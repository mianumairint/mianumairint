import { NextResponse } from "next/server";
import { ApiError, withAdmin } from "@/lib/api/route";
import { getOrderForAdmin, updateOrderForAdmin } from "@/lib/db/orders";
import type { OrderRow } from "@/lib/supabase/types";

/**
 * GET -- one order with its items, customer and shipping address.
 *
 * The detail screen used to load `/api/admin/orders?limit=100` and pick its
 * order out of the result, which fetched up to a hundred orders to show one
 * and still had no line items, because the list query does not include them.
 */
export const GET = withAdmin<{ id: string }>("fetch order", async (_req, { params }) => {
  const order = await getOrderForAdmin(params.id);
  if (!order) throw new ApiError(404, "Order not found");

  return NextResponse.json({ order });
});

export const PUT = withAdmin<{ id: string }>("update order", async (req, { params }) => {
  const { status, trackingNumber, notes } = await req.json();

  // Only the fields that were sent are written, so a form that submits one
  // field does not blank the others.
  const patch: Partial<Pick<OrderRow, "status" | "trackingNumber" | "notes">> = {};
  if (status) patch.status = status;
  if (trackingNumber) patch.trackingNumber = trackingNumber;
  if (notes) patch.notes = notes;

  const order = await updateOrderForAdmin(params.id, patch);
  return NextResponse.json({ order });
});
