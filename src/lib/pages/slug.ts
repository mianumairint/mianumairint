/**
 * SLUG RULES FOR CMS PAGES
 * ========================
 * A page slug is stored with a leading slash ("/", "/about", "/our-team").
 *
 * System pages (Home, About, FAQ, Contact, Catalogue) keep the slug of the
 * route that already renders them. Every other slug must not collide with a
 * route that the app serves from code — products, blog, checkout, admin, api…
 */

/** Routes that back a system page: a CMS row here is expected, not a collision. */
export const SYSTEM_PAGE_SLUGS = ["/", "/about", "/faq", "/contact", "/catalogue"] as const;

/**
 * First path segments owned by code. A new page may not use these.
 * Derived from src/app: (shop) routes, admin, api, auth plus Next.js internals.
 */
export const RESERVED_SEGMENTS = [
  "admin",
  "api",
  "auth",
  "account",
  "blog",
  "products",
  "product",
  "catalogue",
  "cart",
  "checkout",
  "quote",
  "contact",
  "faq",
  "about",
  "wishlist",
  "orders",
  "search",
  "sitemap.xml",
  "robots.txt",
  "_next",
  "_vercel",
  "favicon.ico",
  "images",
  "uploads",
  "fonts",
  "static",
] as const;

export interface SlugValidation {
  ok: boolean;
  slug: string;
  error?: string;
}

/** Normalise user input into a canonical slug: "About Us" → "/about-us". */
export function normalizeSlug(input: string): string {
  const trimmed = (input || "").trim().toLowerCase();
  if (trimmed === "/" || trimmed === "") return "/";

  const cleaned = trimmed
    .replace(/^\/+|\/+$/g, "") // strip surrounding slashes
    // Separators first, so "sitemap.xml" → "sitemap-xml" rather than "sitemapxml"
    // and "Our_Process" → "our-process". Reserved names stay recognisable.
    .replace(/[\s_.]+/g, "-")
    .replace(/[^a-z0-9/-]/g, "") // drop anything still unsupported
    .replace(/-{2,}/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/(^-|-$)/g, "")
    .replace(/-?\/-?/g, "/"); // tidy hyphens that ended up beside a slash

  return cleaned ? `/${cleaned}` : "/";
}

/**
 * Validate a slug for a page.
 * `isSystem` relaxes the reserved-segment check for the five built-in pages.
 */
export function validateSlug(input: string, isSystem = false): SlugValidation {
  const slug = normalizeSlug(input);

  if (isSystem) {
    return SYSTEM_PAGE_SLUGS.includes(slug as (typeof SYSTEM_PAGE_SLUGS)[number])
      ? { ok: true, slug }
      : { ok: false, slug, error: `"${slug}" is not a known system page slug.` };
  }

  if (slug === "/") {
    return { ok: false, slug, error: "The home page slug is reserved. Edit the Home page instead." };
  }

  const segments = slug.replace(/^\//, "").split("/").filter(Boolean);

  // Check the raw first segment as well: normalisation turns "_next" into
  // "next" and "sitemap.xml" into "sitemap-xml", which would otherwise slip
  // past the blocklist and shadow a real asset path.
  const rawFirst = (input || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)[0];

  if (rawFirst && RESERVED_SEGMENTS.includes(rawFirst as (typeof RESERVED_SEGMENTS)[number])) {
    return {
      ok: false,
      slug,
      error: `"/${rawFirst}" is used by an existing part of the site. Choose a different URL.`,
    };
  }

  if (segments.length === 0) {
    return { ok: false, slug, error: "Enter a URL for this page." };
  }
  if (segments.length > 2) {
    return { ok: false, slug, error: "Use at most two path segments (e.g. /company/team)." };
  }
  if (slug.length > 120) {
    return { ok: false, slug, error: "URL is too long (120 characters max)." };
  }
  if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(slug)) {
    return {
      ok: false,
      slug,
      error: "Use lowercase letters, numbers and hyphens only (e.g. /our-process).",
    };
  }
  if (RESERVED_SEGMENTS.includes(segments[0] as (typeof RESERVED_SEGMENTS)[number])) {
    return {
      ok: false,
      slug,
      error: `"/${segments[0]}" is used by an existing part of the site. Choose a different URL.`,
    };
  }

  return { ok: true, slug };
}

export function isSystemSlug(slug: string): boolean {
  return SYSTEM_PAGE_SLUGS.includes(normalizeSlug(slug) as (typeof SYSTEM_PAGE_SLUGS)[number]);
}
