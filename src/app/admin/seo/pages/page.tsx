"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface SeoMetaEntry {
  id: string;
  entityType: string;
  entityId: string;
  slug: string;
  title: string | null;
  metaDesc: string | null;
  focusKeyword: string | null;
  seoScore: number | null;
  updatedAt: string;
}

const TABS = [
  { label: "All", value: "" },
  { label: "Products", value: "PRODUCT" },
  { label: "Blog Posts", value: "BLOG_POST" },
  { label: "Categories", value: "CATEGORY" },
  { label: "Static Pages", value: "PAGE" },
];

export default function SeoAllPagesPage() {
  const [entries, setEntries] = useState<SeoMetaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/admin/seo/meta");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to fetch SEO entries:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (activeTab) {
      result = result.filter((e) => e.entityType === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(q)) ||
          e.slug.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, activeTab, search]);

  function scoreIndicator(score: number | null) {
    if (score === null) return "bg-gray-400";
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  }

  function typeBadge(type: string) {
    const colors: Record<string, string> = {
      PRODUCT: "bg-blue-500/10 text-blue-600",
      BLOG_POST: "bg-purple-500/10 text-purple-600",
      CATEGORY: "bg-amber-500/10 text-amber-700",
      PAGE: "bg-teal-500/10 text-teal-600",
    };
    return colors[type] || "bg-gray-500/10 text-gray-600";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/seo" className="text-on-surface-variant hover:text-on-surface transition">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h1 className="font-headline text-2xl font-bold text-on-surface">All Pages SEO</h1>
          </div>
          <p className="font-body text-sm text-on-surface-variant">
            Manage SEO metadata for all pages, products, and posts
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-container-lowest rounded-xl p-1 tonal-shadow w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg font-label text-sm transition ${
              activeTab === tab.value
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          placeholder="Search by title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest rounded-xl tonal-shadow font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl tonal-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Page Title
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  URL / Slug
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Focus Keyword
                </th>
                <th className="text-center px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Updated
                </th>
                <th className="text-right px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-surface-container/30 transition">
                  <td className="px-5 py-3">
                    <p className="font-body text-sm text-on-surface truncate max-w-[200px]">
                      {entry.title || "(No title)"}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-label text-xs text-on-surface-variant truncate max-w-[180px]">
                      /{entry.slug}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-md font-label text-xs font-medium ${typeBadge(entry.entityType)}`}>
                      {entry.entityType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-label text-xs text-on-surface-variant">
                      {entry.focusKeyword || "-"}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${scoreIndicator(entry.seoScore)}`} />
                      <span className="font-label text-sm text-on-surface">
                        {entry.seoScore ?? "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-label text-xs text-on-surface-variant">
                      {new Date(entry.updatedAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/seo/pages/${entry.entityType}/${entry.entityId}`}
                      className="mineral-glow px-3 py-1.5 rounded-lg font-label text-xs font-medium inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">search_off</span>
                    <p className="font-body text-sm text-on-surface-variant mt-2">No SEO entries found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
