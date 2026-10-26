"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/format";
import LoadingState from "@/components/admin/LoadingState";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const fetchSubscribers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/newsletter/subscribers?limit=100");
      if (!res.ok) throw new Error("Failed to fetch subscribers");
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const activeCount = subscribers.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-2xl text-on-surface">Newsletter</h1>
          <span className="bg-green-100 text-green-800 font-label text-xs px-2.5 py-0.5 rounded-full">
            {activeCount} active
          </span>
          <span className="font-label text-sm text-on-surface-variant">{total} total</span>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-outline-variant/30 font-label text-sm text-on-surface hover:bg-surface-container transition">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">
          {error}
          <button onClick={fetchSubscribers} className="ml-3 underline">Retry</button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <LoadingState label="Loading subscribers..." />
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">newspaper</span>
            <p className="font-label text-sm text-on-surface-variant">No subscribers yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Email", "Status", "Subscribed Date"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition">
                  <td className="px-6 py-3 font-body text-sm text-on-surface">{sub.email}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-label text-xs ${
                      sub.isActive ? "bg-green-100 text-green-800" : "bg-surface-container text-on-surface-variant"
                    }`}>
                      {sub.isActive ? "Active" : "Unsubscribed"}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{formatDate(sub.subscribedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
