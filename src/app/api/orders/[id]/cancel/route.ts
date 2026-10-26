import { NextResponse } from "next/server";
import { ApiError, withUser } from "@/lib/api/route";
import { getOrderStatusForUser, setOrderStatus } from "@/lib/db/orders";

export const POST = withUser<{ id: string }>(
  "cancel order",
  async (_req, { params }, user) => {
    const existing = await getOrderStatusForUser(params.id, user.id);
    if (!existing) throw new ApiError(404, "Order not found");

    if (existing.status !== "PENDING") {
      throw new ApiError(400, "Only pending orders can be cancelled");
    }

    const order = await setOrderStatus(params.id, "CANCELLED");
    return NextResponse.json({ order });
  }
);
