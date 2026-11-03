import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage } from "@/lib/pages/getPage";
import { pageMetadata } from "@/lib/seo";
import PageRenderer from "@/components/cms/PageRenderer";

/**
 * CATCH-ALL FOR CMS PAGES
 * =======================
 * Serves pages created in the dashboard at their own URL. This route sits
 * last in Next.js matching order, so every file-based route (/products,
 * /blog, /checkout, …) still wins — nothing existing is shadowed.
 *
 * Only PUBLISHED pages resolve; a draft or unknown slug is a 404.
 */

// Admin saves invalidate the page; database-side edits refresh within a minute.
export const revalidate = 60;

function toSlug(parts: string[] | undefined): string {
  return `/${(parts ?? []).join("/")}`.replace(/\/+$/, "") || "/";
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  // Through the shared helper, so a CMS page gets its canonical URL and its
  // Open Graph and Twitter blocks like every other page -- this used to
  // return a bare title and description and nothing else.
  return pageMetadata(toSlug(params.slug));
}

export default async function CmsCatchAllPage({ params }: { params: { slug?: string[] } }) {
  const page = await getPublishedPage(toSlug(params.slug));

  if (!page) notFound();

  return <PageRenderer page={page} />;
}
