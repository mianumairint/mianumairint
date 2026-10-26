-- ════════════════════════════════════════════════════════════════════════════
--  CMS PAGE CONTENT
--  Run after 0000_schema.sql. 0001 is not required first.
--
--  The five built-in pages and their sections, as edited in the dashboard.
--  Without them the site still works -- those routes fall back to their
--  original hardcoded components -- but the pages are not editable until the
--  rows exist.
--
--  Re-runnable: it replaces the sections of each page it touches and leaves
--  every other page alone.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ── Home  (/) ──
insert into public."Page" (id, title, slug, status, "seoTitle", "seoDesc", "isSystem")
values ('cmvcee7po0000dxrtyfu6dcsh', 'Home', '/', 'PUBLISHED', 'Himalayan Salt Exporter Since 1995 | Mian Umair International', 'Pakistan''s premier Himalayan salt exporter since 1995. Salt lamps, edible pink salt, black salt, tiles & bulk wholesale. Shipping to 30+ countries.', true)
on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status,
  "seoTitle" = excluded."seoTitle",
  "seoDesc" = excluded."seoDesc",
  "isSystem" = excluded."isSystem";

delete from public."PageSection" where "pageId" = (select id from public."Page" where slug = '/');
insert into public."PageSection" (id, "pageId", type, "sortOrder", "isVisible", data) values
  ('cmvcee7pr0001dxrty3t21sji', (select id from public."Page" where slug = '/'), 'HERO', 0, true, '{"eyebrow":"Pakistan''s Premier Himalayan Salt Exporter","heading":"Exporting Earth''s\nPurest Mineral","subheading":"Since 1995 · Faisalabad, Pakistan · Worldwide Shipping","primaryCtaHref":"/products","backgroundImage":"https://images.unsplash.com/photo-1600850056064-a8b380df8395?w=1920&q=80","primaryCtaLabel":"Explore Products","secondaryCtaHref":"/quote","secondaryCtaLabel":"Request a Quote"}'::jsonb),
  ('cmvcee7pr0002dxrtpl6yw0ji', (select id from public."Page" where slug = '/'), 'TRUST_BAR', 1, true, '{"items":["Exporting Since 1995","30+ Countries Served","ISO Certified Quality","Halal Certified","Direct from Khewra Mines","Custom Packaging Available"]}'::jsonb),
  ('cmvcee7pr0003dxrti6x2klp8', (select id from public."Page" where slug = '/'), 'EXPORT_MAP', 2, true, '{}'::jsonb),
  ('cmvcee7pr0004dxrtdu0cc88x', (select id from public."Page" where slug = '/'), 'CATEGORY_GRID', 3, true, '{"layout":"grid"}'::jsonb),
  ('cmvcee7pr0005dxrt2x7mvl6e', (select id from public."Page" where slug = '/'), 'FEATURED_PRODUCTS', 4, true, '{}'::jsonb),
  ('cmvcee7pr0006dxrt370ha67m', (select id from public."Page" where slug = '/'), 'FEATURE_CARDS', 5, true, '{"items":[{"icon":"factory","title":"Direct from Source","description":"We own our production. No middlemen. Salt straight from Khewra mines to your warehouse."},{"icon":"verified","title":"30 Years of Trust","description":"Since 1995, consistent quality and on-time delivery to buyers in 30+ countries worldwide."},{"icon":"local_shipping","title":"Flexible Packaging","description":"From 500g retail pouches to 25kg bulk sacks. Custom branding and private label available."}],"heading":"Why Buyers Choose Mian Umair International"}'::jsonb),
  ('cmvcee7pr0007dxrt9hnavkzm', (select id from public."Page" where slug = '/'), 'CTA_BANNER', 6, true, '{"ctaHref":"/quote","heading":"Ready to Place a Bulk Order?","variant":"split","ctaLabel":"Request a Quote","subheading":"Get a custom quote within 24 hours"}'::jsonb),
  ('cmvcee7pr0008dxrtves18c3l', (select id from public."Page" where slug = '/'), 'TESTIMONIALS', 7, true, '{"items":[{"quote":"The quality of salt lamps from MUI is unmatched. Consistent sizes, beautiful glow, and always packed perfectly for international shipping.","company":"Fresh Foods Distributors","location":"Sydney, Australia"},{"quote":"We''ve been sourcing edible pink salt from Mian Umair for over 5 years. Their pricing and reliability keep us coming back.","company":"Northern Spice Co.","location":"Ontario, Canada"},{"quote":"The salt tiles we ordered for our spa project arrived in perfect condition. Their team handled everything from packaging to customs.","company":"Wellness Interiors","location":"Dallas, USA"}],"heading":"What Our Buyers Say"}'::jsonb),
  ('cmvcee7pr0009dxrtznnth5wb', (select id from public."Page" where slug = '/'), 'BLOG_PREVIEW', 8, true, '{}'::jsonb),
  ('cmvcee7pr000adxrtt6usjdyd', (select id from public."Page" where slug = '/'), 'CERTIFICATIONS', 9, true, '{"items":["ISO","Halal","PCSIR","GMP"],"heading":"Certified Quality & Global Standards"}'::jsonb);

