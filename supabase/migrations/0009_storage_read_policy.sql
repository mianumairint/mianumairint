-- ════════════════════════════════════════════════════════════════════════════
--  THE PUBLIC NO LONGER GETS TO LIST THE BUCKET
--
--  0001 gave anon and authenticated a blanket select on every object in the
--  `products` bucket. That was more than the site needs, and Supabase flags it:
--
--    "Clients can list all files in this bucket."
--
--  A public bucket serves its files through /storage/v1/object/public/..., which
--  does not consult RLS at all -- so the images on the site keep working with no
--  select policy whatsoever. All the policy actually bought was the ability for
--  anyone with the anon key to pull a full inventory of the bucket.
--
--  Admins keep their own access: products_admin_write is `for all`, which covers
--  reading as well as writing, so the admin panel is unaffected.
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

drop policy if exists products_public_read on storage.objects;

commit;

-- To check: the file should still load in a browser with no key at all, while
-- a list comes back empty.
--
--   curl -I "<SUPABASE_URL>/storage/v1/object/public/products/catalogue/salt-lamps.webp"
--   -- expect 200
--
--   curl -X POST "<SUPABASE_URL>/storage/v1/object/list/products" \
--     -H "apikey: <ANON_KEY>" -H "Content-Type: application/json" \
--     -d '{"prefix":"catalogue/","limit":100}'
--   -- expect []
