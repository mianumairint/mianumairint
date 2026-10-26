import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GUEST CART COOKIE
 * =================
 * The cart lives in one httpOnly cookie so it survives a reload without a
 * database row per visitor. All five cart routes shared the same read, write
 * and cookie-option code; it is written once here.
 */

const COOKIE_NAME = "cart";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface CartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

/**
 * The current cart. A cookie that is missing, empty or not valid JSON reads as
 * an empty cart rather than throwing -- a corrupt cookie must not 500 the
 * route that only wanted to show a badge count.
 */
export function readCart(): CartItem[] {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        typeof item?.productId === "string" && typeof item?.quantity === "number"
    );
  } catch {
    return [];
  }
}

/** Responds with the cart and stores it in the cookie. */
export function respondWithCart(items: CartItem[]): NextResponse {
  const response = NextResponse.json({ items });
  response.cookies.set(COOKIE_NAME, JSON.stringify(items), {
    ...COOKIE_OPTIONS,
    maxAge: MAX_AGE_SECONDS,
  });
  return response;
}

/** Responds with an empty cart and expires the cookie. */
export function respondWithEmptyCart(): NextResponse {
  const response = NextResponse.json({ items: [] });
  response.cookies.set(COOKIE_NAME, "[]", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}

/** Index of a line item, matching on product and variant. -1 when absent. */
export function findCartItem(
  items: CartItem[],
  productId: string,
  variantId: string | null
): number {
  return items.findIndex(
    (item) => item.productId === productId && item.variantId === (variantId || null)
  );
}
