"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TrustBar from "@/components/home/TrustBar";
import DunsNumber from "@/components/shared/DunsNumber";

/**
 * CMS-driven versions of the named layout sections. Markup is carried over
 * from the original hardcoded components so the rendered output is unchanged.
 */

type Data = Record<string, any>;

const fadeUpCustom = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const asArray = (v: unknown): any[] => (Array.isArray(v) ? v : []);

/* ── HERO (full screen) ── */
export function HeroSectionCms({ data }: { data: Data }) {
  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <section
      className="relative min-h-[60svh] md:min-h-screen pt-8 pb-8 md:py-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-on-primary-fixed via-primary to-primary-container"
      style={
        data.backgroundImage
          ? {
              backgroundImage: `url(${data.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-on-primary-fixed/80" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        {data.eyebrow && (
          <motion.p
            variants={fadeUp}
            className="font-label text-xs uppercase tracking-widest text-white/80 mb-6"
          >
            {data.eyebrow}
          </motion.p>
        )}

        {data.heading && (
          <motion.h1
            variants={fadeUp}
            className="font-headline text-3xl md:text-7xl lg:text-8xl text-white leading-tight mb-4 md:mb-6 whitespace-pre-line"
          >
            {data.heading}
          </motion.h1>
        )}

        {data.subheading && (
          <motion.p variants={fadeUp} className="font-body text-lg text-white/85 mb-10">
            {data.subheading}
          </motion.p>
        )}

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {data.primaryCtaLabel && (
            <Link
              href={data.primaryCtaHref || "/products"}
              className="mineral-glow px-8 py-3.5 rounded-xl font-label font-semibold text-sm text-on-primary"
            >
              {data.primaryCtaLabel}
            </Link>
          )}
          {data.secondaryCtaLabel && (
            <Link
              href={data.secondaryCtaHref || "/quote"}
              className="bg-white/15 backdrop-blur text-white border border-white/30 px-8 py-3.5 rounded-xl font-label font-semibold text-sm hover:bg-white/25 transition-colors"
            >
              {data.secondaryCtaLabel}
            </Link>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ── TRUST_BAR ── */
export function TrustBarSection({ data }: { data: Data }) {
  const items = asArray(data.items);
  if (!items.length) return null;

  return <TrustBar items={items} />;
}

/* ── FEATURE_CARDS ── */
export function FeatureCardsSection({ data }: { data: Data }) {
  const items = asArray(data.items);

  return (
    <section className="bg-surface-container-low py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {data.heading && (
          <h2 className="font-headline text-3xl lg:text-4xl text-center text-on-surface mb-12">
            {data.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item: Data, i: number) => (
            <motion.div
              key={item.title || i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpCustom}
              custom={i}
              className="bg-surface-container-lowest rounded-xl p-8 hover:tonal-shadow transition-shadow duration-300"
            >
              <div className="mineral-glow w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-white text-xl">
                  {item.icon || "check"}
                </span>
              </div>
              <h3 className="font-headline text-xl text-on-surface mb-3">{item.title}</h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TESTIMONIALS ── */
export function TestimonialsSection({ data }: { data: Data }) {
  const items = asArray(data.items);

  return (
    <section className="bg-surface py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {data.heading && (
          <h2 className="font-headline text-3xl text-center text-on-surface mb-12">
            {data.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((t: Data, i: number) => (
            <div
              key={t.company || i}
              className="bg-surface-container-lowest rounded-xl p-8 tonal-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <span
                    key={s}
                    className="material-symbols-outlined text-amber-500 text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="font-headline text-lg italic text-on-surface leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="font-label text-sm text-on-surface-variant">
                {[t.company, t.location].filter(Boolean).join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CERTIFICATIONS ── */
export function CertificationsSection({ data }: { data: Data }) {
  const items = asArray(data.items);

  return (
    <section className="bg-surface-container-low py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {data.heading && (
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-10">
            {data.heading}
          </p>
        )}

        <div className="flex items-center justify-center gap-12 flex-wrap">
          {items.map((cert: string, i: number) => (
            <motion.div
              key={`${cert}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 0.5, scale: 1 }}
              whileHover={{ opacity: 1, filter: "grayscale(0)" }}
              viewport={{ once: true }}
              className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default"
            >
              <span className="font-headline text-2xl text-primary font-bold">{cert}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TIMELINE ── */
export function TimelineSection({ data }: { data: Data }) {
  const items = asArray(data.items);

  return (
    <section className="bg-surface-container-low py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {data.eyebrow && (
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
            {data.eyebrow}
          </p>
        )}
        {data.heading && (
          <h2 className="font-headline text-3xl lg:text-4xl text-center text-on-surface mb-14">
            {data.heading}
          </h2>
        )}

        {/* Desktop: horizontal */}
        <div className="hidden md:block relative">
          <div className="absolute top-5 left-0 right-0 h-px bg-outline-variant" />
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
          >
            {items.map((item: Data, i: number) => (
              <motion.div
                key={item.year || i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUpCustom}
                custom={i}
                className="relative text-center"
              >
                <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-4 relative z-10 ring-4 ring-surface-container-low" />
                <p className="font-headline text-2xl text-primary mb-1">{item.year}</p>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  {item.event}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-6">
          {items.map((item: Data, i: number) => (
            <div key={item.year || i} className="flex gap-4 items-start">
              <div className="w-3 h-3 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <p className="font-headline text-xl text-primary">{item.year}</p>
                <p className="font-body text-sm text-on-surface-variant">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── OFFICES ── */
export function OfficesSection({ data }: { data: Data }) {
  const items = asArray(data.items);

  return (
    <section className="bg-surface py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {data.heading && (
          <h2 className="font-headline text-3xl lg:text-4xl text-center text-on-surface mb-12">
            {data.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((office: Data, i: number) => (
            <motion.div
              key={office.name || i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpCustom}
              custom={i}
              className="bg-surface-container-lowest rounded-xl tonal-shadow p-8"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                <h3 className="font-headline text-xl text-on-surface">{office.name}</h3>
              </div>
              {office.role && (
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
                  {office.role}
                </p>
              )}
              {office.address && (
                <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3 whitespace-pre-line">
                  {office.address}
                </p>
              )}
              {office.phone && (
                <a
                  href={`tel:${String(office.phone).replace(/[^\d+]/g, "")}`}
                  className="font-body text-sm text-on-surface-variant mb-1 block hover:text-primary transition-colors"
                >
                  {office.phone}
                </a>
              )}
              {office.email && (
                <a
                  href={`mailto:${office.email}`}
                  className="font-body text-sm text-on-surface-variant mb-4 block hover:text-primary transition-colors break-all"
                >
                  {office.email}
                </a>
              )}
              {office.whatsapp && (
                <a
                  href={`https://wa.me/${String(office.whatsapp).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="salt-chip inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  {office.whatsappLabel || "WhatsApp"}
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── MARKET_TAGS ── */
export function MarketTagsSection({ data }: { data: Data }) {
  const items = asArray(data.items);

  return (
    <section className="bg-surface py-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        {data.eyebrow && (
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
            {data.eyebrow}
          </p>
        )}
        {data.heading && (
          <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-12">
            {data.heading}
          </h2>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {items.map((market: string, i: number) => (
            <span key={`${market}-${i}`} className="salt-chip">
              {market}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ_LIST ── */
export function FaqListSection({ data }: { data: Data }) {
  const items = asArray(data.items);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const waNumber = String(data.asideWhatsapp || "").replace(/\D/g, "");

  return (
    <section className="bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {data.heading && (
          <h2 className="font-headline text-3xl lg:text-4xl text-on-surface text-center mb-12">
            {data.heading}
          </h2>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-surface-container-low rounded-xl aspect-[3/4] flex items-center justify-center overflow-hidden relative">
              {data.asideImage ? (
                <Image
                  src={data.asideImage}
                  alt={data.asideHeading || "FAQ"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              ) : (
                <div className="text-center px-6">
                  <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">
                    help_center
                  </span>
                  <p className="font-headline text-xl text-on-surface-variant/60">
                    Himalayan Salt Expertise
                  </p>
                  <p className="font-body text-sm text-on-surface-variant/40 mt-2">Since 1995</p>
                </div>
              )}
            </div>

            {(data.asideHeading || data.asideText) && (
              <div className="bg-surface-container-low rounded-xl p-6">
                {data.asideHeading && (
                  <h3 className="font-headline text-lg text-on-surface mb-2">
                    {data.asideHeading}
                  </h3>
                )}
                {data.asideText && (
                  <p className="font-body text-sm text-on-surface-variant mb-4">{data.asideText}</p>
                )}
                {waNumber && (
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25d366]/10 text-[#25d366] rounded-full px-5 py-2.5 font-label text-sm hover:bg-[#25d366]/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">chat</span>
                    Chat on WhatsApp
                  </a>
                )}
              </div>
            )}
          </motion.div>

          {/* Accordion */}
          <div className="lg:col-span-8">
            <div className="space-y-0">
              {items.map((item: Data, index: number) => (
                <div key={index}>
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <span className="font-headline text-lg text-on-surface group-hover:text-primary transition-colors pr-4">
                      {item.question}
                    </span>
                    <span
                      className="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-300"
                      style={{
                        transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      expand_more
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openIndex === index && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="font-body text-on-surface-variant leading-relaxed pb-6">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {index < items.length - 1 && <div className="bg-surface-container-low h-px" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── CONTACT_DETAILS ── */
export function ContactDetailsSection({ data }: { data: Data }) {
  const items = asArray(data.items);

  return (
    <div className="space-y-8">
      {data.heading && (
        <h2 className="font-headline text-2xl text-on-surface">{data.heading}</h2>
      )}

      {items.map((loc: Data, i: number) => (
        <div key={loc.name || i} className="flex gap-4">
          <span className="material-symbols-outlined text-primary text-3xl mt-1 shrink-0">
            location_on
          </span>
          <div>
            {loc.role && (
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-0.5">
                {loc.role}
              </p>
            )}
            <h3 className="font-headline text-lg text-on-surface mb-1">{loc.name}</h3>
            {loc.address && (
              <p className="font-body text-on-surface-variant text-sm leading-relaxed whitespace-pre-line">
                {loc.address}
              </p>
            )}
            {loc.phone && (
              <a
                href={`tel:${String(loc.phone).replace(/[^\d+]/g, "")}`}
                className="font-label text-sm text-primary mt-2 inline-block hover:underline"
              >
                {loc.phone}
              </a>
            )}
            {loc.email && (
              <a
                href={`mailto:${loc.email}`}
                className="font-body text-sm text-on-surface-variant mt-1 block hover:text-primary transition-colors break-all"
              >
                {loc.email}
              </a>
            )}
            {loc.whatsapp && (
              <a
                href={`https://wa.me/${String(loc.whatsapp).replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-label text-sm text-[#25d366] mt-1 block hover:underline"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      ))}

      {data.email && (
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary text-3xl mt-1 shrink-0">
            mail
          </span>
          <div>
            <h3 className="font-headline text-lg text-on-surface mb-1">Email</h3>
            <a
              href={`mailto:${data.email}`}
              className="font-label text-sm text-primary hover:underline"
            >
              {data.email}
            </a>
          </div>
        </div>
      )}

      {data.hours && (
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary text-3xl mt-1 shrink-0">
            schedule
          </span>
          <div>
            <h3 className="font-headline text-lg text-on-surface mb-1">Business Hours</h3>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed whitespace-pre-line">
              {data.hours}
            </p>
          </div>
        </div>
      )}

      <DunsNumber />
    </div>
  );
}

