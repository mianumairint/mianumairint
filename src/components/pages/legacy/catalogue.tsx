"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/* ── Types ───────────────────────────────────────────────── */

interface Category {
  name: string;
  slug: string;
  description: string;
}

/* ── Card Style Palette (cycled) ─────────────────────────── */

const cardStyles = [
  { colSpan: "col-span-12 md:col-span-8", aspect: "aspect-[3/2]", bg: "bg-primary-container", text: "text-white" },
  { colSpan: "col-span-12 md:col-span-4", aspect: "aspect-[4/5]", bg: "bg-secondary-container", text: "text-on-secondary-container" },
  { colSpan: "col-span-12 md:col-span-4", aspect: "aspect-[4/5]", bg: "bg-on-primary-fixed", text: "text-white" },
  { colSpan: "col-span-12 md:col-span-4", aspect: "aspect-[4/5]", bg: "bg-primary", text: "text-white" },
  { colSpan: "col-span-12 md:col-span-4", aspect: "aspect-[4/5]", bg: "bg-tertiary-container", text: "text-on-tertiary-container" },
  { colSpan: "col-span-12 md:col-span-4", aspect: "aspect-[4/5]", bg: "bg-surface-container", text: "text-on-surface" },
  { colSpan: "col-span-12 md:col-span-4", aspect: "aspect-[4/5]", bg: "bg-primary-container", text: "text-on-primary-container" },
  { colSpan: "col-span-12 md:col-span-4", aspect: "aspect-[4/5]", bg: "bg-secondary-container", text: "text-on-secondary-container" },
  { colSpan: "col-span-12", aspect: "aspect-[3/2] md:aspect-[6/1]", bg: "bg-tertiary-container", text: "text-on-tertiary-container" },
];

/* ── B2B Info Cards ───────────────────────────────────────── */

const b2bInfo = [
  {
    icon: "inventory_2",
    title: "Minimum Order Quantities",
    description:
      "MOQ varies by product. Edible salt starts at 1 tonne. Lamps and decor from 100 pieces. We accommodate trial orders for new buyers.",
  },
  {
    icon: "package_2",
    title: "Custom Packaging",
    description:
      "We offer private label, custom branding, and retail-ready packaging. Share your design or work with our team to create yours.",
  },
  {
    icon: "sailing",
    title: "Shipping Terms",
    description:
      "We ship FOB Karachi, CIF to your port, or EXW from our Faisalabad facility. Full container loads (FCL) and LCL options available.",
  },
];

/* ── Fade Variant ─────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

/* ── Skeleton ─────────────────────────────────────────────── */

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 animate-pulse">
      <div className="col-span-12 md:col-span-8 aspect-[3/2] bg-surface-container rounded-xl" />
      <div className="col-span-12 md:col-span-4 aspect-[4/5] bg-surface-container rounded-xl" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="col-span-12 md:col-span-4 aspect-[4/5] bg-surface-container rounded-xl" />
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function LegacyCataloguePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/categories")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        const cats = Array.isArray(data) ? data : data.categories ?? [];
        setCategories(
          cats.map((c: Record<string, unknown>) => ({
            name: (c.name as string) || "",
            slug: (c.slug as string) || "",
            description: (c.description as string) || "",
          }))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="bg-surface py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="salt-chip mb-6 inline-block">
            Full Product Range
          </span>
          <h1 className="font-headline text-5xl lg:text-7xl text-primary mb-4">
            Product Catalogue 2025
          </h1>
          <p className="font-body text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-8">
            Explore our complete range of Himalayan salt products — from edible
            grades and lamps to tiles, decor, and bulk industrial supply. Every
            product sourced directly from the Khewra Salt Mines.
          </p>
          <a
            href="/catalogue/salt-catalogue.pdf"
            download
            className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-8 py-4 rounded-full inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              download
            </span>
            Download PDF
          </a>
        </motion.div>
      </section>

      {/* ── Categories Bento Grid ───────────────────────── */}
      <section className="bg-surface-container-low py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
            {loading ? "Loading..." : `${categories.length} Product Categories`}
          </p>
          <h2 className="font-headline text-4xl text-center text-on-surface mb-12">
            Our Collection
          </h2>

          {loading ? (
            <CategoriesSkeleton />
          ) : error ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-error/40 mb-4 block">error</span>
              <p className="font-body text-on-surface-variant mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="font-label text-sm text-primary hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">category</span>
              <p className="font-body text-on-surface-variant">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4">
              {categories.map((cat, i) => {
                const style = cardStyles[i % cardStyles.length];
                return (
                  <motion.div
                    key={cat.slug}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    variants={fadeUp}
                    custom={i}
                    className={style.colSpan}
                  >
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="group block"
                    >
                      <div
                        className={`relative ${style.aspect} ${style.bg} rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-700`}
                      >
                        <div
                          className={`absolute inset-0 flex flex-col justify-end p-6 lg:p-8 ${style.text}`}
                        >
                          <h3 className="font-headline text-2xl lg:text-3xl mb-2">
                            {cat.name}
                          </h3>
                          <p className="font-body text-sm opacity-80 mb-3 max-w-md leading-relaxed">
                            {cat.description}
                          </p>
                          <span className="font-label text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-1">
                            View Products
                            <span className="material-symbols-outlined text-sm">
                              arrow_forward
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── B2B Info Section ─────────────────────────────── */}
      <section className="bg-surface py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
            For Wholesale Buyers
          </p>
          <h2 className="font-headline text-3xl lg:text-4xl text-center text-on-surface mb-12">
            B2B Ordering Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {b2bInfo.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="bg-surface-container-lowest rounded-xl tonal-shadow p-8"
              >
                <div className="mineral-glow w-12 h-12 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-white text-xl">
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-headline text-xl text-on-surface mb-3">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-20 px-6 text-center">
        <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">
          Need a Custom Quote?
        </h2>
        <p className="font-body text-on-surface-variant mb-8 max-w-lg mx-auto">
          Tell us what you need and our team will prepare a competitive offer
          within 24 hours.
        </p>
        <Link
          href="/quote"
          className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-10 py-4 rounded-full inline-block"
        >
          Request a Quote
        </Link>
      </section>
    </>
  );
}
