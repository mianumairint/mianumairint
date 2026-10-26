import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withAdmin } from "@/lib/api/route";
import { getUserSupabase, selectPage } from "@/lib/supabase/server";
import { TABLES, type ContactMessageRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch messages", async (req) => {
  const pagination = parsePagination(req.url);

  const { rows, total } = await selectPage<ContactMessageRow>(
    getUserSupabase()
      .from(TABLES.contactMessage)
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(pagination.from, pagination.to)
  );

  return NextResponse.json({ messages: rows, ...pageMeta(total, pagination) });
});