-- ── About Us  (/about) ──
insert into public."Page" (id, title, slug, status, "seoTitle", "seoDesc", "isSystem")
values ('cmvcee8x0000bdxrtl8j38hip', 'About Us', '/about', 'PUBLISHED', 'About Us — 30 Years of Himalayan Salt Excellence', 'Founded in Faisalabad 1995. Direct sourcing from Khewra Salt Mine.', true)
on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status,
  "seoTitle" = excluded."seoTitle",
  "seoDesc" = excluded."seoDesc",
  "isSystem" = excluded."isSystem";

delete from public."PageSection" where "pageId" = (select id from public."Page" where slug = '/about');
insert into public."PageSection" (id, "pageId", type, "sortOrder", "isVisible", data) values
  ('cmvcee8x1000cdxrth608z5ld', (select id from public."Page" where slug = '/about'), 'PAGE_HERO', 0, true, '{"heading":"Our Story","variant":"gradient","subheading":"From Faisalabad to the World Since 1995"}'::jsonb),
  ('cmvcee8x1000ddxrtgr9u2497', (select id from public."Page" where slug = '/about'), 'RICH_TEXT', 1, true, '{"html":"<p>Mian Umair International was founded in 1995 in Faisalabad, Pakistan, with a simple vision: to bring the purest Himalayan salt from the ancient Khewra mines to the rest of the world. What started as a small family operation has grown into a globally trusted name in the salt industry.</p><p>Our salt is hand-mined from the Khewra Salt Mines in the foothills of the Himalayas — the world''s second-largest salt mine, dating back over 250 million years. Every crystal carries trace minerals that give it the distinctive pink hue and mineral-rich profile that customers love.</p><p>Over three decades, we have built a vertically integrated supply chain: from mining and processing to packaging and global logistics. Today, we serve wholesalers, retailers, restaurants, and spa operators in more than 30 countries across five continents.</p><blockquote>\"Pure mineral wealth, hand-crafted with respect for the land.\"</blockquote>","heading":"30 Years of Pure Excellence"}'::jsonb),
  ('cmvcee8x1000edxrtoko7itwj', (select id from public."Page" where slug = '/about'), 'TIMELINE', 2, true, '{"items":[{"year":"1995","event":"Founded in Faisalabad, Pakistan"},{"year":"2000","event":"First export shipment to UAE"},{"year":"2005","event":"Expanded to European markets"},{"year":"2010","event":"Canada office established"},{"year":"2015","event":"ISO & Halal certified"},{"year":"2020","event":"Online B2B platform launched"},{"year":"2025","event":"Exporting to 30+ countries"}],"eyebrow":"Our Journey","heading":"Milestones"}'::jsonb),
  ('cmvcee8x1000fdxrt0kbxammw', (select id from public."Page" where slug = '/about'), 'MARKET_TAGS', 3, true, '{"items":["USA","Canada","UAE","UK","Germany","France","Australia","Saudi Arabia","South Korea","Japan","Netherlands","Italy","Spain","Poland","Malaysia","Singapore","Kuwait","Qatar","Bahrain","Oman"],"eyebrow":"Global Reach","heading":"Export Markets"}'::jsonb),
  ('cmvcee8x1000gdxrttmvqkfwj', (select id from public."Page" where slug = '/about'), 'OFFICES', 4, true, '{"items":[{"name":"Pakistan HQ","phone":"+92 300 123 4567","address":"Mian Umair International\nFaisalabad, Punjab, Pakistan","whatsapp":"923001234567","whatsappLabel":"WhatsApp Pakistan"},{"name":"Canada Office","phone":"+1 647 123 4567","address":"Mian Umair International\nMississauga, Ontario, Canada","whatsapp":"16471234567","whatsappLabel":"WhatsApp Canada"}],"heading":"Our Offices"}'::jsonb),
  ('cmvcee8x1000hdxrtr2ty5o45', (select id from public."Page" where slug = '/about'), 'FEATURE_CARDS', 5, true, '{"items":[{"icon":"factory","title":"Direct from Source","description":"We own our production. No middlemen. Salt straight from Khewra mines to your warehouse."},{"icon":"verified","title":"30 Years of Trust","description":"Since 1995, consistent quality and on-time delivery to buyers in 30+ countries worldwide."},{"icon":"local_shipping","title":"Flexible Packaging","description":"From 500g retail pouches to 25kg bulk sacks. Custom branding and private label available."}],"heading":"Why We''re Different"}'::jsonb),
  ('cmvcee8x1000idxrtf9mvl1p0', (select id from public."Page" where slug = '/about'), 'CERTIFICATIONS', 6, true, '{"items":["ISO","Halal","PCSIR","GMP"],"heading":"Certified Quality & Global Standards"}'::jsonb),
  ('cmvcee8x1000jdxrttf792yto', (select id from public."Page" where slug = '/about'), 'CTA_BANNER', 7, true, '{"ctaHref":"/quote","heading":"Ready to Partner With Us?","variant":"plain","ctaLabel":"Request a Quote","subheading":"Get in touch with our export team for competitive quotes, samples, and custom packaging options."}'::jsonb);

