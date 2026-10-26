"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import CoverImageUploader from "@/components/admin/CoverImageUploader";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

const categoryOptions = [
  { value: "HEALTH_WELLNESS", label: "Health & Wellness" },
  { value: "CULINARY_ARTS", label: "Culinary Arts" },
  { value: "HOME_DECOR", label: "Home Decor" },
  { value: "SUSTAINABILITY", label: "Sustainability" },
  { value: "EXPORT_NEWS", label: "Export News" },
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BlogEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !category) {
      setError("Title, content, and category are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slugify(title),
          content,
          excerpt: excerpt || undefined,
          coverImage: coverImage || undefined,
          category,
          metaTitle: metaTitle || undefined,
          metaDesc: metaDescription || undefined,
          isPublished,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create post");
      }
      router.push("/admin/blog");
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl text-on-surface">New Blog Post</h1>
        <Link href="/admin/blog" className="font-label text-sm text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Posts
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">{error}</div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Title */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full font-headline text-3xl text-on-surface placeholder:text-on-surface-variant/40 outline-none bg-transparent border-b border-outline-variant/30 pb-2 focus:border-primary transition"
            />
            {title && (
              <p className="font-label text-xs text-on-surface-variant mt-2">
                Slug: <span className="text-primary">/blog/{slugify(title)}</span>
              </p>
            )}
          </div>

          {/* Cover Image — Drag & Drop */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
            <CoverImageUploader imageUrl={coverImage} onChange={setCoverImage} />
          </div>

          {/* Category */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
            <label className="font-label text-sm font-medium text-on-surface">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
            >
              <option value="">Select category</option>
              {categoryOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Content — Tiptap Rich Text + HTML Source */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-label text-sm font-medium text-on-surface">Content</label>
              <p className="font-label text-xs text-on-surface-variant">
                Drag & drop images directly into the editor
              </p>
            </div>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your blog post here... You can also drag & drop images directly."
            />
          </div>

          {/* Excerpt */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
            <label className="font-label text-sm font-medium text-on-surface">Excerpt</label>
            <textarea
              rows={3}
              placeholder="Short summary for listings and social sharing..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none bg-surface-container-low rounded-lg p-4 resize-y focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* SEO */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
            <h3 className="font-label text-sm font-medium text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">search</span>
              SEO Settings
            </h3>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || "Meta title..."}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
              <p className="font-label text-xs text-on-surface-variant/60 mt-1">{metaTitle.length}/60 characters</p>
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={excerpt || "Meta description..."}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary resize-y"
              />
              <p className="font-label text-xs text-on-surface-variant/60 mt-1">{metaDescription.length}/160 characters</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Publish */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
              <h3 className="font-label text-sm font-medium text-on-surface">Publish</h3>
              <div className="flex items-center justify-between">
                <span className="font-label text-sm text-on-surface-variant">
                  {isPublished ? "Published" : "Draft"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={`relative w-11 h-6 rounded-full transition ${isPublished ? "bg-primary" : "bg-outline-variant"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPublished ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="w-full mineral-glow text-on-primary font-label text-sm px-4 py-2.5 rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : isPublished ? "Publish" : "Save Draft"}
              </button>
            </div>

            {/* Tips */}
            <div className="bg-surface-container-low rounded-xl p-5 space-y-3">
              <h4 className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Editor Tips</h4>
              <ul className="space-y-2 font-label text-xs text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">image</span>
                  Drag & drop images into editor
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">code</span>
                  Click HTML button to edit source code
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">format_bold</span>
                  Use toolbar for formatting
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">link</span>
                  Select text then click link icon
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
