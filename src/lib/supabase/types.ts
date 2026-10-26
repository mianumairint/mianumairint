/**
 * DATABASE ROW TYPES
 * ==================
 * Hand-maintained mirror of the Postgres schema behind Supabase. These are the
 * single source of truth for column names and shapes.
 *
 * Two conventions matter when reading rows:
 *   - `numeric` columns arrive as strings ("12.50"), not numbers. Wrap them in
 *     `Number(...)` before doing arithmetic.
 *   - timestamps are `timestamptz`, so they arrive with an offset and
 *     `new Date(...)` reads them correctly. `normalizeTimestamps` in ./server
 *     stays as a safety net for any column that is not.
 *
 * The schema itself is supabase/migrations/0000_schema.sql; keep the two in
 * step.
 */

export type Role = "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type CouponType = "PERCENTAGE" | "FIXED";

export type QuoteStatus = "NEW" | "REVIEWING" | "QUOTED" | "CLOSED";

export type BlogCategory =
  | "HEALTH_WELLNESS"
  | "CULINARY_ARTS"
  | "HOME_DECOR"
  | "SUSTAINABILITY"
  | "EXPORT_NEWS";

export type SeoEntityType = "PAGE" | "PRODUCT" | "BLOG_POST" | "CATEGORY";

export type RedirectType = "PERMANENT" | "TEMPORARY";

export type PageStatus = "DRAFT" | "PUBLISHED";

/** A `numeric` column. PostgREST serialises these as strings. */
export type Numeric = string;

/** A `timestamptz` column, in ISO 8601. */
export type Timestamp = string;

/**
 * A profile, not an account. Supabase Auth owns the email address, the
 * password and whether it is verified; `id` is the auth account's uuid.
 */
export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  phone: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AddressRow {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDesc: string | null;
  price: Numeric;
  comparePrice: Numeric | null;
  categoryId: string;
  inventory: number;
  lowStockAlert: number;
  weight: Numeric | null;
  weightUnit: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
  avgRating: Numeric;
  reviewCount: number;
  soldCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductImageRow {
  id: string;
  productId: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductVariantRow {
  id: string;
  productId: string;
  label: string;
  sku: string;
  price: Numeric | null;
  inventory: number;
  isActive: boolean;
}

export interface ProductTagRow {
  id: string;
  productId: string;
  tag: string;
}

export interface ReviewRow {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isApproved: boolean;
  createdAt: Timestamp;
}

export interface WishlistItemRow {
  id: string;
  userId: string;
  productId: string;
  createdAt: Timestamp;
}

export interface OrderRow {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  addressId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentIntentId: string | null;
  subtotal: Numeric;
  shippingCost: Numeric;
  discount: Numeric;
  tax: Numeric;
  total: Numeric;
  couponCode: string | null;
  notes: string | null;
  trackingNumber: string | null;
  shippedAt: Timestamp | null;
  deliveredAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItemRow {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: Numeric;
}

export interface CouponRow {
  id: string;
  code: string;
  type: CouponType;
  value: Numeric;
  minOrderValue: Numeric | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface QuoteRequestRow {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  country: string;
  products: string;
  message: string | null;
  /** Internal notes written by the dashboard. */
  adminNotes: string | null;
  status: QuoteStatus;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: BlogCategory;
  isPublished: boolean;
  publishedAt: Timestamp | null;
  metaTitle: string | null;
  metaDesc: string | null;
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: Timestamp;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp;
}

export interface SiteSettingRow {
  id: string;
  key: string;
  value: string;
  group: string;
  updatedAt: Timestamp;
}

export interface ShippingZoneRow {
  id: string;
  name: string;
  countries: string[];
}

export interface ShippingRateRow {
  id: string;
  zoneId: string;
  label: string;
  minWeight: Numeric | null;
  maxWeight: Numeric | null;
  price: Numeric;
  estimatedDays: string;
}

export interface ExportMarketRow {
  id: string;
  country: string;
  city: string;
  flag: string;
  since: string | null;
}

export interface SeoGlobalSettingsRow {
  id: string;
  siteName: string;
  siteTagline: string | null;
  separatorChar: string;
  defaultMetaDesc: string | null;
  defaultOgImage: string | null;
  homeTitle: string | null;
  homeMetaDesc: string | null;
  homeOgImage: string | null;
  homeKeywords: string | null;
  googleVerification: string | null;
  bingVerification: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  orgName: string;
  orgUrl: string;
  orgLogo: string | null;
  orgPhone: string | null;
  orgEmail: string | null;
  orgAddress: string | null;
  orgFoundingYear: string;
  orgSocialProfiles: string[];
  defaultRobotsIndex: boolean;
  defaultRobotsFollow: boolean;
  breadcrumbsEnabled: boolean;
  breadcrumbSeparator: string;
  breadcrumbHomeLabel: string;
  updatedAt: Timestamp;
}

export interface SeoMetaRow {
  id: string;
  entityType: SeoEntityType;
  entityId: string;
  slug: string;
  title: string | null;
  metaDesc: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  focusKeyword: string | null;
  noIndex: boolean;
  noFollow: boolean;
  noSnippet: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogImageAlt: string | null;
  ogType: string;
  twitterCard: string;
  twitterTitle: string | null;
  twitterDesc: string | null;
  twitterImage: string | null;
  customSchema: string | null;
  seoScore: number | null;
  readabilityScore: number | null;
  lastAnalyzed: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SeoRedirectRow {
  id: string;
  fromPath: string;
  toPath: string;
  type: RedirectType;
  isActive: boolean;
  hitCount: number;
  createdAt: Timestamp;
}

export interface SeoKeywordRow {
  id: string;
  keyword: string;
  targetUrl: string;
  targetPage: string;
  currentRank: number | null;
  previousRank: number | null;
  searchVolume: number | null;
  notes: string | null;
  trackedSince: Timestamp;
  updatedAt: Timestamp;
}

export interface SeoAuditLogRow {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  score: number;
  issues: string;
  suggestions: string;
  createdAt: Timestamp;
}

export interface RobotsTxtRow {
  id: string;
  content: string;
  updatedAt: Timestamp;
}

export interface PageRow {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  seoTitle: string | null;
  seoDesc: string | null;
  isSystem: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PageSectionRow {
  id: string;
  pageId: string;
  type: string;
  sortOrder: number;
  isVisible: boolean;
  data: Record<string, unknown>;
}

/**
 * Table names as they exist in Postgres. They are PascalCase and therefore
 * case-sensitive, so queries go through this map rather than a bare literal.
 */
export const TABLES = {
  user: "User",
  address: "Address",
  category: "Category",
  product: "Product",
  productImage: "ProductImage",
  productVariant: "ProductVariant",
  productTag: "ProductTag",
  review: "Review",
  wishlistItem: "WishlistItem",
  order: "Order",
  orderItem: "OrderItem",
  coupon: "Coupon",
  quoteRequest: "QuoteRequest",
  blogPost: "BlogPost",
  newsletterSubscriber: "NewsletterSubscriber",
  contactMessage: "ContactMessage",
  siteSetting: "SiteSetting",
  shippingZone: "ShippingZone",
  shippingRate: "ShippingRate",
  exportMarket: "ExportMarket",
  seoGlobalSettings: "SeoGlobalSettings",
  seoMeta: "SeoMeta",
  seoRedirect: "SeoRedirect",
  seoKeyword: "SeoKeyword",
  seoAuditLog: "SeoAuditLog",
  robotsTxt: "RobotsTxt",
  page: "Page",
  pageSection: "PageSection",
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
