import type { PageDTO, PageSectionDTO, PageSectionType } from "@/types/page";

import {
  HeadingSection,
  RichTextSection,
  ImageSection,
  PageHeroSection,
  CtaBannerSection,
  ProductInquiryCtaSection,
} from "./sections/BasicSections";
import {
  HeroSectionCms,
  TrustBarSection,
  FeatureCardsSection,
  TestimonialsSection,
  CertificationsSection,
  TimelineSection,
  OfficesSection,
  MarketTagsSection,
  FaqListSection,
  ContactDetailsSection,
} from "./sections/LayoutSections";
import ContactFormSection from "./sections/ContactFormSection";
import ProductCarousel from "./sections/ProductCarousel";
import CatalogueBook from "./sections/CatalogueBook";
import LeadershipSection from "./sections/LeadershipSection";
import CredentialsSection from "./sections/CredentialsSection";

// Existing dynamic components are reused as-is — they already fetch their data.
import CategoriesGrid from "@/components/home/CategoriesGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BlogPreview from "@/components/home/BlogPreview";
import ExportMapSection from "@/components/home/ExportMapSection";

type SectionComponent = (props: { data: Record<string, any> }) => React.ReactNode;

/**
 * SECTION REGISTRY
 * ================
 * Maps a stored section type to the component that renders it. A type with no
 * entry renders nothing rather than throwing, so an unknown/legacy row can
 * never take a public page down.
 */
const REGISTRY: Partial<Record<PageSectionType, SectionComponent>> = {
  HEADING: HeadingSection,
  RICH_TEXT: RichTextSection,
  IMAGE: ImageSection,
  HERO: HeroSectionCms,
  PAGE_HERO: PageHeroSection,
  TRUST_BAR: TrustBarSection,
  FEATURE_CARDS: FeatureCardsSection,
  TESTIMONIALS: TestimonialsSection,
  CERTIFICATIONS: CertificationsSection,
  CTA_BANNER: CtaBannerSection,
  TIMELINE: TimelineSection,
  OFFICES: OfficesSection,
  FAQ_LIST: FaqListSection,
  MARKET_TAGS: MarketTagsSection,
  CONTACT_DETAILS: ContactDetailsSection,
  CONTACT_FORM: ContactFormSection,
  PRODUCT_INQUIRY_CTA: ProductInquiryCtaSection,
  PRODUCT_BANNERS: ProductCarousel,
  CATALOGUE_BOOK: CatalogueBook,
  LEADERSHIP: LeadershipSection,
  CREDENTIALS: CredentialsSection,

  // Dynamic sections ignore `data` except for an optional heading override.
  CATEGORY_GRID: () => <CategoriesGrid />,
  FEATURED_PRODUCTS: () => <FeaturedProducts />,
  BLOG_PREVIEW: () => <BlogPreview />,
  EXPORT_MAP: () => <ExportMapSection />,
};

export function renderSection(section: PageSectionDTO) {
  const Component = REGISTRY[section.type];
  if (!Component) return null;
  return <Component key={section.id} data={section.data} />;
}

/**
 * Section types that are meant to start a page edge to edge.
 *
 * The layout leaves a gap at the top for the floating header. A hero has to
 * reach up through it, or the header sits on a band of empty background
 * instead of over the picture.
 */
const FULL_BLEED_FIRST = new Set<PageSectionType>(["HERO", "PRODUCT_BANNERS"]);

/** Renders every visible section of a page in order. */
export default function PageRenderer({ page }: { page: PageDTO }) {
  const sections = page.slug === "/"
    ? page.sections.filter((section) => section.type !== "CERTIFICATIONS")
    : page.sections;
  return (
    <>
      {sections.map((section, i) => (
        <div
          key={section.id}
          data-section={section.type}
          className={
            i === 0 && FULL_BLEED_FIRST.has(section.type) ? "md:-mt-[88px]" : undefined
          }
        >
          {renderSection(section)}
        </div>
      ))}
    </>
  );
}

/**
 * Two-column layout used by the Contact page: details on the left, form on
 * the right, with any other sections rendered full width around them.
 */
export function ContactPageRenderer({ page }: { page: PageDTO }) {
  const details = page.sections.find((s) => s.type === "CONTACT_DETAILS");
  const form = page.sections.find((s) => s.type === "CONTACT_FORM");
  const rest = page.sections.filter(
    (s) => s.type !== "CONTACT_DETAILS" && s.type !== "CONTACT_FORM"
  );

  const hero = rest.find((s) => s.type === "PAGE_HERO");
  const below = rest.filter((s) => s.type !== "PAGE_HERO");

  return (
    <section className="bg-surface">
      {hero && renderSection(hero)}

      {(details || form) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">{details && renderSection(details)}</div>
            <div className="lg:col-span-7">{form && renderSection(form)}</div>
          </div>
        </div>
      )}

      {below.map((section) => (
        <div key={section.id} data-section={section.type}>
          {renderSection(section)}
        </div>
      ))}
    </section>
  );
}
