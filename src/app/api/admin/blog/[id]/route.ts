import { NextResponse } from "next/server";
import { ApiError, withAdmin } from "@/lib/api/route";
import {
  getUserSupabase,
  mutate,
  mutateOne,
  nowIso,
  selectOne,
  touched,
} from "@/lib/supabase/server";
import { TABLES, type BlogPostRow } from "@/lib/supabase/types";

/**
 * GET -- one post.
 *
 * The editor used to load `/api/admin/blog?limit=100` and find its post in the
 * result, which fetched a hundred full post bodies to edit one.
 */
export const GET = withAdmin<{ id: string }>("fetch post", async (_req, { params }) => {
  const post = await selectOne<BlogPostRow>(
    getUserSupabase().from(TABLES.blogPost).select("*").eq("id", params.id).maybeSingle()
  );
  if (!post) throw new ApiError(404, "Post not found");

  return NextResponse.json({ post });
});

export const PUT = withAdmin<{ id: string }>("update post", async (req, { params }) => {
  const data = await req.json();

  const post = await mutateOne<BlogPostRow>(
    getUserSupabase()
      .from(TABLES.blogPost)
      .update(
        touched({
          ...data,
          // Keep the original publication date if the post was already live.
          publishedAt: data.isPublished ? data.publishedAt || nowIso() : null,
        })
      )
      .eq("id", params.id)
      .select("*")
      .single()
  );

  return NextResponse.json({ post });
});

export const DELETE = withAdmin<{ id: string }>(
  "delete post",
  async (_req, { params }) => {
    await mutate(getUserSupabase().from(TABLES.blogPost).delete().eq("id", params.id));

    return NextResponse.json({ message: "Post deleted" });
  }
);
