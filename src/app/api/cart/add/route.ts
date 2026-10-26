import { ApiError, withRoute } from "@/lib/api/route";
import { findCartItem, readCart, respondWithCart } from "@/lib/cart-cookie";

export const POST = withRoute("add to cart", async (req) => {
  const { productId, variantId, quantity } = await req.json();

  if (!productId || !quantity) {
    throw new ApiError(400, "productId and quantity are required");
  }

  const items = readCart();
  const index = findCartItem(items, productId, variantId ?? null);

  if (index > -1) {
    items[index].quantity += quantity;
  } else {
    items.push({ productId, variantId: variantId || null, quantity });
  }

  return respondWithCart(items);
});
