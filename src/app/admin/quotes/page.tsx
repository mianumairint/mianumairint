"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { QUOTE_STATUS_COLORS as statusColor } from "@/lib/constants/status";
import LoadingState from "@/components/admin/LoadingState";

interface Quote {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  country: string;
  products: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [total, setTotal] = useState(0);

  const fetchQuotes = async (status?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status && status !== "ALL") params.set("status", status);
      params.set("limit", "50");
      const res = await fetch(`/api/admin/quotes?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch quotes");
      const data = await res.json();
      setQuotes(data.quotes || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes(filter);
  }, [filter]);

  const newCount = quotes.filter((q) => q.status === "NEW").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-headline text-2xl text-on-surface">Quote Requests</h1>
        {newCount > 0 && (
          <span className="bg-primary/10 text-primary font-label text-xs px-2.5 py-0.5 rounded-full">
            {newCount} new
          </span>
        )}
        <span className="font-label text-sm text-on-surface-variant ml-auto">{total} total</span>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["ALL", "NEW", "REVIEWING", "QUOTED", "CLOSED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full font-label text-xs transition ${
              filter === s
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">
          {error}
          <button onClick={() => fetchQuotes(filter)} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <LoadingState label="Loading quotes..." />
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">request_quote</span>
            <p className="font-label text-sm text-on-surface-variant">No quote requests found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Company", "Contact", "Country", "Products Requested", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition cursor-pointer">
                  <td className="px-6 py-3 font-label text-sm font-medium text-on-surface">{quote.companyName}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">{quote.contactName}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{quote.country}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant max-w-[200px] truncate">{quote.products}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{formatDate(quote.createdAt)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-label text-xs ${statusColor[quote.status] || "bg-surface-container text-on-surface-variant"}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/admin/quotes/${quote.id}`} className="p-1.5 rounded-lg hover:bg-surface-container transition inline-flex">
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
