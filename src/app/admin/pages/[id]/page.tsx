"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SectionFields from "@/components/admin/pages/SectionFields";
import {
  SECTION_SCHEMAS,
  getSectionSchema,
  sectionLabel,
  type PageSectionType,
} from "@/types/page";
import { normalizeSlug, validateSlug } from "@/lib/pages/slug";

interface EditorSection {
  /** Server id, or `new-*` for a row that has not been saved yet. */
  id: string;
  type: PageSectionType;
  isVisible: boolean;
  data: Record<string, any>;
}

interface PageState {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string;
  seoDesc: string;
  isSystem: boolean;
}

let tmpCounter = 0;
const tmpId = () => `new-${Date.now()}-${tmpCounter++}`;

export default function AdminPageEditor() {
  const params = useParams<{ id: string }>();
  const pageId = params.id;

  const [page, setPage] = useState<PageState | null>(null);
  const [sections, setSections] = useState<EditorSection[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [msg, setMsg] = useState("");
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`);
      if (!res.ok) throw new Error("Could not load this page.");
      const { page: p } = await res.json();
      setPage({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        seoTitle: p.seoTitle || "",
        seoDesc: p.seoDesc || "",
        isSystem: p.isSystem,
      });
      setSections(
        (p.sections || []).map((s: any) => ({
          id: s.id,
          type: s.type,
          isVisible: s.isVisible,
          data: s.data || {},
        }))
      );
      setDirty(false);
    } catch (err: any) {
      setLoadError(err.message || "Could not load this page.");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    load();
  }, [load]);

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  }

  /* ── Settings (title, slug, status, SEO) ── */
  async function saveSettings(overrides: Partial<PageState> = {}) {
    if (!page) return;
    const next = { ...page, ...overrides };

    if (!next.isSystem) {
      const check = validateSlug(next.slug, false);
      if (!check.ok) {
        flash(check.error || "Invalid URL.");
        return;
      }
      next.slug = check.slug;
    }

    setSavingSettings(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: next.title,
          ...(next.isSystem ? {} : { slug: next.slug }),
          status: next.status,
          seoTitle: next.seoTitle,
          seoDesc: next.seoDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save.");
      setPage({ ...next, slug: data.page.slug, status: data.page.status });
      flash("Page settings saved.");
    } catch (err: any) {
      flash(err.message || "Could not save.");
    } finally {
      setSavingSettings(false);
    }
  }

  /* ── Content (sections) ── */
  async function saveContent() {
    setSavingContent(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s, i) => ({
            id: s.id.startsWith("new-") ? undefined : s.id,
            type: s.type,
            sortOrder: i,
            isVisible: s.isVisible,
            data: s.data,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save content.");
      setSections(
        (data.page?.sections || []).map((s: any) => ({
          id: s.id,
          type: s.type,
          isVisible: s.isVisible,
          data: s.data || {},
        }))
      );
      setDirty(false);
      flash("Content saved and published.");
    } catch (err: any) {
      flash(err.message || "Could not save content.");
    } finally {
      setSavingContent(false);
    }
  }

  /* ── Section operations ── */
  const touch = () => setDirty(true);

  function addSection(type: PageSectionType) {
    const id = tmpId();
    setSections((prev) => [...prev, { id, type, isVisible: true, data: {} }]);
    setOpenId(id);
    setShowPicker(false);
    touch();
  }

  function updateSection(id: string, data: Record<string, any>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, data } : s)));
    touch();
  }

  function removeSection(id: string) {
    const section = sections.find((s) => s.id === id);
    if (!confirm(`Remove the "${sectionLabel(section!.type)}" section?`)) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
    touch();
  }

  function toggleVisible(id: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
    touch();
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    touch();
  }

  function replaceType(id: string, type: PageSectionType) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, type, data: {} } : s)));
    touch();
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-56 bg-surface-container rounded" />
        <div className="h-40 bg-surface-container rounded-xl" />
        <div className="h-64 bg-surface-container rounded-xl" />
      </div>
    );
  }

  if (loadError || !page) {
    return (
      <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-10 text-center">
        <p className="font-body text-on-surface-variant mb-4">{loadError || "Page not found."}</p>
        <Link href="/admin/pages" className="font-label text-sm text-primary hover:underline">
          Back to Pages
        </Link>
      </div>
    );
  }

  const contentSchemas = SECTION_SCHEMAS.filter((s) => s.group === "content");
  const layoutSchemas = SECTION_SCHEMAS.filter((s) => s.group === "section");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/pages"
            className="font-label text-xs text-on-surface-variant hover:text-primary inline-flex items-center gap-1 mb-1"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Pages
          </Link>
          <h1 className="font-headline text-2xl text-on-surface">{page.title}</h1>
          <p className="font-label text-xs text-on-surface-variant mt-0.5">
            {page.slug}
            {page.isSystem && " · built-in page"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`font-label text-xs px-2.5 py-1 rounded-md ${
              page.status === "PUBLISHED"
                ? "bg-green-100 text-green-800"
                : "bg-surface-container text-on-surface-variant"
            }`}
          >
            {page.status === "PUBLISHED" ? "Published" : "Draft"}
          </span>
          <button
            onClick={() =>
              saveSettings({ status: page.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" })
            }
            disabled={savingSettings}
            className="font-label text-sm px-4 py-2.5 rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container disabled:opacity-60"
          >
            {page.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={saveContent}
            disabled={savingContent}
            className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {savingContent ? "Saving..." : dirty ? "Save Content •" : "Save Content"}
          </button>
        </div>
      </div>

      {msg && (
        <div className="bg-surface-container-low text-on-surface px-4 py-3 rounded-lg font-body text-sm">
          {msg}
        </div>
      )}

      {page.status === "DRAFT" && (
        <div className="bg-amber-50 text-amber-900 px-4 py-3 rounded-lg font-body text-sm">
          This page is a draft — visitors get a 404 at {page.slug} until you publish it.
        </div>
      )}

      {/* Page settings */}
      <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
        <h2 className="font-label text-sm font-medium text-on-surface">Page settings</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">Title</label>
            <input
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">URL</label>
            <input
              value={page.slug}
              disabled={page.isSystem}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              onBlur={(e) => setPage({ ...page, slug: normalizeSlug(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary disabled:opacity-60"
            />
            {page.isSystem && (
              <p className="font-label text-xs text-on-surface-variant/70 mt-1">
                Built-in pages keep their URL.
              </p>
            )}
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">
              SEO title
            </label>
            <input
              value={page.seoTitle}
              onChange={(e) => setPage({ ...page, seoTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-xs text-on-surface-variant block mb-1">
              SEO description
            </label>
            <textarea
              rows={2}
              value={page.seoDesc}
              onChange={(e) => setPage({ ...page, seoDesc: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary resize-y"
            />
          </div>
        </div>

        <button
          onClick={() => saveSettings()}
          disabled={savingSettings}
          className="font-label text-sm px-5 py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-60"
        >
          {savingSettings ? "Saving..." : "Save settings"}
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-label text-sm font-medium text-on-surface">
            Content sections ({sections.length})
          </h2>
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="font-label text-sm text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add section
          </button>
        </div>

        {showPicker && (
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-5 space-y-4">
            {[
              { title: "Content blocks", list: contentSchemas },
              { title: "Sections", list: layoutSchemas },
            ].map((group) => (
              <div key={group.title}>
                <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-2">
                  {group.title}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {group.list.map((schema) => (
                    <button
                      key={schema.type}
                      onClick={() => addSection(schema.type)}
                      className="text-left p-3 rounded-lg border border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-low transition"
                    >
                      <p className="font-label text-sm text-on-surface">{schema.label}</p>
                      <p className="font-body text-xs text-on-surface-variant mt-0.5">
                        {schema.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {sections.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-10 text-center">
            <p className="font-body text-sm text-on-surface-variant">
              No sections yet. Use “Add section” to start building this page.
            </p>
          </div>
        ) : (
          sections.map((section, index) => {
            const schema = getSectionSchema(section.type);
            const isOpen = openId === section.id;

            return (
              <div
                key={section.id}
                className={`bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden ${
                  section.isVisible ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 px-5 py-4">
                  <span className="font-label text-xs text-on-surface-variant/60 w-6">
                    {index + 1}
                  </span>

                  <button
                    onClick={() => setOpenId(isOpen ? null : section.id)}
                    className="flex-1 text-left"
                  >
                    <p className="font-label text-sm text-on-surface">
                      {schema?.label || section.type}
                      {!section.isVisible && (
                        <span className="ml-2 font-label text-[10px] uppercase tracking-wider text-on-surface-variant/70">
                          hidden
                        </span>
                      )}
                      {schema?.dynamic && (
                        <span className="ml-2 font-label text-[10px] uppercase tracking-wider text-blue-600">
                          live data
                        </span>
                      )}
                    </p>
                    <p className="font-body text-xs text-on-surface-variant truncate">
                      {section.data?.heading ||
                        section.data?.eyebrow ||
                        schema?.description ||
                        ""}
                    </p>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <IconBtn icon="arrow_upward" title="Move up" onClick={() => move(index, -1)} />
                    <IconBtn
                      icon="arrow_downward"
                      title="Move down"
                      onClick={() => move(index, 1)}
                    />
                    <IconBtn
                      icon={section.isVisible ? "visibility" : "visibility_off"}
                      title={section.isVisible ? "Hide from page" : "Show on page"}
                      onClick={() => toggleVisible(section.id)}
                    />
                    <IconBtn
                      icon="delete"
                      title="Remove section"
                      onClick={() => removeSection(section.id)}
                      danger
                    />
                    <IconBtn
                      icon={isOpen ? "expand_less" : "expand_more"}
                      title={isOpen ? "Collapse" : "Edit"}
                      onClick={() => setOpenId(isOpen ? null : section.id)}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-outline-variant/20 px-5 py-5 space-y-5">
                    <div>
                      <label className="font-label text-xs text-on-surface-variant block mb-1.5">
                        Section type — changing this clears the fields below
                      </label>
                      <select
                        value={section.type}
                        onChange={(e) =>
                          replaceType(section.id, e.target.value as PageSectionType)
                        }
                        className="px-3 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
                      >
                        {SECTION_SCHEMAS.map((s) => (
                          <option key={s.type} value={s.type}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {schema?.dynamic && (
                      <p className="bg-blue-50 text-blue-800 px-4 py-2.5 rounded-lg font-body text-xs">
                        This section pulls its content live from the database — there is nothing to
                        type in here.
                      </p>
                    )}

                    {schema && (
                      <SectionFields
                        fields={schema.fields}
                        data={section.data || {}}
                        onChange={(data) => updateSection(section.id, data)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {sections.length > 0 && (
          <div className="flex items-center justify-end gap-3 pt-2">
            {dirty && (
              <p className="font-label text-xs text-amber-700">You have unsaved changes.</p>
            )}
            <button
              onClick={saveContent}
              disabled={savingContent}
              className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg disabled:opacity-60"
            >
              {savingContent ? "Saving..." : "Save Content"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg hover:bg-surface-container transition-colors ${
        danger ? "text-red-600" : "text-on-surface-variant"
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </button>
  );
}
