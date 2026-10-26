"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RobotsTxt {
  id: string;
  content: string;
  updatedAt: string;
}

const TEMPLATES = {
  default: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Sitemap: https://mianumairint.com/sitemap.xml`,
  blockAll: `User-agent: *
Disallow: /`,
  allowAll: `User-agent: *
Allow: /

Sitemap: https://mianumairint.com/sitemap.xml`,
};

export default function SeoRobotsPage() {
  const [robots, setRobots] = useState<RobotsTxt | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRobots();
  }, []);

  async function fetchRobots() {
    try {
      const res = await fetch("/api/admin/seo/robots");
      if (res.ok) {
        const data = await res.json();
        setRobots(data.robots);
        setContent(data.robots?.content || "");
      }
    } catch (error) {
      console.error("Failed to fetch robots.txt:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!robots) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/seo/robots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: robots.id, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setRobots(data.robots);
        setMessage("Robots.txt saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save robots.txt");
      }
    } catch {
      setMessage("Failed to save robots.txt");
    } finally {
      setSaving(false);
    }
  }

  function applyTemplate(key: keyof typeof TEMPLATES) {
    setContent(TEMPLATES[key]);
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
            <h1 className="font-headline text-2xl font-bold text-on-surface">Robots.txt Editor</h1>
          </div>
          <p className="font-body text-sm text-on-surface-variant">
            Control how search engines crawl your site
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mineral-glow px-5 py-2.5 rounded-xl font-label text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
        <div>
          <p className="font-label text-sm font-medium text-amber-700">Caution</p>
          <p className="font-body text-xs text-amber-700/80 mt-0.5">
            Changes to robots.txt affect how search engines crawl your site. Incorrect settings can prevent your pages from being indexed.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-xl p-4 font-body text-sm ${
            message.includes("success") ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Quick Templates */}
      <div className="flex flex-wrap gap-2">
        <span className="font-label text-sm text-on-surface-variant self-center mr-2">Quick Templates:</span>
        <button
          onClick={() => applyTemplate("default")}
          className="px-4 py-2 rounded-xl font-label text-xs font-medium bg-surface-container-lowest tonal-shadow hover:bg-surface-container transition text-on-surface"
        >
          Default
        </button>
        <button
          onClick={() => applyTemplate("blockAll")}
          className="px-4 py-2 rounded-xl font-label text-xs font-medium bg-red-500/10 hover:bg-red-500/20 transition text-red-600"
        >
          Block All Crawlers
        </button>
        <button
          onClick={() => applyTemplate("allowAll")}
          className="px-4 py-2 rounded-xl font-label text-xs font-medium bg-green-500/10 hover:bg-green-500/20 transition text-green-600"
        >
          Allow All
        </button>
      </div>

      {/* Editor */}
      <div className="bg-surface-container-lowest rounded-2xl tonal-shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-outline-variant/20 flex items-center justify-between">
          <span className="font-label text-sm text-on-surface-variant">robots.txt</span>
          {robots?.updatedAt && (
            <span className="font-label text-xs text-on-surface-variant">
              Last updated: {new Date(robots.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[300px] p-5 bg-transparent font-mono text-sm text-on-surface resize-y outline-none leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
