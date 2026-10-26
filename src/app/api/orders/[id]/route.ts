import { NextResponse } from "next/server";
import { ApiError, withUser } from "@/lib/api/route";
import { getOrderForUser } from "@/lib/db/orders";

export const GET = withUser<{ id: string }>("fetch order", async (_req, { params }, user) => {
  // Scoped to the owner, so an unknown id and someone else's order both 404.
  const order = await getOrderForUser(params.id, user.id);
  if (!order) throw new ApiError(404, "Order not found");

  return NextResponse.json({ order });
});
