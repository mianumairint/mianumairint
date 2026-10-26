import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withAdmin } from "@/lib/api/route";
import { listOrdersForAdmin } from "@/lib/db/orders";

export const GET = withAdmin("fetch orders", async (req) => {
  const status = new URL(req.url).searchParams.get("status");
  const pagination = parsePagination(req.url);

  const { rows, total } = await listOrdersForAdmin(
    status,
    pagination.from,
    pagination.to
  );

  return NextResponse.json({ orders: rows, ...pageMeta(total, pagination) });
});
