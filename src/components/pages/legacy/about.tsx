"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ── Timeline Data ────────────────────────────────────────── */

const timeline = [
  { year: "1995", event: "Founded in Faisalabad, Pakistan" },
  { year: "2000", event: "First export shipment to UAE" },
  { year: "2005", event: "Expanded to European markets" },
  { year: "2010", event: "Canada office established" },
  { year: "2015", event: "ISO & Halal certified" },
  { year: "2020", event: "Online B2B platform launched" },
  { year: "2025", event: "Exporting to 30+ countries" },
];

/* ── Why Different (3 pillars) ────────────────────────────── */

const pillars = [
  {
    icon: "factory",
    title: "Direct from Source",
    description:
      "We own our production. No middlemen. Salt straight from Khewra mines to your warehouse.",
  },
  {
    icon: "verified",
    title: "30 Years of Trust",
    description:
      "Since 1995, consistent quality and on-time delivery to buyers in 30+ countries worldwide.",
  },
  {
    icon: "local_shipping",
    title: "Flexible Packaging",
    description:
      "From 500g retail pouches to 25kg bulk sacks. Custom branding and private label available.",
  },
];

/* ── Export Markets ────────────────────────────────────────── */

const markets = [
  "USA",
  "Canada",
  "UAE",
  "UK",
  "Germany",
  "France",
  "Australia",
  "Saudi Arabia",
  "South Korea",
  "Japan",
  "Netherlands",
  "Italy",
  "Spain",
  "Poland",
  "Malaysia",
  "Singapore",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
];

/* ── Certifications ───────────────────────────────────────── */

const certifications = ["ISO", "Halal", "PCSIR", "GMP"];

/* ── Fade-in Variant ──────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

/* ── Page ─────────────────────────────────────────────────── */

export default function LegacyAboutPage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary to-primary-container py-32 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-headline text-5xl lg:text-6xl text-white mb-4"
        >
          Our Story
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-body text-lg text-white/80 max-w-xl mx-auto"
        >
          From Faisalabad to the World Since 1995
        </motion.p>
      </section>

      {/* ── Company Story ───────────────────────────────── */}
      <section className="bg-surface py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-6">
              30 Years of Pure Excellence
            </h2>
            <p className="font-body text-on-surface-variant leading-relaxed mb-6">
              Mian Umair International was founded in 1995 in Faisalabad,
              Pakistan, with a simple vision: to bring the purest Himalayan salt
              from the ancient Khewra mines to the rest of the world. What
              started as a small family operation has grown into a globally
              trusted name in the salt industry.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed mb-6">
              Our salt is hand-mined from the Khewra Salt Mines in the foothills
              of the Himalayas — the world&apos;s second-largest salt mine, dating
              back over 250 million years. Every crystal carries trace minerals
              that give it the distinctive pink hue and mineral-rich profile that
              customers love.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Over three decades, we have built a vertically integrated supply
              chain: from mining and processing to packaging and global
              logistics. Today, we serve wholesalers, retailers, restaurants, and
              spa operators in more than 30 countries across five continents.
            </p>
          </motion.div>

          {/* Right: placeholder image + floating quote */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={1}
            className="relative"
          >
            <div className="aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center">
              <span className="material-symbols-outlined text-outline-variant text-8xl">
                image
              </span>
            </div>

            {/* Floating quote */}
            <div className="absolute -bottom-6 -left-4 lg:-left-8 max-w-xs">
              <blockquote className="font-headline italic text-primary bg-primary-fixed/30 p-6 rounded-xl text-sm leading-relaxed">
                &ldquo;Pure mineral wealth, hand-crafted with respect for the
                land.&rdquo;
              </blockquote>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────── */}
      <section className="bg-surface-container-low py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
            Our Journey
          </p>
          <h2 className="font-headline text-3xl lg:text-4xl text-center text-on-surface mb-14">
            Milestones
          </h2>

          {/* Desktop: horizontal */}
          <div className="hidden md:block relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-0 right-0 h-px bg-outline-variant" />

            <div className="grid grid-cols-7 gap-4">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="relative text-center"
                >
                  {/* Dot */}
                  <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-4 relative z-10 ring-4 ring-surface-container-low" />
                  <p className="font-headline text-2xl text-primary mb-1">
                    {item.year}
                  </p>
                  <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile: vertical */}
          <div className="md:hidden relative pl-8">
            {/* Connecting line */}
            <div className="absolute top-0 bottom-0 left-3 w-px bg-outline-variant" />

            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="relative"
                >
                  {/* Dot */}
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface-container-low" />
                  <p className="font-headline text-2xl text-primary mb-1">
                    {item.year}
                  </p>
                  <p className="font-body text-sm text-on-surface-variant">
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Offices ─────────────────────────────────── */}
      <section className="bg-surface py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
            Global Presence
          </p>
          <h2 className="font-headline text-3xl lg:text-4xl text-center text-on-surface mb-12">
            Our Offices
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pakistan HQ */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="bg-surface-container-lowest rounded-xl tonal-shadow p-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">
                  location_on
                </span>
                <h3 className="font-headline text-xl text-on-surface">
                  Pakistan HQ
                </h3>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3">
                Mian Umair International
                <br />
                Imran Plaza, Layalpur Warehouses,
                <br />
                Faisalabad, Pakistan 38000
              </p>
              <p className="font-body text-sm text-on-surface-variant mb-4">
                +92 320-7550055
              </p>
              <a
                href="https://wa.me/14372259136"
                target="_blank"
                rel="noopener noreferrer"
                className="salt-chip inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                WhatsApp Pakistan
              </a>
            </motion.div>

            {/* Canada Office */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
              className="bg-surface-container-lowest rounded-xl tonal-shadow p-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">
                  location_on
                </span>
                <h3 className="font-headline text-xl text-on-surface">
                  Canada Office
                </h3>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-3">
                Mian Umair International
                <br />
                206-37 Antrim Crescent,
                <br />
                Scarborough, ON M1P 0E8, Canada
              </p>
              <p className="font-body text-sm text-on-surface-variant mb-4">
                +1 (647) 777-9333
              </p>
              <a
                href="https://wa.me/16477779333"
                target="_blank"
                rel="noopener noreferrer"
                className="salt-chip inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                WhatsApp Canada
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why We're Different ─────────────────────────── */}
      <section className="bg-surface-container-low py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-headline text-3xl lg:text-4xl text-center text-on-surface mb-12">
            Why We&apos;re Different
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="bg-surface-container-lowest rounded-xl p-8 hover:tonal-shadow transition-shadow duration-300"
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

      {/* ── Export Markets ───────────────────────────────── */}
      <section className="bg-surface py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
            Trusted Worldwide
          </p>
          <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-10">
            Export Markets
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {markets.map((market) => (
              <span key={market} className="salt-chip">
                {market}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ──────────────────────────────── */}
      <section className="bg-surface-container-low py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-10">
            Certified Quality &amp; Global Standards
          </p>

          <div className="flex items-center justify-center gap-12 flex-wrap">
            {certifications.map((cert) => (
              <motion.div
                key={cert}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.5, scale: 1 }}
                whileHover={{ opacity: 1, filter: "grayscale(0)" }}
                viewport={{ once: true }}
                className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default"
              >
                <span className="font-headline text-2xl text-primary font-bold">
                  {cert}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="bg-surface py-20 px-6 text-center">
        <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">
          Ready to Partner With Us?
        </h2>
        <p className="font-body text-on-surface-variant mb-8 max-w-lg mx-auto">
          Get in touch with our export team for competitive quotes, samples, and
          custom packaging options.
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
