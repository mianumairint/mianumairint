"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/format";
import LoadingState from "@/components/admin/LoadingState";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/customers?limit=50");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-headline text-2xl text-on-surface">Customers</h1>
        <span className="font-label text-sm text-on-surface-variant">{total} total</span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">
          {error}
          <button onClick={fetchCustomers} className="ml-3 underline">Retry</button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <LoadingState label="Loading customers..." />
        ) : customers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">group</span>
            <p className="font-label text-sm text-on-surface-variant">No customers yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Name", "Email", "Phone", "Orders", "Joined"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition">
                  <td className="px-6 py-3 font-label text-sm font-medium text-on-surface">{c.name || "N/A"}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{c.email}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{c.phone || "N/A"}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">{c._count?.orders || 0}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
