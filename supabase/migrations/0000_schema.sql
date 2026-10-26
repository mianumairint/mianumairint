-- ════════════════════════════════════════════════════════════════════════════
--  SCHEMA
--  Run this FIRST, in the Supabase dashboard → SQL Editor → New query,
--  then run 0001_auth_and_rls.sql.
--
--  Safe to run more than once: every object is created with IF NOT EXISTS or
--  guarded, so re-running changes nothing and destroys nothing.
--
--  Three conventions, applied everywhere:
--
--    id          text, defaulted to a uuid by the database. Text rather than
--                uuid because that is what the application's types expect.
--    timestamps  timestamptz, not timestamp. A naked `timestamp` comes back
--                from the API with no offset, and the browser then reads it as
--                local time -- every date on the site shifts by the viewer's
--                offset. timestamptz carries the offset and cannot.
--    updatedAt   defaulted and maintained by a trigger, so it is right even if
--                a write forgets it.
--
--  Credentials and sessions are NOT here: Supabase Auth owns those. The "User"
--  table is only a profile (name, phone, role) linked to an auth account by id.
-- ════════════════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────────────────
--  ENUMS
--  The application sends and receives these exact strings. Declaring them as
--  real enum types means a typo is rejected by the database instead of being
--  stored and surfacing later as a missing badge or an unfiltered list.
-- ────────────────────────────────────────────────────────────────────────────

