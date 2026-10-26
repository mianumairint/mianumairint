-- ════════════════════════════════════════════════════════════════════════════
--  THE CATALOGUE, FROM THE CONTACT PAGE
--
--  /contact ends on a list of sales representatives. A buyer who has not yet
--  decided what to ask about has nothing to do there but close the tab.
--
--  This puts the catalogue at the foot of the page: read the twenty-six pages
--  on screen, or take the PDF away. The navbar and the mobile menu now carry
--  the same link, so it is reachable from anywhere on the site.
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

delete from public."PageSection"
 where type = 'CTA_BANNER'
   and "pageId" = (select id from public."Page" where slug = '/contact');

insert into public."PageSection" ("pageId", type, "sortOrder", "isVisible", data) values
  ((select id from public."Page" where slug = '/contact'), 'CTA_BANNER', 20, true,
   '{
  "variant": "split",
  "heading": "Not Sure What To Ask For Yet?",
  "subheading": "Our full catalogue runs to twenty-six pages — every grade, lamp, tile and spa line we export, with sizes and weights. Read it on the site or take the PDF with you.",
  "ctaLabel": "Browse the Catalogue",
  "ctaHref": "/catalogue"
}'::jsonb);

commit;
