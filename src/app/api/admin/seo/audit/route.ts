import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api/route";
import { analyzeSeoEntry } from "@/lib/seo-audit";
import {
  getUserSupabase,
  mutate,
  newRow,
  nowIso,
  selectMany,
} from "@/lib/supabase/server";
import { TABLES, type SeoAuditLogRow, type SeoMetaRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch audit logs", async () => {
  const logs = await selectMany<SeoAuditLogRow>(
    getUserSupabase()
      .from(TABLES.seoAuditLog)
      .select("*")
      .order("createdAt", { ascending: false })
  );

  return NextResponse.json({ logs });
});

/**
 * POST -- score every SEO entry and record the run.
 *
 * The previous version issued two sequential requests per entry, so a hundred
 * pages meant two hundred round trips one after another. The log rows are now
 * written in a single insert, and the score updates go out together.
 */
export const POST = withAdmin("run SEO audit", async () => {
  const supabase = getUserSupabase();

  const entries = await selectMany<SeoMetaRow>(
    supabase.from(TABLES.seoMeta).select("*")
  );

  const analysed = entries.map((entry) => ({ entry, analysis: analyzeSeoEntry(entry) }));

  const lastAnalyzed = nowIso();

  await Promise.all(
    analysed.map(({ entry, analysis }) =>
      mutate(
        supabase
          .from(TABLES.seoMeta)
          .update({ seoScore: analysis.score, lastAnalyzed, updatedAt: lastAnalyzed })
          .eq("id", entry.id)
      )
    )
  );

  let results: SeoAuditLogRow[] = [];

  if (analysed.length) {
    const { data, error } = await supabase
      .from(TABLES.seoAuditLog)
      .insert(
        analysed.map(({ entry, analysis }) =>
          newRow({
            entityType: entry.entityType,
            entityId: entry.entityId,
            entityName: entry.title || entry.slug,
            score: analysis.score,
            issues: JSON.stringify(analysis.issues),
            suggestions: JSON.stringify(analysis.suggestions),
          })
        )
      )
      .select("*");

    if (error) throw error;
    results = (data ?? []) as SeoAuditLogRow[];
  }

  return NextResponse.json({
    message: `Audit complete. Analyzed ${results.length} pages.`,
    results,
  });
});
