import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api/route";
import { dailyPaidRevenue, listRecentOrders, sumPaidRevenue } from "@/lib/db/orders";
import { getUserSupabase, selectCount } from "@/lib/supabase/server";
import { TABLES } from "@/lib/supabase/types";

// The dashboard polls this route, so it must always read live figures.
export const dynamic = "force-dynamic";

/** Row counts only: `head: true` transfers the count without the rows. */
function countOf(table: string) {
  return getUserSupabase().from(table).select("id", { count: "exact", head: true });
}

export const GET = withAdmin("fetch stats", async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    totalRevenue,
    ordersThisMonth,
    pendingQuotes,
    totalProducts,
    totalCustomers,
    recentOrders,
    revenueByDay,
  ] = await Promise.all([
    sumPaidRevenue(),
    selectCount(countOf(TABLES.order).gte("createdAt", startOfMonth)),
    selectCount(countOf(TABLES.quoteRequest).eq("status", "NEW")),
    selectCount(countOf(TABLES.product).eq("isActive", true)),
    selectCount(countOf(TABLES.user).eq("role", "CUSTOMER")),
    listRecentOrders(),
    dailyPaidRevenue(30),
  ]);

  return NextResponse.json({
    totalRevenue,
    ordersThisMonth,
    pendingQuotes,
    totalProducts,
    totalCustomers,
    recentOrders,
    revenueByDay,
  });
});
