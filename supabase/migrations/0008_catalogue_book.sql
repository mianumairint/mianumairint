-- ════════════════════════════════════════════════════════════════════════════
--  THE CATALOGUE PAGE BECOMES THE CATALOGUE
--
--  /catalogue advertised a PDF it never showed: a hero whose download button
--  pointed at "#", then the same category tiles as the home page. The printed
--  catalogue now opens on the page itself as a book, and the file is a real
--  download.
--
--  * PAGE_HERO      — its button points at the PDF
--  * CATALOGUE_BOOK — new; the book
--  * CATEGORY_GRID  — removed; the book is the whole range, so the tiles under
--                     it were the same content twice
--  * FEATURE_CARDS and PRODUCT_INQUIRY_CTA — kept, renumbered
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- The hero's button now does what it says.
update public."PageSection"
   set data = data
            || '{"ctaLabel":"Download PDF","ctaIcon":"download","ctaHref":"/catalogue/salt-catalogue.pdf"}'::jsonb
 where type = 'PAGE_HERO'
   and "pageId" = (select id from public."Page" where slug = '/catalogue');

-- The home page already carries the category rail.
delete from public."PageSection"
 where type = 'CATEGORY_GRID'
   and "pageId" = (select id from public."Page" where slug = '/catalogue');

-- Only ever one book on the page.
delete from public."PageSection"
 where type = 'CATALOGUE_BOOK'
   and "pageId" = (select id from public."Page" where slug = '/catalogue');

insert into public."PageSection" ("pageId", type, "sortOrder", "isVisible", data) values
  ((select id from public."Page" where slug = '/catalogue'), 'CATALOGUE_BOOK', 1, true,
   '{
  "eyebrow": "Turn The Pages",
  "heading": "Inside The Catalogue",
  "description": "Twenty-six pages: natural, carved, USB, basket and calligraphy salt lamps, candle holders, edible and raw pink salt, and the spa and healing range — each with its sizes and weights. Read it here, or take the PDF with you.",
  "pdfUrl": "/catalogue/salt-catalogue.pdf",
  "downloadLabel": "Download Catalogue (PDF)"
}'::jsonb);

-- Hero, book, then the trade terms and the enquiry, numbered from zero.
with ordered as (
  select id,
         row_number() over (
           order by case type
                      when 'PAGE_HERO' then 0
                      when 'CATALOGUE_BOOK' then 1
                      else 2
                    end,
                    "sortOrder"
         ) - 1 as position
    from public."PageSection"
   where "pageId" = (select id from public."Page" where slug = '/catalogue')
)
update public."PageSection" s
   set "sortOrder" = ordered.position
  from ordered
 where s.id = ordered.id;

commit;
