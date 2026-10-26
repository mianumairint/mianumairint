-- ════════════════════════════════════════════════════════════════════════════
--  THE ABOUT PAGE GETS THE REAL OFFICES
--
--  /about carried two invented ones, left over from the first build:
--
--    Pakistan HQ    +92 300 123 4567   Faisalabad, Punjab, Pakistan
--    Canada Office  +1 647 123 4567    Mississauga, Ontario, Canada
--
--  None of it was real -- not the numbers, not the WhatsApp links, not the
--  street addresses. A buyer reading /about and dialling got nowhere.
--
--  The real details were already in the database, on /contact, where 0004 and
--  0005 put them. This copies them onto /about, and adds the Indonesia office,
--  which /about never listed at all.
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

update public."PageSection"
   set data = '{
  "heading": "Our Offices",
  "items": [
    {
      "name": "Pakistan HQ",
      "role": "Head Office",
      "address": "Imran Plaza, Layalpur Warehouses,\nFaisalabad, Pakistan 38000",
      "phone": "+92 320-7550055",
      "email": "mianumairinternational@gmail.com",
      "whatsapp": "14372259136",
      "whatsappLabel": "WhatsApp Pakistan"
    },
    {
      "name": "Canada Office",
      "role": "North America",
      "address": "206-37 Antrim Crescent,\nScarborough, ON M1P 0E8,\nCanada",
      "phone": "+1 (647) 777-9333",
      "email": "info@mianumairint.com",
      "whatsapp": "16477779333",
      "whatsappLabel": "WhatsApp Canada"
    },
    {
      "name": "Indonesia Office",
      "role": "South East Asia",
      "address": "Pentol Mas Doy, Jalan Dukuh Ngelo,\nRT.3/RW.2, Bancangan, Sambit,\nKab. Ponorogo, Jawa Timur 63474",
      "phone": "+62 821-1477-655",
      "email": "mianumairinternational@gmail.com",
      "whatsapp": "628211477655",
      "whatsappLabel": "WhatsApp Indonesia"
    }
  ]
}'::jsonb
 where type = 'OFFICES'
   and "pageId" = (select id from public."Page" where slug = '/about');

commit;

-- To check: no invented number should survive anywhere in page content.
--
--   select type, data from public."PageSection"
--    where data::text like '%123 4567%' or data::text like '%1234567%';
--   -- expect 0 rows
