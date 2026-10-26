-- ════════════════════════════════════════════════════════════════════════════
--  COMPANY DETAILS  —  imported from https://mianumairint.com
--  Run after 0003_catalogue.sql.
--
--  Replaces the placeholder contact information that was in the CMS with the
--  addresses, numbers and FAQs the live site actually publishes. The previous
--  values named a Faisalabad industrial estate and a Kennedy Road office that
--  appear nowhere on the live site.
--
--  Re-runnable: every statement updates by slug or key.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ── Contact details  (/contact) ──────────────────────────────────────────
-- Three offices, exactly as the live site's footer and contact page list them.
update public."PageSection"
   set data = '{
     "heading": "Our Offices",
     "email": "info@mianumairint.com",
     "hours": "Monday – Saturday: 9:00 AM – 6:00 PM (PKT)\nSunday: Closed",
     "items": [
       {
         "name": "Pakistan Headquarters",
         "address": "Imran Plaza, Layalpur Warehouses,\nFaisalabad, Pakistan 38000",
         "phone": "+92 320-7550055"
       },
       {
         "name": "Canada Office",
         "address": "206-37 Antrim Crescent,\nScarborough, ON M1P 0E8,\nCanada",
         "phone": "+1 (647) 777-9333",
         "whatsapp": "16477779333"
       },
       {
         "name": "Indonesia Office",
         "address": "Pentol Mas Doy, Jalan Dukuh Ngelo,\nRT.3/RW.2, Bancangan, Sambit,\nKab. Ponorogo, Jawa Timur 63474",
         "phone": "+62 821-1477-655",
         "whatsapp": "628211477655"
       }
     ]
   }'::jsonb
 where type = 'CONTACT_DETAILS'
   and "pageId" = (select id from public."Page" where slug = '/contact');


-- ── FAQ  (/faq) ──────────────────────────────────────────────────────────
-- The five questions the live site answers. The previous list quoted specific
-- minimum order quantities that the live site does not state anywhere; they
-- are replaced rather than kept, because an invented MOQ in writing is worse
-- than no MOQ.
update public."PageSection"
   set data = '{
     "items": [
       {
         "question": "What types of salt do you supply?",
         "answer": "We supply a wide range of salts, including food-grade table salt, refined industrial salt, Himalayan pink salt, rock salt, and bath salts. Specific product categories can be customized to client needs."
       },
       {
         "question": "Do you offer bulk and wholesale quantities?",
         "answer": "Yes. We specialize in bulk supply for wholesalers, distributors, retailers, and industrial clients. Minimum Order Quantity (MOQ) may vary depending on the product type."
       },
       {
         "question": "Can you provide customized packaging?",
         "answer": "Yes, we offer private labeling and customized packaging solutions as per client requirements. Packaging sizes range from retail packs (500g, 1kg) to jumbo bags (25kg, 50kg, or more)."
       },
       {
         "question": "Do you export salt internationally?",
         "answer": "Yes, we export salt worldwide. Our logistics team ensures proper documentation, compliance, and safe delivery to your port of choice."
       },
       {
         "question": "What is your delivery timeline?",
         "answer": "Delivery timelines depend on the order size and destination. Domestic deliveries are usually fulfilled within a few days, while international shipments may take 2–4 weeks."
       }
     ]
   }'::jsonb
 where type = 'FAQ_LIST'
   and "pageId" = (select id from public."Page" where slug = '/faq');


-- ── Export markets ───────────────────────────────────────────────────────
-- The destinations the live site names across its product and about pages.
delete from public."ExportMarket";

insert into public."ExportMarket" (country, city, flag, since) values
  ('United States', 'Dallas',        '🇺🇸', null),
  ('United States', 'California',    '🇺🇸', null),
  ('Canada',        'Ontario',       '🇨🇦', null),
  ('Australia',     'Sydney',        '🇦🇺', null),
  ('Ireland',       'Nationwide',    '🇮🇪', null),
  ('Saudi Arabia',  'Nationwide',    '🇸🇦', null),
  ('Indonesia',     'Ponorogo',      '🇮🇩', null);


-- ── Site settings ────────────────────────────────────────────────────────
-- Company-wide contact information, keyed so the dashboard's Settings screen
-- can edit it.
insert into public."SiteSetting" (key, value, "group") values
  ('company_name',      'Mian Umair International',        'contact'),
  ('company_email',     'info@mianumairint.com',           'contact'),
  ('company_email_alt', 'mianumairinternational@gmail.com','contact'),
  ('company_phone',     '+92 320-7550055',                 'contact'),
  ('company_phone_ca',  '+1 (437) 225-9136',               'contact'),
  ('company_whatsapp',  '14372259136',                    'contact'),
  ('company_address',   'Imran Plaza, Layalpur Warehouses, Faisalabad, Pakistan 38000', 'contact'),
  ('founded_year',      '1995',                            'general'),
  ('social_facebook',   'https://www.facebook.com/mianumairinternational', 'social'),
  ('social_instagram',  'https://www.instagram.com/mian_umair_int/','social'),
  ('social_linkedin',   'https://www.linkedin.com/in/mianumair-international-1b551b291','social')
on conflict (key) do update set
  value = excluded.value,
  "group" = excluded."group";

commit;
