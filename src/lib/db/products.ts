import {
  getSupabase,
  getUserSupabase,
  selectMany,
  selectOne,
  selectPage,
} from "@/lib/supabase/server";
import {
  TABLES,
  type CategoryRow,
  type ProductImageRow,
  type ProductRow,
  type ProductTagRow,
  type ProductVariantRow,
  type ReviewRow,
} from "@/lib/supabase/types";

/**
 * PRODUCT QUERIES
 * ===============
 * The storefront, the catalogue and the admin product screens all need a
 * product with its category and images attached, in slightly different shapes.
 * The select strings live here so each column is named once.
 *
 * `price`, `comparePrice` and `avgRating` are `numeric` and so arrive as
 * strings -- the same thing the ORM's Decimal serialised to, which is why the
 * shape the API returns is unchanged.
 */

export type CategorySummary = Pick<CategoryRow, "id" | "name" | "slug">;

/** A product as rendered in a grid or list: primary image, category name. */
export interface ProductCard extends ProductRow {
  category: CategorySummary | null;
  images: ProductImageRow[];
}

export interface ProductCardWithTags extends ProductCard {
  tags: ProductTagRow[];
}

/** A product as rendered on its own page: all images, variants, reviews. */
export interface ProductDetail extends ProductRow {
  category: CategorySummary | null;
  images: ProductImageRow[];
  variants: ProductVariantRow[];
  tags: ProductTagRow[];
  reviews: (ReviewRow & { user: { name: string | null } | null })[];
}

const CARD_SELECT = "*, category:Category(id,name,slug), images:ProductImage(*)";
const CARD_WITH_TAGS_SELECT = `${CARD_SELECT}, tags:ProductTag(*)`;

/**
 * Same as CARD_WITH_TAGS_SELECT but joining the category inline, so filtering
 * on `category.slug` narrows the products rather than just the embedded row.
 */
const CARD_BY_CATEGORY_SELECT =
  "*, category:Category!inner(id,name,slug), images:ProductImage(*), tags:ProductTag(*)";

const DETAIL_SELECT =
  "*, category:Category(id,name,slug), images:ProductImage(*), variants:ProductVariant(*), tags:ProductTag(*), reviews:Review(*, user:User(name))";

/** Restricts an embedded image list to the primary image, which is all a card shows. */
const PRIMARY_IMAGE = { column: "images.isPrimary", referencedTable: "images" } as const;

export type ProductSort = "newest" | "price_asc" | "price_desc" | "bestselling";

const SORT_COLUMNS: Record<ProductSort, { column: string; ascending: boolean }> = {
  newest: { column: "createdAt", ascending: false },
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
  bestselling: { column: "soldCount", ascending: false },
};

function sortOf(sort: string | null | undefined) {
  return SORT_COLUMNS[(sort ?? "newest") as ProductSort] ?? SORT_COLUMNS.newest;
}

/**
 * Quotes a user-supplied value for a PostgREST `or(...)` filter.
 * Without this a search for "salt, pink" is read as two filter terms and the
 * whole query fails.
 */
function quoteFilterValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function ilikeAny(columns: string[], search: string): string {
  const term = quoteFilterValue(`%${search}%`);
  return columns.map((column) => `${column}.ilike.${term}`).join(",");
}

export interface ProductListOptions {
  categorySlug?: string | null;
  search?: string | null;
  sort?: string | null;
  from: number;
  to: number;
}

/** Public catalogue listing: active products only, paginated. */
export async function listPublicProducts({
  categorySlug,
  search,
  sort,
  from,
  to,
}: ProductListOptions): Promise<{ rows: ProductCardWithTags[]; total: number }> {
  const { column, ascending } = sortOf(sort);

  let query = getSupabase()
    .from(TABLES.product)
    .select(categorySlug ? CARD_BY_CATEGORY_SELECT : CARD_WITH_TAGS_SELECT, {
      count: "exact",
    })
    .eq("isActive", true)
    .eq(PRIMARY_IMAGE.column, true)
    .limit(1, { referencedTable: PRIMARY_IMAGE.referencedTable });

  if (categorySlug) query = query.eq("category.slug", categorySlug);
  if (search) query = query.or(ilikeAny(["name", "description"], search));

  return selectPage<ProductCardWithTags>(query.order(column, { ascending }).range(from, to));
}

