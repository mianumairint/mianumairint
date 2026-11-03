import {
  DbError,
  getUserSupabase,
  mutateOne,
  normalizeTimestamps,
  selectMany,
  selectOne,
  selectPage,
  sumNumericColumn,
  touched,
} from "@/lib/supabase/server";
import {
  TABLES,
  type AddressRow,
  type OrderItemRow,
  type OrderRow,
  type OrderStatus,
  type ProductImageRow,
} from "@/lib/supabase/types";

/**
 * ORDER QUERIES
 * =============
 * Orders are read by the customer account page, the checkout confirmation and
 * three admin screens, each needing a different depth of nesting. The select
 * strings are collected here.
 *
 * Every query uses the session-bound client: the policies let a customer see
 * only their own orders and an admin see all of them, so the `userId` filters
 * below are a second line of defence rather than the only one.
 */

type ProductStub = { name: string; slug: string; images: ProductImageRow[] };

export interface OrderWithItems extends OrderRow {
  items: (OrderItemRow & { product: ProductStub | null })[];
}

export interface OrderDetail extends OrderRow {
  items: (OrderItemRow & {
    product: (ProductStub & { id: string }) | null;
    variant: { id: string; label: string; sku: string } | null;
  })[];
}

const PRIMARY_IMAGE_PATH = "items.product.images.isPrimary";
const PRIMARY_IMAGE_TABLE = "items.product.images";

const WITH_ITEMS =
  "*, items:OrderItem(*, product:Product(name,slug,images:ProductImage(*)))";

const WITH_ITEM_DETAIL =
  "*, items:OrderItem(*, product:Product(id,name,slug,images:ProductImage(*)), variant:ProductVariant(*))";

/** Every order belonging to one customer, newest first. */
export async function listOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  return selectMany<OrderWithItems>(
    getUserSupabase()
      .from(TABLES.order)
      .select(WITH_ITEMS)
      .eq("userId", userId)
      .eq(PRIMARY_IMAGE_PATH, true)
      .limit(1, { referencedTable: PRIMARY_IMAGE_TABLE })
      .order("createdAt", { ascending: false })
  );
}

/**
 * One order, scoped to its owner so a guessed id cannot read someone else's.
 * Null when the id is unknown or belongs to another customer.
 */
export async function getOrderForUser(id: string, userId: string): Promise<OrderDetail | null> {
  return selectOne<OrderDetail>(
    getUserSupabase()
      .from(TABLES.order)
      .select(WITH_ITEM_DETAIL)
      .eq("id", id)
      .eq("userId", userId)
      .eq(PRIMARY_IMAGE_PATH, true)
      .limit(1, { referencedTable: PRIMARY_IMAGE_TABLE })
      .maybeSingle()
  );
}

