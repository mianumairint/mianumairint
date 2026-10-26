-- ════════════════════════════════════════════════════════════════════════════
--  THE PRODUCT CAROUSEL TAKES THE TOP OF THE HOME PAGE
--  Run after 0005_home_banners_and_contacts.sql.
--
--  The hero was a stock photograph with nothing to do with the catalogue, so
--  the product banners move up into its place and run as a carousel instead of
--  a stack.
--
--  The hero is hidden rather than deleted: its headline and buttons are still
--  in the row, and one toggle in Pages → Home brings it back.
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- Everything shifts down by one, then the carousel takes position 0.
update public."PageSection"
   set "sortOrder" = "sortOrder" + 1
 where "pageId" = (select id from public."Page" where slug = '/')
   and type <> 'PRODUCT_BANNERS';

update public."PageSection"
   set "sortOrder" = 0
 where "pageId" = (select id from public."Page" where slug = '/')
   and type = 'PRODUCT_BANNERS';

update public."PageSection"
   set "isVisible" = false
 where "pageId" = (select id from public."Page" where slug = '/')
   and type = 'HERO';

-- Close the gaps the shuffle leaves, so the order is 0,1,2,… again and the
-- editor's drag handles behave.
with ordered as (
  select id, row_number() over (order by "sortOrder") - 1 as position
    from public."PageSection"
   where "pageId" = (select id from public."Page" where slug = '/')
)
update public."PageSection" s
   set "sortOrder" = ordered.position
  from ordered
 where s.id = ordered.id;

commit;
