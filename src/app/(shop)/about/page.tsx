import { notFound } from "next/navigation";
import { resolveSystemPage, findSection } from "@/lib/pages/getPage";
import PageRenderer from "@/components/cms/PageRenderer";
import LegacyAboutPage from "@/components/pages/legacy/about";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * Renders the CMS version of /about once imported and published.
 * If the page is set to Draft it 404s — it must NOT fall back to the legacy
 * component, or unpublishing would have no public effect.
 */
export const revalidate = 60;

type Office = Record<string, any>;

/**
 * The Organization record, built from the offices the page is already showing
 * rather than typed out again here. A number corrected in the admin is then
 * corrected in the structured data too, instead of the two drifting apart
 * until the one search engines read is the stale one.
 */
function organizationSchema(offices: Office[], milestones: Office[]) {
  const head = offices[0];

  const contactPoints = offices
    .filter((office) => office.phone)
    .map((office) => ({
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: String(office.phone),
      ...(office.email ? { email: office.email } : {}),
      areaServed: office.role || office.name,
      availableLanguage: ["English", "Urdu"],
    }));

  // The first milestone year is the founding year, and it is on the page for
  // anyone to read, so it does not need to be repeated as a constant.
  const founded = String(milestones[0]?.year || "").match(/\d{4}/)?.[0];

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/brand/logo.webp`,
    description:
      "Exporter of Himalayan pink salt from the Khewra Salt Mine, Pakistan — edible grades, lamps, tiles, cookware, bath and spa products, and animal licks, supplied wholesale worldwide since 1995.",
    ...(founded ? { foundingDate: founded } : {}),
    ...(head?.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: String(head.address).split("\n")[0],
            addressLocality: "Faisalabad",
            addressCountry: "PK",
          },
        }
      : {}),
    ...(contactPoints.length ? { contactPoint: contactPoints } : {}),
  };
}

export default async function AboutRoute() {
  const resolved = await resolveSystemPage("/about");

  if (resolved.mode === "draft") notFound();

  if (resolved.mode === "cms") {
    const offices = (findSection(resolved.page, "OFFICES")?.items ?? []) as Office[];
    const milestones = (findSection(resolved.page, "TIMELINE")?.items ?? []) as Office[];

    return (
      <>
        <JsonLd data={organizationSchema(offices, milestones)} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: resolved.page.seoTitle || resolved.page.title,
            url: `${SITE_URL}/about`,
            ...(resolved.page.seoDesc ? { description: resolved.page.seoDesc } : {}),
            mainEntity: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
            ],
          }}
        />
        <PageRenderer page={resolved.page} />
      </>
    );
  }

  return <LegacyAboutPage />;
}
