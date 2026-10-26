"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/**
 * The catalogue figure is counted, not claimed: it is whatever the Products
 * table holds at the time of the request, so adding a line to the catalogue
 * moves it without anyone remembering to edit this file. `value: null` means
 * the count has not arrived yet, and that tile waits rather than counting up
 * from nothing to a number that is about to change.
 *
 * The other three are company facts the database does not know.
 */
function statsFor(productCount: number | null) {
  return [
    { value: 30, suffix: "+", label: "Countries Exported To" },
    { value: 1995, suffix: "", label: "Year Established" },
    { value: productCount, suffix: "", label: "Products in Catalogue" },
  ];
}

interface ExportMarket {
  id: string;
  country: string;
  city: string;
  flag: string;
  since: string | null;
}

export default function ExportMapSection() {
  const [countries, setCountries] = useState<ExportMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState<number | null>(null);

  // One row is asked for because the count rides along in the response; the
  // product itself is thrown away.
  useEffect(() => {
    fetch("/api/products?limit=1")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.total === "number") setProductCount(data.total);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/export-markets")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.markets || []);
      })
      .catch(() => {
        setCountries([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      {/* Heading */}
      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
        Trusted by Buyers Across 4 Continents
      </p>
      <h2 className="font-headline text-4xl text-center text-on-surface mb-12">
        Our Global Reach
      </h2>

      {/* A placeholder panel for a map that was never built used to sit here.
          It carried no information, so the figures and the market list start
          the section instead. */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
        {statsFor(productCount).map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 text-center"
          >
            <p className="font-headline text-4xl text-primary mb-1">
              {stat.value === null ? (
                <span className="inline-block w-16 h-8 rounded bg-surface-container animate-pulse align-middle" />
              ) : (
                <CountUp target={stat.value} suffix={stat.suffix} />
              )}
            </p>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Country Chips */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {loading && (
          <>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="salt-chip w-28 h-8 bg-surface-container animate-pulse rounded-full"
              />
            ))}
          </>
        )}
        {/* The city is named alongside the country, because two of these are
            the United States -- Dallas and California -- and on the country
            alone the row read as the same market listed twice. */}
        {!loading &&
          countries.map((c) => (
            <span key={c.id} className="salt-chip">
              {c.flag} {c.country}
              {c.city && (
                <span className="text-on-surface-variant/70"> · {c.city}</span>
              )}
            </span>
          ))}
        {!loading && countries.length === 0 && (
          <p className="text-on-surface-variant font-body text-sm">
            Export market data coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
