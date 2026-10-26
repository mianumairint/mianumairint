"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * CREDENTIALS
 * ===========
 * The company's registrations, one full-width block each: the scan on one
 * side, and on the other the reference numbers set out as a table with a link
 * to the public register they can be checked against.
 *
 * A trade buyer wiring money to a supplier they have never met is asking two
 * questions: does this company exist where it says it does, and has anyone
 * independent confirmed it. A row of grey logos answers neither. A number they
 * can type into a government registry answers both.
 *
 * So the number is the loudest thing on the block, and the link beside it goes
 * to the registry rather than to us. The scan is supporting evidence, not the
 * point -- which is why it can be missing without the block falling apart.
 *
 * Blocks alternate sides so a page of three does not read as a list of forms.
 */

type Data = Record<string, any>;

const asArray = (value: unknown): any[] => (Array.isArray(value) ? value : []);

/** A "Label: Value" line, as typed in the admin. */
function splitDetail(line: string): [string, string] {
  const at = line.indexOf(":");
  if (at === -1) return ["", line.trim()];
  return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
}

export default function CredentialsSection({ data }: { data: Data }) {
  const items = asArray(data.items);
  if (!items.length) return null;

  return (
    <section className="bg-surface">
      {(data.eyebrow || data.heading || data.description) && (
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-4 text-center">
          {data.eyebrow && (
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
              {data.eyebrow}
            </p>
          )}
          {data.heading && (
            <h2 className="font-headline text-3xl lg:text-4xl text-on-surface mb-4">
              {data.heading}
            </h2>
          )}
          {data.description && (
            <p className="font-body text-on-surface-variant leading-relaxed">
              {data.description}
            </p>
          )}
        </div>
      )}

      {items.map((item: Data, i: number) => (
        <Credential key={item.name || i} item={item} index={i} />
      ))}
    </section>
  );
}

function Credential({ item, index }: { item: Data; index: number }) {
  // Banding and the side the scan sits on both come from the index rather
  // than odd:/even: variants, which count position among siblings -- the
  // optional heading above is a sibling too, so it would flip every band.
  const flipped = index % 2 === 1;
  const details = asArray(item.details).filter(
    (line: unknown) => typeof line === "string" && line.trim()
  );

  return (
    <div className={`py-14 px-6 ${flipped ? "bg-surface-container-low" : "bg-surface"}`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
      >
        {item.image && (
          <div
            className={`lg:col-span-5 ${flipped ? "lg:order-2" : ""}`}
          >
            {/* Contained inside a white frame rather than cropped to fill one:
                a certificate with its edges cut off looks like a document with
                something to hide. */}
            <a
              href={item.image}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open the ${item.name} document full size`}
              className="group block relative rounded-2xl bg-white p-3 tonal-shadow ring-1 ring-outline-variant/20 hover:ring-primary/40 transition"
            >
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-container-low">
                <Image
                  src={item.image}
                  alt={`${item.name} certificate`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain"
                />
              </div>
              <span className="absolute inset-3 rounded-xl bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-label text-xs uppercase tracking-widest">
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                View full size
              </span>
            </a>
          </div>
        )}

        <div className={item.image ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl mx-auto"}>
          {item.badge && (
            <p className="flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.2em] text-emerald-700 mb-4">
              {/* A live dot, because the claim is that this is current and
                  checkable right now -- not that a certificate once existed. */}
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              {item.badge}
            </p>
          )}

          <h3 className="font-headline text-3xl lg:text-5xl text-on-surface leading-[1.1]">
            {item.name}
          </h3>

          {item.issuer && (
            <p className="font-label text-[11px] uppercase tracking-widest text-on-surface-variant mt-3">
              {item.issuer}
            </p>
          )}

          {item.summary && (
            <p className="font-body text-on-surface-variant leading-relaxed mt-5 max-w-2xl">
              {item.summary}
            </p>
          )}

          {details.length > 0 && (
            <dl className="mt-8 rounded-2xl ring-1 ring-outline-variant/25 bg-surface-container-lowest divide-y divide-outline-variant/20 overflow-hidden">
              {details.map((line: string, j: number) => {
                const [label, value] = splitDetail(line);
                return (
                  <div
                    key={j}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3.5"
                  >
                    <dt className="font-body text-sm text-on-surface-variant">{label}</dt>
                    <dd className="font-body text-sm text-on-surface font-medium tabular-nums text-right">
                      {value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-8">
            {item.verifyUrl && (
              <a
                href={item.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mineral-glow text-on-primary font-label text-xs uppercase tracking-widest px-7 py-3.5 rounded-full inline-flex items-center gap-2"
              >
                {item.verifyLabel || "Verify"}
                <span className="material-symbols-outlined text-[16px]">north_east</span>
              </a>
            )}
            {item.image && (
              <a
                href={item.image}
                target="_blank"
                rel="noopener noreferrer"
                className="font-label text-xs uppercase tracking-widest text-on-surface px-7 py-3.5 rounded-full ring-1 ring-outline-variant/40 hover:ring-primary hover:text-primary transition inline-flex items-center gap-2"
              >
                View certificate
              </a>
            )}
          </div>

          {item.note && (
            <p className="font-body text-xs text-on-surface-variant mt-4 max-w-xl leading-relaxed">
              {item.note}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
