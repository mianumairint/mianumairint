"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface SeoMetaData {
  id: string;
  entityType: string;
  entityId: string;
  slug: string;
  title: string;
  metaDesc: string;
  metaKeywords: string;
  canonicalUrl: string;
  focusKeyword: string;
  noIndex: boolean;
  noFollow: boolean;
  noSnippet: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDesc: string;
  twitterImage: string;
  customSchema: string;
  seoScore: number | null;
  readabilityScore: number | null;
}

const defaultData: Omit<SeoMetaData, "id" | "entityType" | "entityId"> = {
  slug: "",
  title: "",
  metaDesc: "",
  metaKeywords: "",
  canonicalUrl: "",
  focusKeyword: "",
  noIndex: false,
  noFollow: false,
  noSnippet: false,
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogImageAlt: "",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDesc: "",
  twitterImage: "",
  customSchema: "",
  seoScore: null,
  readabilityScore: null,
};

function calculateScore(data: typeof defaultData): {
  score: number;
  checks: { label: string; pass: boolean; warning?: boolean }[];
} {
  const kw = (data.focusKeyword || "").toLowerCase().trim();
  const titleLen = (data.title || "").length;
  const descLen = (data.metaDesc || "").length;

  const checks = [
    {
      label: "Focus keyword in title",
      pass: !!kw && (data.title || "").toLowerCase().includes(kw),
    },
    {
      label: "Focus keyword in meta description",
      pass: !!kw && (data.metaDesc || "").toLowerCase().includes(kw),
    },
    {
      label: "Focus keyword in slug",
      pass: !!kw && (data.slug || "").toLowerCase().includes(kw.replace(/\s+/g, "-")),
    },
    {
      label: "Title length 50\u201360 characters",
      pass: titleLen >= 50 && titleLen <= 60,
      warning: titleLen > 0 && (titleLen < 50 || titleLen > 60),
    },
    {
      label: "Description length 140\u2013160 characters",
      pass: descLen >= 140 && descLen <= 160,
      warning: descLen > 0 && (descLen < 140 || descLen > 160),
    },
    {
      label: "OG image set",
      pass: !!(data.ogImage || "").trim(),
    },
    {
      label: "Custom schema (JSON-LD) exists",
      pass: !!(data.customSchema || "").trim(),
    },
    {
      label: "Canonical URL set",
      pass: !!(data.canonicalUrl || "").trim(),
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface-container-lowest rounded-2xl tonal-shadow overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          {title}
        </span>
        <span
          className={`material-symbols-outlined text-on-surface-variant text-[20px] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </div>
  );
}

function titleCharClass(len: number) {
  if (len === 0) return "text-on-surface-variant";
  if (len > 60) return "text-red-500 font-bold";
  if (len >= 50) return "text-green-500 font-bold";
  return "text-orange-500";
}

function descCharClass(len: number) {
  if (len === 0) return "text-on-surface-variant";
  if (len > 160) return "text-red-500 font-bold";
  if (len >= 140) return "text-green-500 font-bold";
  return "text-orange-500";
}

function titleBarColor(len: number) {
  if (len > 60) return "bg-red-500";
  if (len >= 50) return "bg-green-500";
  return "bg-orange-400";
}

function descBarColor(len: number) {
  if (len > 160) return "bg-red-500";
  if (len >= 140) return "bg-green-500";
  return "bg-orange-400";
}

export default function SeoMetaEditorPage() {
  const params = useParams();
  const entityType = (params.type as string).toUpperCase();
  const entityId = params.id as string;

  const [data, setData] = useState<SeoMetaData | null>(null);
  const [form, setForm] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/admin/seo/meta?entityType=${entityType}&entityId=${entityId}`
        );
        if (res.ok) {
          const json = await res.json();
          const entries = json.entries || [];
          const match = entries.find(
            (e: SeoMetaData) =>
              e.entityType === entityType && e.entityId === entityId
          );
          if (match) {
            setData(match);
            setForm({
              slug: match.slug || "",
              title: match.title || "",
              metaDesc: match.metaDesc || "",
              metaKeywords: match.metaKeywords || "",
              canonicalUrl: match.canonicalUrl || "",
              focusKeyword: match.focusKeyword || "",
              noIndex: match.noIndex || false,
              noFollow: match.noFollow || false,
              noSnippet: match.noSnippet || false,
              ogTitle: match.ogTitle || "",
              ogDescription: match.ogDescription || "",
              ogImage: match.ogImage || "",
              ogImageAlt: match.ogImageAlt || "",
              ogType: match.ogType || "website",
              twitterCard: match.twitterCard || "summary_large_image",
              twitterTitle: match.twitterTitle || "",
              twitterDesc: match.twitterDesc || "",
              twitterImage: match.twitterImage || "",
              customSchema: match.customSchema || "",
              seoScore: match.seoScore,
              readabilityScore: match.readabilityScore,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load SEO meta:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [entityType, entityId]);

  const { score, checks } = useMemo(() => calculateScore(form), [form]);

  function updateField(field: keyof typeof defaultData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      const body = {
        ...(data ? { id: data.id } : {}),
        entityType,
        entityId,
        ...form,
        seoScore: score,
      };

      const res = await fetch("/api/admin/seo/meta", {
        method: data ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.entry) setData(json.entry);
        setSaveMsg("Saved successfully!");
      } else {
        setSaveMsg("Failed to save. Please try again.");
      }
    } catch {
      setSaveMsg("Error saving. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  const scoreColor =
    score >= 80 ? "text-green-500" : score >= 50 ? "text-orange-500" : "text-red-500";
  const scoreStroke =
    score >= 80 ? "stroke-green-500" : score >= 50 ? "stroke-orange-500" : "stroke-red-500";

  // Focus keyword badge helpers
  const kw = (form.focusKeyword || "").toLowerCase().trim();
  const kwInTitle = !!kw && (form.title || "").toLowerCase().includes(kw);
  const kwInDesc = !!kw && (form.metaDesc || "").toLowerCase().includes(kw);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  const slugDisplay = form.slug || entityId;
  const typeLabel = entityType.replace(/_/g, " ").toLowerCase();
  const breadcrumbUrl = `mianumairint.com \u203A ${typeLabel}s \u203A ${slugDisplay}`;

  // Preview helpers
  const previewTitle = form.ogTitle || form.title || "Page Title";
  const previewDesc = form.ogDescription || form.metaDesc || "Page description will appear here.";
  const previewImage = form.ogImage || "";
  const twitterPreviewTitle = form.twitterTitle || form.ogTitle || form.title || "Page Title";
  const twitterPreviewDesc = form.twitterDesc || form.ogDescription || form.metaDesc || "Page description will appear here.";
  const twitterPreviewImage = form.twitterImage || form.ogImage || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Link
          href="/admin/seo/pages"
          className="text-on-surface-variant hover:text-on-surface transition"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            SEO Meta Editor
          </h1>
          <span className="inline-block px-2.5 py-1 rounded-md font-label text-xs font-medium bg-primary/10 text-primary uppercase">
            {entityType.replace(/_/g, " ")}
          </span>
          <span className="font-label text-sm text-on-surface-variant">
            ID: {entityId}
          </span>
        </div>
      </div>

      {saveMsg && (
        <div
          className={`rounded-xl px-4 py-3 font-body text-sm ${
            saveMsg.includes("success")
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {saveMsg}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN - Editor (7 cols) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Focus Keyword */}
          <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
              Focus Keyword
            </label>
            <input
              type="text"
              value={form.focusKeyword}
              onChange={(e) => updateField("focusKeyword", e.target.value)}
              placeholder="e.g. himalayan pink salt"
              className="w-full bg-surface-container rounded-xl px-4 py-3 font-headline text-lg text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
            />
            {kw && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label text-xs ${
                    kwInTitle
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {kwInTitle ? "check_circle" : "cancel"}
                  </span>
                  In Title
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label text-xs ${
                    kwInDesc
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {kwInDesc ? "check_circle" : "cancel"}
                  </span>
                  In Description
                </span>
              </div>
            )}
          </div>

          {/* SEO Title */}
          <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                SEO Title
              </label>
              <span className={`font-label text-xs ${titleCharClass((form.title || "").length)}`}>
                {(form.title || "").length}/60
              </span>
            </div>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Page title for search engines"
              className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
            />
            {/* Character bar */}
            <div className="mt-2 h-1 rounded-full bg-surface-container overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${titleBarColor(
                  (form.title || "").length
                )}`}
                style={{
                  width: `${Math.min(((form.title || "").length / 60) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Meta Description */}
          <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Meta Description
              </label>
              <span
                className={`font-label text-xs ${descCharClass(
                  (form.metaDesc || "").length
                )}`}
              >
                {(form.metaDesc || "").length}/160
              </span>
            </div>
            <textarea
              rows={3}
              value={form.metaDesc}
              onChange={(e) => updateField("metaDesc", e.target.value)}
              placeholder="Brief description for search results"
              className="w-full bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-on-surface-variant/40"
            />
            <div className="mt-2 h-1 rounded-full bg-surface-container overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${descBarColor(
                  (form.metaDesc || "").length
                )}`}
                style={{
                  width: `${Math.min(
                    ((form.metaDesc || "").length / 160) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Robots Directives */}
          <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 block">
              Robots Directives
            </label>
            <div className="flex flex-wrap gap-6">
              {(["noIndex", "noFollow", "noSnippet"] as const).map((field) => (
                <label
                  key={field}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form[field] as boolean}
                      onChange={(e) => updateField(field, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-surface-container-high rounded-full peer peer-checked:bg-red-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </div>
                  <span className="font-label text-sm text-on-surface">{field}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Canonical URL */}
          <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
              Canonical URL
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={form.canonicalUrl}
                onChange={(e) => updateField("canonicalUrl", e.target.value)}
                placeholder="https://mianumairint.com/..."
                className="flex-1 bg-surface-container rounded-xl px-4 py-3 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
              />
              <button
                type="button"
                onClick={() =>
                  updateField(
                    "canonicalUrl",
                    `https://mianumairint.com/${slugDisplay}`
                  )
                }
                className="shrink-0 px-4 py-3 rounded-xl bg-surface-container hover:bg-surface-container-high font-label text-xs uppercase tracking-wider text-on-surface-variant transition"
              >
                Use Default
              </button>
            </div>
          </div>

          {/* Open Graph (Collapsible) */}
          <CollapsibleSection title="Open Graph">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label text-xs text-on-surface-variant mb-1 block">
                  OG Title
                </label>
                <input
                  type="text"
                  value={form.ogTitle}
                  onChange={(e) => updateField("ogTitle", e.target.value)}
                  placeholder="Open Graph title"
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
                />
              </div>
              <div>
                <label className="font-label text-xs text-on-surface-variant mb-1 block">
                  OG Type
                </label>
                <select
                  value={form.ogType}
                  onChange={(e) => updateField("ogType", e.target.value)}
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                </select>
              </div>
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant mb-1 block">
                OG Description
              </label>
              <textarea
                rows={2}
                value={form.ogDescription}
                onChange={(e) => updateField("ogDescription", e.target.value)}
                placeholder="Open Graph description"
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-on-surface-variant/40"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant mb-1 block">
                OG Image URL
              </label>
              <input
                type="url"
                value={form.ogImage}
                onChange={(e) => updateField("ogImage", e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
              />
              {form.ogImage && (
                <div className="mt-3 rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.ogImage}
                    alt={form.ogImageAlt || "OG Image preview"}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Twitter Card (Collapsible) */}
          <CollapsibleSection title="Twitter Card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label text-xs text-on-surface-variant mb-1 block">
                  Card Type
                </label>
                <select
                  value={form.twitterCard}
                  onChange={(e) => updateField("twitterCard", e.target.value)}
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                </select>
              </div>
              <div>
                <label className="font-label text-xs text-on-surface-variant mb-1 block">
                  Twitter Title
                </label>
                <input
                  type="text"
                  value={form.twitterTitle}
                  onChange={(e) => updateField("twitterTitle", e.target.value)}
                  placeholder="Twitter title"
                  className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
                />
              </div>
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant mb-1 block">
                Twitter Description
              </label>
              <input
                type="text"
                value={form.twitterDesc}
                onChange={(e) => updateField("twitterDesc", e.target.value)}
                placeholder="Twitter description"
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant mb-1 block">
                Twitter Image URL
              </label>
              <input
                type="url"
                value={form.twitterImage}
                onChange={(e) => updateField("twitterImage", e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
              />
            </div>
          </CollapsibleSection>

          {/* Custom Schema (Collapsible) */}
          <CollapsibleSection title="Custom Schema (JSON-LD)">
            <textarea
              rows={8}
              value={form.customSchema}
              onChange={(e) => updateField("customSchema", e.target.value)}
              placeholder={'{"@context": "https://schema.org", ...}'}
              className="w-full bg-surface-container rounded-xl px-4 py-3 font-mono text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/30 resize-none placeholder:text-on-surface-variant/40"
            />
          </CollapsibleSection>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest w-full py-4 rounded-full disabled:opacity-60 transition-all"
          >
            {saving ? "Saving..." : "Save SEO Settings"}
          </button>
        </div>

        {/* RIGHT COLUMN - Live Previews (5 cols, sticky) */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Google Snippet Preview */}
            <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
              <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                Google Snippet Preview
              </h3>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-[#202124] text-xs font-normal mb-1 truncate">
                  {breadcrumbUrl}
                </p>
                <p className="text-[#1a0dab] text-lg font-normal leading-snug truncate cursor-pointer hover:underline">
                  {(form.title || "Page Title").slice(0, 60)}
                  {(form.title || "").length > 60 && "..."}
                </p>
                <p className="text-[#4d5156] text-sm mt-1 leading-relaxed line-clamp-2">
                  {(
                    form.metaDesc ||
                    "Add a meta description to see how it appears in search results."
                  ).slice(0, 160)}
                  {(form.metaDesc || "").length > 160 && "..."}
                </p>
              </div>
            </div>

            {/* Facebook OG Preview */}
            <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
              <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                Facebook Preview
              </h3>
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-[#f0f2f5]">
                {/* Image area */}
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewImage}
                      alt="OG preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-gray-400">
                      image
                    </span>
                  )}
                </div>
                <div className="p-3 bg-[#f0f2f5]">
                  <p className="text-[#606770] text-[11px] uppercase tracking-wider mb-0.5">
                    mianumairint.com
                  </p>
                  <p className="text-[#1d2129] text-sm font-semibold leading-snug truncate">
                    {previewTitle.slice(0, 60)}
                  </p>
                  <p className="text-[#606770] text-xs mt-0.5 line-clamp-2 leading-relaxed">
                    {previewDesc.slice(0, 160)}
                  </p>
                </div>
              </div>
            </div>

            {/* Twitter Card Preview */}
            <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
              <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                Twitter Card Preview
              </h3>
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">
                {form.twitterCard === "summary_large_image" ? (
                  <>
                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
                      {twitterPreviewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={twitterPreviewImage}
                          alt="Twitter preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-gray-400">
                          image
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[#0f1419] text-sm font-bold leading-snug truncate">
                        {twitterPreviewTitle.slice(0, 70)}
                      </p>
                      <p className="text-[#536471] text-xs mt-0.5 line-clamp-2">
                        {twitterPreviewDesc.slice(0, 160)}
                      </p>
                      <p className="text-[#536471] text-[11px] mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">link</span>
                        mianumairint.com
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex">
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {twitterPreviewImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={twitterPreviewImage}
                          alt="Twitter preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-gray-400">
                          image
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 min-w-0">
                      <p className="text-[#0f1419] text-sm font-bold leading-snug truncate">
                        {twitterPreviewTitle.slice(0, 70)}
                      </p>
                      <p className="text-[#536471] text-xs mt-0.5 line-clamp-2">
                        {twitterPreviewDesc.slice(0, 160)}
                      </p>
                      <p className="text-[#536471] text-[11px] mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">link</span>
                        mianumairint.com
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Score Panel */}
            <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6">
              <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                SEO Score
              </h3>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-surface-container"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      strokeWidth="6"
                      strokeLinecap="round"
                      className={scoreStroke}
                      strokeDasharray={`${(score / 100) * 264} 264`}
                      style={{ transition: "stroke-dasharray 0.5s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-headline text-3xl font-bold ${scoreColor}`}>
                      {score}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                {checks.map((check) => (
                  <div key={check.label} className="flex items-start gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] mt-0.5 shrink-0 ${
                        check.pass
                          ? "text-green-500"
                          : check.warning
                          ? "text-orange-500"
                          : "text-red-500"
                      }`}
                    >
                      {check.pass
                        ? "check_circle"
                        : check.warning
                        ? "warning"
                        : "cancel"}
                    </span>
                    <span className="font-body text-sm text-on-surface leading-snug">
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}