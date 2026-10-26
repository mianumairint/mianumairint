import { notFound } from "next/navigation";
import { resolveSystemPage } from "@/lib/pages/getPage";
import { ContactPageRenderer } from "@/components/cms/PageRenderer";
import LegacyContactPage from "@/components/pages/legacy/contact";

/**
 * Renders the CMS version of /contact once imported and published.
 * If the page is set to Draft it 404s — it must NOT fall back to the legacy
 * component, or unpublishing would have no public effect.
 */
export const dynamic = "force-dynamic";

export default async function ContactRoute() {
  const resolved = await resolveSystemPage("/contact");

  if (resolved.mode === "draft") notFound();
  if (resolved.mode === "cms") return <ContactPageRenderer page={resolved.page} />;

  return <LegacyContactPage />;
}