-- ── Catalogue  (/catalogue) ──
insert into public."Page" (id, title, slug, status, "seoTitle", "seoDesc", "isSystem")
values ('cmvceech8000sdxrt2zpbsxqo', 'Catalogue', '/catalogue', 'PUBLISHED', 'Product Catalogue 2025', 'Download our complete 2025 Himalayan salt export catalogue.', true)
on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status,
  "seoTitle" = excluded."seoTitle",
  "seoDesc" = excluded."seoDesc",
  "isSystem" = excluded."isSystem";

delete from public."PageSection" where "pageId" = (select id from public."Page" where slug = '/catalogue');
insert into public."PageSection" (id, "pageId", type, "sortOrder", "isVisible", data) values
  ('cmvceech8000tdxrtt3ar6ewr', (select id from public."Page" where slug = '/catalogue'), 'PAGE_HERO', 0, true, '{"ctaHref":"#","ctaIcon":"download","eyebrow":"Full Product Range","heading":"Product Catalogue 2025","ctaLabel":"Download PDF","subheading":"Explore our complete range of Himalayan salt products — from edible grades and lamps to tiles, decor, and bulk industrial supply. Every product sourced directly from the Khewra Salt Mines."}'::jsonb),
  ('cmvceech8000udxrt0x8iu91x', (select id from public."Page" where slug = '/catalogue'), 'CATEGORY_GRID', 1, true, '{"layout":"bento"}'::jsonb),
  ('cmvceech8000vdxrt2wwy4op5', (select id from public."Page" where slug = '/catalogue'), 'FEATURE_CARDS', 2, true, '{"items":[{"icon":"inventory_2","title":"Minimum Order Quantities","description":"MOQ varies by product. Edible salt starts at 1 tonne. Lamps and decor from 100 pieces. We accommodate trial orders for new buyers."},{"icon":"package_2","title":"Custom Packaging","description":"We offer private label, custom branding, and retail-ready packaging. Share your design or work with our team to create yours."},{"icon":"sailing","title":"Shipping Terms","description":"We ship FOB Karachi, CIF to your port, or EXW from our Faisalabad facility. Full container loads (FCL) and LCL options available."}],"heading":"Wholesale & Export Information"}'::jsonb),
  ('cmvceech8000wdxrt29leh7wf', (select id from public."Page" where slug = '/catalogue'), 'PRODUCT_INQUIRY_CTA', 3, true, '{"ctaHref":"/quote","heading":"Interested in our full range?","ctaLabel":"Request a Quote","subheading":"Send us an inquiry and our export team will respond within 24 hours."}'::jsonb);

-- ── Contact  (/contact) ──
insert into public."Page" (id, title, slug, status, "seoTitle", "seoDesc", "isSystem")
values ('cmvceebah000odxrtyainuppr', 'Contact', '/contact', 'PUBLISHED', 'Contact Us | Mian Umair International', 'Contact Mian Umair International. Pakistan & Canada offices.', true)
on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status,
  "seoTitle" = excluded."seoTitle",
  "seoDesc" = excluded."seoDesc",
  "isSystem" = excluded."isSystem";

delete from public."PageSection" where "pageId" = (select id from public."Page" where slug = '/contact');
insert into public."PageSection" (id, "pageId", type, "sortOrder", "isVisible", data) values
  ('cmvceebah000pdxrtrsrrglx2', (select id from public."Page" where slug = '/contact'), 'PAGE_HERO', 0, true, '{"eyebrow":"Contact Us","heading":"Get in Touch","subheading":"Our team in Pakistan and Canada is ready to help."}'::jsonb),
  ('cmvceebah000qdxrt95890ef9', (select id from public."Page" where slug = '/contact'), 'CONTACT_DETAILS', 1, true, '{"email":"mianumairint@gmail.com","hours":"Monday – Saturday: 9:00 AM – 6:00 PM (PKT)\nSunday: Closed","items":[{"name":"Pakistan Headquarters","phone":"+92-320-755-0055","address":"Punjab Small Industrial Estate,\nFaisalabad, Punjab 38850","whatsapp":"923207550055"},{"name":"North American Office","phone":"+1-437-225-9136","address":"16-593 Kennedy Road,\nScarborough, ON M1K 2B2,\nToronto, Canada","whatsapp":"14372259136"}],"heading":"Our Offices"}'::jsonb),
  ('cmvceebah000rdxrtd3oj4l30', (select id from public."Page" where slug = '/contact'), 'CONTACT_FORM', 2, true, '{"heading":"Send Us a Message","successMessage":"Thank you for reaching out. Our team will get back to you within 24 hours."}'::jsonb);

