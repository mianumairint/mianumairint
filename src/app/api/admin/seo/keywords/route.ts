import { NextResponse } from "next/server";
import { ApiError, omit, withAdmin } from "@/lib/api/route";
import {
  getUserSupabase,
  mutate,
  mutateOne,
  newTimestampedRow,
  selectMany,
  touched,
} from "@/lib/supabase/server";
import { TABLES, type SeoKeywordRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch keywords", async () => {
  const keywords = await selectMany<SeoKeywordRow>(
    getUserSupabase()
      .from(TABLES.seoKeyword)
      .select("*")
      .order("updatedAt", { ascending: false })
  );

  return NextResponse.json({ keywords });
});

export const POST = withAdmin("create keyword", async (req) => {
  const data = await req.json();

  const keyword = await mutateOne<SeoKeywordRow>(
    getUserSupabase()
      .from(TABLES.seoKeyword)
      .insert(
        newTimestampedRow({
          keyword: data.keyword,
          targetUrl: data.targetUrl,
          targetPage: data.targetPage,
          currentRank: data.currentRank ?? null,
          previousRank: data.previousRank ?? null,
          searchVolume: data.searchVolume ?? null,
          notes: data.notes ?? null,
        })
      )
      .select("*")
      .single()
  );

  return NextResponse.json({ keyword }, { status: 201 });
});

export const PUT = withAdmin("update keyword", async (req) => {
  // `trackedSince` and `updatedAt` are managed here, not by the client.
  const body = await req.json();
  const patch = omit(body, ["id", "trackedSince", "updatedAt"]);
  const { id } = body;

  if (!id) throw new ApiError(400, "ID is required");

  const keyword = await mutateOne<SeoKeywordRow>(
    getUserSupabase()
      .from(TABLES.seoKeyword)
      .update(touched(patch))
      .eq("id", id)
      .select("*")
      .single()
  );

  return NextResponse.json({ keyword });
});

export const DELETE = withAdmin("delete keyword", async (req) => {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw new ApiError(400, "ID is required");

  await mutate(getUserSupabase().from(TABLES.seoKeyword).delete().eq("id", id));

  return NextResponse.json({ success: true });
});
