import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ApiError, omit, withAdmin } from "@/lib/api/route";
import {
  getUserSupabase,
  mutateOne,
  newTimestampedRow,
  selectOne,
  touched,
} from "@/lib/supabase/server";
import { TABLES, type SeoGlobalSettingsRow } from "@/lib/supabase/types";

/**
 * GET -- the single global SEO settings row, created on first use.
 *
 * The table holds exactly one row. Every column has a database default, so an
 * insert with only the two app-managed fields is enough to create it.
 */
export const GET = withAdmin("fetch SEO settings", async () => {
  const supabase = getUserSupabase();

  const existing = await selectOne<SeoGlobalSettingsRow>(
    supabase.from(TABLES.seoGlobalSettings).select("*").limit(1).maybeSingle()
  );
  if (existing) return NextResponse.json({ settings: existing });

  const settings = await mutateOne<SeoGlobalSettingsRow>(
    supabase
      .from(TABLES.seoGlobalSettings)
      .insert(newTimestampedRow({}))
      .select("*")
      .single()
  );

  revalidateTag("public-seo");
  return NextResponse.json({ settings });
});

export const PUT = withAdmin("update SEO settings", async (req) => {
  const body = await req.json();
  const patch = omit(body, ["id", "updatedAt"]);
  const { id } = body;

  if (!id) throw new ApiError(400, "Settings ID is required");

  const settings = await mutateOne<SeoGlobalSettingsRow>(
    getUserSupabase()
      .from(TABLES.seoGlobalSettings)
      .update(touched(patch))
      .eq("id", id)
      .select("*")
      .single()
  );

  revalidateTag("public-seo");
  return NextResponse.json({ settings });
});