-- ── FAQ  (/faq) ──
insert into public."Page" (id, title, slug, status, "seoTitle", "seoDesc", "isSystem")
values ('cmvceea3t000kdxrtzv9sgg5d', 'FAQ', '/faq', 'PUBLISHED', 'FAQ — Frequently Asked Questions', 'Answers about MOQ, packaging, certifications, shipping terms.', true)
on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status,
  "seoTitle" = excluded."seoTitle",
  "seoDesc" = excluded."seoDesc",
  "isSystem" = excluded."isSystem";

delete from public."PageSection" where "pageId" = (select id from public."Page" where slug = '/faq');
insert into public."PageSection" (id, "pageId", type, "sortOrder", "isVisible", data) values
  ('cmvceea3u000ldxrtg5ualtoh', (select id from public."Page" where slug = '/faq'), 'PAGE_HERO', 0, true, '{"eyebrow":"Support","heading":"Common Questions"}'::jsonb),
  ('cmvceea3u000mdxrtsbmji7ip', (select id from public."Page" where slug = '/faq'), 'FAQ_LIST', 1, true, '{"items":[{"answer":"MOQ varies by product. For bulk pink salt, the minimum is typically one 20-foot container (approximately 18-20 metric tons). For salt lamps and decorative items, we can accommodate smaller trial orders starting from 500 pieces. Contact us for specific MOQ details for the product you are interested in.","question":"What is the minimum order quantity?"},{"answer":"Yes, we offer comprehensive custom packaging and private labeling services. Whether you need custom pouches, jars, boxes, or retail-ready packaging with your brand name, logo, and design, our in-house design team will work with you. We support packaging in multiple languages and can meet specific regulatory labeling requirements for your target market.","question":"Do you offer custom packaging and private labeling?"},{"answer":"We export worldwide to over 30 countries across North America, Europe, the Middle East, Asia, and Australia. Our major export destinations include the United States, Canada, United Kingdom, Germany, UAE, Saudi Arabia, Japan, and Australia. We handle all export documentation and can ship to any destination port.","question":"What countries do you export to?"},{"answer":"We hold ISO 9001:2015 (Quality Management), Halal Certification, PCSIR (Pakistan Council of Scientific and Industrial Research) lab testing certificates, and GMP (Good Manufacturing Practices) compliance. We also provide third-party lab analysis reports, Certificates of Origin, and can meet additional certification requirements upon request.","question":"What certifications do you hold?"},{"answer":"We offer flexible shipping terms including FOB (Free on Board) Karachi Port, CIF (Cost, Insurance and Freight) to your destination port, and EXW (Ex Works) from our factory. We work with trusted international freight forwarders and can arrange both sea freight and air freight depending on your urgency and budget.","question":"What are your shipping terms?"},{"answer":"Mian Umair International has been in the Himalayan salt industry since 1995, giving us nearly three decades of experience. We started as a small mining and processing operation and have grown into a vertically integrated manufacturer and exporter with our own mines, processing facilities, and global distribution network.","question":"How long has Mian Umair International been in business?"},{"answer":"Getting a price quote is easy. You can fill out our contact form on this website, send us an email at mianumairint@gmail.com, or reach us directly on WhatsApp at +92-320-755-0055. Please include the product type, desired quantity, packaging preferences, and destination country so we can provide an accurate quote within 24 hours.","question":"How do I get a price quote?"},{"answer":"We accept bank wire transfers (T/T), Letters of Credit (L/C) through major banks, and PayPal for smaller orders. For first-time buyers, we typically work with 30% advance payment and 70% before shipment or against copy of Bill of Lading. We can discuss flexible payment terms for long-term partnerships.","question":"What payment methods do you accept?"}],"asideText":"Chat with our team directly on WhatsApp for instant answers.","asideHeading":"Need Quick Help?","asideWhatsapp":"923207550055"}'::jsonb),
  ('cmvceea3u000ndxrtdzmh0vkg', (select id from public."Page" where slug = '/faq'), 'CTA_BANNER', 2, true, '{"ctaHref":"/contact","heading":"Still have questions?","variant":"solid","ctaLabel":"Contact Us","subheading":"Our team is happy to help with any questions about our products, pricing, or shipping."}'::jsonb);

commit;
