import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  getPageBySlug,
  listPublishedCustomSlugs,
  type PageWithSections,
} from "@/lib/db/pages";
import type { PageDTO, PageSectionDTO, PageSectionType } from "@/types/page";
import { fillDateTokensDeep } from "@/lib/company-age";

// Share one anonymous CMS query between metadata and page rendering, and reuse
// it across visits. Admin saves invalidate the matching tag immediately.
const loadPublicPage = cache((slug: string) =>
  unstable_cache(() => getPageBySlug(slug), ["public-page", slug], {
    revalidate: 60,
    tags: [`page:${slug}`],
  })()
);

/**
 * SERVER-SIDE PAGE LOADER
 * =======================
 * Every function here is failure-tolerant on purpose: if the database is
 * unreachable or the row has not been imported yet, it returns null and the
 * caller renders its existing hardcoded content instead. That keeps the live
 * site working during rollout and if the database blips.
 *
 * Drafts are never returned by `getPublishedPage` -- only the admin API reads
 * them.
 */

function toDTO(page: PageWithSections): PageDTO {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.status,
    seoTitle: page.seoTitle,
    seoDesc: page.seoDesc,
    isSystem: page.isSystem,
    sections: page.sections.map(
      (section): PageSectionDTO => ({
        id: section.id,
        type: section.type as PageSectionType,
        sortOrder: section.sortOrder,
        isVisible: section.isVisible,
        data: fillDateTokensDeep((section.data as Record<string, any>) ?? {}),
      })
    ),
  };
}

/** Published page by slug, visible sections only. Null if missing/draft/DB down. */
export async function getPublishedPage(slug: string): Promise<PageDTO | null> {
  try {
    const page = await loadPublicPage(slug);
    return page?.status === "PUBLISHED" ? toDTO(page) : null;
  } catch (error) {
    console.error(`getPublishedPage("${slug}") failed:`, error);
    return null;
  }
}

/**
 * Resolution for a route that also has a hardcoded legacy fallback.
 *
 * A built-in page must distinguish three cases, because "no published page"
 * alone is ambiguous:
 *   "cms"      -> render the CMS content
 *   "draft"    -> the row exists but is unpublished: the route must 404.
 *                 Falling back to the legacy component here would publish
 *                 exactly the content the author just unpublished.
 *   "fallback" -> no row at all (not imported yet) or the database is
 *                 unreachable: render the original hardcoded page so the live
 *                 site keeps working.
 */
export type SystemPageResolution =
  | { mode: "cms"; page: PageDTO }
  | { mode: "draft" }
  | { mode: "fallback" };

export async function resolveSystemPage(slug: string): Promise<SystemPageResolution> {
  try {
    const page = await loadPublicPage(slug);

    // Never imported -- keep serving the existing hardcoded page.
    if (!page) return { mode: "fallback" };

    // Explicitly unpublished -- hide it, do not fall back.
    if (page.status !== "PUBLISHED") return { mode: "draft" };

    // Published but empty: treat as not-yet-built and keep the legacy page
    // rather than rendering a blank screen.
    if (page.sections.length === 0) return { mode: "fallback" };

    return { mode: "cms", page: toDTO(page) };
  } catch (error) {
    console.error(`resolveSystemPage("${slug}") failed:`, error);
    return { mode: "fallback" };
  }
}

/** Slugs of every published non-system page -- used by the catch-all route. */
export async function getPublishedCustomSlugs(): Promise<string[]> {
  try {
    return await listPublishedCustomSlugs();
  } catch (error) {
    console.error("getPublishedCustomSlugs failed:", error);
    return [];
  }
}

/**
 * SEO for a CMS page, shaped for `generateMetadata`.
 * Falls back to the page title when no SEO title is set.
 */
export async function getPageSeo(
  slug: string
): Promise<{ title: string; description: string | null } | null> {
  try {
    const page = await loadPublicPage(slug);
    if (!page || page.status !== "PUBLISHED") return null;
    return {
      title: page.seoTitle?.trim() || page.title,
      description: page.seoDesc?.trim() || null,
    };
  } catch (error) {
    console.error(`getPageSeo("${slug}") failed:`, error);
    return null;
  }
}

/** Convenience: pull one section's data out of a loaded page. */
export function findSection(
  page: PageDTO | null,
  type: PageSectionType
): Record<string, any> | null {
  return page?.sections.find((section) => section.type === type)?.data ?? null;
}