export async function getOrderStatusForUser(
  id: string,
  userId: string
): Promise<Pick<OrderRow, "id" | "status"> | null> {
  return selectOne<Pick<OrderRow, "id" | "status">>(
    getUserSupabase()
      .from(TABLES.order)
      .select("id,status")
      .eq("id", id)
      .eq("userId", userId)
      .maybeSingle()
  );
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<OrderRow> {
  return mutateOne<OrderRow>(
    getUserSupabase()
      .from(TABLES.order)
      .update(touched({ status }))
      .eq("id", id)
      .select("*")
      .single()
  );
}

/* ── Creating an order ───────────────────────────────────── */

export interface NewOrderItem {
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
}

export interface NewOrder {
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  couponCode: string | null;
  notes: string | null;
}

/**
 * Creates an order and its line items.
 *
 * Done in one database function, for two reasons. It is a transaction, so an
 * order can never be left without its items -- over PostgREST the two inserts
 * would be separate requests. And it means neither table needs a public INSERT
 * policy, so nobody can attach a line to someone else's order.
 *
 * The function refuses to file an order under an account other than the
 * caller's, and returns the stored row so the response reflects what Postgres
 * actually wrote. Guest checkout works because the function, not the caller,
 * is what reads the row back.
 */
export async function createOrder(
  order: NewOrder,
  items: NewOrderItem[]
): Promise<OrderRow & { items: OrderItemRow[] }> {
  const { data, error } = await getUserSupabase().rpc("create_order", {
    p_order: order,
    p_items: items,
  });

  if (error) throw new DbError(error.message, error);
  if (!data) throw new DbError("The order could not be created.");

  return normalizeTimestamps(data as OrderRow & { items: OrderItemRow[] });
}

/** The next order number, in the MUI-YYYYMMDD-NNNN format used so far. */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MUI-${dateStr}-${rand}`;
}

/* ── Admin ───────────────────────────────────────────────── */

export interface AdminOrderCard extends OrderRow {
  user: { name: string | null; email: string } | null;
  _count: { items: number };
}

export async function listOrdersForAdmin(
  status: string | null,
  from: number,
  to: number
): Promise<{ rows: AdminOrderCard[]; total: number }> {
  let query = getUserSupabase()
    .from(TABLES.order)
    .select("*, user:User(name,email), items:OrderItem(count)", { count: "exact" });

  if (status) query = query.eq("status", status);

  type Raw = Omit<AdminOrderCard, "_count"> & { items: { count: number }[] };

  const { rows, total } = await selectPage<Raw>(
    query.order("createdAt", { ascending: false }).range(from, to)
  );

  return {
    total,
    rows: rows.map(({ items, ...order }) => ({
      ...order,
      _count: { items: items[0]?.count ?? 0 },
    })),
  };
}

export interface AdminOrderDetail extends OrderRow {
  user: { name: string | null; email: string } | null;
  shippingAddress: AddressRow | null;
  items: (OrderItemRow & {
    product: { name: string } | null;
    variant: { label: string } | null;
  })[];
}

const ADMIN_ORDER_DETAIL =
  "*, user:User(name,email), shippingAddress:Address(*), items:OrderItem(*, product:Product(name), variant:ProductVariant(label))";

/** One order with everything the detail screen shows. */
export async function getOrderForAdmin(id: string): Promise<AdminOrderDetail | null> {
  return selectOne<AdminOrderDetail>(
    getUserSupabase().from(TABLES.order).select(ADMIN_ORDER_DETAIL).eq("id", id).maybeSingle()
  );
}

export async function updateOrderForAdmin(
  id: string,
  patch: Partial<Pick<OrderRow, "status" | "trackingNumber" | "notes">>
): Promise<AdminOrderDetail> {
  const supabase = getUserSupabase();

  await mutateOne<Pick<OrderRow, "id">>(
    supabase.from(TABLES.order).update(touched(patch)).eq("id", id).select("id").single()
  );

  const order = await getOrderForAdmin(id);
  if (!order) throw new DbError("The order no longer exists.");
  return order;
}

/* ── Dashboard statistics ────────────────────────────────── */

/**
 * Lifetime revenue from paid orders.
 * Summed in the app because this project has PostgREST aggregates disabled --
 * see `sumNumericColumn`, which pages so the figure is never truncated.
 */
export async function sumPaidRevenue(): Promise<number> {
  return sumNumericColumn<{ total: string }>("total", (from, to) =>
    getUserSupabase()
      .from(TABLES.order)
      .select("total")
      .eq("paymentStatus", "PAID")
      .range(from, to)
  );
}

/**
 * Paid revenue per day for the last `days` days, oldest first, with a zero
 * for every day that had no sales so the chart has no gaps. Days are UTC.
 */
export async function dailyPaidRevenue(
  days = 30
): Promise<{ date: string; revenue: number }[]> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  const chunk = 1000;
  for (let offset = 0; ; offset += chunk) {
    const rows = await selectMany<{ total: string | number; createdAt: string }>(
      getUserSupabase()
        .from(TABLES.order)
        .select("total,createdAt")
        .eq("paymentStatus", "PAID")
        .gte("createdAt", start.toISOString())
        .order("createdAt", { ascending: true })
        .range(offset, offset + chunk - 1)
    );
    for (const row of rows) {
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, buckets.get(key)! + (Number(row.total) || 0));
    }
    if (rows.length < chunk) break;
  }

  return Array.from(buckets, ([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));
}

export async function listRecentOrders(
  limit = 5
): Promise<Pick<OrderRow, "id" | "orderNumber" | "total" | "status" | "createdAt">[]> {
  return selectMany(
    getUserSupabase()
      .from(TABLES.order)
      .select("id,orderNumber,total,status,createdAt")
      .order("createdAt", { ascending: false })
      .limit(limit)
  );
}
