import { NextResponse } from "next/server";
import { ApiError, withRoute, withUser } from "@/lib/api/route";
import { getSessionUser } from "@/lib/auth/session";
import { discountFor, redeemCoupon } from "@/lib/db/coupons";
import {
  createOrder,
  generateOrderNumber,
  listOrdersForUser,
  type NewOrderItem,
} from "@/lib/db/orders";
import { getSupabase, selectMany } from "@/lib/supabase/server";
import { TABLES, type ProductRow, type ProductVariantRow } from "@/lib/supabase/types";

/** GET -- the signed-in customer's orders. */
export const GET = withUser("fetch orders", async (_req, _ctx, user) => {
  const orders = await listOrdersForUser(user.id);
  return NextResponse.json({ orders });
});

interface CartLine {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

/**
 * Prices the cart from the database rather than trusting the client.
 *
 * One query per product became one query for all of them: a cart of ten items
 * used to cost eleven round trips before the order was even written. The
 * anonymous client is right here -- prices are public, and a guest checkout
 * has no session.
 *
 * A line whose product no longer exists is dropped, as it was before.
 */
async function priceCart(
  lines: CartLine[]
): Promise<{ items: NewOrderItem[]; subtotal: number }> {
  const supabase = getSupabase();

  const productIds = Array.from(new Set(lines.map((line) => line.productId)));
  const variantIds = Array.from(
    new Set(lines.map((line) => line.variantId).filter((id): id is string => !!id))
  );

  const [products, variants] = await Promise.all([
    selectMany<Pick<ProductRow, "id" | "price">>(
      supabase.from(TABLES.product).select("id,price").in("id", productIds)
    ),
    variantIds.length
      ? selectMany<Pick<ProductVariantRow, "id" | "price">>(
          supabase.from(TABLES.productVariant).select("id,price").in("id", variantIds)
        )
      : Promise.resolve([]),
  ]);

  const priceByProduct = new Map(products.map((p) => [p.id, Number(p.price)]));
  const priceByVariant = new Map(
    variants.filter((v) => v.price !== null).map((v) => [v.id, Number(v.price)])
  );

  const items: NewOrderItem[] = [];
  let subtotal = 0;

  for (const line of lines) {
    const basePrice = priceByProduct.get(line.productId);
    if (basePrice === undefined) continue;

    const variantPrice = line.variantId ? priceByVariant.get(line.variantId) : undefined;
    const price = variantPrice ?? basePrice;

    subtotal += price * line.quantity;
    items.push({
      productId: line.productId,
      variantId: line.variantId || null,
      quantity: line.quantity,
      price,
    });
  }

  return { items, subtotal };
}

/** POST -- place an order. Guest checkout is allowed. */
export const POST = withRoute("create order", async (req) => {
  const user = await getSessionUser();

  const {
    items: lines,
    shippingAddress,
    paymentMethod,
    couponCode,
    shippingCost,
    guestEmail,
    notes,
  } = await req.json();

  if (!lines?.length) throw new ApiError(400, "Cart is empty");

  if (!user && !guestEmail && !shippingAddress?.email) {
    throw new ApiError(400, "Email is required for guest checkout");
  }

  const email = guestEmail || shippingAddress?.email || user?.email || "";

  const { items, subtotal } = await priceCart(lines);

  // Every line referred to a product that no longer exists -- a cart left open
  // while the catalogue changed. That is the shopper's problem to fix, not a
  // server fault, so it reads as a 400 rather than a 500.
  if (!items.length) {
    throw new ApiError(400, "The items in your cart are no longer available");
  }

  // Redeeming counts the use in the same statement that checks the limit, so a
  // coupon cannot be spent twice by two simultaneous checkouts. An unusable
  // code is simply worth nothing, which is how checkout behaved before.
  const discount = couponCode
    ? discountFor(await redeemCoupon(couponCode), subtotal)
    : 0;

  const shipping = Number(shippingCost) || 0;

  const order = await createOrder(
    {
      orderNumber: generateOrderNumber(),
      userId: user?.id ?? null,
      guestEmail: user ? null : email,
      subtotal,
      discount,
      shippingCost: shipping,
      tax: 0,
      total: subtotal - discount + shipping,
      paymentMethod: paymentMethod || "cod",
      couponCode: couponCode || null,
      notes: notes || null,
    },
    items
  );

  return NextResponse.json({ order }, { status: 201 });
});
