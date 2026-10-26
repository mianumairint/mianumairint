import { NextResponse } from "next/server";
import { withRoute } from "@/lib/api/route";
import { getSupabase, selectMany } from "@/lib/supabase/server";
import { TABLES, type CategoryRow } from "@/lib/supabase/types";

/**
 * Without this the handler takes no request input, so Next.js runs it once at
 * build time and serves that snapshot forever -- new categories and products
 * would never appear until the next deploy.
 *
 * Dynamic rather than revalidated: the Supabase client opts out of the fetch
 * cache, so a time-based revalidate here would promise a freshness window the
 * request never actually waits for. The queries are small and indexed.
 */
export const dynamic = "force-dynamic";

export const GET = withRoute("fetch categories", async () => {
  type Raw = CategoryRow & { products: { count: number }[] };

  const rows = await selectMany<Raw>(
    getSupabase()
      .from(TABLES.category)
      .select("*, products:Product(count)")
      .eq("isActive", true)
      .order("sortOrder", { ascending: true })
  );

  // The category grid reads `_count.products`, so the aggregate PostgREST
  // returns as `[{ count: n }]` is reshaped to match.
  const categories = rows.map(({ products, ...category }) => ({
    ...category,
    _count: { products: products[0]?.count ?? 0 },
  }));

  return NextResponse.json({ categories });
});
