import { NextResponse } from "next/server";
import { getSupabase, selectMany } from "@/lib/supabase/server";
import { TABLES, type ExportMarketRow } from "@/lib/supabase/types";

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

/**
 * The home page map renders whatever this returns and hides itself when the
 * list is empty, so a database problem answers with an empty list rather than
 * an error the page would have to handle.
 */
export async function GET() {
  try {
    const markets = await selectMany<ExportMarketRow>(
      getSupabase().from(TABLES.exportMarket).select("*")
    );
    return NextResponse.json({ markets });
  } catch (error) {
    console.error("[api] fetch export markets failed:", error);
    return NextResponse.json({ markets: [] });
  }
}
