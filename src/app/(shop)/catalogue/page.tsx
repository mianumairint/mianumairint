import { notFound } from "next/navigation";
import { resolveSystemPage } from "@/lib/pages/getPage";
import PageRenderer from "@/components/cms/PageRenderer";
import LegacyCataloguePage from "@/components/pages/legacy/catalogue";

/**
 * Renders the CMS version of /catalogue once imported and published.
 * If the page is set to Draft it 404s — it must NOT fall back to the legacy
 * component, or unpublishing would have no public effect.
 */
export const dynamic = "force-dynamic";

export default async function CatalogueRoute() {
  const resolved = await resolveSystemPage("/catalogue");

  if (resolved.mode === "draft") notFound();
  if (resolved.mode === "cms") return <PageRenderer page={resolved.page} />;

  return <LegacyCataloguePage />;
}
