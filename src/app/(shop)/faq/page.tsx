import { notFound } from "next/navigation";
import { resolveSystemPage } from "@/lib/pages/getPage";
import PageRenderer from "@/components/cms/PageRenderer";
import LegacyFaqPage from "@/components/pages/legacy/faq";

/**
 * Renders the CMS version of /faq once imported and published.
 * If the page is set to Draft it 404s — it must NOT fall back to the legacy
 * component, or unpublishing would have no public effect.
 */
export const dynamic = "force-dynamic";

export default async function FaqRoute() {
  const resolved = await resolveSystemPage("/faq");

  if (resolved.mode === "draft") notFound();
  if (resolved.mode === "cms") return <PageRenderer page={resolved.page} />;

  return <LegacyFaqPage />;
}
