-- ════════════════════════════════════════════════════════════════════════════
--  LICENCES & CERTIFICATES  (/certifications)
--
--  A new page listing the company's registrations, each with the number a
--  buyer can look up for themselves and a slot for the scan of the document.
--
--  Served by the catch-all CMS route, so no code route is needed.
--
--  ┌─ READ THIS BEFORE UPLOADING THE SCANS ──────────────────────────────┐
--  │ The Faisalabad Chamber certificate has a CNIC printed on it. A CNIC │
--  │ is a national identity number and must NOT go on a public website:  │
--  │ with a name and a CNIC, someone can open accounts in that person's  │
--  │ name. Black it out in the image before uploading.                   │
--  │                                                                     │
--  │ GST and NTN are different -- Pakistani exporters print those on     │
--  │ invoices and letterheads, and a buyer checks them, so they are      │
--  │ listed below on purpose.                                            │
--  └─────────────────────────────────────────────────────────────────────┘
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ── The page ────────────────────────────────────────────────────────────
insert into public."Page" (title, slug, status, "seoTitle", "seoDesc", "isSystem")
values (
  'Licences & Certificates',
  '/certifications',
  'PUBLISHED',
  'Licences & Certificates | Mian Umair International',
  'Company registrations for Mian Umair International — Ontario business registration, D-U-N-S number and Faisalabad Chamber of Commerce membership, with reference numbers you can verify.',
  true
)
on conflict (slug) do update
   set title      = excluded.title,
       status     = excluded.status,
       "seoTitle" = excluded."seoTitle",
       "seoDesc"  = excluded."seoDesc";

delete from public."PageSection"
 where "pageId" = (select id from public."Page" where slug = '/certifications');

-- ── Hero ────────────────────────────────────────────────────────────────
insert into public."PageSection" ("pageId", type, "sortOrder", "isVisible", data) values
  ((select id from public."Page" where slug = '/certifications'), 'PAGE_HERO', 0, true,
   '{
  "variant": "gradient",
  "eyebrow": "Company Registrations",
  "heading": "Licences & Certificates",
  "subheading": "Every number on this page is held in a public register. Look us up before you place an order — we would rather you did."
}'::jsonb),

-- ── The documents ───────────────────────────────────────────────────────
-- The scans are already uploaded to Supabase Storage. The Chamber one has
-- its CNIC blacked out; the original, unredacted scan was never uploaded.
-- Order runs newest registration first, then the long-standing membership.
  ((select id from public."Page" where slug = '/certifications'), 'CREDENTIALS', 1, true,
   '{
  "eyebrow": "Registered And Verifiable",
  "heading": "Who Says So",
  "description": "A buyer sending money to a supplier they have not met is really asking two questions: does this company exist where it says it does, and has anyone independent confirmed it. These are the answers, with the reference numbers to check them against.",
  "items": [
    {
      "name": "Ontario Business Name Registration",
      "issuer": "Ministry of Public and Business Service Delivery, Province of Ontario, Canada",
      "summary": "Mian Umair International is registered as a business name in Ontario under the Business Names Act, held by our Canadian corporation. This is what lets us invoice and contract from Canada for North American buyers.",
      "details": [
        "Business name: MIAN UMAIR INTERNATIONAL",
        "Business Identification Number: 1001508838",
        "Registrant: 13615464 CANADA INC.",
        "Effective: 19 February 2026",
        "Expires: 18 February 2031"
      ],
      "image": "https://bdkqflbabuxykdhmwxnc.supabase.co/storage/v1/object/public/products/certificates/ontario-business-registration.jpg",
      "verifyUrl": "https://www.ontario.ca/page/search-business-name",
      "verifyLabel": "Search the Ontario register"
    },
    {
      "name": "D-U-N-S Number",
      "issuer": "Dun & Bradstreet",
      "summary": "A D-U-N-S number is the identifier banks, insurers and large buyers use to pull an independent file on a supplier. Ours is live in the D&B database, so a purchasing department can run its own check on us without asking us for anything.",
      "details": [
        "D-U-N-S: 75-337-5748",
        "Registered to: MIAN UMAIR INTERNATIONAL",
        "Issued: 15 September 2026"
      ],
      "image": "https://bdkqflbabuxykdhmwxnc.supabase.co/storage/v1/object/public/products/certificates/duns-number.jpg",
      "verifyUrl": "https://www.dnb.com/duns-number/lookup.html",
      "verifyLabel": "Look up our D-U-N-S"
    },
    {
      "name": "Chamber of Commerce Membership",
      "issuer": "The Faisalabad Chamber of Commerce & Industry — affiliated with the Federation of Pakistan Chambers of Commerce & Industry",
      "summary": "Associate Class membership of the Faisalabad Chamber, held continuously since 2019. The Chamber certifies export documents and certificates of origin, which is why most import customs authorities expect a supplier to be a member.",
      "details": [
        "Membership number: 2112241-10244",
        "Member since: 12 November 2019",
        "Valid until: 31 March 2027",
        "NTN: 0950057-0",
        "GST: 32-77-8761-810-08"
      ],
      "image": "https://bdkqflbabuxykdhmwxnc.supabase.co/storage/v1/object/public/products/certificates/chamber-of-commerce-membership.jpg",
      "verifyUrl": "https://fcci.com.pk/",
      "verifyLabel": "Faisalabad Chamber of Commerce"
    }
  ]
}'::jsonb),

-- ── Quality standards strip ─────────────────────────────────────────────
  ((select id from public."Page" where slug = '/certifications'), 'CERTIFICATIONS', 2, true,
   '{
  "heading": "Product Standards We Work To",
  "items": ["ISO 9001", "HACCP", "Halal", "PCSIR", "GMP"]
}'::jsonb),

-- ── Ask ─────────────────────────────────────────────────────────────────
  ((select id from public."Page" where slug = '/certifications'), 'CTA_BANNER', 3, true,
   '{
  "variant": "split",
  "heading": "Need Paperwork For Your Customs Broker?",
  "subheading": "Certificates of origin, certificates of analysis, phytosanitary certificates and chamber attestation are issued with every shipment. Tell us the destination and we will confirm exactly what is required.",
  "ctaLabel": "Talk To Our Export Team",
  "ctaHref": "/contact"
}'::jsonb);

commit;

