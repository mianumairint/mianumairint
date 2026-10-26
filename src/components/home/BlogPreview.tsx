"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEnumLabel as formatCategory } from "@/lib/format";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  publishedAt: string | null;
}

function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className={i === 1 ? "md:mt-8" : ""}>
          <div className="rounded-xl overflow-hidden bg-surface-container-lowest tonal-shadow">
            <div className="aspect-[4/5] bg-surface-container animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-surface-container rounded animate-pulse w-3/4" />
              <div className="h-4 bg-surface-container rounded animate-pulse" />
              <div className="h-4 bg-surface-container rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogPreview() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog?limit=3")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts || []);
      })
      .catch(() => {
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Heading */}
      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
        Latest Articles
      </p>
      <h2 className="font-headline text-4xl text-center text-on-surface mb-12">
        Wellness Journal
      </h2>

      {/* Loading State */}
      {loading && <BlogSkeleton />}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <p className="text-center text-on-surface-variant font-body">
          No articles available yet. Check back soon!
        </p>
      )}

      {/* Articles Grid */}
      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <div key={post.slug} className={i === 1 ? "md:mt-8" : ""}>
              <Link
                href={`/blog/${post.slug}`}
                className="block rounded-xl overflow-hidden bg-surface-container-lowest tonal-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-primary/20 to-tertiary/20">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl text-primary/30">article</span>
                    </div>
                  )}
                  <span className="salt-chip absolute top-4 left-4">
                    {formatCategory(post.category)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-headline text-xl text-on-surface group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="font-body text-sm text-on-surface-variant line-clamp-2 mb-4">
                    {post.excerpt || ""}
                  </p>
                  <span className="font-label text-sm text-primary">
                    Read More &rarr;
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
