-- ════════════════════════════════════════════════════════════════════════════
--  HOME BANNERS, CONTACT DIRECTORY, CATEGORY ORDER
--  Run after 0004_company_details.sql.
--
--  It also turns PageSection.type from a Postgres enum into text, so that
--  adding a section type is a code change and nothing more.
--
--  Three things, all taken from https://mianumairint.com:
--    1. the row of product banners the live home page runs
--    2. the full contact directory -- head office, international
--       representatives and sales representatives, in the live order
--    3. the catalogue reordered so the salt lines come first and rice and
--       horse saddles follow
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ── Section type becomes free text ───────────────────────────────────────
-- It was a Postgres enum, which meant every new section type needed its own
-- migration run: Postgres refuses to use an enum value in the transaction
-- that added it. The type is already validated in the application -- the
-- save API rejects anything outside SECTION_SCHEMAS and the renderer skips
-- a type it does not know -- so the enum was a second, stricter copy of a
-- rule that lives in the code.
alter table public."PageSection" alter column type type text using type::text;
drop type if exists "PageSectionType";

-- ── Catalogue order: salt first ──────────────────────────────────────────
update public."Category" set "sortOrder" = 0 where slug = 'edible-salt';
update public."Category" set "sortOrder" = 1 where slug = 'black-salt';
update public."Category" set "sortOrder" = 2 where slug = 'natural-lamps';
update public."Category" set "sortOrder" = 3 where slug = 'crafted-lamps';
update public."Category" set "sortOrder" = 4 where slug = 'candle-holders';
update public."Category" set "sortOrder" = 5 where slug = 'salt-tiles';
update public."Category" set "sortOrder" = 6 where slug = 'salt-cooking-tiles';
update public."Category" set "sortOrder" = 7 where slug = 'salt-grinders';
update public."Category" set "sortOrder" = 8 where slug = 'bath-salt';
update public."Category" set "sortOrder" = 9 where slug = 'salt-inhaler';
update public."Category" set "sortOrder" = 10 where slug = 'animal-licks';
update public."Category" set "sortOrder" = 11 where slug = 'industrial-salt';
update public."Category" set "sortOrder" = 12 where slug = 'rice';
update public."Category" set "sortOrder" = 13 where slug = 'horse-saddles';

-- ── Home page product banners ────────────────────────────────────────────
delete from public."PageSection"
 where type = 'PRODUCT_BANNERS'
   and "pageId" = (select id from public."Page" where slug = '/');

-- Placed directly under the hero, above everything else, because the
-- catalogue is what the home page is for.
update public."PageSection" set "sortOrder" = "sortOrder" + 1
 where "pageId" = (select id from public."Page" where slug = '/')
   and "sortOrder" >= 1;

insert into public."PageSection" ("pageId", type, "sortOrder", "isVisible", data) values
  ((select id from public."Page" where slug = '/'), 'PRODUCT_BANNERS', 1, true,
   '{
  "eyebrow": "Our Range",
  "heading": "Himalayan Salt Products",
  "items": [
    {
      "title": "Edible Salt",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/edible-salt.webp",
      "href": "/products/edible-salt",
      "ctaLabel": "View Product"
    },
    {
      "title": "Black Salt",
      "image": "https://mianumairint.com/wp-content/uploads/2026/01/coarse-black-salt-fine-black-salt.webp",
      "href": "/products/black-salt",
      "ctaLabel": "View Product"
    },
    {
      "title": "Natural Lamps",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/salt-lamps.webp",
      "href": "/products/natural-lamps",
      "ctaLabel": "View Product"
    },
    {
      "title": "Crafted Lamps",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/basket-lamp.webp",
      "href": "/products/crafted-lamps",
      "ctaLabel": "View Product"
    },
    {
      "title": "Candle Holders",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/candle-holders.webp",
      "href": "/products/candle-holders",
      "ctaLabel": "View Product"
    },
    {
      "title": "Salt Tiles",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/salt-tiles.webp",
      "href": "/products/salt-tiles",
      "ctaLabel": "View Product"
    },
    {
      "title": "Salt Cooking Tiles",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/salt-blocks.webp",
      "href": "/products/salt-cooking-tiles",
      "ctaLabel": "View Product"
    },
    {
      "title": "Salt Grinders",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/salt-grinders.webp",
      "href": "/products/salt-grinders",
      "ctaLabel": "View Product"
    },
    {
      "title": "Bath Salt",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/bath-salt.webp",
      "href": "/products/bath-salt",
      "ctaLabel": "View Product"
    },
    {
      "title": "Salt Inhaler",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/salt-inhaler.webp",
      "href": "/products/salt-inhaler",
      "ctaLabel": "View Product"
    },
    {
      "title": "Animal Licks",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/animal-licks.webp",
      "href": "/products/animal-licks",
      "ctaLabel": "View Product"
    },
    {
      "title": "Industrial Salt",
      "image": "https://mianumairint.com/wp-content/uploads/2025/12/industrial-salt.webp",
      "href": "/products/industrial-salt",
      "ctaLabel": "View Product"
    },
    {
      "title": "Rice",
      "image": "https://mianumairint.com/wp-content/uploads/2026/01/home-rice.webp",
      "href": "/products/rice",
      "ctaLabel": "View Product"
    },
    {
      "title": "Horse Saddles",
      "image": "https://mianumairint.com/wp-content/uploads/2026/03/buy-saddle.webp",
      "href": "/products/horse-saddles",
      "ctaLabel": "View Product"
    }
  ]
}'::jsonb);

