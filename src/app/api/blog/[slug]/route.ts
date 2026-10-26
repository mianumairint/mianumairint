import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { getSupabase, selectOne, touched } from "@/lib/supabase/server";
import { TABLES, type BlogPostRow } from "@/lib/supabase/types";

export const GET = withRoute<{ slug: string }>("fetch blog post", async (_req, { params }) => {
  const supabase = getSupabase();

  const post = await selectOne<BlogPostRow>(
    supabase
      .from(TABLES.blogPost)
      .select("*")
      .eq("slug", params.slug)
      .eq("isPublished", true)
      .maybeSingle()
  );

  if (!post) throw new ApiError(404, "Post not found");

  // Read-then-write, so two readers in the same instant can cost one view.
  // An exact count is not worth an extra database function for a view counter,
  // and a failed bump must not stop the post from being served.
  const { error } = await supabase
    .from(TABLES.blogPost)
    .update(touched({ viewCount: post.viewCount + 1 }))
    .eq("id", post.id);

  if (error) console.error("Blog view count bump failed:", error);

  return NextResponse.json({ post });
});
