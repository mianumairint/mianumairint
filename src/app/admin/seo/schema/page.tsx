"use client";

import { useState } from "react";
import Link from "next/link";

interface SchemaItem {
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  global: boolean;
  json: object;
}

const initialSchemas: SchemaItem[] = [
  {
    name: "Organization",
    description:
      "Always active. Defines your organization identity for Google Knowledge Panel.",
    icon: "corporate_fare",
    enabled: true,
    global: true,
    json: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Mian Umair International",
      url: "https://mianumairint.com",
      logo: "https://mianumairint.com/logo.png",
      foundingDate: "1995",
      description:
        "Pakistan-based exporter of premium Himalayan salt products since 1995. Supplying wholesalers, retailers, and spa operators in 30+ countries.",
      telephone: "+92-320-755-0055",
      email: "info@mianumairint.com",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+92-320-755-0055",
          contactType: "sales",
          areaServed: "Worldwide",
        },
      ],
      sameAs: [
        "https://www.facebook.com/mianumairint",
        "https://www.instagram.com/mianumairint",
        "https://www.linkedin.com/company/mianumairint",
      ],
    },
  },
  {
    name: "LocalBusiness (Pakistan HQ)",
    description:
      "Marks your Pakistan headquarters as a local business with address and phone.",
    icon: "landscape",
    enabled: true,
    global: true,
    json: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Mian Umair International - Pakistan HQ",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Punjab Small Industrial Estate",
        addressLocality: "Faisalabad",
        addressRegion: "Punjab",
        postalCode: "38850",
        addressCountry: "PK",
      },
      telephone: "+92-320-755-0055",
      url: "https://mianumairint.com",
    },
  },
  {
    name: "LocalBusiness (Canada Office)",
    description: "Marks your North American office as a local business.",
    icon: "location_on",
    enabled: true,
    global: true,
    json: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "Mian Umair International - Canada Office",
      address: {
        "@type": "PostalAddress",
        streetAddress: "16-593 Kennedy Road",
        addressLocality: "Scarborough",
        addressRegion: "ON",
        postalCode: "M1K 2B2",
        addressCountry: "CA",
      },
      telephone: "+1-437-225-9136",
      url: "https://mianumairint.com",
    },
  },
  {
    name: "Product Schema",
    description:
      "Auto-generated on product pages. Includes name, price, image, availability.",
    icon: "inventory_2",
    enabled: true,
    global: false,
    json: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "[Product Name]",
      image: "[Product Image URL]",
      description: "[Product Description]",
      brand: { "@type": "Brand", name: "Mian Umair International" },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        priceCurrency: "USD",
        price: "[Price]",
      },
    },
  },
  {
    name: "Article Schema",
    description:
      "Auto-generated on blog post pages. Includes headline, author, date.",
    icon: "article",
    enabled: true,
    global: false,
    json: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "[Blog Post Title]",
      image: "[Featured Image URL]",
      author: { "@type": "Organization", name: "Mian Umair International" },
      publisher: {
        "@type": "Organization",
        name: "Mian Umair International",
        logo: {
          "@type": "ImageObject",
          url: "https://mianumairint.com/logo.png",
        },
      },
      datePublished: "[Publish Date]",
      dateModified: "[Modified Date]",
    },
  },
  {
    name: "BreadcrumbList",
    description:
      "Auto-generated on all pages. Provides breadcrumb navigation for search results.",
    icon: "linear_scale",
    enabled: true,
    global: false,
    json: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://mianumairint.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "[Page Name]",
          item: "[Page URL]",
        },
      ],
    },
  },
  {
    name: "FAQPage",
    description:
      "Auto-generated on the FAQ page. Shows FAQ rich snippets in search results.",
    icon: "quiz",
    enabled: true,
    global: false,
    json: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "[Question Text]",
          acceptedAnswer: { "@type": "Answer", text: "[Answer Text]" },
        },
      ],
    },
  },
];

