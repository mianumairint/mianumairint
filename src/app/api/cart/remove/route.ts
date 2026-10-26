import { ApiError, withRoute } from "@/lib/api/route";
import { readCart, respondWithCart } from "@/lib/cart-cookie";

export const DELETE = withRoute("remove from cart", async (req) => {
  const { productId, variantId } = await req.json();

  if (!productId) throw new ApiError(400, "productId is required");

  const remaining = readCart().filter(
    (item) => !(item.productId === productId && item.variantId === (variantId || null))
  );

  return respondWithCart(remaining);
});
