-- ════════════════════════════════════════════════════════════════════════════
--  THE OLD HERO GOES
--  Run after 0006_hero_carousel.sql.
--
--  0006 only hid it, in case the headline was wanted back. It is not, so the
--  row is removed and the remaining sections are renumbered from zero.
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

delete from public."PageSection"
 where type = 'HERO'
   and "pageId" = (select id from public."Page" where slug = '/');

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
