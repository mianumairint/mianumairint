"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ── Types ───────────────────────────────────────────────── */

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  publishedAt: string;
  viewCount?: number;
}

interface BlogCategory {
  /** The stored enum value — what /api/blog filters on. */
  name: string;
  /** The readable form shown on the button. */
  label: string;
  count: number;
}

interface BlogApiResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

/* ── Animation ───────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

/* ── Skeleton Components ─────────────────────────────────── */

function ArticleSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-pulse">
      <div className="relative aspect-[4/5] bg-surface-container-low rounded-2xl" />
      <div className="space-y-4">
        <div className="h-3 w-32 bg-surface-container-low rounded" />
        <div className="h-7 w-full bg-surface-container-low rounded" />
        <div className="h-7 w-3/4 bg-surface-container-low rounded" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-surface-container-low rounded" />
          <div className="h-4 w-5/6 bg-surface-container-low rounded" />
        </div>
        <div className="h-4 w-24 bg-surface-container-low rounded" />
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-11 bg-surface-container-low rounded-xl" />
      <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
        <div className="h-5 w-28 bg-surface-container rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-surface-container rounded" />
            <div className="h-3 w-20 bg-surface-container rounded" />
          </div>
        ))}
      </div>
      <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
        <div className="h-5 w-24 bg-surface-container rounded" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-28 bg-surface-container rounded" />
            <div className="h-4 w-8 bg-surface-container rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [filterCategories, setFilterCategories] = useState<BlogCategory[]>([
    { name: "All", label: "All", count: 0 },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* ── Fetch posts ── */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "6" });
      if (activeCategory !== "All") params.set("category", activeCategory);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/blog?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load blog posts");
      const data: BlogApiResponse = await res.json();

      setPosts(data.posts ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, searchQuery]);

  /* ── Fetch categories + recent posts (once) ── */
  useEffect(() => {
    async function loadSidebar() {
      try {
        const [catRes, recentRes] = await Promise.all([
          fetch("/api/blog/categories"),
          fetch("/api/blog?limit=3&sort=publishedAt"),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          const cats: BlogCategory[] = Array.isArray(catData) ? catData : catData.categories ?? [];
          setCategories(cats);
          setFilterCategories([{ name: "All", label: "All", count: 0 }, ...cats]);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecentPosts(recentData.posts?.slice(0, 3) ?? []);
        }
      } catch {
        // sidebar data is non-critical
      }
    }
    loadSidebar();
  }, []);

  /* ── Re-fetch when filters change ── */
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  /* ── Reset page when category/search changes ── */
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  /* ── Format date helper ── */
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="bg-surface">
      {/* ── Header ── */}
      <div className="pt-20 pb-12 text-center px-4">
        <motion.p
          className="salt-chip inline-block mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          The Archives
        </motion.p>
        <motion.h1
          className="font-headline text-5xl lg:text-7xl text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Wellness Journal
        </motion.h1>
      </div>

      {/* ── Filter Chips ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {filterCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryChange(cat.name)}
              className={`rounded-full px-5 py-2 font-label text-sm transition-all ${
                activeCategory === cat.name
                  ? "mineral-glow text-on-primary"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ── Left: Articles ── */}
          <div className="lg:col-span-8 space-y-16">
            {loading ? (
              <>
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </>
            ) : error ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-error/40 mb-4 block">
                  error
                </span>
                <p className="font-body text-on-surface-variant mb-4">{error}</p>
                <button
                  onClick={fetchPosts}
                  className="font-label text-sm text-primary hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
                  article
                </span>
                <p className="font-body text-on-surface-variant">
                  No articles found{activeCategory !== "All" ? " in this category" : ""}{searchQuery ? " matching your search" : ""}.
                </p>
              </div>
            ) : (
              <>
                {posts.map((post, index) => {
                  const isOdd = index % 2 === 0;
                  return (
                    <motion.article
                      key={post.slug}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                        !isOdd ? "md:direction-rtl" : ""
                      }`}
                    >
                      {/* Image */}
                      <div className={`${!isOdd ? "md:order-2" : ""}`}>
                        <div className="relative aspect-[4/5] bg-surface-container-low rounded-2xl overflow-hidden group">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">
                                image
                              </span>
                            </div>
                          )}
                          {/* Category chip overlay */}
                          <div className="absolute top-4 left-4">
                            <span className="bg-surface/70 backdrop-blur-md text-on-surface font-label text-xs uppercase tracking-widest px-3 py-1.5 rounded-full">
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Text */}
                      <div className={`${!isOdd ? "md:order-1" : ""}`}>
                        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
                          {formatDate(post.publishedAt)}
                          {post.viewCount !== undefined && (
                            <> &middot; {post.viewCount} views</>
                          )}
                        </p>
                        <Link href={`/blog/${post.slug}`}>
                          <h2 className="font-headline text-2xl lg:text-3xl text-on-surface hover:text-primary transition-colors mb-4 cursor-pointer">
                            {post.title}
                          </h2>
                        </Link>
                        <p className="font-body text-on-surface-variant leading-relaxed mb-6">
                          {post.excerpt}
                        </p>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-label text-sm text-primary hover:text-primary-container transition-colors inline-flex items-center gap-1"
                        >
                          Read More
                          <span className="inline-block translate-x-0 group-hover:translate-x-1 transition-transform">
                            &rarr;
                          </span>
                        </Link>
                      </div>
                    </motion.article>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-full px-5 py-2 font-label text-sm bg-surface-container-low text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      &larr; Previous
                    </button>
                    <span className="font-label text-sm text-on-surface-variant">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-full px-5 py-2 font-label text-sm bg-surface-container-low text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start space-y-8">
            {loading && categories.length === 0 ? (
              <SidebarSkeleton />
            ) : (
              <>
                {/* Search */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full bg-surface-container-low rounded-xl pl-10 pr-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
                    />
                  </div>
                </motion.div>

                {/* Recent Posts */}
                <motion.div
                  className="bg-surface-container-low rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-headline text-lg text-on-surface mb-4">
                    Recent Posts
                  </h3>
                  <div className="space-y-4">
                    {recentPosts.length === 0 ? (
                      <p className="font-body text-sm text-on-surface-variant">No recent posts.</p>
                    ) : (
                      recentPosts.map((post) => (
                        <Link
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="block group"
                        >
                          <p className="font-body text-sm text-on-surface group-hover:text-primary transition-colors leading-snug">
                            {post.title}
                          </p>
                          <p className="font-label text-xs text-on-surface-variant mt-1">
                            {formatDate(post.publishedAt)}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Categories */}
                <motion.div
                  className="bg-surface-container-low rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="font-headline text-lg text-on-surface mb-4">
                    Categories
                  </h3>
                  <div className="space-y-3">
                    {categories.length === 0 ? (
                      <p className="font-body text-sm text-on-surface-variant">No categories.</p>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => handleCategoryChange(cat.name)}
                          className="flex items-center justify-between w-full text-left group"
                        >
                          <span className="font-body text-sm text-on-surface-variant group-hover:text-primary transition-colors">
                            {cat.label}
                          </span>
                          <span className="font-label text-xs text-on-surface-variant/60 bg-surface-container rounded-full px-2 py-0.5">
                            {cat.count}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Newsletter */}
                <motion.div
                  className="mineral-glow rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="font-headline text-lg text-on-primary mb-2">
                    Newsletter
                  </h3>
                  <p className="font-body text-sm text-on-primary/80 mb-4">
                    Get the latest articles and industry insights delivered to your
                    inbox.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-on-primary/10 backdrop-blur-sm rounded-lg px-4 py-2.5 font-body text-sm text-on-primary placeholder:text-on-primary/50 focus:outline-none focus:bg-on-primary/20 transition-colors"
                    />
                    <button className="bg-on-primary text-primary font-label text-sm px-4 py-2.5 rounded-lg hover:bg-on-primary/90 transition-colors shrink-0">
                      Subscribe
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
