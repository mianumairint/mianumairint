import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withRoute } from "@/lib/api/route";
import { listPublicProducts } from "@/lib/db/products";

export const GET = withRoute("fetch products", async (req) => {
  const params = new URL(req.url).searchParams;
  const pagination = parsePagination(req.url, 12);

  const { rows, total } = await listPublicProducts({
    categorySlug: params.get("category"),
    search: params.get("search"),
    sort: params.get("sort"),
    from: pagination.from,
    to: pagination.to,
  });

  return NextResponse.json({ products: rows, ...pageMeta(total, pagination) });
});
