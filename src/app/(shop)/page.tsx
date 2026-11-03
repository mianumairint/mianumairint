import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSeoMeta, buildMetadata } from "@/lib/seo";
import { resolveSystemPage, getPageSeo } from "@/lib/pages/getPage";
import PageRenderer from "@/components/cms/PageRenderer";

import HeroSection from "@/components/home/HeroSection";
import TrustBar from "@/components/home/TrustBar";
import ExportMapSection from "@/components/home/ExportMapSection";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import QuoteCTA from "@/components/home/QuoteCTA";
import Testimonials from "@/components/home/Testimonials";
import BlogPreview from "@/components/home/BlogPreview";

/**
 * The home page renders CMS content when the "/" page has been imported and
 * published. Until then (or if the database is unreachable) it falls back to
 * the original hardcoded sections, so the live site never goes blank.
 */

// Refresh public content every minute; admin saves invalidate it immediately.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const pageSeo = await getPageSeo("/");
  if (pageSeo) {
    return { title: pageSeo.title, description: pageSeo.description || undefined };
  }
  const seo = await getSeoMeta("/");
  return buildMetadata(seo, "/");
}

export default async function HomePage() {
  const resolved = await resolveSystemPage("/");

  // Home set to Draft hides it rather than silently reverting to the
  // hardcoded sections.
  if (resolved.mode === "draft") notFound();
  if (resolved.mode === "cms") return <PageRenderer page={resolved.page} />;

  return (
    <>
      <HeroSection />
      <TrustBar />
      <ExportMapSection />
      <CategoriesGrid />
      <FeaturedProducts />
      <WhyChooseUs />
      <QuoteCTA />
      <Testimonials />
      <BlogPreview />
    </>
  );
}
