import { NextResponse } from "next/server";
import { withRoute } from "@/lib/api/route";
import { formatEnumLabel } from "@/lib/format";
import { getSupabase, selectMany } from "@/lib/supabase/server";
import { TABLES, type BlogPostRow } from "@/lib/supabase/types";

/**
 * The categories that actually have published posts, with a count each.
 *
 * The blog sidebar has always asked for this; the route was simply missing, so
 * every visit to /blog logged a 404 and the filter list stayed empty.
 *
 * `name` is the stored enum value, which is what /api/blog filters on, and
 * `label` is the readable form -- the two are separate because a button
 * showing "HEALTH_WELLNESS" would have to filter on something else.
 *
 * Counted here rather than with a GROUP BY because this project has PostgREST
 * aggregates disabled; one column of the published posts is all it reads.
 */
export const dynamic = "force-dynamic";

export const GET = withRoute("fetch blog categories", async () => {
  const posts = await selectMany<Pick<BlogPostRow, "category">>(
    getSupabase().from(TABLES.blogPost).select("category").eq("isPublished", true)
  );

  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  }

  const categories = Array.from(counts, ([name, count]) => ({
    name,
    label: formatEnumLabel(name),
    count,
  }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

  return NextResponse.json({ categories });
});
