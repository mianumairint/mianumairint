import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withAdmin } from "@/lib/api/route";
import {
  getUserSupabase,
  mutateOne,
  newTimestampedRow,
  nowIso,
  selectPage,
} from "@/lib/supabase/server";
import { TABLES, type BlogPostRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch posts", async (req) => {
  const pagination = parsePagination(req.url);

  const { rows, total } = await selectPage<BlogPostRow>(
    getUserSupabase()
      .from(TABLES.blogPost)
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(pagination.from, pagination.to)
  );

  return NextResponse.json({ posts: rows, ...pageMeta(total, pagination) });
});

/**
 * POST -- create a post.
 *
 * `publishedAt` is stamped the moment a post goes live and cleared when it is
 * not, which is what the blog index orders by.
 *
 * The previous version also set an `authorId`, a column `BlogPost` does not
 * have, so creating a post always failed.
 */
export const POST = withAdmin("create post", async (req) => {
  const data = await req.json();

  const post = await mutateOne<BlogPostRow>(
    getUserSupabase()
      .from(TABLES.blogPost)
      .insert(
        newTimestampedRow({
          ...data,
          publishedAt: data.isPublished ? nowIso() : null,
        })
      )
      .select("*")
      .single()
  );

  return NextResponse.json({ post }, { status: 201 });
});
