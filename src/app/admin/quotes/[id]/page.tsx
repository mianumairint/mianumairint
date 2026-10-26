"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/format";
import { QUOTE_STATUS_COLORS as statusColor } from "@/lib/constants/status";
import LoadingState from "@/components/admin/LoadingState";

interface QuoteData {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  country: string;
  products: string;
  message: string | null;
  status: string;
  adminNotes?: string | null;
  createdAt: string;
}

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/quotes/${quoteId}`);
        if (!res.ok) throw new Error("Quote not found");
        const { quote: found } = await res.json();
        setQuote(found);
        setStatus(found.status);
        setNotes(found.adminNotes || "");
      } catch (err: any) {
        setError(err.message || "Failed to load quote");
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [quoteId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!res.ok) throw new Error("Failed to update quote");
      const data = await res.json();
      setQuote(data.quote);
      setStatus(data.quote.status);
      setSaveMsg("Quote updated successfully");
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
        <LoadingState label="Loading quote..." className="text-center" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="space-y-6">
        <Link href="/admin/quotes" className="font-label text-sm text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Quotes
        </Link>
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">{error || "Quote not found"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/quotes" className="font-label text-sm text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Quotes
        </Link>
        <h1 className="font-headline text-2xl text-on-surface">{quote.companyName}</h1>
        <span className={`px-2.5 py-0.5 rounded-full font-label text-xs ${statusColor[status] || "bg-surface-container text-on-surface-variant"}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
            <h2 className="font-label text-sm font-medium text-on-surface mb-4">Contact Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-label text-xs text-on-surface-variant">Contact Name</p>
                <p className="font-body text-sm text-on-surface">{quote.contactName}</p>
              </div>
              <div>
                <p className="font-label text-xs text-on-surface-variant">Email</p>
                <p className="font-body text-sm text-on-surface">{quote.email}</p>
              </div>
              <div>
                <p className="font-label text-xs text-on-surface-variant">Phone</p>
                <p className="font-body text-sm text-on-surface">{quote.phone || "N/A"}</p>
              </div>
              <div>
                <p className="font-label text-xs text-on-surface-variant">Country</p>
                <p className="font-body text-sm text-on-surface">{quote.country}</p>
              </div>
            </div>
          </div>

          {/* Products Requested */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
            <h2 className="font-label text-sm font-medium text-on-surface mb-4">Products Requested</h2>
            <p className="font-body text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{quote.products}</p>
          </div>

          {/* Message */}
          {quote.message && (
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
              <h2 className="font-label text-sm font-medium text-on-surface mb-4">Message</h2>
              <p className="font-body text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{quote.message}</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
            <h2 className="font-label text-sm font-medium text-on-surface">Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-label text-sm outline-none focus:border-primary"
            >
              {["NEW", "REVIEWING", "QUOTED", "CLOSED"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="font-label text-xs text-on-surface-variant">
              Received: {formatDate(quote.createdAt)}
            </p>
          </div>

          {/* Internal Notes */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
            <h2 className="font-label text-sm font-medium text-on-surface">Internal Notes</h2>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this quote..."
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary resize-y"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mineral-glow text-on-primary font-label text-sm px-5 py-3 rounded-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saveMsg && (
            <p className={`font-label text-xs text-center ${saveMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {saveMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
