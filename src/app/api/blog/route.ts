import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withRoute } from "@/lib/api/route";
import { getSupabase, selectPage } from "@/lib/supabase/server";
import { TABLES, type BlogPostRow } from "@/lib/supabase/types";

/** Only the fields the blog index renders -- the post body is a large column. */
const LIST_COLUMNS = "id,title,slug,excerpt,coverImage,category,publishedAt,viewCount";

export const GET = withRoute("fetch blog posts", async (req) => {
  const category = new URL(req.url).searchParams.get("category");
  const pagination = parsePagination(req.url, 10);

  let query = getSupabase()
    .from(TABLES.blogPost)
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("isPublished", true);

  if (category) query = query.eq("category", category);

  const { rows, total } = await selectPage<Partial<BlogPostRow>>(
    query.order("publishedAt", { ascending: false }).range(pagination.from, pagination.to)
  );

  return NextResponse.json({ posts: rows, ...pageMeta(total, pagination) });
});
