"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface SeoKeyword {
  id: string;
  keyword: string;
  targetUrl: string;
  targetPage: string;
  currentRank: number | null;
  previousRank: number | null;
  searchVolume: number | null;
  notes: string | null;
  updatedAt: string;
}

export default function KeywordTrackerPage() {
  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [kw, setKw] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [targetPage, setTargetPage] = useState("");
  const [searchVolume, setSearchVolume] = useState("");
  const [currentRank, setCurrentRank] = useState("");

  // Inline edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    keyword: "",
    targetUrl: "",
    targetPage: "",
    searchVolume: "",
    currentRank: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    fetchKeywords();
  }, []);

  async function fetchKeywords() {
    try {
      const res = await fetch("/api/admin/seo/keywords");
      if (res.ok) {
        const data = await res.json();
        setKeywords(data.keywords || []);
      }
    } catch (err) {
      console.error("Failed to fetch keywords:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!kw.trim() || !targetUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: kw.trim(),
          targetUrl: targetUrl.trim(),
          targetPage: targetPage.trim() || targetUrl.trim(),
          searchVolume: searchVolume ? parseInt(searchVolume) : null,
          currentRank: currentRank ? parseInt(currentRank) : null,
        }),
      });
      if (res.ok) {
        setKw("");
        setTargetUrl("");
        setTargetPage("");
        setSearchVolume("");
        setCurrentRank("");
        fetchKeywords();
      }
    } catch (err) {
      console.error("Failed to add keyword:", err);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item: SeoKeyword) {
    setEditId(item.id);
    setEditForm({
      keyword: item.keyword,
      targetUrl: item.targetUrl,
      targetPage: item.targetPage,
      searchVolume: item.searchVolume?.toString() || "",
      currentRank: item.currentRank?.toString() || "",
    });
  }

  function cancelEdit() {
    setEditId(null);
  }

  async function saveEdit(id: string) {
    setEditSaving(true);
    try {
      const res = await fetch("/api/admin/seo/keywords", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          keyword: editForm.keyword.trim(),
          targetUrl: editForm.targetUrl.trim(),
          targetPage: editForm.targetPage.trim() || editForm.targetUrl.trim(),
          searchVolume: editForm.searchVolume ? parseInt(editForm.searchVolume) : null,
          currentRank: editForm.currentRank ? parseInt(editForm.currentRank) : null,
        }),
      });
      if (res.ok) {
        setEditId(null);
        fetchKeywords();
      }
    } catch (err) {
      console.error("Failed to update keyword:", err);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this keyword?")) return;
    try {
      const res = await fetch(`/api/admin/seo/keywords?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setKeywords((prev) => prev.filter((k) => k.id !== id));
        if (editId === id) setEditId(null);
      }
    } catch (err) {
      console.error("Failed to delete keyword:", err);
    }
  }

  function rankChange(current: number | null, previous: number | null) {
    if (current === null || previous === null)
      return <span className="text-on-surface-variant">&mdash;</span>;
    if (current < previous)
      return (
        <span className="text-green-500 font-bold flex items-center justify-center gap-0.5">
          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
          {previous - current}
        </span>
      );
    if (current > previous)
      return (
        <span className="text-red-500 font-bold flex items-center justify-center gap-0.5">
          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
          {current - previous}
        </span>
      );
    return (
      <span className="text-on-surface-variant flex items-center justify-center">&mdash;</span>
    );
  }

  const sorted = [...keywords].sort((a, b) => {
    if (a.currentRank === null && b.currentRank === null) return 0;
    if (a.currentRank === null) return 1;
    if (b.currentRank === null) return -1;
    return a.currentRank - b.currentRank;
  });

  // Stats calculations
  const stats = useMemo(() => {
    const rankedKeywords = keywords.filter((k) => k.currentRank !== null);
    const totalTracked = keywords.length;
    const avgRank =
      rankedKeywords.length > 0
        ? Math.round(
            rankedKeywords.reduce((sum, k) => sum + (k.currentRank ?? 0), 0) /
              rankedKeywords.length
          )
        : 0;
    const inTopTen = rankedKeywords.filter(
      (k) => k.currentRank !== null && k.currentRank <= 10
    ).length;
    return { totalTracked, avgRank, inTopTen };
  }, [keywords]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/admin/seo"
            className="text-on-surface-variant hover:text-on-surface transition"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Keyword Tracker
          </h1>
        </div>
        <p className="font-body text-sm text-on-surface-variant">
          Track and monitor keyword rankings across your site
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-primary">key</span>
          </div>
          <p className="font-headline text-2xl text-on-surface">{stats.totalTracked}</p>
          <p className="font-label text-xs text-on-surface-variant">Total Keywords Tracked</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-orange-500">trending_up</span>
          </div>
          <p className="font-headline text-2xl text-on-surface">
            {stats.avgRank > 0 ? `#${stats.avgRank}` : "--"}
          </p>
          <p className="font-label text-xs text-on-surface-variant">Average Rank</p>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-green-500">emoji_events</span>
          </div>
          <p className="font-headline text-2xl text-on-surface">{stats.inTopTen}</p>
          <p className="font-label text-xs text-on-surface-variant">Keywords in Top 10</p>
        </div>
      </div>

      {/* Add Keyword Form */}
      <form
        onSubmit={handleAdd}
        className="bg-surface-container-lowest rounded-2xl tonal-shadow p-6"
      >
        <h2 className="font-headline text-lg text-on-surface mb-4">Add Keyword</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="font-label text-xs text-on-surface-variant mb-1 block">
              Keyword *
            </label>
            <input
              type="text"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="himalayan pink salt"
              required
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant mb-1 block">
              Target URL *
            </label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="/products"
              required
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant mb-1 block">
              Target Page
            </label>
            <input
              type="text"
              value={targetPage}
              onChange={(e) => setTargetPage(e.target.value)}
              placeholder="Products page"
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant mb-1 block">
              Search Volume
            </label>
            <input
              type="number"
              value={searchVolume}
              onChange={(e) => setSearchVolume(e.target.value)}
              placeholder="1000"
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant mb-1 block">
              Current Rank
            </label>
            <input
              type="number"
              value={currentRank}
              onChange={(e) => setCurrentRank(e.target.value)}
              placeholder="15"
              className="w-full bg-surface-container rounded-xl px-4 py-2.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/40"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-8 py-3 rounded-full mt-4 disabled:opacity-60 transition-all"
        >
          {saving ? "Adding..." : "Add Keyword"}
        </button>
      </form>

      {/* Keywords Table */}
      <div className="bg-surface-container-lowest rounded-2xl tonal-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Keyword
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Target Page
                </th>
                <th className="text-center px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Rank
                </th>
                <th className="text-center px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Change
                </th>
                <th className="text-center px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Volume
                </th>
                <th className="text-left px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Updated
                </th>
                <th className="text-right px-5 py-3 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {sorted.map((item) =>
                editId === item.id ? (
                  <tr key={item.id} className="bg-primary/5">
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={editForm.keyword}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, keyword: e.target.value }))
                        }
                        className="w-full bg-surface-container rounded-lg px-3 py-1.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        value={editForm.targetPage}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, targetPage: e.target.value }))
                        }
                        placeholder="Page name"
                        className="w-full bg-surface-container rounded-lg px-3 py-1.5 font-body text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 mb-1"
                      />
                      <input
                        type="text"
                        value={editForm.targetUrl}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, targetUrl: e.target.value }))
                        }
                        placeholder="URL"
                        className="w-full bg-surface-container rounded-lg px-3 py-1.5 font-label text-xs text-primary outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="number"
                        value={editForm.currentRank}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, currentRank: e.target.value }))
                        }
                        placeholder="#"
                        className="w-16 bg-surface-container rounded-lg px-2 py-1.5 font-body text-sm text-on-surface text-center outline-none focus:ring-2 focus:ring-primary/30 mx-auto"
                      />
                    </td>
                    <td className="px-5 py-3 text-center font-label text-sm text-on-surface-variant">
                      &mdash;
                    </td>
                    <td className="px-5 py-3 text-center">
                      <input
                        type="number"
                        value={editForm.searchVolume}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, searchVolume: e.target.value }))
                        }
                        placeholder="Vol"
                        className="w-20 bg-surface-container rounded-lg px-2 py-1.5 font-body text-sm text-on-surface text-center outline-none focus:ring-2 focus:ring-primary/30 mx-auto"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-label text-xs text-on-surface-variant">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => saveEdit(item.id)}
                          disabled={editSaving}
                          className="text-green-500 hover:text-green-600 transition p-1 disabled:opacity-50"
                          title="Save"
                        >
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-on-surface-variant hover:text-on-surface transition p-1"
                          title="Cancel"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="hover:bg-surface-container/30 transition">
                    <td className="px-5 py-3">
                      <p className="font-body text-sm text-on-surface font-medium">
                        {item.keyword}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-label text-xs text-on-surface-variant">
                        {item.targetPage}
                      </p>
                      <p className="font-label text-xs text-primary">{item.targetUrl}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="font-headline text-lg text-on-surface">
                        {item.currentRank ?? "--"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center font-label text-sm">
                      {rankChange(item.currentRank, item.previousRank)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="font-label text-sm text-on-surface-variant">
                        {item.searchVolume?.toLocaleString() ?? "--"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-label text-xs text-on-surface-variant">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-on-surface-variant hover:text-primary transition p-1"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-on-surface-variant hover:text-red-500 transition p-1"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                      key
                    </span>
                    <p className="font-body text-sm text-on-surface-variant mt-2">
                      No keywords tracked yet. Add your first keyword above.
                    </p>
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
