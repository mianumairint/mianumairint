"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizeSlug, validateSlug } from "@/lib/pages/slug";

interface PageRow {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  isSystem: boolean;
  seoTitle: string | null;
  updatedAt: string;
  _count?: { sections: number };
}

export default function AdminPagesList() {
  const router = useRouter();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/admin/pages");
      if (!res.ok) throw new Error("Could not load pages.");
      const data = await res.json();
      setPages(data.pages || []);
    } catch (err: any) {
      setLoadError(err.message || "Could not load pages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const previewSlug = slugEdited ? normalizeSlug(newSlug) : normalizeSlug(newTitle);
  const slugCheck = newTitle || newSlug ? validateSlug(previewSlug, false) : null;

  async function createPage() {
    setFormError("");
    if (!newTitle.trim()) {
      setFormError("Enter a page title.");
      return;
    }
    if (slugCheck && !slugCheck.ok) {
      setFormError(slugCheck.error || "Invalid URL.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), slug: previewSlug, status: "DRAFT" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the page.");
      router.push(`/admin/pages/${data.page.id}`);
    } catch (err: any) {
      setFormError(err.message || "Could not create the page.");
    } finally {
      setCreating(false);
    }
  }

  async function togglePublish(page: PageRow) {
    const next = page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setPages((prev) => prev.map((p) => (p.id === page.id ? { ...p, status: next } : p)));
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      load(); // revert to server truth
    }
  }

  async function deletePage(page: PageRow) {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not delete the page.");
      load();
    } catch (err: any) {
      alert(err.message || "Could not delete the page.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl text-on-surface">Pages</h1>
          <p className="font-label text-xs text-on-surface-variant mt-1">
            Edit the content of your site pages, or add new ones.
          </p>
        </div>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Page
        </button>
      </div>

      {showNew && (
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
          <h2 className="font-label text-sm font-medium text-on-surface">Create a new page</h2>

          {formError && (
            <div className="bg-red-50 text-red-700 px-4 py-2.5 rounded-lg font-body text-sm">
              {formError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Title</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Our Process"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">URL</label>
              <input
                value={slugEdited ? newSlug : previewSlug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setNewSlug(e.target.value);
                }}
                placeholder="/our-process"
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
              {slugCheck && (
                <p
                  className={`font-label text-xs mt-1 ${
                    slugCheck.ok ? "text-on-surface-variant" : "text-red-600"
                  }`}
                >
                  {slugCheck.ok
                    ? `Will be published at mianumairint.com${slugCheck.slug}`
                    : slugCheck.error}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={createPage}
              disabled={creating}
              className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create & Edit"}
            </button>
            <button
              onClick={() => {
                setShowNew(false);
                setFormError("");
              }}
              className="font-label text-sm text-on-surface-variant px-4 py-2.5"
            >
              Cancel
            </button>
            <p className="font-label text-xs text-on-surface-variant/70 ml-auto">
              New pages start as a draft — invisible to visitors until you publish.
            </p>
          </div>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-surface-container-low rounded-lg" />
            ))}
          </div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p className="font-body text-sm text-on-surface-variant mb-3">{loadError}</p>
            <button onClick={load} className="font-label text-sm text-primary hover:underline">
              Try again
            </button>
          </div>
        ) : pages.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">
              description
            </span>
            <p className="font-headline text-lg text-on-surface mb-1">No pages yet</p>
            <p className="font-body text-sm text-on-surface-variant">
              Run the page import to bring your existing pages in, or create a new page above.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-surface-container-low">
              <tr>
                {["Page", "URL", "Sections", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left font-label text-xs uppercase tracking-wider text-on-surface-variant px-6 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} className="border-t border-outline-variant/20">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-label text-sm text-on-surface hover:text-primary transition-colors"
                    >
                      {page.title}
                    </Link>
                    {page.isSystem && (
                      <span className="ml-2 font-label text-[10px] uppercase tracking-wider text-on-surface-variant/70 bg-surface-container px-2 py-0.5 rounded">
                        Built-in
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-on-surface-variant">
                    {page.slug}
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-on-surface-variant">
                    {page._count?.sections ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublish(page)}
                      title={
                        page.status === "PUBLISHED" ? "Click to unpublish" : "Click to publish"
                      }
                      className={`font-label text-xs px-2.5 py-1 rounded-md ${
                        page.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {page.status === "PUBLISHED" ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="font-label text-xs text-primary hover:underline mr-4"
                    >
                      Edit
                    </Link>
                    {page.status === "PUBLISHED" && (
                      <a
                        href={page.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-label text-xs text-on-surface-variant hover:underline mr-4"
                      >
                        View
                      </a>
                    )}
                    {!page.isSystem && (
                      <button
                        onClick={() => deletePage(page)}
                        className="font-label text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
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
