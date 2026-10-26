"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate, formatPrice as formatCurrency } from "@/lib/format";
import { ORDER_STATUS_COLORS as statusColor } from "@/lib/constants/status";
import LoadingState from "@/components/admin/LoadingState";

const statusOptions = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

interface Order {
  id: string;
  orderNumber: string;
  guestEmail: string | null;
  status: string;
  paymentMethod: string;
  total: string | number;
  createdAt: string;
  user: { name: string | null; email: string } | null;
  _count: { items: number };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [total, setTotal] = useState(0);

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status && status !== "ALL") params.set("status", status);
      params.set("limit", "50");
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeStatus);
  }, [activeStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl text-on-surface">Orders</h1>
        <span className="font-label text-sm text-on-surface-variant">{total} total</span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 rounded-full font-label text-xs transition ${
                activeStatus === s
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">
          {error}
          <button onClick={() => fetchOrders(activeStatus)} className="ml-3 underline">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <LoadingState label="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">receipt_long</span>
            <p className="font-label text-sm text-on-surface-variant">No orders found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition">
                  <td className="px-6 py-3 font-label text-sm font-medium text-on-surface">{order.orderNumber}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">
                    {order.user?.email || order.guestEmail || "N/A"}
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{order._count?.items || 0}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{order.paymentMethod}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-label text-xs ${statusColor[order.status] || "bg-surface-container text-on-surface-variant"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="p-1.5 rounded-lg hover:bg-surface-container transition inline-flex">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">visibility</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
