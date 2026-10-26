"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate, formatPrice as formatCurrency } from "@/lib/format";
import { ORDER_STATUS_COLORS as statusColor } from "@/lib/constants/status";
import LoadingState from "@/components/admin/LoadingState";

const timelineSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

interface OrderItem {
  id: string;
  quantity: number;
  price: string | number;
  product: { name: string } | null;
  variant?: { label: string } | null;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: string | number;
  shippingCost: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
  trackingNumber: string | null;
  notes: string | null;
  couponCode: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
  guestEmail: string | null;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  } | null;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const { order: found } = await res.json();
        setOrder(found);
        setStatus(found.status);
        setTrackingNumber(found.trackingNumber || "");
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleUpdate = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, trackingNumber }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const data = await res.json();
      setOrder(data.order);
      setStatus(data.order.status);
      setTrackingNumber(data.order.trackingNumber || "");
      setSaveMsg("Order updated successfully");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err: any) {
      setSaveMsg(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingState label="Loading order..." className="text-center" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link href="/admin/orders" className="font-label text-sm text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Orders
        </Link>
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">{error || "Order not found"}</div>
      </div>
    );
  }

  const currentStepIndex = timelineSteps.indexOf(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="font-label text-sm text-primary hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Orders
          </Link>
          <h1 className="font-headline text-2xl text-on-surface">{order.orderNumber}</h1>
          <span className={`px-2.5 py-0.5 rounded-full font-label text-xs ${statusColor[order.status] || "bg-surface-container text-on-surface-variant"}`}>
            {order.status}
          </span>
        </div>
        <span className="font-label text-sm text-on-surface-variant">{formatDate(order.createdAt)}</span>
      </div>

      {/* Customer & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
          <h2 className="font-label text-sm font-medium text-on-surface mb-4">Customer Info</h2>
          <div className="space-y-2">
            <p className="font-body text-sm text-on-surface">{order.user?.name || "Guest"}</p>
            <p className="font-body text-sm text-on-surface-variant">{order.user?.email || order.guestEmail || "N/A"}</p>
          </div>
        </div>
        {order.shippingAddress && (
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
            <h2 className="font-label text-sm font-medium text-on-surface mb-4">Shipping Address</h2>
            <div className="space-y-1">
              <p className="font-body text-sm text-on-surface">{order.shippingAddress.fullName}</p>
              <p className="font-body text-sm text-on-surface-variant">{order.shippingAddress.street}</p>
              <p className="font-body text-sm text-on-surface-variant">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="font-body text-sm text-on-surface-variant">{order.shippingAddress.country}</p>
              <p className="font-body text-sm text-on-surface-variant">{order.shippingAddress.phone}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="font-label text-sm font-medium text-on-surface">Items</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-t border-outline-variant/30">
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">Variant</th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">Qty</th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-t border-outline-variant/20">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-container-low rounded flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">image</span>
                      </div>
                      <span className="font-label text-sm text-on-surface">{item.product?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{item.variant?.label || "-"}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">{item.quantity}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">{formatCurrency(item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline */}
      {order.status !== "CANCELLED" && order.status !== "REFUNDED" && (
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
          <h2 className="font-label text-sm font-medium text-on-surface mb-6">Status Timeline</h2>
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                        i <= currentStepIndex ? "bg-primary" : "bg-outline-variant/30"
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? "bg-primary text-on-primary"
                        : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 font-label text-xs ${isCurrent ? "text-primary font-medium" : "text-on-surface-variant"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Update + Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
          <h2 className="font-label text-sm font-medium text-on-surface">Update Status</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-label text-sm outline-none focus:border-primary"
          >
            {[...timelineSteps, "CANCELLED", "REFUNDED"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Update"}
          </button>
          {saveMsg && (
            <p className={`font-label text-xs ${saveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {saveMsg}
            </p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
          <h2 className="font-label text-sm font-medium text-on-surface mb-2">Order Summary</h2>
          <div className="flex justify-between font-body text-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-on-surface">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between font-body text-sm">
            <span className="text-on-surface-variant">Shipping</span>
            <span className="text-on-surface">{formatCurrency(order.shippingCost)}</span>
          </div>
          {parseFloat(String(order.discount)) > 0 && (
            <div className="flex justify-between font-body text-sm">
              <span className="text-on-surface-variant">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span className="text-green-600">-{formatCurrency(order.discount)}</span>
            </div>
          )}
          {parseFloat(String(order.tax)) > 0 && (
            <div className="flex justify-between font-body text-sm">
              <span className="text-on-surface-variant">Tax</span>
              <span className="text-on-surface">{formatCurrency(order.tax)}</span>
            </div>
          )}
          <div className="border-t border-outline-variant/30 pt-3 flex justify-between">
            <span className="font-label text-sm font-medium text-on-surface">Total</span>
            <span className="font-headline text-xl text-on-surface">{formatCurrency(order.total)}</span>
          </div>
          <p className="font-label text-xs text-on-surface-variant">
            Paid via {order.paymentMethod} &middot; Payment: {order.paymentStatus}
          </p>
        </div>
      </div>
    </div>
  );
}
