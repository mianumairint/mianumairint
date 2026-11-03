import type { Metadata } from "next";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getContentSupabase, selectOne } from "@/lib/supabase/server";
import { TABLES, type SeoGlobalSettingsRow, type SeoMetaRow } from "@/lib/supabase/types";
import { getPageSeo } from "@/lib/pages/getPage";
import { DEFAULT_SHARE_IMAGE } from "@/lib/branding";

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
  ogImage: DEFAULT_SHARE_IMAGE.url,
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
    ogImage: settings?.defaultOgImage || DEFAULT_SHARE_IMAGE.url,
    noIndex: !(settings?.defaultRobotsIndex ?? true),
    noFollow: !(settings?.defaultRobotsFollow ?? true),
  };
}

export const getSeoGlobalSettings = unstable_cache(async (): Promise<SeoGlobalSettingsRow | null> => {
  return selectOne<SeoGlobalSettingsRow>(
    getContentSupabase().from(TABLES.seoGlobalSettings).select("*").limit(1).maybeSingle()
  );
}, ["public-seo-settings"], { revalidate: 60, tags: ["public-seo"] });

const loadSeoMeta = cache(unstable_cache(async (slug: string): Promise<SeoMetaResult> => {
  const entry = await selectOne<SeoMetaRow>(
    getContentSupabase().from(TABLES.seoMeta).select("*").eq("slug", slug).limit(1).maybeSingle()
  );
  return entry ? fromEntry(entry) : fromGlobalSettings(await getSeoGlobalSettings());
}, ["public-seo-meta"], { revalidate: 60, tags: ["public-seo"] }));

export async function getSeoMeta(slug: string): Promise<SeoMetaResult> {
  try {
    return await loadSeoMeta(slug);
  } catch (error) {
    console.error(`getSeoMeta("${slug}") failed:`, error);
    return FALLBACK;
  }
}

export function buildMetadata(seo: SeoMetaResult, slug: string): Metadata {
  const robots: Metadata["robots"] = {};
  if (seo.noIndex) robots.index = false;
  if (seo.noFollow) robots.follow = false;

  const openGraphImage = seo.ogImage || DEFAULT_SHARE_IMAGE.url;
  const socialImage = seo.twitterImage || openGraphImage;

  return {
    title: seo.title,
    description: seo.metaDesc || undefined,
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.metaDesc || undefined,
      url: `${SITE_URL}${slug}`,
      siteName: SITE_NAME,
      type: (seo.ogType as "website" | "article") || "website",
      images: [openGraphImage === DEFAULT_SHARE_IMAGE.url ? DEFAULT_SHARE_IMAGE : { url: openGraphImage }],
    },
    twitter: {
      card: (seo.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || seo.title,
      description: seo.twitterDesc || seo.ogDescription || seo.metaDesc || undefined,
      images: [socialImage],
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
