/**
 * PAGE / SECTION CONTENT TYPES
 * ============================
 * `PageSection.data` is a Json column. Each section type has its own shape,
 * declared here and rendered by the matching entry in
 * `src/components/cms/sectionRegistry.tsx`.
 *
 * Editable field metadata lives in `SECTION_SCHEMAS` so the admin editor can
 * build a form for any section type without a bespoke component per type.
 */

export type PageStatus = "DRAFT" | "PUBLISHED";

export type PageSectionType =
  | "HEADING"
  | "RICH_TEXT"
  | "IMAGE"
  | "HERO"
  | "PAGE_HERO"
  | "TRUST_BAR"
  | "FEATURE_CARDS"
  | "TESTIMONIALS"
  | "CERTIFICATIONS"
  | "CTA_BANNER"
  | "TIMELINE"
  | "OFFICES"
  | "FAQ_LIST"
  | "MARKET_TAGS"
  | "CONTACT_DETAILS"
  | "CONTACT_FORM"
  | "CATEGORY_GRID"
  | "FEATURED_PRODUCTS"
  | "BLOG_PREVIEW"
  | "EXPORT_MAP"
  | "PRODUCT_INQUIRY_CTA"
  | "PRODUCT_BANNERS"
  | "CATALOGUE_BOOK"
  | "LEADERSHIP"
  | "CREDENTIALS";

export interface PageSectionDTO {
  id: string;
  type: PageSectionType;
  sortOrder: number;
  isVisible: boolean;
  data: Record<string, any>;
}

export interface PageDTO {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  seoTitle: string | null;
  seoDesc: string | null;
  isSystem: boolean;
  sections: PageSectionDTO[];
  createdAt?: string;
  updatedAt?: string;
}

/* ── Editor field descriptors ───────────────────────────── */

export type FieldKind =
  | "text"
  | "textarea"
  | "richtext"
  | "image"
  | "url"
  | "icon"
  | "list" // list of plain strings
  | "repeater"; // list of objects, shape in `fields`

export interface FieldSchema {
  key: string;
  label: string;
  kind: FieldKind;
  help?: string;
  /** For `repeater`: the shape of each row. */
  fields?: FieldSchema[];
}

export interface SectionSchema {
  type: PageSectionType;
  label: string;
  /** Shown in the "add section" picker. */
  description: string;
  /** Basic building blocks appear first in the picker. */
  group: "content" | "section";
  /** Dynamic sections pull from the database and have no editable copy. */
  dynamic?: boolean;
  fields: FieldSchema[];
}

const LINK_FIELDS: FieldSchema[] = [
  { key: "primaryCtaLabel", label: "Primary button label", kind: "text" },
  { key: "primaryCtaHref", label: "Primary button link", kind: "url" },
  { key: "secondaryCtaLabel", label: "Secondary button label", kind: "text" },
  { key: "secondaryCtaHref", label: "Secondary button link", kind: "url" },
];

