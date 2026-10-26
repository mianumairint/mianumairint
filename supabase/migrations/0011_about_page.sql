-- ════════════════════════════════════════════════════════════════════════════
--  THE ABOUT PAGE, WRITTEN FOR A BUYER
--
--  What was there read like a brochure cover: three paragraphs of adjectives,
--  a row of years, a list of countries. Nothing a trade buyer actually decides
--  on -- who runs the company, what it can ship, how it is checked.
--
--  This rewrites the copy, adds the LEADERSHIP section (the portrait slot is
--  left empty on purpose: upload it in Admin -> Pages -> About -> Leadership
--  -> Portrait), and sharpens the title and description for search.
--
--  Headings are left as one <h1> in the hero and <h2> everywhere below, which
--  is what the components already render -- so the page keeps a single, clean
--  outline rather than competing titles.
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ── Search ──────────────────────────────────────────────────────────────
-- The old title led with the company name, which every page already carries;
-- a buyer searches for the thing, not the firm. 60 and 155 characters are
-- what Google will show before it cuts.
update public."Page"
   set "seoTitle" = 'Himalayan Salt Exporter Since 1995 | Khewra Mine, Pakistan',
       "seoDesc"  = 'Himalayan salt exporter in Faisalabad, Pakistan. Direct from the Khewra Salt Mine since 1995 — edible salt, lamps, tiles and spa products, wholesale worldwide.'
 where slug = '/about';

-- ── Hero ────────────────────────────────────────────────────────────────
update public."PageSection"
   set data = data || '{
  "eyebrow": "About Us",
  "heading": "Thirty Years From One Salt Mine",
  "subheading": "A family business in Faisalabad, exporting Himalayan salt from Khewra to buyers in more than thirty countries since 1995."
}'::jsonb
 where type = 'PAGE_HERO'
   and "pageId" = (select id from public."Page" where slug = '/about');

-- ── The story ───────────────────────────────────────────────────────────
-- Specific where the old copy was general: the mine is named, the depth of
-- the supply chain is stated, and the claims a buyer can check come first.
update public."PageSection"
   set data = '{
  "heading": "Who We Are",
  "html": "<p>Mian Umair International has been exporting Himalayan salt since 1995. We are based in Faisalabad, Pakistan, four hours from the Khewra Salt Mine in the Punjab foothills — the second-largest salt mine in the world, worked continuously since the 1870s and holding deposits laid down more than 250 million years ago.</p><p>We buy nothing on the open market. Our salt comes out of Khewra, is processed and packed in our own facility, and leaves on our own documentation. That is why we can tell you the grade, the granulation and the moisture content of what is in the container, and why a repeat order looks like the one before it.</p><p>Today we supply wholesalers, retailers, food manufacturers, spa operators and private-label brands across Asia, Europe, North America, the Middle East and Australia. Orders run from a single trial pallet to full container loads, FOB Karachi or CIF to your port.</p><p>What we sell is simple and it has not changed in thirty years: salt that is what we say it is, in the quantity agreed, on the date agreed.</p>"
}'::jsonb
 where type = 'RICH_TEXT'
   and "pageId" = (select id from public."Page" where slug = '/about');

-- ── Leadership ──────────────────────────────────────────────────────────
delete from public."PageSection"
 where type = 'LEADERSHIP'
   and "pageId" = (select id from public."Page" where slug = '/about');

insert into public."PageSection" ("pageId", type, "sortOrder", "isVisible", data) values
  ((select id from public."Page" where slug = '/about'), 'LEADERSHIP', 2, true,
   '{
  "eyebrow": "Leadership",
  "heading": "The People You Deal With",
  "image": "",
  "name": "Mian Umair Ahmad",
  "role": "Founder & Chief Executive",
  "quote": "Every container that leaves here carries my family name on the paperwork. That is the whole quality system.",
  "bio": "Mian Umair Ahmad founded the company in 1995 and still signs off the export documentation himself. He works directly with buyers on specification, packing and shipping terms, supported by offices in Canada and Indonesia and sales representatives in Australia, the Middle East and across Pakistan.\n\nIf you are placing a first order, you will be speaking to the people who will also be loading it."
}'::jsonb);

-- ── Why buyers choose us ────────────────────────────────────────────────
-- The old cards promised "trust" and "quality". These say what is actually
-- on offer, in the terms a purchasing manager uses.
update public."PageSection"
   set data = '{
  "heading": "What You Get Working With Us",
  "items": [
    {
      "icon": "factory",
      "title": "One Supply Chain, End To End",
      "description": "Mine to processing to packing to port, under our own control. No broker in the middle, no substituted material, no surprise on arrival."
    },
    {
      "icon": "verified",
      "title": "Documented And Certified",
      "description": "ISO 9001, HACCP, Halal and PCSIR. Certificates of analysis, phytosanitary papers and full export documentation supplied with every shipment."
    },
    {
      "icon": "inventory_2",
      "title": "Trial Orders Welcome",
      "description": "Start with a pallet before you commit to a container. Most buyers do, and we would rather you were sure."
    },
    {
      "icon": "label",
      "title": "Private Label And Custom Packing",
      "description": "Your brand, your artwork, your retail-ready cartons. We also pack bulk in 25kg and 50kg bags for processors."
    },
    {
      "icon": "schedule",
      "title": "Dates We Keep",
      "description": "Production slots are confirmed in writing before you pay. If something slips, you hear it from us first."
    },
    {
      "icon": "public",
      "title": "Local People In Your Market",
      "description": "Offices in Canada and Indonesia, and representatives in Australia and the Middle East, so there is someone in a nearby timezone."
    }
  ]
}'::jsonb
 where type = 'FEATURE_CARDS'
   and "pageId" = (select id from public."Page" where slug = '/about');

-- ── Closing call to action ──────────────────────────────────────────────
update public."PageSection"
   set data = data || '{
  "heading": "Tell Us What You Need Shipped",
  "subheading": "Send the product, the quantity and the destination port. Our export team comes back with pricing, lead time and packing options — usually within one working day.",
  "ctaLabel": "Request a Quote",
  "ctaHref": "/quote"
}'::jsonb
 where type = 'CTA_BANNER'
   and "pageId" = (select id from public."Page" where slug = '/about');

-- ── Order ───────────────────────────────────────────────────────────────
-- Hero, story, the person, then the record, the reach, the offices, the
-- terms, the certificates, and finally the ask.
with wanted(type, position) as (
  values ('PAGE_HERO', 0), ('RICH_TEXT', 1), ('LEADERSHIP', 2), ('TIMELINE', 3),
         ('MARKET_TAGS', 4), ('OFFICES', 5), ('FEATURE_CARDS', 6),
         ('CERTIFICATIONS', 7), ('CTA_BANNER', 8)
)
update public."PageSection" s
   set "sortOrder" = wanted.position
  from wanted
 where s.type = wanted.type
   and s."pageId" = (select id from public."Page" where slug = '/about');

commit;

-- The portrait is the one thing left to fill in:
--   Admin -> Pages -> About -> Leadership -> Portrait -> drag the photo in.
-- Until then the section centres its text and shows no empty frame.
