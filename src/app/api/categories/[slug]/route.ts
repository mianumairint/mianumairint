import { NextResponse } from "next/server";
import { ApiError, pageMeta, parsePagination, withRoute } from "@/lib/api/route";
import { listProductsByCategoryId } from "@/lib/db/products";
import { getSupabase, selectOne } from "@/lib/supabase/server";
import { TABLES, type CategoryRow } from "@/lib/supabase/types";

export const GET = withRoute<{ slug: string }>("fetch category", async (req, { params }) => {
  const pagination = parsePagination(req.url, 12);

  const category = await selectOne<CategoryRow>(
    getSupabase().from(TABLES.category).select("*").eq("slug", params.slug).maybeSingle()
  );
  if (!category) throw new ApiError(404, "Category not found");

  const { rows, total } = await listProductsByCategoryId(
    category.id,
    pagination.from,
    pagination.to
  );

  return NextResponse.json({
    category,
    products: rows,
    ...pageMeta(total, pagination),
  });
});
