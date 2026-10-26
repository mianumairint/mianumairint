-- ════════════════════════════════════════════════════════════════════════════
--  SUPABASE AUTH + ROW LEVEL SECURITY
--  Run 0000_schema.sql FIRST, then this, in the Supabase dashboard →
--  SQL Editor → New query.
--
--  It is safe to run more than once: every statement either uses IF NOT EXISTS
--  or drops its own object first. It creates no tables and changes no data.
--
--  WHAT IT DOES
--    1. Links Supabase Auth accounts to the existing "User" profile table.
--    2. Adds the small set of database functions the app needs in order to do
--       things the public must not be able to do directly (check a coupon,
--       place an order, subscribe to the newsletter).
--    3. Turns on row-level security for every table and writes the policies.
--    4. Creates the storage bucket for image uploads.
--
--  AFTER RUNNING IT, to make yourself an admin:
--    - Authentication → Users → "Add user" (tick "Auto Confirm User")
--    - then run, with your own address:
--        update public."User" set role = 'SUPER_ADMIN' where email = 'you@example.com';
-- ════════════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────────────
--  1. AUTH ACCOUNT  →  "User" PROFILE
--
--  "User".id is TEXT and holds the auth account's uuid as text, so the
--  existing foreign keys from Order, Review and WishlistItem keep working.
--  The trigger means an account can never exist without a profile, which is
--  what the application relies on when it reads a role.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."User" (id, email, name, phone, role, "createdAt", "updatedAt")
  values (
    new.id::text,
    new.email,
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'CUSTOMER',
    now(),
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        -- Only fill a name or phone that is still missing: an admin may have
        -- corrected the profile, and signing in again must not undo that.
        name  = coalesce(public."User".name, excluded.name),
        phone = coalesce(public."User".phone, excluded.phone),
        "updatedAt" = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the profile's email in step if it is changed in the dashboard.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public."User"
       set email = new.email, "updatedAt" = now()
     where id = new.id::text;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- Deleting an account in the dashboard must take its profile with it.
-- Without this the profile survives -- still carrying its role -- and a new
-- account created with the same email would get a fresh id and a second row.
create or replace function public.handle_deleted_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Orders deliberately survive (Order."userId" is ON DELETE SET NULL): a
  -- paid order is a record of a sale, not a property of the account.
  delete from public."User" where id = old.id::text;
  return old;
end;
$$;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function public.handle_deleted_user();

-- Profiles for accounts that already existed before this migration.
insert into public."User" (id, email, name, phone, role, "createdAt", "updatedAt")
select u.id::text,
       u.email,
       nullif(u.raw_user_meta_data ->> 'name', ''),
       nullif(u.raw_user_meta_data ->> 'phone', ''),
       'CUSTOMER',
       coalesce(u.created_at, now()),
       now()
  from auth.users u
 where not exists (select 1 from public."User" p where p.id = u.id::text)
   and u.email is not null;


-- ────────────────────────────────────────────────────────────────────────────
--  2. HELPERS USED BY THE POLICIES
--
--  is_admin() must be SECURITY DEFINER: it reads "User", and "User" has a
--  policy that calls is_admin(). Running it as the owner breaks that loop.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
      from public."User"
     where id = auth.uid()::text
       and role in ('ADMIN', 'SUPER_ADMIN')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────────
--  3. COUPONS
--
--  Coupon codes stay unreadable: a SELECT policy wide enough for the checkout
--  would also let anyone list every unused code. These two functions return
--  one coupon and nothing else.
--
--  redeem_coupon() checks the limit and counts the use in a single statement,
--  so two simultaneous checkouts cannot both spend the last use of a coupon.
-- ────────────────────────────────────────────────────────────────────────────

drop function if exists public.validate_coupon(text);
create function public.validate_coupon(p_code text)
returns table (
  status text,
  code text,
  type "CouponType",
  value numeric,
  min_order_value numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  c public."Coupon";
begin
  select * into c from public."Coupon" where public."Coupon".code = p_code;

  if not found then
    return query select 'not_found'::text, null::text, null::"CouponType", null::numeric, null::numeric;
  elsif not c."isActive" then
    return query select 'inactive'::text, c.code, c.type, c.value, c."minOrderValue";
  elsif c."expiresAt" is not null and c."expiresAt" < now() then
    return query select 'expired'::text, c.code, c.type, c.value, c."minOrderValue";
  elsif c."maxUses" is not null and c."usedCount" >= c."maxUses" then
    return query select 'exhausted'::text, c.code, c.type, c.value, c."minOrderValue";
  else
    return query select 'ok'::text, c.code, c.type, c.value, c."minOrderValue";
  end if;
end;
$$;

drop function if exists public.redeem_coupon(text);
create function public.redeem_coupon(p_code text)
returns table (
  status text,
  code text,
  type "CouponType",
  value numeric,
  min_order_value numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  c public."Coupon";
begin
  -- The UPDATE both re-checks every condition and counts the use, so the
  -- check and the increment cannot be separated by another transaction.
  update public."Coupon"
     set "usedCount" = "usedCount" + 1
   where public."Coupon".code = p_code
     and "isActive"
     and ("expiresAt" is null or "expiresAt" >= now())
     and ("maxUses" is null or "usedCount" < "maxUses")
  returning * into c;

  if found then
    return query select 'ok'::text, c.code, c.type, c.value, c."minOrderValue";
  end if;

  -- Nothing was updated: report exactly why.
  return query select * from public.validate_coupon(p_code);
end;
$$;

revoke all on function public.validate_coupon(text) from public;
revoke all on function public.redeem_coupon(text) from public;
grant execute on function public.validate_coupon(text) to anon, authenticated;
grant execute on function public.redeem_coupon(text) to anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────────
--  4. PLACING AN ORDER
--
--  One function for the whole order, for two reasons. It is a transaction, so
--  an order can never be left without its line items. And it means neither
--  "Order" nor "OrderItem" needs a public INSERT policy, so nobody can add a
--  line to somebody else's order.
--
--  Prices are decided by the application from the product table before this is
--  called; this function only writes what it is given.
-- ────────────────────────────────────────────────────────────────────────────

drop function if exists public.create_order(jsonb, jsonb);
create function public.create_order(p_order jsonb, p_items jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id text := gen_random_uuid()::text;
  v_user_id text := nullif(p_order ->> 'userId', '');
  v_order jsonb;
  v_items jsonb;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'An order needs at least one item';
  end if;

  -- An order may be anonymous (guest checkout) or the caller's own. It may
  -- never be filed under somebody else's account.
  if v_user_id is not null and v_user_id <> coalesce(auth.uid()::text, '') then
    raise exception 'Cannot create an order for another user';
  end if;

  insert into public."Order" (
    id, "orderNumber", "userId", "guestEmail", subtotal, discount,
    "shippingCost", tax, total, "paymentMethod", "couponCode", notes,
    status, "paymentStatus", "createdAt", "updatedAt"
  )
  values (
    v_id,
    p_order ->> 'orderNumber',
    v_user_id,
    nullif(p_order ->> 'guestEmail', ''),
    (p_order ->> 'subtotal')::numeric,
    (p_order ->> 'discount')::numeric,
    (p_order ->> 'shippingCost')::numeric,
    (p_order ->> 'tax')::numeric,
    (p_order ->> 'total')::numeric,
    p_order ->> 'paymentMethod',
    nullif(p_order ->> 'couponCode', ''),
    nullif(p_order ->> 'notes', ''),
    'PENDING',
    'PENDING',
    now(),
    now()
  );

  insert into public."OrderItem" (id, "orderId", "productId", "variantId", quantity, price)
  select gen_random_uuid()::text,
         v_id,
         item ->> 'productId',
         nullif(item ->> 'variantId', ''),
         (item ->> 'quantity')::int,
         (item ->> 'price')::numeric
    from jsonb_array_elements(p_items) as item;

  select to_jsonb(o) into v_order from public."Order" o where o.id = v_id;
  select coalesce(jsonb_agg(to_jsonb(i)), '[]'::jsonb) into v_items
    from public."OrderItem" i where i."orderId" = v_id;

  return v_order || jsonb_build_object('items', v_items);
end;
$$;

revoke all on function public.create_order(jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb) to anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────────
--  5. NEWSLETTER
--
--  Subscribing has to insert a new address or reactivate one that
--  unsubscribed. An UPDATE policy wide enough for that would also let anyone
--  reactivate or enumerate the list, so the decision happens here instead.
-- ────────────────────────────────────────────────────────────────────────────

drop function if exists public.subscribe_newsletter(text);
create function public.subscribe_newsletter(p_email text)
returns public."NewsletterSubscriber"
language plpgsql
security definer
set search_path = public
as $$
declare
  s public."NewsletterSubscriber";
begin
  update public."NewsletterSubscriber"
     set "isActive" = true
   where email = lower(trim(p_email))
  returning * into s;

  if not found then
    insert into public."NewsletterSubscriber" (id, email, "isActive", "subscribedAt")
    values (gen_random_uuid()::text, lower(trim(p_email)), true, now())
    returning * into s;
  end if;

  return s;
end;
$$;

revoke all on function public.subscribe_newsletter(text) from public;
grant execute on function public.subscribe_newsletter(text) to anon, authenticated;


-- ────────────────────────────────────────────────────────────────────────────
--  6. PRODUCT RATING
--
--  The cached avgRating/reviewCount on "Product" used to be recalculated by
--  the API route that created the review -- which both counted unapproved
--  reviews at the wrong moment and needed write access to "Product" from a
--  customer's session. A trigger keeps it correct from approved reviews only.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.sync_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id text := coalesce(new."productId", old."productId");
begin
  update public."Product" p
     set "avgRating"   = coalesce(stats.avg_rating, 0),
         "reviewCount" = coalesce(stats.review_count, 0),
         "updatedAt"   = now()
    from (
      select round(avg(rating)::numeric, 2) as avg_rating,
             count(*)                       as review_count
        from public."Review"
       where "productId" = v_product_id
         and "isApproved"
    ) as stats
   where p.id = v_product_id;

  return null;
end;
$$;

drop trigger if exists review_changed on public."Review";
create trigger review_changed
  after insert or update or delete on public."Review"
  for each row execute function public.sync_product_rating();


-- ────────────────────────────────────────────────────────────────────────────
--  7. ROW LEVEL SECURITY
--
--  Every table is locked by default and then opened only where it has to be.
--  Three shapes recur:
--
--    public      anyone may read the published/active rows
--    own         a signed-in user may reach rows that are theirs
--    admin       an ADMIN or SUPER_ADMIN may do anything
--
--  Writes are admin-only unless listed otherwise, and the three public forms
--  (contact, quote, newsletter) are insert-only -- they can be filled in but
--  never read back.
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array[
    'User','Address','Category','Product','ProductImage','ProductVariant',
    'ProductTag','Review','WishlistItem','Order','OrderItem','Coupon','QuoteRequest',
    'BlogPost','NewsletterSubscriber','ContactMessage','SiteSetting','ShippingZone',
    'ShippingRate','ExportMarket','SeoGlobalSettings','SeoMeta','SeoRedirect',
    'SeoKeyword','SeoAuditLog','RobotsTxt','Page','PageSection'
  ]
  loop
    -- `enable`, not `force`: forcing would apply the policies to the table
    -- owner too, which is the role the SQL Editor and the dashboard's table
    -- editor run as. The anon and authenticated roles are not owners, so
    -- enabling is what actually constrains the app's key.
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;

-- An admin can do anything, on every table. Written once, as a loop, so no
-- table can be forgotten and every table reads the same rule.
do $$
declare
  t text;
begin
  foreach t in array array[
    'User','Address','Category','Product','ProductImage','ProductVariant',
    'ProductTag','Review','WishlistItem','Order','OrderItem','Coupon','QuoteRequest',
    'BlogPost','NewsletterSubscriber','ContactMessage','SiteSetting','ShippingZone',
    'ShippingRate','ExportMarket','SeoGlobalSettings','SeoMeta','SeoRedirect',
    'SeoKeyword','SeoAuditLog','RobotsTxt','Page','PageSection'
  ]
  loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      execute format('drop policy if exists admin_all on public.%I', t);
      execute format(
        'create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
        t
      );
    end if;
  end loop;
end $$;


-- ── Storefront content: readable by anyone ────────────────────────────────

drop policy if exists public_read on public."Category";
create policy public_read on public."Category"
  for select to anon, authenticated using ("isActive");

drop policy if exists public_read on public."Product";
create policy public_read on public."Product"
  for select to anon, authenticated using ("isActive");

-- Child rows follow their product, so a draft product's images and prices are
-- not readable before it goes live.
drop policy if exists public_read on public."ProductImage";
create policy public_read on public."ProductImage"
  for select to anon, authenticated
  using (exists (select 1 from public."Product" p where p.id = "productId"));

drop policy if exists public_read on public."ProductVariant";
create policy public_read on public."ProductVariant"
  for select to anon, authenticated
  using (exists (select 1 from public."Product" p where p.id = "productId"));

drop policy if exists public_read on public."ProductTag";
create policy public_read on public."ProductTag"
  for select to anon, authenticated
  using (exists (select 1 from public."Product" p where p.id = "productId"));

drop policy if exists public_read on public."Review";
create policy public_read on public."Review"
  for select to anon, authenticated using ("isApproved");

drop policy if exists public_read on public."BlogPost";
create policy public_read on public."BlogPost"
  for select to anon, authenticated using ("isPublished");

drop policy if exists public_read on public."Page";
create policy public_read on public."Page"
  for select to anon, authenticated using (status = 'PUBLISHED');

drop policy if exists public_read on public."PageSection";
create policy public_read on public."PageSection"
  for select to anon, authenticated
  using (exists (select 1 from public."Page" pg where pg.id = "pageId"));

drop policy if exists public_read on public."ExportMarket";
create policy public_read on public."ExportMarket"
  for select to anon, authenticated using (true);

-- Checkout needs shipping options before anyone signs in.
drop policy if exists public_read on public."ShippingZone";
create policy public_read on public."ShippingZone"
  for select to anon, authenticated using (true);

drop policy if exists public_read on public."ShippingRate";
create policy public_read on public."ShippingRate"
  for select to anon, authenticated using (true);


-- ── Public forms: write-only ──────────────────────────────────────────────

drop policy if exists public_submit on public."ContactMessage";
create policy public_submit on public."ContactMessage"
  for insert to anon, authenticated with check (true);

drop policy if exists public_submit on public."QuoteRequest";
create policy public_submit on public."QuoteRequest"
  for insert to anon, authenticated with check (true);


-- ── A signed-in customer's own rows ───────────────────────────────────────

drop policy if exists own_profile on public."User";
create policy own_profile on public."User"
  for select to authenticated using (id = auth.uid()::text);

drop policy if exists own_addresses on public."Address";
create policy own_addresses on public."Address"
  for all to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

drop policy if exists own_wishlist on public."WishlistItem";
create policy own_wishlist on public."WishlistItem"
  for all to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

drop policy if exists own_orders_read on public."Order";
create policy own_orders_read on public."Order"
  for select to authenticated using ("userId" = auth.uid()::text);

-- A customer may cancel their own order; create_order() writes the rest.
drop policy if exists own_orders_cancel on public."Order";
create policy own_orders_cancel on public."Order"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

-- Line items are visible exactly when the order they belong to is, because
-- this check is itself subject to the policies above.
drop policy if exists own_order_items on public."OrderItem";
create policy own_order_items on public."OrderItem"
  for select to authenticated
  using (exists (select 1 from public."Order" o where o.id = "orderId"));

-- A review is submitted unapproved: nobody can publish their own.
drop policy if exists own_reviews_insert on public."Review";
create policy own_reviews_insert on public."Review"
  for insert to authenticated
  with check ("userId" = auth.uid()::text and "isApproved" = false);

drop policy if exists own_reviews_read on public."Review";
create policy own_reviews_read on public."Review"
  for select to authenticated using ("userId" = auth.uid()::text);


-- ────────────────────────────────────────────────────────────────────────────
--  8. IMAGE STORAGE
--
--  Without this bucket the upload route falls back to the local disk, which is
--  wiped on every deploy. Reads are public (the images are on the site);
--  writing is admin-only.
-- ────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists products_public_read on storage.objects;
create policy products_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'products');

drop policy if exists products_admin_write on storage.objects;
create policy products_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());


-- ════════════════════════════════════════════════════════════════════════════
--  DONE. To check it worked, as the anonymous public:
--
--    set local role anon;
--    select count(*) from public."User";          -- expect 0 rows, no error
--    select count(*) from public."Order";         -- expect 0 rows
--    select count(*) from public."Page";          -- published pages only
--    reset role;
--
--  Then grant yourself the dashboard, with your own address:
--
--    update public."User" set role = 'SUPER_ADMIN' where email = 'you@example.com';
-- ════════════════════════════════════════════════════════════════════════════