/** Products in one category, paginated. */
export async function listProductsByCategoryId(
  categoryId: string,
  from: number,
  to: number
): Promise<{ rows: ProductCard[]; total: number }> {
  return selectPage<ProductCard>(
    getSupabase()
      .from(TABLES.product)
      .select(CARD_SELECT, { count: "exact" })
      .eq("categoryId", categoryId)
      .eq("isActive", true)
      .eq(PRIMARY_IMAGE.column, true)
      .limit(1, { referencedTable: PRIMARY_IMAGE.referencedTable })
      .order("createdAt", { ascending: false })
      .range(from, to)
  );
}

/** A short list of highlighted products for the home page. */
export async function listHighlightedProducts(
  flag: "isFeatured" | "isBestSeller",
  limit = 6
): Promise<ProductCard[]> {
  // Best sellers are ranked by sales; featured products by recency.
  const orderBy = flag === "isBestSeller" ? "soldCount" : "createdAt";

  return selectMany<ProductCard>(
    getSupabase()
      .from(TABLES.product)
      .select(CARD_SELECT)
      .eq(flag, true)
      .eq("isActive", true)
      .eq(PRIMARY_IMAGE.column, true)
      .limit(1, { referencedTable: PRIMARY_IMAGE.referencedTable })
      .order(orderBy, { ascending: false })
      .limit(limit)
  );
}

/** Full product for its public page. Null when the slug is unknown. */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return selectOne<ProductDetail>(
    getSupabase()
      .from(TABLES.product)
      .select(DETAIL_SELECT)
      .eq("slug", slug)
      .eq("reviews.isApproved", true)
      .order("sortOrder", { referencedTable: "images", ascending: true })
      .order("createdAt", { referencedTable: "reviews", ascending: false })
      .maybeSingle()
  );
}

/* ── Admin ───────────────────────────────────────────────── */

export interface AdminProductCard extends ProductRow {
  category: Pick<CategoryRow, "id" | "name"> | null;
  images: ProductImageRow[];
  _count: { reviews: number; variants: number };
}

/** Admin listing, with review and variant counts and an optional search. */
export async function listAdminProducts(
  search: string | null,
  from: number,
  to: number
): Promise<{ rows: AdminProductCard[]; total: number }> {
  let query = getUserSupabase()
    .from(TABLES.product)
    .select(
      "*, category:Category(id,name), images:ProductImage(*), reviews:Review(count), variants:ProductVariant(count)",
      { count: "exact" }
    )
    .eq(PRIMARY_IMAGE.column, true)
    .limit(1, { referencedTable: PRIMARY_IMAGE.referencedTable });

  if (search) query = query.or(ilikeAny(["name", "sku"], search));

  type Raw = Omit<AdminProductCard, "_count"> & {
    reviews: { count: number }[];
    variants: { count: number }[];
  };

  const { rows, total } = await selectPage<Raw>(
    query.order("createdAt", { ascending: false }).range(from, to)
  );

  // PostgREST reports an aggregate as `[{ count: n }]`. The admin table reads
  // `_count.reviews`, so that shape is preserved here.
  return {
    total,
    rows: rows.map(({ reviews, variants, ...product }) => ({
      ...product,
      _count: { reviews: reviews[0]?.count ?? 0, variants: variants[0]?.count ?? 0 },
    })),
  };
}

export interface AdminProductDetail extends ProductRow {
  category: Pick<CategoryRow, "id" | "name"> | null;
  images: ProductImageRow[];
  variants: ProductVariantRow[];
  tags: ProductTagRow[];
}

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  return selectOne<AdminProductDetail>(
    getUserSupabase()
      .from(TABLES.product)
      .select(
        "*, category:Category(id,name), images:ProductImage(*), variants:ProductVariant(*), tags:ProductTag(*)"
      )
      .eq("id", id)
      .order("sortOrder", { referencedTable: "images", ascending: true })
      .maybeSingle()
  );
}

/** A product with all its children, as returned after a create or update. */
export async function getProductWithChildren(id: string) {
  return selectOne<AdminProductDetail & { category: CategoryRow | null }>(
    getUserSupabase()
      .from(TABLES.product)
      .select(
        "*, category:Category(*), images:ProductImage(*), variants:ProductVariant(*), tags:ProductTag(*)"
      )
      .eq("id", id)
      .maybeSingle()
  );
}
