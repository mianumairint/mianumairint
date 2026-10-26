"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SeoMetaEntry {
  id: string;
  entityType: string;
  entityId: string;
  slug: string;
  title: string | null;
  seoScore: number | null;
  updatedAt: string;
}

interface RedirectEntry {
  id: string;
  isActive: boolean;
}

export default function SeoOverviewPage() {
  const [metaEntries, setMetaEntries] = useState<SeoMetaEntry[]>([]);
  const [redirects, setRedirects] = useState<RedirectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [auditMessage, setAuditMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [metaRes, redirectRes] = await Promise.all([
        fetch("/api/admin/seo/meta"),
        fetch("/api/admin/seo/redirects"),
      ]);
      if (metaRes.ok) {
        const data = await metaRes.json();
        setMetaEntries(data.entries || []);
      }
      if (redirectRes.ok) {
        const data = await redirectRes.json();
        setRedirects(data.redirects || []);
      }
    } catch (error) {
      console.error("Failed to fetch SEO data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function runAudit() {
    setAuditing(true);
    setAuditMessage("");
    try {
      const res = await fetch("/api/admin/seo/audit", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setAuditMessage(data.message);
        fetchData();
      } else {
        setAuditMessage("Audit failed: " + (data.error || "Unknown error"));
      }
    } catch {
      setAuditMessage("Audit failed: Network error");
    } finally {
      setAuditing(false);
    }
  }

  const scores = metaEntries.map((e) => e.seoScore).filter((s): s is number => s !== null);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const optimizedCount = metaEntries.filter((e) => e.seoScore !== null && e.seoScore > 50).length;
  const criticalCount = metaEntries.filter((e) => e.seoScore !== null && e.seoScore < 50).length;
  const activeRedirects = redirects.filter((r) => r.isActive).length;

  const issuePages = metaEntries
    .filter((e) => e.seoScore !== null && e.seoScore < 80)
    .sort((a, b) => (a.seoScore ?? 0) - (b.seoScore ?? 0));

  function scoreColor(score: number) {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-orange-500";
    return "text-red-500";
  }

  function gaugeColor(score: number) {
    if (score >= 80) return "#22c55e";
    if (score >= 50) return "#f97316";
    return "#ef4444";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="font-label text-sm text-on-surface-variant mt-2">Loading SEO data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">SEO Manager</h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Monitor and optimize your site&apos;s search engine performance
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 tonal-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label text-sm text-on-surface-variant">Overall SEO Score</span>
            <span className="material-symbols-outlined text-on-surface-variant">speed</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-container" />
                <circle
                  cx="32" cy="32" r="28" fill="none"
                  stroke={gaugeColor(avgScore)}
                  strokeWidth="6"
                  strokeDasharray={`${(avgScore / 100) * 175.9} 175.9`}
                  strokeLinecap="round"
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center font-headline font-bold text-lg ${scoreColor(avgScore)}`}>
                {avgScore}
              </span>
            </div>
            <div>
              <p className="font-body text-xs text-on-surface-variant">
                {avgScore >= 80 ? "Good" : avgScore >= 50 ? "Needs Work" : "Critical"}
              </p>
            </div>
          </div>
        </div>

        {/* Pages Optimized */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 tonal-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label text-sm text-on-surface-variant">Pages Optimized</span>
            <span className="material-symbols-outlined text-on-surface-variant">check_circle</span>
          </div>
          <p className="font-headline text-3xl font-bold text-on-surface">
            {optimizedCount}<span className="text-lg text-on-surface-variant font-normal">/{metaEntries.length}</span>
          </p>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Pages scoring above 50
          </p>
        </div>

        {/* Critical Issues */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 tonal-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label text-sm text-on-surface-variant">Critical Issues</span>
            <span className="material-symbols-outlined text-red-500">error</span>
          </div>
          <p className="font-headline text-3xl font-bold text-red-500">{criticalCount}</p>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Pages scoring below 50
          </p>
        </div>

        {/* Active Redirects */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 tonal-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label text-sm text-on-surface-variant">Active Redirects</span>
            <span className="material-symbols-outlined text-on-surface-variant">redo</span>
          </div>
          <p className="font-headline text-3xl font-bold text-on-surface">{activeRedirects}</p>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            Of {redirects.length} total redirects
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={runAudit}
          disabled={auditing}
          className="mineral-glow inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-label text-sm font-medium disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {auditing ? "progress_activity" : "query_stats"}
          </span>
          {auditing ? "Running Audit..." : "Run Full Audit"}
        </button>
        <Link
          href="/admin/seo/pages"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-label text-sm font-medium bg-surface-container-lowest tonal-shadow hover:bg-surface-container transition text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          View All Pages
        </Link>
        <Link
          href="/admin/seo/redirects"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-label text-sm font-medium bg-surface-container-lowest tonal-shadow hover:bg-surface-container transition text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]">redo</span>
          Manage Redirects
        </Link>
        <Link
          href="/admin/seo/robots"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-label text-sm font-medium bg-surface-container-lowest tonal-shadow hover:bg-surface-container transition text-on-surface"
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          Edit Robots.txt
        </Link>
      </div>

      {auditMessage && (
        <div className="bg-surface-container-lowest rounded-xl p-4 tonal-shadow">
          <p className="font-body text-sm text-on-surface">{auditMessage}</p>
        </div>
      )}

      {/* Issues Panel */}
      {issuePages.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl tonal-shadow">
          <div className="px-5 py-4 border-b border-outline-variant/20">
            <h2 className="font-headline text-lg font-semibold text-on-surface">Pages Needing Attention</h2>
            <p className="font-body text-xs text-on-surface-variant mt-0.5">
              Pages with SEO scores below 80
            </p>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {issuePages.map((page) => (
              <div key={page.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      (page.seoScore ?? 0) < 50 ? "bg-red-500" : "bg-orange-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="font-body text-sm text-on-surface truncate">
                      {page.title || page.slug}
                    </p>
                    <p className="font-label text-xs text-on-surface-variant">
                      {page.entityType} &middot; /{page.slug}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`font-headline font-bold text-sm ${scoreColor(page.seoScore ?? 0)}`}>
                    {page.seoScore}
                  </span>
                  <Link
                    href={`/admin/seo/pages/${page.entityType}/${page.entityId}`}
                    className="mineral-glow px-3 py-1.5 rounded-lg font-label text-xs font-medium"
                  >
                    Fix Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {issuePages.length === 0 && metaEntries.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 tonal-shadow text-center">
          <span className="material-symbols-outlined text-4xl text-green-500">check_circle</span>
          <p className="font-headline text-lg font-semibold text-on-surface mt-2">All pages look great!</p>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            All your pages have an SEO score of 80 or above.
          </p>
        </div>
      )}

      {metaEntries.length === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 tonal-shadow text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
          <p className="font-headline text-lg font-semibold text-on-surface mt-2">No SEO data yet</p>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Run an audit or add SEO metadata to your pages to get started.
          </p>
        </div>
      )}
    </div>
  );
}
