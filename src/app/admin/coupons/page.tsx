"use client";

import { useState, useEffect } from "react";
import LoadingState from "@/components/admin/LoadingState";
import {
  formatDate,
  formatCouponValue as formatValue,
  formatPriceOrDash as formatCurrency,
} from "@/lib/format";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: string | number;
  minOrderValue: string | number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("PERCENTAGE");
  const [newValue, setNewValue] = useState("");
  const [newMinOrder, setNewMinOrder] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpiry, setNewExpiry] = useState("");

  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons?limit=50");
      if (!res.ok) throw new Error("Failed to fetch coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setNewCode("");
    setNewType("PERCENTAGE");
    setNewValue("");
    setNewMinOrder("");
    setNewMaxUses("");
    setNewExpiry("");
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!newCode.trim() || !newValue.trim()) {
      alert("Code and value are required.");
      return;
    }
    setSaving(true);
    try {
      const body: any = {
        code: newCode.toUpperCase().trim(),
        type: newType,
        value: parseFloat(newValue),
      };
      if (newMinOrder) body.minOrderValue = parseFloat(newMinOrder);
      if (newMaxUses) body.maxUses = parseInt(newMaxUses);
      if (newExpiry) body.expiresAt = new Date(newExpiry).toISOString();

      if (editingId) {
        const res = await fetch(`/api/admin/coupons/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to update coupon");
      } else {
        const res = await fetch("/api/admin/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to create coupon");
      }
      setShowForm(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      alert(err.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setNewCode(coupon.code);
    setNewType(coupon.type);
    setNewValue(String(typeof coupon.value === "string" ? parseFloat(coupon.value) : coupon.value));
    setNewMinOrder(coupon.minOrderValue ? String(typeof coupon.minOrderValue === "string" ? parseFloat(coupon.minOrderValue) : coupon.minOrderValue) : "");
    setNewMaxUses(coupon.maxUses ? String(coupon.maxUses) : "");
    setNewExpiry(coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "");
    setShowForm(true);
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete coupon");
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      alert(err.message || "Failed to delete coupon");
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update coupon");
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-2xl text-on-surface">Coupons</h1>
          <span className="font-label text-sm text-on-surface-variant">{total} total</span>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Coupon
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">
          {error}
          <button onClick={fetchCoupons} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Inline Add/Edit Form */}
      {showForm && (
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
          <h3 className="font-label text-sm font-medium text-on-surface mb-4">
            {editingId ? "Edit Coupon" : "New Coupon"}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Code</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="SAVE10"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary uppercase"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-label text-sm outline-none focus:border-primary"
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Value</label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={newType === "PERCENTAGE" ? "10" : "25.00"}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Min Order ($)</label>
              <input
                type="text"
                value={newMinOrder}
                onChange={(e) => setNewMinOrder(e.target.value)}
                placeholder="50.00"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Max Uses</label>
              <input
                type="text"
                value={newMaxUses}
                onChange={(e) => setNewMaxUses(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Expiry</label>
              <input
                type="date"
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="mineral-glow text-on-primary font-label text-sm px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="px-5 py-2 rounded-lg border border-outline-variant/30 font-label text-sm text-on-surface hover:bg-surface-container transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <LoadingState label="Loading coupons..." />
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">sell</span>
            <p className="font-label text-sm text-on-surface-variant">No coupons yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Code", "Type", "Value", "Min Order", "Uses", "Status", "Expiry", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition">
                  <td className="px-6 py-3 font-label text-sm font-medium text-on-surface font-mono">{coupon.code}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-label text-xs ${
                      coupon.type === "PERCENTAGE" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                    }`}>
                      {coupon.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">{formatValue(coupon.type, coupon.value)}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{formatCurrency(coupon.minOrderValue)}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                    {coupon.usedCount}/{coupon.maxUses || "Unlimited"}
                  </td>
                  <td className="px-6 py-3">
                    <button onClick={() => handleToggleActive(coupon)}>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-label text-xs cursor-pointer ${
                        coupon.isActive ? "bg-green-100 text-green-800" : "bg-surface-container text-on-surface-variant"
                      }`}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : "No expiry"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(coupon)} className="p-1.5 rounded-lg hover:bg-surface-container transition">
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(coupon.id, coupon.code)} className="p-1.5 rounded-lg hover:bg-red-50 transition">
                        <span className="material-symbols-outlined text-red-500 text-[20px]">delete</span>
                      </button>
                    </div>
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
