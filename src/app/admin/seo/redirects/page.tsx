"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  type: string;
  isActive: boolean;
  hitCount: number;
  createdAt: string;
}

export default function SeoRedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [redirectType, setRedirectType] = useState("PERMANENT");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRedirects();
  }, []);

  async function fetchRedirects() {
    try {
      const res = await fetch("/api/admin/seo/redirects");
      if (res.ok) {
        const data = await res.json();
        setRedirects(data.redirects || []);
      }
    } catch (error) {
      console.error("Failed to fetch redirects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!fromPath.trim() || !toPath.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/seo/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromPath: fromPath.trim(), toPath: toPath.trim(), type: redirectType }),
      });
      if (res.ok) {
        setFromPath("");
        setToPath("");
        setRedirectType("PERMANENT");
        fetchRedirects();
      }
    } catch (error) {
      console.error("Failed to create redirect:", error);
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(redirect: Redirect) {
    try {
      await fetch("/api/admin/seo/redirects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: redirect.id, isActive: !redirect.isActive }),
      });
      fetchRedirects();
    } catch (error) {
      console.error("Failed to toggle redirect:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this redirect?")) return;
    try {
      await fetch(`/api/admin/seo/redirects?id=${id}`, { method: "DELETE" });
      fetchRedirects();
    } catch (error) {
      console.error("Failed to delete redirect:", error);
    }
  }

  const totalHits = redirects.reduce((sum, r) => sum + r.hitCount, 0);

  const inputClass =
    "w-full px-4 py-2.5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 transition";

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
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin/seo" className="text-on-surface-variant hover:text-on-surface transition">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="font-headline text-2xl font-bold text-on-surface">Redirects Manager</h1>
        </div>
        <p className="font-body text-sm text-on-surface-variant">
          Manage URL redirects to preserve SEO value and fix broken links
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl p-4 tonal-shadow">
          <p className="font-label text-xs text-on-surface-variant">Total Redirects</p>
          <p className="font-headline text-2xl font-bold text-on-surface mt-1">{redirects.length}</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-4 tonal-shadow">
          <p className="font-label text-xs text-on-surface-variant">Total Hits</p>
          <p className="font-headline text-2xl font-bold text-on-surface mt-1">{totalHits.toLocaleString()}</p>
        </div>
      </div>

      {/* Add Redirect Form */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 tonal-shadow">
        <h2 className="font-headline text-base font-semibold text-on-surface mb-4">Add New Redirect</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="font-label text-xs font-medium text-on-surface-variant block mb-1">From Path</label>
            <input
              type="text"
              value={fromPath}
              onChange={(e) => setFromPath(e.target.value)}
              placeholder="/old-page"
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-label text-xs font-medium text-on-surface-variant block mb-1">To Path</label>
            <input
              type="text"
              value={toPath}
              onChange={(e) => setToPath(e.target.value)}
              placeholder="/new-page"
              className={inputClass}
            />
          </div>
          <div>
            <label className="font-label text-xs font-medium text-on-surface-variant block mb-1">Type</label>
            <select
              value={redirectType}
              onChange={(e) => setRedirectType(e.target.value)}
              className={inputClass}
            >
              <option value="PERMANENT">301 Permanent</option>
              <option value="TEMPORARY">302 Temporary</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreate}
              disabled={creating || !fromPath.trim() || !toPath.trim()}
              className="mineral-glow w-full px-4 py-2.5 rounded-xl font-label text-sm font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {creating ? "Adding..." : "Add Redirect"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl tonal-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  From Path
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  To Path
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Type
                </th>
                <th className="text-center px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Hits
                </th>
                <th className="text-center px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Active
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Created
                </th>
                <th className="text-right px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {redirects.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container/30 transition">
                  <td className="px-5 py-3">
                    <code className="font-mono text-xs text-on-surface bg-surface-container px-2 py-0.5 rounded">
                      {r.fromPath}
                    </code>
                  </td>
                  <td className="px-5 py-3">
                    <code className="font-mono text-xs text-on-surface bg-surface-container px-2 py-0.5 rounded">
                      {r.toPath}
                    </code>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md font-label text-xs font-medium ${
                        r.type === "PERMANENT"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-amber-500/10 text-amber-700"
                      }`}
                    >
                      {r.type === "PERMANENT" ? "301" : "302"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="font-label text-sm text-on-surface">{r.hitCount}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleActive(r)}
                      className={`relative w-10 h-6 rounded-full transition ${
                        r.isActive ? "bg-primary" : "bg-outline-variant/30"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          r.isActive ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-label text-xs text-on-surface-variant">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {redirects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">redo</span>
                    <p className="font-body text-sm text-on-surface-variant mt-2">No redirects yet</p>
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
