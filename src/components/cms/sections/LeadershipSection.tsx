"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * LEADERSHIP
 * ==========
 * The person behind the company: a portrait, a name, and what they say about
 * the business in their own words.
 *
 * A thirty-year-old family exporter sells on trust, and a buyer deciding
 * whether to wire money to Faisalabad wants to see who they are dealing with.
 * The rest of the About page is dates and certificates; this is the part that
 * is a person.
 *
 * The portrait is optional. Without one the section does not hold a gap open
 * with a grey box and a camera glyph -- a visitor reads that as a page someone
 * forgot to finish. It simply centres the words instead, and the portrait
 * appears the moment an image is set on the section in the admin.
 */

type Data = Record<string, any>;

export default function LeadershipSection({ data }: { data: Data }) {
  const hasPortrait = Boolean(data.image);

  const words = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={hasPortrait ? "" : "max-w-3xl mx-auto text-center"}
    >
      {data.eyebrow && (
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
          {data.eyebrow}
        </p>
      )}

      {data.heading && (
        <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-6">
          {data.heading}
        </h2>
      )}

      {data.quote && (
        <blockquote className="font-headline text-xl lg:text-2xl text-primary leading-relaxed italic mb-6">
          &ldquo;{data.quote}&rdquo;
        </blockquote>
      )}

      {data.bio && (
        <p className="font-body text-on-surface-variant leading-relaxed whitespace-pre-line mb-6">
          {data.bio}
        </p>
      )}

      {(data.name || data.role) && (
        <div className={hasPortrait ? "" : "inline-block"}>
          {data.name && (
            <p className="font-headline text-lg text-on-surface">{data.name}</p>
          )}
          {data.role && (
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">
              {data.role}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );

  if (!hasPortrait) {
    return (
      <section className="bg-surface py-20 px-6">
        <div className="max-w-7xl mx-auto">{words}</div>
      </section>
    );
  }

  return (
    <section className="bg-surface py-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5"
        >
          {/* A portrait, so it is shown whole rather than cropped to a shape
              chosen before anyone had seen the photograph. */}
          <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container-low tonal-shadow">
            <Image
              src={data.image}
              alt={data.name ? `${data.name}, ${data.role || "Mian Umair International"}` : "Leadership"}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
        </motion.div>

        <div className="lg:col-span-7">{words}</div>
      </div>
    </section>
  );
}
