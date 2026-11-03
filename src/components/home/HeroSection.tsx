"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[60svh] md:min-h-screen py-8 md:py-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-on-primary-fixed via-primary to-primary-container"
      style={{
        // The same photograph, served from our own storage. It used to come
        // straight from Unsplash, which made every visit to this fallback a
        // request to a third party.
        backgroundImage:
          "url(https://bdkqflbabuxykdhmwxnc.supabase.co/storage/v1/object/public/products/catalogue/photo-1600850056064-a8b380df8395.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-on-primary-fixed/80" />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
      >
        <motion.p
          variants={fadeUp}
          className="font-label text-xs uppercase tracking-widest text-white/80 mb-6"
        >
          Pakistan&apos;s Premier Himalayan Salt Exporter
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="font-headline text-3xl md:text-7xl lg:text-8xl text-white leading-tight mb-4 md:mb-6 whitespace-pre-line"
        >
          {"Exporting Earth's\nPurest Mineral"}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="font-body text-lg text-white/85 mb-10"
        >
          Since 1995 &middot; Faisalabad, Pakistan &middot; Worldwide Shipping
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/products"
            className="mineral-glow px-8 py-3.5 rounded-xl font-label font-semibold text-sm text-on-primary"
          >
            Explore Products
          </Link>
          <Link
            href="/quote"
            className="bg-white/15 backdrop-blur text-white border border-white/30 px-8 py-3.5 rounded-xl font-label font-semibold text-sm hover:bg-white/25 transition-colors"
          >
            Request a Quote
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