do $$ begin create type "Role" as enum ('CUSTOMER','ADMIN','SUPER_ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin create type "OrderStatus" as enum ('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED');
exception when duplicate_object then null; end $$;

do $$ begin create type "PaymentStatus" as enum ('PENDING','PAID','FAILED','REFUNDED');
exception when duplicate_object then null; end $$;

do $$ begin create type "CouponType" as enum ('PERCENTAGE','FIXED');
exception when duplicate_object then null; end $$;

do $$ begin create type "QuoteStatus" as enum ('NEW','REVIEWING','QUOTED','CLOSED');
exception when duplicate_object then null; end $$;

do $$ begin create type "BlogCategory" as enum ('HEALTH_WELLNESS','CULINARY_ARTS','HOME_DECOR','SUSTAINABILITY','EXPORT_NEWS');
exception when duplicate_object then null; end $$;

do $$ begin create type "SeoEntityType" as enum ('PAGE','PRODUCT','BLOG_POST','CATEGORY');
exception when duplicate_object then null; end $$;

do $$ begin create type "RedirectType" as enum ('PERMANENT','TEMPORARY');
exception when duplicate_object then null; end $$;

do $$ begin create type "PageStatus" as enum ('DRAFT','PUBLISHED');
exception when duplicate_object then null; end $$;



-- ────────────────────────────────────────────────────────────────────────────
--  updatedAt
--  One trigger function, attached at the end to every table that has the
--  column, so no write can leave it stale.
-- ────────────────────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" := now();
  return new;
end;
$$;


-- ────────────────────────────────────────────────────────────────────────────
--  PEOPLE
--
--  "User".id holds the Supabase Auth account's uuid as text. The row is
--  created by a trigger on auth.users -- see 0001_auth_and_rls.sql -- so a
--  profile never exists without an account or an account without a profile.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."User" (
  id          text primary key default gen_random_uuid()::text,
  email       text not null unique,
  name        text,
  phone       text,
  role        "Role" not null default 'CUSTOMER',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."Address" (
  id           text primary key default gen_random_uuid()::text,
  "userId"     text not null references public."User"(id) on delete cascade,
  "fullName"   text not null,
  phone        text not null,
  street       text not null,
  city         text not null,
  state        text not null,
  country      text not null,
  "postalCode" text not null,
  "isDefault"  boolean not null default false
);

create index if not exists "Address_userId_idx" on public."Address"("userId");


-- ────────────────────────────────────────────────────────────────────────────
--  CATALOGUE
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."Category" (
  id           text primary key default gen_random_uuid()::text,
  name         text not null unique,
  slug         text not null unique,
  description  text,
  image        text,
  "metaTitle"  text,
  "metaDesc"   text,
  "sortOrder"  integer not null default 0,
  "isActive"   boolean not null default true,
  "createdAt"  timestamptz not null default now()
);

create table if not exists public."Product" (
  id              text primary key default gen_random_uuid()::text,
  name            text not null,
  slug            text not null unique,
  sku             text not null unique,
  description     text not null,
  "shortDesc"     text,
  price           numeric(10,2) not null,
  "comparePrice"  numeric(10,2),
  "categoryId"    text not null references public."Category"(id),
  inventory       integer not null default 0,
  "lowStockAlert" integer not null default 5,
  weight          numeric(8,2),
  "weightUnit"    text not null default 'kg',
  "isFeatured"    boolean not null default false,
  "isBestSeller"  boolean not null default false,
  "isNewArrival"  boolean not null default false,
  "isActive"      boolean not null default true,
  "metaTitle"     text,
  "metaDesc"      text,
  -- Cached from approved reviews by a trigger in 0001_auth_and_rls.sql.
  "avgRating"     numeric(3,2) not null default 0,
  "reviewCount"   integer not null default 0,
  "soldCount"     integer not null default 0,
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);

-- The storefront filters on isActive and sorts by these three columns.
create index if not exists "Product_categoryId_idx" on public."Product"("categoryId");
create index if not exists "Product_isActive_createdAt_idx" on public."Product"("isActive", "createdAt" desc);
create index if not exists "Product_isFeatured_idx" on public."Product"("isFeatured") where "isFeatured";
create index if not exists "Product_isBestSeller_idx" on public."Product"("isBestSeller") where "isBestSeller";

create table if not exists public."ProductImage" (
  id          text primary key default gen_random_uuid()::text,
  "productId" text not null references public."Product"(id) on delete cascade,
  url         text not null,
  "altText"   text,
  "sortOrder" integer not null default 0,
  "isPrimary" boolean not null default false
);

create index if not exists "ProductImage_productId_idx" on public."ProductImage"("productId", "sortOrder");

create table if not exists public."ProductVariant" (
  id          text primary key default gen_random_uuid()::text,
  "productId" text not null references public."Product"(id) on delete cascade,
  label       text not null,
  sku         text not null unique,
  price       numeric(10,2),
  inventory   integer not null default 0,
  "isActive"  boolean not null default true
);

create index if not exists "ProductVariant_productId_idx" on public."ProductVariant"("productId");

create table if not exists public."ProductTag" (
  id          text primary key default gen_random_uuid()::text,
  "productId" text not null references public."Product"(id) on delete cascade,
  tag         text not null
);

create index if not exists "ProductTag_productId_idx" on public."ProductTag"("productId");


-- ────────────────────────────────────────────────────────────────────────────
--  REVIEWS AND WISHLIST
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."Review" (
  id           text primary key default gen_random_uuid()::text,
  "productId"  text not null references public."Product"(id) on delete cascade,
  "userId"     text not null references public."User"(id) on delete cascade,
  rating       integer not null check (rating between 1 and 5),
  title        text,
  body         text,
  "isApproved" boolean not null default false,
  "createdAt"  timestamptz not null default now()
);

create index if not exists "Review_productId_idx" on public."Review"("productId", "isApproved");
create index if not exists "Review_userId_idx" on public."Review"("userId");

create table if not exists public."WishlistItem" (
  id          text primary key default gen_random_uuid()::text,
  "userId"    text not null references public."User"(id) on delete cascade,
  "productId" text not null references public."Product"(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  unique ("userId", "productId")
);


-- ────────────────────────────────────────────────────────────────────────────
--  ORDERS
--
--  "userId" is nullable: guest checkout stores the address in "guestEmail"
--  instead. Orders are written by create_order() in 0001_auth_and_rls.sql.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."Order" (
  id                text primary key default gen_random_uuid()::text,
  "orderNumber"     text not null unique,
  "userId"          text references public."User"(id) on delete set null,
  "guestEmail"      text,
  "addressId"       text references public."Address"(id) on delete set null,
  status            "OrderStatus" not null default 'PENDING',
  "paymentStatus"   "PaymentStatus" not null default 'PENDING',
  "paymentMethod"   text not null,
  "paymentIntentId" text,
  subtotal          numeric(10,2) not null,
  "shippingCost"    numeric(10,2) not null default 0,
  discount          numeric(10,2) not null default 0,
  tax               numeric(10,2) not null default 0,
  total             numeric(10,2) not null,
  "couponCode"      text,
  notes             text,
  "trackingNumber"  text,
  "shippedAt"       timestamptz,
  "deliveredAt"     timestamptz,
  "createdAt"       timestamptz not null default now(),
  "updatedAt"       timestamptz not null default now()
);

create index if not exists "Order_userId_idx" on public."Order"("userId", "createdAt" desc);
create index if not exists "Order_status_idx" on public."Order"(status);
create index if not exists "Order_paymentStatus_idx" on public."Order"("paymentStatus");
create index if not exists "Order_createdAt_idx" on public."Order"("createdAt" desc);

create table if not exists public."OrderItem" (
  id          text primary key default gen_random_uuid()::text,
  "orderId"   text not null references public."Order"(id) on delete cascade,
  "productId" text not null references public."Product"(id),
  "variantId" text references public."ProductVariant"(id) on delete set null,
  quantity    integer not null check (quantity > 0),
  price       numeric(10,2) not null
);

create index if not exists "OrderItem_orderId_idx" on public."OrderItem"("orderId");


-- ────────────────────────────────────────────────────────────────────────────
--  COUPONS
--  Read only through validate_coupon()/redeem_coupon(); see the next file.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."Coupon" (
  id              text primary key default gen_random_uuid()::text,
  code            text not null unique,
  type            "CouponType" not null,
  value           numeric(10,2) not null,
  "minOrderValue" numeric(10,2),
  "maxUses"       integer,
  "usedCount"     integer not null default 0,
  "isActive"      boolean not null default true,
  "expiresAt"     timestamptz,
  "createdAt"     timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────────────────────
--  ENQUIRIES
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."QuoteRequest" (
  id            text primary key default gen_random_uuid()::text,
  "companyName" text not null,
  "contactName" text not null,
  email         text not null,
  phone         text,
  country       text not null,
  products      text not null,
  message       text,
  -- Internal notes the dashboard writes when a quote is reviewed.
  "adminNotes"  text,
  status        "QuoteStatus" not null default 'NEW',
  "isRead"      boolean not null default false,
  "createdAt"   timestamptz not null default now()
);

create index if not exists "QuoteRequest_status_idx" on public."QuoteRequest"(status, "createdAt" desc);

create table if not exists public."ContactMessage" (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null,
  "isRead"    boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create index if not exists "ContactMessage_createdAt_idx" on public."ContactMessage"("createdAt" desc);

create table if not exists public."NewsletterSubscriber" (
  id             text primary key default gen_random_uuid()::text,
  email          text not null unique,
  "isActive"     boolean not null default true,
  "subscribedAt" timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────────────────────
--  BLOG
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."BlogPost" (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  slug          text not null unique,
  content       text not null,
  excerpt       text,
  "coverImage"  text,
  category      "BlogCategory" not null,
  "isPublished" boolean not null default false,
  "publishedAt" timestamptz,
  "metaTitle"   text,
  "metaDesc"    text,
  "viewCount"   integer not null default 0,
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);

create index if not exists "BlogPost_published_idx" on public."BlogPost"("isPublished", "publishedAt" desc);


-- ────────────────────────────────────────────────────────────────────────────
--  SHIPPING
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."ShippingZone" (
  id        text primary key default gen_random_uuid()::text,
  name      text not null,
  countries text[] not null default '{}'
);

create table if not exists public."ShippingRate" (
  id              text primary key default gen_random_uuid()::text,
  "zoneId"        text not null references public."ShippingZone"(id) on delete cascade,
  label           text not null,
  "minWeight"     numeric(8,2),
  "maxWeight"     numeric(8,2),
  price           numeric(10,2) not null,
  "estimatedDays" text not null
);

create index if not exists "ShippingRate_zoneId_idx" on public."ShippingRate"("zoneId");


-- ────────────────────────────────────────────────────────────────────────────
--  SITE SETTINGS AND EXPORT MARKETS
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."SiteSetting" (
  id          text primary key default gen_random_uuid()::text,
  key         text not null unique,
  value       text not null,
  "group"     text not null default 'general',
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."ExportMarket" (
  id      text primary key default gen_random_uuid()::text,
  country text not null,
  city    text not null,
  flag    text not null,
  since   text
);


-- ────────────────────────────────────────────────────────────────────────────
--  SEO
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."SeoGlobalSettings" (
  id                    text primary key default gen_random_uuid()::text,
  "siteName"            text not null default 'Mian Umair International',
  "siteTagline"         text,
  "separatorChar"       text not null default '|',
  "defaultMetaDesc"     text,
  "defaultOgImage"      text,
  "homeTitle"           text,
  "homeMetaDesc"        text,
  "homeOgImage"         text,
  "homeKeywords"        text,
  "googleVerification"  text,
  "bingVerification"    text,
  "googleAnalyticsId"   text,
  "googleTagManagerId"  text,
  "orgName"             text not null default 'Mian Umair International',
  "orgUrl"              text not null default 'https://mianumairint.com',
  "orgLogo"             text,
  "orgPhone"            text,
  "orgEmail"            text,
  "orgAddress"          text,
  "orgFoundingYear"     text not null default '1995',
  "orgSocialProfiles"   text[] not null default '{}',
  "defaultRobotsIndex"  boolean not null default true,
  "defaultRobotsFollow" boolean not null default true,
  "breadcrumbsEnabled"  boolean not null default true,
  "breadcrumbSeparator" text not null default '›',
  "breadcrumbHomeLabel" text not null default 'Home',
  "updatedAt"           timestamptz not null default now()
);

create table if not exists public."SeoMeta" (
  id                 text primary key default gen_random_uuid()::text,
  "entityType"       "SeoEntityType" not null,
  "entityId"         text not null,
  slug               text not null,
  title              text,
  "metaDesc"         text,
  "metaKeywords"     text,
  "canonicalUrl"     text,
  "focusKeyword"     text,
  "noIndex"          boolean not null default false,
  "noFollow"         boolean not null default false,
  "noSnippet"        boolean not null default false,
  "ogTitle"          text,
  "ogDescription"    text,
  "ogImage"          text,
  "ogImageAlt"       text,
  "ogType"           text not null default 'website',
  "twitterCard"      text not null default 'summary_large_image',
  "twitterTitle"     text,
  "twitterDesc"      text,
  "twitterImage"     text,
  "customSchema"     text,
  "seoScore"         integer,
  "readabilityScore" integer,
  "lastAnalyzed"     timestamptz,
  "createdAt"        timestamptz not null default now(),
  "updatedAt"        timestamptz not null default now(),
  unique ("entityType", "entityId")
);

create index if not exists "SeoMeta_slug_idx" on public."SeoMeta"(slug);

create table if not exists public."SeoRedirect" (
  id          text primary key default gen_random_uuid()::text,
  "fromPath"  text not null unique,
  "toPath"    text not null,
  type        "RedirectType" not null default 'PERMANENT',
  "isActive"  boolean not null default true,
  "hitCount"  integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create table if not exists public."SeoKeyword" (
  id             text primary key default gen_random_uuid()::text,
  keyword        text not null,
  "targetUrl"    text not null,
  "targetPage"   text not null,
  "currentRank"  integer,
  "previousRank" integer,
  "searchVolume" integer,
  notes          text,
  "trackedSince" timestamptz not null default now(),
  "updatedAt"    timestamptz not null default now()
);

create table if not exists public."SeoAuditLog" (
  id            text primary key default gen_random_uuid()::text,
  "entityType"  text not null,
  "entityId"    text not null,
  "entityName"  text not null,
  score         integer not null,
  issues        text not null default '[]',
  suggestions   text not null default '[]',
  "createdAt"   timestamptz not null default now()
);

create index if not exists "SeoAuditLog_createdAt_idx" on public."SeoAuditLog"("createdAt" desc);

create table if not exists public."RobotsTxt" (
  id          text primary key default gen_random_uuid()::text,
  content     text not null default E'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /auth/\nSitemap: https://mianumairint.com/sitemap.xml',
  "updatedAt" timestamptz not null default now()
);


-- ────────────────────────────────────────────────────────────────────────────
--  CMS PAGES
--
--  isSystem marks a page that backs a route the code already serves
--  ("/", "/about", …). Those can be edited and unpublished but not deleted,
--  and their slug is locked, because the slug IS the route.
-- ────────────────────────────────────────────────────────────────────────────

create table if not exists public."Page" (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  slug        text not null unique,
  status      "PageStatus" not null default 'DRAFT',
  "seoTitle"  text,
  "seoDesc"   text,
  "isSystem"  boolean not null default false,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "Page_status_idx" on public."Page"(status);

create table if not exists public."PageSection" (
  id          text primary key default gen_random_uuid()::text,
  "pageId"    text not null references public."Page"(id) on delete cascade,
  -- text, not an enum: the renderer and the save API already validate the
  -- type against SECTION_SCHEMAS in src/types/page.ts, and an enum would mean
  -- a database migration every time a section type is added, in a separate
  -- run because Postgres will not let a new enum value be used in the
  -- transaction that created it.
  type        text not null,
  "sortOrder" integer not null default 0,
  "isVisible" boolean not null default true,
  -- Shape depends on `type` -- see src/types/page.ts
  data        jsonb not null default '{}'
);

create index if not exists "PageSection_pageId_sortOrder_idx" on public."PageSection"("pageId", "sortOrder");


-- ────────────────────────────────────────────────────────────────────────────
--  updatedAt TRIGGERS
--  Attached to every table that has the column.
-- ────────────────────────────────────────────────────────────────────────────

do $$
declare
  t text;
begin
  foreach t in array array[
    'User','Product','Order','BlogPost','SiteSetting',
    'SeoGlobalSettings','SeoMeta','SeoKeyword','RobotsTxt','Page'
  ]
  loop
    execute format('drop trigger if exists touch_updated_at on public.%I', t);
    execute format(
      'create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()',
      t
    );
  end loop;
end $$;
