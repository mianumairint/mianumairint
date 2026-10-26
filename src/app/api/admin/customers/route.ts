import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withAdmin } from "@/lib/api/route";
import { listCustomers } from "@/lib/db/users";

export const GET = withAdmin("fetch customers", async (req) => {
  const pagination = parsePagination(req.url);

  const { rows, total } = await listCustomers(pagination.from, pagination.to);

  return NextResponse.json({ customers: rows, ...pageMeta(total, pagination) });
});
