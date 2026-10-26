"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import LoadingState from "@/components/admin/LoadingState";

const categoryLabels: Record<string, string> = {
  HEALTH_WELLNESS: "Health & Wellness",
  CULINARY_ARTS: "Culinary Arts",
  HOME_DECOR: "Home Decor",
  SUSTAINABILITY: "Sustainability",
  EXPORT_NEWS: "Export News",
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  isPublished: boolean;
  publishedAt: string | null;
  coverImage: string | null;
  viewCount: number;
  createdAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog?limit=50");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-headline text-2xl text-on-surface">Blog Posts</h1>
          <span className="font-label text-sm text-on-surface-variant">{total} total</span>
        </div>
        <Link
          href="/admin/blog/new"
          className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Post
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">
          {error}
          <button onClick={fetchPosts} className="ml-3 underline">Retry</button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <LoadingState label="Loading posts..." />
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">edit_note</span>
            <p className="font-label text-sm text-on-surface-variant">No blog posts yet</p>
            <Link href="/admin/blog/new" className="mt-3 inline-block font-label text-sm text-primary hover:underline">
              Create your first post
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["Cover", "Title", "Category", "Status", "Date", "Views", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition">
                  <td className="px-6 py-3">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt="" className="w-12 h-8 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-8 bg-surface-container-low rounded flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 font-label text-sm font-medium text-on-surface max-w-[250px]">{post.title}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                    {categoryLabels[post.category] || post.category}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-label text-xs ${
                      post.isPublished ? "bg-green-100 text-green-800" : "bg-surface-container text-on-surface-variant"
                    }`}>
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                    {formatDate(post.publishedAt || post.createdAt)}
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{post.viewCount}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/${post.id}`} className="p-1.5 rounded-lg hover:bg-surface-container transition">
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        <span className="material-symbols-outlined text-red-500 text-[20px]">delete</span>
                      </button>
                    </div>
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