export const SECTION_SCHEMAS: SectionSchema[] = [
  /* ── Basic content blocks ── */
  {
    type: "HEADING",
    label: "Heading",
    description: "A standalone heading, optionally with a short subtitle.",
    group: "content",
    fields: [
      { key: "eyebrow", label: "Eyebrow (small label above)", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Subheading", kind: "textarea" },
      { key: "align", label: "Alignment (left / center)", kind: "text" },
    ],
  },
  {
    type: "RICH_TEXT",
    label: "Rich text",
    description: "Formatted body copy with headings, lists and links.",
    group: "content",
    fields: [
      { key: "heading", label: "Heading (optional)", kind: "text" },
      { key: "html", label: "Body", kind: "richtext" },
    ],
  },
  {
    type: "IMAGE",
    label: "Image",
    description: "A single image with optional caption.",
    group: "content",
    fields: [
      { key: "url", label: "Image", kind: "image" },
      { key: "altText", label: "Alt text", kind: "text" },
      { key: "caption", label: "Caption", kind: "text" },
    ],
  },

  /* ── Named layout sections ── */
  {
    type: "HERO",
    label: "Full-screen hero",
    description: "Background image, large headline and two buttons.",
    group: "section",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Headline", kind: "textarea", help: "Line breaks are preserved." },
      { key: "subheading", label: "Sub-line", kind: "text" },
      { key: "backgroundImage", label: "Background image", kind: "image" },
      ...LINK_FIELDS,
    ],
  },
  {
    type: "PAGE_HERO",
    label: "Page header",
    description: "Compact page title band used on inner pages.",
    group: "section",
    fields: [
      { key: "eyebrow", label: "Chip / eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Subheading", kind: "textarea" },
      { key: "variant", label: "Style (plain / gradient)", kind: "text" },
      { key: "ctaLabel", label: "Button label", kind: "text" },
      { key: "ctaHref", label: "Button link", kind: "url" },
      { key: "ctaIcon", label: "Button icon", kind: "icon" },
    ],
  },
  {
    type: "TRUST_BAR",
    label: "Trust bar",
    description: "Single row of short trust statements.",
    group: "section",
    fields: [{ key: "items", label: "Items", kind: "list" }],
  },
  {
    type: "FEATURE_CARDS",
    label: "Feature cards",
    description: "Three-up cards with icon, title and description.",
    group: "section",
    fields: [
      { key: "heading", label: "Section heading", kind: "text" },
      {
        key: "items",
        label: "Cards",
        kind: "repeater",
        fields: [
          { key: "icon", label: "Icon", kind: "icon" },
          { key: "title", label: "Title", kind: "text" },
          { key: "description", label: "Description", kind: "textarea" },
        ],
      },
    ],
  },
  {
    type: "TESTIMONIALS",
    label: "Testimonials",
    description: "Customer quotes with company and location.",
    group: "section",
    fields: [
      { key: "heading", label: "Section heading", kind: "text" },
      {
        key: "items",
        label: "Quotes",
        kind: "repeater",
        fields: [
          { key: "quote", label: "Quote", kind: "textarea" },
          { key: "company", label: "Company", kind: "text" },
          { key: "location", label: "Location", kind: "text" },
        ],
      },
    ],
  },
  {
    type: "CERTIFICATIONS",
    label: "Certifications",
    description: "Row of certification labels.",
    group: "section",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "items", label: "Certifications", kind: "list" },
    ],
  },
  {
    type: "CTA_BANNER",
    label: "Call-to-action banner",
    description: "Coloured band with a heading and one button.",
    group: "section",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Supporting text", kind: "textarea" },
      { key: "ctaLabel", label: "Button label", kind: "text" },
      { key: "ctaHref", label: "Button link", kind: "url" },
      { key: "variant", label: "Style (solid / split / plain)", kind: "text" },
    ],
  },
  {
    type: "TIMELINE",
    label: "Timeline",
    description: "Milestones by year.",
    group: "section",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      {
        key: "items",
        label: "Milestones",
        kind: "repeater",
        fields: [
          { key: "year", label: "Year", kind: "text" },
          { key: "event", label: "Event", kind: "text" },
        ],
      },
    ],
  },
  {
    type: "OFFICES",
    label: "Office cards",
    description: "Office locations with phone and WhatsApp link.",
    group: "section",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      {
        key: "items",
        label: "Offices",
        kind: "repeater",
        fields: [
          { key: "name", label: "Name", kind: "text" },
          { key: "role", label: "Role / region", kind: "text" },
          { key: "address", label: "Address", kind: "textarea" },
          { key: "phone", label: "Phone", kind: "text" },
          { key: "email", label: "Email", kind: "text" },
          { key: "whatsapp", label: "WhatsApp number (digits only)", kind: "text" },
          { key: "whatsappLabel", label: "WhatsApp link label", kind: "text" },
        ],
      },
    ],
  },
  {
    type: "FAQ_LIST",
    label: "FAQ accordion",
    description: "Expandable question and answer list.",
    group: "section",
    fields: [
      { key: "heading", label: "Heading (optional)", kind: "text" },
      { key: "asideHeading", label: "Side card heading", kind: "text" },
      { key: "asideText", label: "Side card text", kind: "textarea" },
      { key: "asideWhatsapp", label: "Side card WhatsApp number", kind: "text" },
      { key: "asideImage", label: "Side card image", kind: "image" },
      {
        key: "items",
        label: "Questions",
        kind: "repeater",
        fields: [
          { key: "question", label: "Question", kind: "text" },
          { key: "answer", label: "Answer", kind: "textarea" },
        ],
      },
    ],
  },
  {
    type: "MARKET_TAGS",
    label: "Market tags",
    description: "Grid of country / market names.",
    group: "section",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "items", label: "Markets", kind: "list" },
    ],
  },
  {
    type: "CONTACT_DETAILS",
    label: "Contact details",
    description: "Addresses, phone numbers, email and WhatsApp.",
    group: "section",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "email", label: "Email", kind: "text" },
      { key: "hours", label: "Business hours", kind: "textarea" },
      {
        key: "items",
        label: "Locations",
        kind: "repeater",
        fields: [
          { key: "name", label: "Name", kind: "text" },
          { key: "role", label: "Role / region", kind: "text" },
          { key: "address", label: "Address", kind: "textarea" },
          { key: "phone", label: "Phone", kind: "text" },
          { key: "email", label: "Email", kind: "text" },
          { key: "whatsapp", label: "WhatsApp number", kind: "text" },
        ],
      },
    ],
  },
  {
    type: "CONTACT_FORM",
    label: "Contact form",
    description: "The enquiry form. Submissions appear under Messages.",
    group: "section",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "successMessage", label: "Message after sending", kind: "textarea" },
    ],
  },
  {
    type: "PRODUCT_INQUIRY_CTA",
    label: "Product inquiry CTA",
    description: "Band linking to the quote/inquiry form.",
    group: "section",
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "subheading", label: "Supporting text", kind: "textarea" },
      { key: "ctaLabel", label: "Button label", kind: "text" },
      { key: "ctaHref", label: "Button link", kind: "url" },
    ],
  },

  {
    type: "CREDENTIALS",
    label: "Licences & certificates",
    description:
      "Registrations and memberships, each with its number and a scan of the document.",
    group: "section",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "description", label: "Intro text", kind: "textarea" },
      {
        key: "items",
        label: "Documents",
        kind: "repeater",
        fields: [
          { key: "badge", label: "Status badge", kind: "text", help: "e.g. Verified Registration" },
          { key: "name", label: "Document name", kind: "text" },
          { key: "issuer", label: "Issued by", kind: "text" },
          { key: "summary", label: "What it means", kind: "textarea" },
          {
            key: "details",
            label: "Reference numbers",
            kind: "list",
            help: "One per line, written as — Label: Value",
          },
          {
            key: "image",
            label: "Document scan",
            kind: "image",
            help: "Optional. Redact any national ID number before uploading.",
          },
          { key: "verifyUrl", label: "Verify at (link)", kind: "url" },
          { key: "verifyLabel", label: "Verify link label", kind: "text" },
          { key: "note", label: "Footnote under the buttons", kind: "textarea" },
        ],
      },
    ],
  },
  {
    type: "LEADERSHIP",
    label: "Leadership",
    description:
      "A portrait, a name and a few words from the person behind the company.",
    group: "section",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      {
        key: "image",
        label: "Portrait",
        kind: "image",
        help: "Optional. Without one the section centres the text instead of showing an empty frame.",
      },
      { key: "name", label: "Name", kind: "text" },
      { key: "role", label: "Role", kind: "text" },
      { key: "quote", label: "Quote", kind: "textarea" },
      { key: "bio", label: "Biography", kind: "textarea" },
    ],
  },
  {
    type: "CATALOGUE_BOOK",
    label: "Catalogue book",
    description:
      "The printed catalogue as a page-turning book, with a download link.",
    group: "section",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading", kind: "text" },
      { key: "description", label: "Intro text", kind: "textarea" },
      {
        key: "pdfUrl",
        label: "Catalogue PDF",
        kind: "url",
        help: "Defaults to /catalogue/salt-catalogue.pdf.",
      },
      { key: "downloadLabel", label: "Download button label", kind: "text" },
    ],
  },
  {
    type: "PRODUCT_BANNERS",
    label: "Product carousel",
    description: "A full-width carousel of product photographs, each linking to a product.",
    group: "section",
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Section heading", kind: "text" },
      {
        key: "items",
        label: "Banners",
        kind: "repeater",
        fields: [
          { key: "title", label: "Title", kind: "text" },
          { key: "subtitle", label: "Supporting text", kind: "text" },
          { key: "image", label: "Banner image", kind: "image" },
          { key: "href", label: "Links to", kind: "url" },
          { key: "ctaLabel", label: "Link label", kind: "text" },
        ],
      },
    ],
  },

  /* ── Dynamic sections (content comes from the database) ── */
  {
    type: "CATEGORY_GRID",
    label: "Category grid",
    description: "Pulls live categories from the database.",
    group: "section",
    dynamic: true,
    fields: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "layout", label: "Layout (grid / bento)", kind: "text" },
    ],
  },
  {
    type: "FEATURED_PRODUCTS",
    label: "Featured products",
    description: "Pulls products flagged as featured.",
    group: "section",
    dynamic: true,
    fields: [{ key: "heading", label: "Heading", kind: "text" }],
  },
  {
    type: "BLOG_PREVIEW",
    label: "Latest blog posts",
    description: "Pulls the most recent published posts.",
    group: "section",
    dynamic: true,
    fields: [{ key: "heading", label: "Heading", kind: "text" }],
  },
  {
    type: "EXPORT_MAP",
    label: "Export markets map",
    description: "Pulls export markets from the database.",
    group: "section",
    dynamic: true,
    fields: [{ key: "heading", label: "Heading", kind: "text" }],
  },
];

export function getSectionSchema(type: PageSectionType): SectionSchema | undefined {
  return SECTION_SCHEMAS.find((s) => s.type === type);
}

export function sectionLabel(type: PageSectionType): string {
  return getSectionSchema(type)?.label ?? type;
}
