"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import CoverImageUploader from "@/components/admin/CoverImageUploader";
import LoadingState from "@/components/admin/LoadingState";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

const categoryOptions = [
  { value: "HEALTH_WELLNESS", label: "Health & Wellness" },
  { value: "CULINARY_ARTS", label: "Culinary Arts" },
  { value: "HOME_DECOR", label: "Home Decor" },
  { value: "SUSTAINABILITY", label: "Sustainability" },
  { value: "EXPORT_NEWS", label: "Export News" },
];

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  isPublished: boolean;
  metaTitle: string | null;
  metaDesc: string | null;
  viewCount: number;
}

export default function BlogEditPage() {
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/blog/${postId}`);
        if (!res.ok) throw new Error("Post not found");
        const { post: found } = await res.json();
        setPost(found);
        setTitle(found.title || "");
        setContent(found.content || "");
        setExcerpt(found.excerpt || "");
        setCoverImage(found.coverImage || "");
        setCategory(found.category || "");
        setMetaTitle(found.metaTitle || "");
        setMetaDescription(found.metaDesc || "");
        setIsPublished(found.isPublished || false);
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim() || !category) {
      setSaveMsg("Title, content, and category are required.");
      return;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          excerpt: excerpt || undefined,
          coverImage: coverImage || undefined,
          category,
          metaTitle: metaTitle || undefined,
          metaDesc: metaDescription || undefined,
          isPublished,
        }),
      });
      if (!res.ok) throw new Error("Failed to update post");
      setSaveMsg("Post updated successfully!");
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
        <LoadingState label="Loading post..." className="text-center" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <Link href="/admin/blog" className="font-label text-sm text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Blog Posts
        </Link>
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">{error || "Post not found"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl text-on-surface">Edit Post</h1>
        <Link href="/admin/blog" className="font-label text-sm text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Posts
        </Link>
      </div>

      {saveMsg && (
        <div className={`px-4 py-3 rounded-lg font-body text-sm ${
          saveMsg.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {saveMsg}
        </div>
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
                Drag & drop images into the editor
              </p>
            </div>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Write your blog post here..."
            />
          </div>

          {/* Excerpt */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
            <label className="font-label text-sm font-medium text-on-surface">Excerpt</label>
            <textarea
              rows={3}
              placeholder="Short summary..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full font-body text-sm text-on-surface outline-none bg-surface-container-low rounded-lg p-4 resize-y focus:ring-1 focus:ring-primary transition"
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
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary resize-y"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
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
              <p className="font-label text-xs text-on-surface-variant">
                Views: {post.viewCount}
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full mineral-glow text-on-primary font-label text-sm px-4 py-2.5 rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-5 space-y-3">
              <h4 className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Editor Tips</h4>
              <ul className="space-y-2 font-label text-xs text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">image</span>
                  Drag & drop images into editor
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">code</span>
                  Click HTML to edit source code
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">format_bold</span>
                  Use toolbar for formatting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
