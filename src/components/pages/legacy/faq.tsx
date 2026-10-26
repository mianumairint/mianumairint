"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const faqItems = [
  {
    question: "What is the minimum order quantity?",
    answer:
      "MOQ varies by product. For bulk pink salt, the minimum is typically one 20-foot container (approximately 18-20 metric tons). For salt lamps and decorative items, we can accommodate smaller trial orders starting from 500 pieces. Contact us for specific MOQ details for the product you are interested in.",
  },
  {
    question: "Do you offer custom packaging and private labeling?",
    answer:
      "Yes, we offer comprehensive custom packaging and private labeling services. Whether you need custom pouches, jars, boxes, or retail-ready packaging with your brand name, logo, and design, our in-house design team will work with you. We support packaging in multiple languages and can meet specific regulatory labeling requirements for your target market.",
  },
  {
    question: "What countries do you export to?",
    answer:
      "We export worldwide to over 30 countries across North America, Europe, the Middle East, Asia, and Australia. Our major export destinations include the United States, Canada, United Kingdom, Germany, UAE, Saudi Arabia, Japan, and Australia. We handle all export documentation and can ship to any destination port.",
  },
  {
    question: "What certifications do you hold?",
    answer:
      "We hold ISO 9001:2015 (Quality Management), Halal Certification, PCSIR (Pakistan Council of Scientific and Industrial Research) lab testing certificates, and GMP (Good Manufacturing Practices) compliance. We also provide third-party lab analysis reports, Certificates of Origin, and can meet additional certification requirements upon request.",
  },
  {
    question: "What are your shipping terms?",
    answer:
      "We offer flexible shipping terms including FOB (Free on Board) Karachi Port, CIF (Cost, Insurance and Freight) to your destination port, and EXW (Ex Works) from our factory. We work with trusted international freight forwarders and can arrange both sea freight and air freight depending on your urgency and budget.",
  },
  {
    question: "How long has Mian Umair International been in business?",
    answer:
      "Mian Umair International has been in the Himalayan salt industry since 1995, giving us nearly three decades of experience. We started as a small mining and processing operation and have grown into a vertically integrated manufacturer and exporter with our own mines, processing facilities, and global distribution network.",
  },
  {
    question: "How do I get a price quote?",
    answer:
      "Getting a price quote is easy. You can fill out our contact form on this website, send us an email at mianumairint@gmail.com, or reach us directly on WhatsApp at +92-320-755-0055. Please include the product type, desired quantity, packaging preferences, and destination country so we can provide an accurate quote within 24 hours.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank wire transfers (T/T), Letters of Credit (L/C) through major banks, and PayPal for smaller orders. For first-time buyers, we typically work with 30% advance payment and 70% before shipment or against copy of Bill of Lading. We can discuss flexible payment terms for long-term partnerships.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LegacyFaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-surface">
      {/* ── Hero ── */}
      <div className="pt-20 pb-16 text-center px-4">
        <motion.p
          className="salt-chip inline-block mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Support
        </motion.p>
        <motion.h1
          className="font-headline text-5xl lg:text-7xl text-primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Common Questions
        </motion.h1>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ── Left Sidebar ── */}
          <motion.div
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Decorative Placeholder */}
            <div className="bg-surface-container-low rounded-xl aspect-[3/4] flex items-center justify-center">
              <div className="text-center px-6">
                <span className="material-symbols-outlined text-6xl text-primary/30 mb-4 block">
                  help_center
                </span>
                <p className="font-headline text-xl text-on-surface-variant/60">
                  Himalayan Salt Expertise
                </p>
                <p className="font-body text-sm text-on-surface-variant/40 mt-2">
                  Since 1995
                </p>
              </div>
            </div>

            {/* WhatsApp Info Card */}
            <div className="bg-surface-container-low rounded-xl p-6">
              <h3 className="font-headline text-lg text-on-surface mb-2">
                Need Quick Help?
              </h3>
              <p className="font-body text-sm text-on-surface-variant mb-4">
                Chat with our team directly on WhatsApp for instant answers.
              </p>
              <a
                href="https://wa.me/923207550055"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25d366]/10 text-[#25d366] rounded-full px-5 py-2.5 font-label text-sm hover:bg-[#25d366]/20 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.704-1.228A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.326-.682-6.058-1.849l-.422-.295-3.09.807.844-3.028-.327-.466A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>

          {/* ── Right: FAQ Accordion ── */}
          <div className="lg:col-span-8">
            <div className="space-y-0">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <button
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                    className="w-full flex items-center justify-between py-6 text-left group"
                  >
                    <span className="font-headline text-lg text-on-surface group-hover:text-primary transition-colors pr-4">
                      {item.question}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-300"
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

                  {/* Divider */}
                  {index < faqItems.length - 1 && (
                    <div className="bg-surface-container-low h-px" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA Section ── */}
      <motion.div
        className="mineral-glow py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline text-3xl lg:text-4xl text-on-primary mb-4">
            Still have questions?
          </h2>
          <p className="font-body text-on-primary/80 mb-8 text-lg">
            Our team is happy to help with any questions about our products,
            pricing, or shipping.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-on-primary text-primary font-label text-sm uppercase tracking-widest px-10 py-4 rounded-full hover:bg-on-primary/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
