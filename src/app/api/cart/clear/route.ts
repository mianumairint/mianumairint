import { respondWithEmptyCart } from "@/lib/cart-cookie";

export async function DELETE() {
  return respondWithEmptyCart();
}