export default function SchemaBuilderPage() {
  const [schemas, setSchemas] = useState<SchemaItem[]>(initialSchemas);
  const [selected, setSelected] = useState<number>(0);

  function toggleSchema(index: number) {
    // Don't allow toggling global schemas off
    if (schemas[index].global) return;
    setSchemas((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s))
    );
  }

  const globalSchemas = schemas.filter((s) => s.global);
  const autoSchemas = schemas.filter((s) => !s.global);

  const testUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(
    "https://mianumairint.com"
  )}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/seo"
              className="text-on-surface-variant hover:text-on-surface transition"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="font-headline text-2xl font-bold text-on-surface">
              Schema Builder
            </h1>
          </div>
          <p className="font-body text-sm text-on-surface-variant">
            Manage structured data (JSON-LD) schemas for rich search results
          </p>
        </div>
        <a
          href={testUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-lowest tonal-shadow hover:bg-surface-container transition font-label text-sm text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Test in Google Rich Results
        </a>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Schema List */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Global Schemas */}
          <div>
            <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
              Global Schemas (Always Active)
            </h2>
            <div className="space-y-3">
              {globalSchemas.map((schema) => {
                const globalIndex = schemas.indexOf(schema);
                return (
                  <div
                    key={schema.name}
                    onClick={() => setSelected(globalIndex)}
                    className={`bg-surface-container-lowest rounded-2xl tonal-shadow p-5 cursor-pointer transition-all ${
                      selected === globalIndex
                        ? "ring-2 ring-primary"
                        : "hover:ring-1 hover:ring-outline-variant/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full mineral-glow flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lg text-white">
                          {schema.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline text-base text-on-surface">
                            {schema.name}
                          </h3>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-label text-[10px] uppercase tracking-wider">
                            Always On
                          </span>
                        </div>
                        <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-0.5">
                          {schema.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Auto-generated Schemas */}
          <div>
            <h2 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
              Auto-generated Schemas
            </h2>
            <div className="space-y-3">
              {autoSchemas.map((schema) => {
                const autoIndex = schemas.indexOf(schema);
                return (
                  <div
                    key={schema.name}
                    onClick={() => setSelected(autoIndex)}
                    className={`bg-surface-container-lowest rounded-2xl tonal-shadow p-5 cursor-pointer transition-all ${
                      selected === autoIndex
                        ? "ring-2 ring-primary"
                        : "hover:ring-1 hover:ring-outline-variant/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            schema.enabled
                              ? "mineral-glow"
                              : "bg-surface-container"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-lg ${
                              schema.enabled
                                ? "text-white"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {schema.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-headline text-base text-on-surface">
                            {schema.name}
                          </h3>
                          <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-0.5">
                            {schema.description}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={schema.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSchema(autoIndex);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-surface-container-high rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="col-span-12 lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-lg text-on-surface">
                  {schemas[selected].name} Preview
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full font-label text-xs ${
                    schemas[selected].enabled
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {schemas[selected].enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="bg-[#1b1c1c] rounded-xl p-5 overflow-x-auto">
                <pre className="text-green-400 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {`<script type="application/ld+json">\n${JSON.stringify(
                    schemas[selected].json,
                    null,
                    2
                  )}\n</script>`}
                </pre>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <a
                  href={testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-label text-xs text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    open_in_new
                  </span>
                  Test in Google Rich Results
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(schemas[selected].json, null, 2)
                    );
                  }}
                  className="inline-flex items-center gap-1.5 font-label text-xs text-on-surface-variant hover:text-on-surface transition"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    content_copy
                  </span>
                  Copy JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-primary/5 rounded-2xl p-6 flex gap-4">
        <span className="material-symbols-outlined text-primary text-2xl shrink-0">
          info
        </span>
        <div>
          <h3 className="font-headline text-base text-on-surface mb-1">
            How schemas work
          </h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            Schemas are automatically injected into your frontend pages as JSON-LD
            structured data. Global schemas (Organization and LocalBusiness) are included
            on every page. Auto-generated schemas like Product, Article, BreadcrumbList,
            and FAQPage are injected on their respective page types. Google and other
            search engines use this structured data to display rich results like
            knowledge panels, product cards, and FAQ dropdowns.
          </p>
        </div>
      </div>
    </div>
  );
}
