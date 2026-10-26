import {
  getSupabase,
  getUserSupabase,
  mutate,
  mutateOne,
  newId,
  newTimestampedRow,
  selectMany,
  selectOne,
  touched,
} from "@/lib/supabase/server";
import { TABLES, type PageRow, type PageSectionRow } from "@/lib/supabase/types";
import type { PageSectionType } from "@/types/page";

/**
 * CMS PAGE QUERIES
 * ================
 * Pages are read by the public routes (published only, visible sections only)
 * and by the dashboard (everything, drafts included). Both shapes come from
 * here so the "published and visible" rule is written once.
 */

export interface PageWithSections extends PageRow {
  sections: PageSectionRow[];
}

export interface PageWithSectionCount extends PageRow {
  _count: { sections: number };
}

const WITH_SECTIONS = "*, sections:PageSection(*)";

/** Published page by slug, visible sections only, ordered. */
export async function getPublishedPageBySlug(slug: string): Promise<PageWithSections | null> {
  return selectOne<PageWithSections>(
    getSupabase()
      .from(TABLES.page)
      .select(WITH_SECTIONS)
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .eq("sections.isVisible", true)
      .order("sortOrder", { referencedTable: "sections", ascending: true })
      .maybeSingle()
  );
}

/**
 * Page by slug whatever its status, visible sections only.
 * Used by routes that must tell "unpublished" apart from "does not exist".
 */
export async function getPageBySlug(slug: string): Promise<PageWithSections | null> {
  return selectOne<PageWithSections>(
    getSupabase()
      .from(TABLES.page)
      .select(WITH_SECTIONS)
      .eq("slug", slug)
      .eq("sections.isVisible", true)
      .order("sortOrder", { referencedTable: "sections", ascending: true })
      .maybeSingle()
  );
}

/** SEO fields only, for `generateMetadata`. */
export async function getPublishedPageSeo(
  slug: string
): Promise<Pick<PageRow, "title" | "seoTitle" | "seoDesc"> | null> {
  return selectOne<Pick<PageRow, "title" | "seoTitle" | "seoDesc">>(
    getSupabase()
      .from(TABLES.page)
      .select("title,seoTitle,seoDesc")
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .maybeSingle()
  );
}

/** Slugs of every published page the dashboard created. */
export async function listPublishedCustomSlugs(): Promise<string[]> {
  const rows = await selectMany<Pick<PageRow, "slug">>(
    getSupabase()
      .from(TABLES.page)
      .select("slug")
      .eq("status", "PUBLISHED")
      .eq("isSystem", false)
  );
  return rows.map((row) => row.slug);
}

/* ── Admin ───────────────────────────────────────────────── */

/** Every page, built-ins first, each with how many sections it has. */
export async function listPagesForAdmin(): Promise<PageWithSectionCount[]> {
  const rows = await selectMany<PageRow & { sections: { count: number }[] }>(
    getUserSupabase()
      .from(TABLES.page)
      .select("*, sections:PageSection(count)")
      .order("isSystem", { ascending: false })
      .order("title", { ascending: true })
  );

  return rows.map(({ sections, ...page }) => ({
    ...page,
    _count: { sections: sections[0]?.count ?? 0 },
  }));
}

/** One page with every section, drafts and hidden sections included. */
export async function getPageByIdForAdmin(id: string): Promise<PageWithSections | null> {
  return selectOne<PageWithSections>(
    getUserSupabase()
      .from(TABLES.page)
      .select(WITH_SECTIONS)
      .eq("id", id)
      .order("sortOrder", { referencedTable: "sections", ascending: true })
      .maybeSingle()
  );
}

export async function getPageById(id: string): Promise<PageRow | null> {
  return selectOne<PageRow>(
    getUserSupabase().from(TABLES.page).select("*").eq("id", id).maybeSingle()
  );
}

/** True when another page already owns this slug. */
export async function slugExists(slug: string): Promise<boolean> {
  const row = await selectOne<Pick<PageRow, "id">>(
    getUserSupabase().from(TABLES.page).select("id").eq("slug", slug).maybeSingle()
  );
  return row !== null;
}

export interface NewPage {
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string | null;
  seoDesc: string | null;
}

export async function createPage(page: NewPage): Promise<PageRow> {
  return mutateOne<PageRow>(
    getUserSupabase()
      .from(TABLES.page)
      .insert(newTimestampedRow({ ...page, isSystem: false }))
      .select("*")
      .single()
  );
}

export async function updatePage(
  id: string,
  patch: Partial<Omit<PageRow, "id" | "createdAt" | "updatedAt">>
): Promise<PageRow> {
  return mutateOne<PageRow>(
    getUserSupabase()
      .from(TABLES.page)
      .update(touched(patch))
      .eq("id", id)
      .select("*")
      .single()
  );
}

export async function deletePage(id: string): Promise<void> {
  // PageSection has ON DELETE CASCADE, so its rows go with the page.
  await mutate(getUserSupabase().from(TABLES.page).delete().eq("id", id));
}

export interface IncomingSection {
  /** Existing section id, or absent/temporary for a new one. */
  id?: string;
  type: PageSectionType;
  isVisible?: boolean;
  data?: Record<string, unknown>;
}

/**
 * Replaces a page's whole section list.
 *
 * The editor always sends the complete, ordered array, so add, edit, reorder
 * and delete are one operation. `sortOrder` comes from array position, which
 * means the order cannot drift.
 *
 * PostgREST has no multi-statement transaction, so this is a write followed by
 * a cleanup, in that order deliberately: the upsert lands the author's content
 * first, and if the delete then fails the page keeps a few stale sections and
 * reports the error -- rather than losing the content that was just saved.
 */
export async function replacePageSections(
  pageId: string,
  incoming: IncomingSection[]
): Promise<void> {
  const supabase = getUserSupabase();

  const existing = await selectMany<Pick<PageSectionRow, "id">>(
    supabase.from(TABLES.pageSection).select("id").eq("pageId", pageId)
  );
  const existingIds = new Set(existing.map((row) => row.id));

  const rows = incoming.map((section, index) => ({
    // Reuse the id when the row is already ours; anything else is a new row.
    id: section.id && existingIds.has(section.id) ? section.id : newId(),
    pageId,
    type: section.type,
    sortOrder: index,
    isVisible: section.isVisible !== false,
    data: section.data ?? {},
  }));

  if (rows.length) {
    await mutate(supabase.from(TABLES.pageSection).upsert(rows));
  }

  const keptIds = new Set(rows.map((row) => row.id));
  const removedIds = Array.from(existingIds).filter((id) => !keptIds.has(id));

  if (removedIds.length) {
    await mutate(supabase.from(TABLES.pageSection).delete().in("id", removedIds));
  }
}
