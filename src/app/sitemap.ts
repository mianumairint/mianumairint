import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mianumairint.com";

/**
 * The category slugs the catalogue actually uses. The previous list was
 * written before the catalogue was imported and named nine categories that do
 * not exist, so the sitemap advertised filtered URLs that return nothing.
 */
const categories = [
  "edible-salt",
  "black-salt",
  "natural-lamps",
  "crafted-lamps",
  "candle-holders",
  "salt-tiles",
  "salt-cooking-tiles",
  "salt-grinders",
  "bath-salt",
  "salt-inhaler",
  "animal-licks",
  "industrial-salt",
  "rice",
  "horse-saddles",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/quote`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/catalogue`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const categoryPages = categories.map((slug) => ({
    url: `${BASE_URL}/products?category=${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages];
}
