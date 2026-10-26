import { NextResponse } from "next/server";
import { withRoute } from "@/lib/api/route";
import { listHighlightedProducts } from "@/lib/db/products";

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

export const GET = withRoute("fetch bestsellers", async () => {
  const products = await listHighlightedProducts("isBestSeller");
  return NextResponse.json({ products });
});
