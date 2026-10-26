import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withAdmin } from "@/lib/api/route";
import { getUserSupabase, selectPage } from "@/lib/supabase/server";
import { TABLES, type QuoteRequestRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch quotes", async (req) => {
  const status = new URL(req.url).searchParams.get("status");
  const pagination = parsePagination(req.url);

  let query = getUserSupabase()
    .from(TABLES.quoteRequest)
    .select("*", { count: "exact" });

  if (status) query = query.eq("status", status);

  const { rows, total } = await selectPage<QuoteRequestRow>(
    query.order("createdAt", { ascending: false }).range(pagination.from, pagination.to)
  );

  return NextResponse.json({ quotes: rows, ...pageMeta(total, pagination) });
});
