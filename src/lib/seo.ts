import type { Metadata } from "next";
import { getSupabase, selectOne } from "@/lib/supabase/server";
import { TABLES, type SeoGlobalSettingsRow, type SeoMetaRow } from "@/lib/supabase/types";
import { getPageSeo } from "@/lib/pages/getPage";

/**
 * PAGE SEO
 * ========
 * `getSeoMeta` resolves the per-page SEO row, falls back to the global
 * defaults, and finally to a hardcoded default if the database is unreachable
 * so a blip never costs a page its title tag. `buildMetadata` turns the result
 * into the object Next.js expects.
 */

export interface SeoMetaResult {
  title: string;
  metaDesc: string;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogType: string;
  twitterCard: string;
  twitterTitle: string | null;
  twitterDesc: string | null;
  twitterImage: string | null;
  noIndex: boolean;
  noFollow: boolean;
}

export const SITE_NAME = "Mian Umair International";
export const SITE_URL = "https://mianumairint.com";

const FALLBACK: SeoMetaResult = {
  title: SITE_NAME,
  metaDesc: "",
  canonicalUrl: null,
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: null,
  twitterDesc: null,
  twitterImage: null,
  noIndex: false,
  noFollow: false,
};

function fromEntry(entry: SeoMetaRow): SeoMetaResult {
  return {
    title: entry.title || SITE_NAME,
    metaDesc: entry.metaDesc || "",
    canonicalUrl: entry.canonicalUrl,
    ogTitle: entry.ogTitle,
    ogDescription: entry.ogDescription,
    ogImage: entry.ogImage,
    ogType: entry.ogType || "website",
    twitterCard: entry.twitterCard || "summary_large_image",
    twitterTitle: entry.twitterTitle,
    twitterDesc: entry.twitterDesc,
    twitterImage: entry.twitterImage,
    noIndex: entry.noIndex,
    noFollow: entry.noFollow,
  };
}

function fromGlobalSettings(settings: SeoGlobalSettingsRow | null): SeoMetaResult {
  return {
    ...FALLBACK,
    title: settings?.homeTitle || SITE_NAME,
    metaDesc: settings?.defaultMetaDesc || "",
    ogImage: settings?.defaultOgImage || null,
    noIndex: !(settings?.defaultRobotsIndex ?? true),
    noFollow: !(settings?.defaultRobotsFollow ?? true),
  };
}

export async function getSeoGlobalSettings(): Promise<SeoGlobalSettingsRow | null> {
  return selectOne<SeoGlobalSettingsRow>(
    getSupabase().from(TABLES.seoGlobalSettings).select("*").limit(1).maybeSingle()
  );
}

export async function getSeoMeta(slug: string): Promise<SeoMetaResult> {
  try {
    const entry = await selectOne<SeoMetaRow>(
      getSupabase().from(TABLES.seoMeta).select("*").eq("slug", slug).limit(1).maybeSingle()
    );
    if (entry) return fromEntry(entry);

    return fromGlobalSettings(await getSeoGlobalSettings());
  } catch (error) {
    console.error(`getSeoMeta("${slug}") failed:`, error);
    return FALLBACK;
  }
}

export function buildMetadata(seo: SeoMetaResult, slug: string): Metadata {
  const robots: Metadata["robots"] = {};
  if (seo.noIndex) robots.index = false;
  if (seo.noFollow) robots.follow = false;

  const socialImage = seo.twitterImage || seo.ogImage;

  return {
    title: seo.title,
    description: seo.metaDesc || undefined,
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.metaDesc || undefined,
      url: `${SITE_URL}${slug}`,
      siteName: SITE_NAME,
      type: (seo.ogType as "website" | "article") || "website",
      ...(seo.ogImage ? { images: [{ url: seo.ogImage }] } : {}),
    },
    twitter: {
      card: (seo.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || seo.title,
      description: seo.twitterDesc || seo.ogDescription || seo.metaDesc || undefined,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
    ...(seo.noIndex || seo.noFollow ? { robots } : {}),
    alternates: { canonical: seo.canonicalUrl || `${SITE_URL}${slug}` },
  };
}

/**
 * The metadata for a page that may also exist in the CMS.
 *
 * The CMS only carries a title and a description, so it cannot be the whole
 * answer. Layouts used to return just those two fields when a CMS page was
 * found, which silently dropped the canonical URL, the Open Graph block and
 * the Twitter card -- the editor filling in a nicer title was, without knowing
 * it, stripping the page of everything a link preview needs.
 *
 * Here the SeoMeta row is always the base, and the CMS values override the
 * title and description across every place they appear.
 */
export async function pageMetadata(slug: string): Promise<Metadata> {
  const [pageSeo, seo] = await Promise.all([getPageSeo(slug), getSeoMeta(slug)]);
  const base = buildMetadata(seo, slug);

  if (!pageSeo) return base;

  const description = pageSeo.description ?? (base.description || undefined);

  return {
    ...base,
    title: pageSeo.title,
    description,
    openGraph: { ...base.openGraph, title: pageSeo.title, description },
    twitter: { ...base.twitter, title: pageSeo.title, description },
  };
}
