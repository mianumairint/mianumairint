"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

/**
 * The categories as an auto-advancing rail rather than a wall of tiles.
 *
 * Fourteen squares stacked four to a row filled most of a screen on their own
 * and pushed everything after them a long way down. Four at a time, moving on
 * by themselves, show the same range in one row.
 *
 * Every tile is the same square: an earlier version sized each one to its own
 * photograph, which showed each picture whole but left the row ragged, because
 * the photographs are all different shapes.
 */
const TILE = "aspect-square rounded-xl overflow-hidden bg-surface-container-low";

const STEP_MS = 3500;

/** How many tiles are on screen at each width. */
function visibleAt(width: number): number {
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 2;
}

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={`${TILE} animate-pulse`} />
      ))}
    </div>
  );
}

export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(4);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  // The rail moves by a fraction of its own width, so how many tiles fit has
  // to be known here as well as in the CSS.
  useEffect(() => {
    const measure = () => setVisible(visibleAt(window.innerWidth));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const count = categories.length;
  const lastIndex = Math.max(0, count - visible);

  // Clamped after a resize, so widening the window cannot leave the rail
  // scrolled past its end with empty space on the right.
  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(0, count - visible)));
  }, [visible, count]);

  const go = useCallback(
    (next: number) => setIndex(next > lastIndex ? 0 : Math.max(0, next)),
    [lastIndex]
  );

  const lastIndexRef = useRef(lastIndex);
  lastIndexRef.current = lastIndex;

  useEffect(() => {
    if (paused || count <= visible) return;
    const timer = setInterval(
      () => setIndex((current) => (current >= lastIndexRef.current ? 0 : current + 1)),
      STEP_MS
    );
    return () => clearInterval(timer);
  }, [paused, count, visible]);

  const canSlide = count > visible;

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
        {loading ? "Product Categories" : `${count} Product Categories`}
      </p>
      <h2 className="font-headline text-4xl text-center text-on-surface mb-12">
        Our Product Categories
      </h2>

      {loading && <CategoriesSkeleton />}

      {!loading && count === 0 && (
        <p className="text-center text-on-surface-variant font-body">
          No categories available yet. Check back soon!
        </p>
      )}

      {!loading && count > 0 && (
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${index * (100 / visible)}%)` }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.slug}
                  className="shrink-0 px-2 md:px-2.5"
                  style={{ width: `${100 / visible}%` }}
                >
                  <Link href={`/products?category=${cat.slug}`} className="group block">
                    <div className={`relative ${TILE}`}>
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-700 to-amber-900" />
                      )}

                      {/* Only the strip under the label is darkened, so the
                          picture above it keeps its own colour. */}
                      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <h3 className="font-headline text-lg md:text-xl leading-tight drop-shadow">
                          {cat.name}
                        </h3>
                        <span className="font-label text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          View Products &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {canSlide && (
            <>
              <button
                onClick={() => go(index - 1)}
                aria-label="Previous categories"
                className="absolute -left-3 lg:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest tonal-shadow text-on-surface flex items-center justify-center hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                onClick={() => go(index + 1)}
                aria-label="Next categories"
                className="absolute -right-3 lg:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest tonal-shadow text-on-surface flex items-center justify-center hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>

              <div className="flex items-center justify-center gap-2 mt-8">
                {Array.from({ length: lastIndex + 1 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Show categories from ${i + 1}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index
                        ? "w-8 bg-primary"
                        : "w-1.5 bg-on-surface-variant/30 hover:bg-on-surface-variant/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