-- ── Contact directory ────────────────────────────────────────────────────
update public."PageSection"
   set data = '{
  "heading": "Head Office",
  "email": "info@mianumairint.com",
  "hours": "Monday – Saturday: 9:00 AM – 6:00 PM (PKT)\nSunday: Closed",
  "items": [
    {
      "role": "CEO",
      "name": "Mian Umair Ahmad",
      "phone": "+92 320-7550055",
      "email": "mianumairinternational@gmail.com",
      "whatsapp": "14372259136",
      "address": "Imran Plaza, Layalpur Warehouses,\nFaisalabad, Pakistan 38000"
    },
    {
      "role": "Canada Office",
      "name": "Mr Super",
      "phone": "+1 (647) 777-9333",
      "email": "info@mianumairint.com",
      "whatsapp": "16477779333",
      "address": "206-37 Antrim Crescent,\nScarborough, ON M1P 0E8,\nCanada"
    },
    {
      "role": "Indonesia Office",
      "name": "M Saim",
      "phone": "+62 821-1477-655",
      "email": "mianumairinternational@gmail.com",
      "whatsapp": "628211477655",
      "address": "Pentol Mas Doy, Jalan Dukuh Ngelo,\nRT.3/RW.2, Bancangan, Sambit,\nKab. Ponorogo, Jawa Timur 63474"
    }
  ]
}'::jsonb
 where type = 'CONTACT_DETAILS'
   and "pageId" = (select id from public."Page" where slug = '/contact');

-- The two representative lists sit below the form as full-width card grids.
delete from public."PageSection"
 where type = 'OFFICES'
   and "pageId" = (select id from public."Page" where slug = '/contact');

insert into public."PageSection" ("pageId", type, "sortOrder", "isVisible", data) values
  ((select id from public."Page" where slug = '/contact'), 'OFFICES', 10, true,
   '{
  "heading": "International Sales Representatives",
  "items": [
    {
      "name": "Muhammad Rashid",
      "role": "Australia",
      "phone": "+61 413 290 939",
      "email": "rashid@mianumairint.com",
      "whatsapp": "61413290939"
    },
    {
      "name": "Mudasar Mumtaz",
      "role": "Middle East",
      "phone": "+966 581 991911",
      "email": "muddasarmuint@gmail.com",
      "whatsapp": "966581991911"
    }
  ]
}'::jsonb),
  ((select id from public."Page" where slug = '/contact'), 'OFFICES', 11, true,
   '{
  "heading": "Sales Representatives",
  "items": [
    {
      "name": "Waseem Munir",
      "phone": "+92 371-1288779",
      "email": "info@mianumairint.com",
      "whatsapp": "923711288779"
    },
    {
      "name": "Mirza Rumaan",
      "phone": "+92 339-0703394",
      "email": "rumaan@mianumairint.com",
      "whatsapp": "923390703394"
    },
    {
      "name": "Syed Fiaz Hussain",
      "phone": "+92 301-6817744",
      "email": "fiazmuint@gmail.com",
      "whatsapp": "923016817744"
    },
    {
      "name": "Muhammad Ahmad",
      "phone": "+92 335-7335135",
      "email": "ahmad@mianumairint.com",
      "whatsapp": "923357335135"
    },
    {
      "name": "Muhammad Ahmad Raza",
      "phone": "+92 302-0408062",
      "email": "ahmadraza@mianumairint.com",
      "whatsapp": "923020408062"
    },
    {
      "name": "Muhammad Imran Ijaz",
      "phone": "+92 321-7171852",
      "email": "imran@mianumairint.com",
      "whatsapp": "923217171852"
    }
  ]
}'::jsonb);

commit;
