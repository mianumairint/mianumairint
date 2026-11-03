"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import RevenueChart, { type RevenuePoint } from "@/components/admin/RevenueChart";

const REFRESH_MS = 30_000;
import { formatCurrency, formatDate } from "@/lib/format";
import { DASHBOARD_ORDER_STATUS_COLORS as statusColor } from "@/lib/constants/status";

interface DashboardStats {
  totalRevenue: number;
  ordersThisMonth: number;
  pendingQuotes: number;
  totalProducts: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number | string;
  status: string;
  createdAt: string;
  user?: { name: string | null; email: string } | null;
}

interface PendingQuote {
  id: string;
  companyName: string;
  contactName: string;
  country: string;
  createdAt: string;
}

/* ── Skeleton Components ── */
function StatSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-on-surface/5" />
        <div className="space-y-2 flex-1">
          <div className="h-8 w-24 bg-on-surface/5 rounded" />
          <div className="h-4 w-32 bg-on-surface/5 rounded" />
        </div>
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-t border-outline-variant/20">
      <td className="px-6 py-3">
        <div className="h-4 w-20 bg-on-surface/5 rounded animate-pulse" />
      </td>
      <td className="px-6 py-3">
        <div className="h-4 w-28 bg-on-surface/5 rounded animate-pulse" />
      </td>
      <td className="px-6 py-3">
        <div className="h-4 w-20 bg-on-surface/5 rounded animate-pulse" />
      </td>
      <td className="px-6 py-3">
        <div className="h-5 w-20 bg-on-surface/5 rounded-full animate-pulse" />
      </td>
      <td className="px-6 py-3">
        <div className="h-4 w-24 bg-on-surface/5 rounded animate-pulse" />
      </td>
    </tr>
  );
}

function QuoteSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/50 animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-4 w-36 bg-on-surface/5 rounded" />
        <div className="h-3 w-28 bg-on-surface/5 rounded" />
      </div>
      <div className="h-7 w-14 bg-on-surface/5 rounded-lg" />
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [pendingQuotes, setPendingQuotes] = useState<PendingQuote[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingQuotes, setLoadingQuotes] = useState(true);

  const [revenueByDay, setRevenueByDay] = useState<RevenuePoint[]>([]);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  // Reloads every figure on the page. The first call shows skeletons; later
  // refreshes swap numbers in place so the screen does not flicker.
  const load = useCallback(async () => {
    const json = (url: string) =>
      fetch(url, { cache: "no-store" }).then((res) => {
        if (!res.ok) throw new Error(`${url}: ${res.status}`);
        return res.json();
      });

    await Promise.allSettled([
      json("/api/admin/dashboard/stats")
        .then((data) => {
          setStats({
            totalRevenue: data.totalRevenue,
            ordersThisMonth: data.ordersThisMonth,
            pendingQuotes: data.pendingQuotes,
            totalProducts: data.totalProducts,
          });
          setRevenueByDay(data.revenueByDay || []);
        })
        .catch(console.error)
        .finally(() => setLoadingStats(false)),
      json("/api/admin/orders?limit=5")
        .then((data) => setRecentOrders(data.orders || []))
        .catch(console.error)
        .finally(() => setLoadingOrders(false)),
      json("/api/admin/quotes?status=NEW&limit=5")
        .then((data) => setPendingQuotes(data.quotes || []))
        .catch(console.error)
        .finally(() => setLoadingQuotes(false)),
    ]);
    setUpdatedAt(new Date());
  }, []);

  useEffect(() => {
    load();
    // Poll while the tab is open, and refresh straight away when the admin
    // comes back to it, so new orders and quotes appear without a reload.
    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, REFRESH_MS);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const statCards = stats
    ? [
        {
          label: "Total Revenue",
          value: formatCurrency(stats.totalRevenue),
          icon: "payments",
          color: "bg-primary/10 text-primary",
        },
        {
          label: "Orders This Month",
          value: String(stats.ordersThisMonth),
          icon: "shopping_bag",
          color: "bg-green-100 text-green-700",
        },
        {
          label: "Pending Quotes",
          value: String(stats.pendingQuotes),
          icon: "request_quote",
          color: "bg-amber-100 text-amber-700",
        },
        {
          label: "Total Products",
          value: String(stats.totalProducts),
          icon: "inventory_2",
          color: "bg-blue-100 text-blue-700",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-headline text-2xl text-on-surface">Dashboard</h1>
        {updatedAt && (
          <p className="flex items-center gap-2 font-label text-xs text-on-surface-variant">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Live &middot; updated {updatedAt.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-container-lowest rounded-xl tonal-shadow p-6"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}
                  >
                    <span className="material-symbols-outlined">
                      {stat.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-headline text-3xl text-on-surface">
                      {stat.value}
                    </p>
                    <p className="font-label text-sm text-on-surface-variant">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={revenueByDay} loading={loadingStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-headline text-lg text-on-surface">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="font-label text-sm text-primary hover:underline"
            >
              View All
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-t border-outline-variant/30">
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                  ))
                : recentOrders.length === 0
                ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center font-label text-sm text-on-surface-variant"
                    >
                      No orders yet
                    </td>
                  </tr>
                )
                : recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition"
                    >
                      <td className="px-6 py-3 font-label text-sm font-medium text-on-surface">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-3 font-body text-sm text-on-surface">
                        {order.user?.name || order.user?.email || "Guest"}
                      </td>
                      <td className="px-6 py-3 font-body text-sm text-on-surface">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-label text-xs ${
                            statusColor[order.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Quotes */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline text-lg text-on-surface">
                Pending Quotes
              </h2>
              <Link
                href="/admin/quotes"
                className="font-label text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {loadingQuotes
                ? Array.from({ length: 3 }).map((_, i) => (
                    <QuoteSkeleton key={i} />
                  ))
                : pendingQuotes.length === 0
                ? (
                  <p className="text-center font-label text-sm text-on-surface-variant py-4">
                    No pending quotes
                  </p>
                )
                : pendingQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low/50"
                    >
                      <div>
                        <p className="font-label text-sm font-medium text-on-surface">
                          {q.companyName}
                        </p>
                        <p className="font-label text-xs text-on-surface-variant">
                          {q.country} &middot; {formatDate(q.createdAt)}
                        </p>
                      </div>
                      <Link
                        href={`/admin/quotes/${q.id}`}
                        className="mineral-glow text-on-primary font-label text-xs px-3 py-1.5 rounded-lg"
                      >
                        Reply
                      </Link>
                    </div>
                  ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
            <h2 className="font-headline text-lg text-on-surface mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/admin/products/new"
                className="flex items-center gap-2 w-full mineral-glow text-on-primary font-label text-sm px-4 py-2.5 rounded-lg justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add Product
              </Link>
              <Link
                href="/admin/blog/new"
                className="flex items-center gap-2 w-full border border-primary text-primary font-label text-sm px-4 py-2.5 rounded-lg justify-center hover:bg-primary/5 transition"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                New Blog Post
              </Link>
              <Link
                href="/admin/messages"
                className="flex items-center gap-2 w-full border border-outline-variant text-on-surface-variant font-label text-sm px-4 py-2.5 rounded-lg justify-center hover:bg-surface-container-low transition"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chat
                </span>
                View Messages
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
