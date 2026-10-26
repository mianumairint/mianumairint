import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withAdmin } from "@/lib/api/route";
import { getUserSupabase, selectPage } from "@/lib/supabase/server";
import { TABLES, type NewsletterSubscriberRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch subscribers", async (req) => {
  const pagination = parsePagination(req.url, 50);

  const { rows, total } = await selectPage<NewsletterSubscriberRow>(
    getUserSupabase()
      .from(TABLES.newsletterSubscriber)
      .select("*", { count: "exact" })
      .order("subscribedAt", { ascending: false })
      .range(pagination.from, pagination.to)
  );

  return NextResponse.json({ subscribers: rows, ...pageMeta(total, pagination) });
});
