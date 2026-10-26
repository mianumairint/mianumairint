"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Basic content blocks (heading, rich text, image) plus the shared
 * page-header and CTA bands. Markup matches the original hardcoded pages.
 */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

type Data = Record<string, any>;

/* ── HEADING ── */
export function HeadingSection({ data }: { data: Data }) {
  const align = data.align === "left" ? "text-left" : "text-center";
  return (
    <section className={`bg-surface pt-16 pb-8 px-6 ${align}`}>
      <div className="max-w-4xl mx-auto">
        {data.eyebrow && (
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
            {data.eyebrow}
          </p>
        )}
        {data.heading && (
          <h2 className="font-headline text-3xl lg:text-4xl text-on-surface">{data.heading}</h2>
        )}
        {data.subheading && (
          <p className="font-body text-on-surface-variant leading-relaxed mt-4 max-w-2xl mx-auto">
            {data.subheading}
          </p>
        )}
      </div>
    </section>
  );
}

/* ── RICH_TEXT ── */
export function RichTextSection({ data }: { data: Data }) {
  return (
    <section className="bg-surface py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {data.heading && (
          <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-6">
            {data.heading}
          </h2>
        )}
        {data.html && (
          <div
            className="cms-richtext font-body text-on-surface-variant leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        )}
      </div>
    </section>
  );
}

/* ── IMAGE ── */
export function ImageSection({ data }: { data: Data }) {
  if (!data.url) return null;
  return (
    <section className="bg-surface py-12 px-6">
      <figure className="max-w-5xl mx-auto">
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-surface-container-low">
          <Image
            src={data.url}
            alt={data.altText || ""}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        </div>
        {data.caption && (
          <figcaption className="font-label text-xs text-on-surface-variant text-center mt-3">
            {data.caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}

/* ── PAGE_HERO ── */
export function PageHeroSection({ data }: { data: Data }) {
  const gradient = data.variant === "gradient";

  return (
    <section
      className={
        gradient
          ? "bg-gradient-to-br from-primary to-primary-container py-32 px-6 text-center"
          : "bg-surface pt-20 pb-12 px-4 text-center"
      }
    >
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        {data.eyebrow &&
          (gradient ? (
            <p className="font-label text-xs uppercase tracking-widest text-white/80 mb-4">
              {data.eyebrow}
            </p>
          ) : (
            <span className="salt-chip inline-block mb-6">{data.eyebrow}</span>
          ))}

        {data.heading && (
          <h1
            className={
              gradient
                ? "font-headline text-5xl lg:text-6xl text-white mb-4"
                : "font-headline text-5xl lg:text-7xl text-primary mb-4"
            }
          >
            {data.heading}
          </h1>
        )}

        {data.subheading && (
          <p
            className={
              gradient
                ? "font-body text-lg text-white/80 max-w-xl mx-auto"
                : "font-body text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
            }
          >
            {data.subheading}
          </p>
        )}

        {data.ctaLabel && (
          <a
            href={data.ctaHref || "#"}
            className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-8 py-4 rounded-full inline-flex items-center gap-2 mt-8"
          >
            {data.ctaIcon && (
              <span className="material-symbols-outlined text-lg">{data.ctaIcon}</span>
            )}
            {data.ctaLabel}
          </a>
        )}
      </motion.div>
    </section>
  );
}

/* ── CTA_BANNER ── */
export function CtaBannerSection({ data }: { data: Data }) {
  const variant = data.variant || "solid";

  if (variant === "split") {
    return (
      <section className="mineral-glow w-full py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-headline text-3xl text-white mb-2">{data.heading}</h2>
            {data.subheading && <p className="text-white/80 font-body">{data.subheading}</p>}
          </div>
          {data.ctaLabel && (
            <Link
              href={data.ctaHref || "/quote"}
              className="bg-white text-primary font-label font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors shrink-0"
            >
              {data.ctaLabel}
            </Link>
          )}
        </div>
      </section>
    );
  }

  if (variant === "plain") {
    return (
      <section className="bg-surface py-20 px-6 text-center">
        <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">{data.heading}</h2>
        {data.subheading && (
          <p className="font-body text-on-surface-variant mb-8 max-w-lg mx-auto">
            {data.subheading}
          </p>
        )}
        {data.ctaLabel && (
          <Link
            href={data.ctaHref || "/quote"}
            className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-10 py-4 rounded-full inline-block"
          >
            {data.ctaLabel}
          </Link>
        )}
      </section>
    );
  }

  return (
    <motion.div
      className="mineral-glow py-20 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-headline text-3xl lg:text-4xl text-on-primary mb-4">{data.heading}</h2>
        {data.subheading && (
          <p className="font-body text-on-primary/80 mb-8 text-lg">{data.subheading}</p>
        )}
        {data.ctaLabel && (
          <Link
            href={data.ctaHref || "/contact"}
            className="inline-block bg-on-primary text-primary font-label text-sm uppercase tracking-widest px-10 py-4 rounded-full hover:bg-on-primary/90 transition-colors"
          >
            {data.ctaLabel}
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/* ── PRODUCT_INQUIRY_CTA ── */
export function ProductInquiryCtaSection({ data }: { data: Data }) {
  return (
    <section className="bg-surface-container-low py-16 px-6 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-headline text-3xl text-on-surface mb-3">{data.heading}</h2>
        {data.subheading && (
          <p className="font-body text-on-surface-variant mb-8">{data.subheading}</p>
        )}
        {data.ctaLabel && (
          <Link
            href={data.ctaHref || "/quote"}
            className="mineral-glow text-on-primary font-label font-semibold px-8 py-3.5 rounded-xl inline-block"
          >
            {data.ctaLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
