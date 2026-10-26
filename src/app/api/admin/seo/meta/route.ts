import { NextResponse } from "next/server";
import { ApiError, omit, withAdmin } from "@/lib/api/route";
import {
  getUserSupabase,
  mutateOne,
  newTimestampedRow,
  selectMany,
  touched,
} from "@/lib/supabase/server";
import { TABLES, type SeoMetaRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch SEO meta", async (req) => {
  const entityType = new URL(req.url).searchParams.get("entityType");

  let query = getUserSupabase().from(TABLES.seoMeta).select("*");
  if (entityType) query = query.eq("entityType", entityType);

  const entries = await selectMany<SeoMetaRow>(query.order("slug", { ascending: true }));

  return NextResponse.json({ entries });
});

export const POST = withAdmin("create SEO meta", async (req) => {
  const data = await req.json();

  const entry = await mutateOne<SeoMetaRow>(
    getUserSupabase()
      .from(TABLES.seoMeta)
      .insert(newTimestampedRow(data))
      .select("*")
      .single()
  );

  return NextResponse.json({ entry }, { status: 201 });
});

export const PUT = withAdmin("update SEO meta", async (req) => {
  const body = await req.json();
  const patch = omit(body, ["id", "createdAt", "updatedAt"]);
  const { id } = body;
  if (!id) throw new ApiError(400, "ID is required");

  const entry = await mutateOne<SeoMetaRow>(
    getUserSupabase()
      .from(TABLES.seoMeta)
      .update(touched(patch))
      .eq("id", id)
      .select("*")
      .single()
  );

  return NextResponse.json({ entry });
});
