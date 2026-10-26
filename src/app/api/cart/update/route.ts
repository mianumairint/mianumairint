import { ApiError, withRoute } from "@/lib/api/route";
import { findCartItem, readCart, respondWithCart } from "@/lib/cart-cookie";

export const PUT = withRoute("update cart", async (req) => {
  const { productId, variantId, quantity } = await req.json();

  if (!productId || quantity === undefined) {
    throw new ApiError(400, "productId and quantity are required");
  }

  const items = readCart();
  const index = findCartItem(items, productId, variantId ?? null);

  if (index === -1) throw new ApiError(404, "Item not found in cart");

  // Setting a quantity of zero or less is how the UI removes a line.
  if (quantity <= 0) {
    items.splice(index, 1);
  } else {
    items[index].quantity = quantity;
  }

  return respondWithCart(items);
});
