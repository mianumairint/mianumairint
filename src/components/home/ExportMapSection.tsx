"use client";

import { useEffect, useState } from "react";

interface ExportMarket {
  id: string;
  country: string;
  city: string;
  flag: string;
}

export default function ExportMapSection() {
  const [countries, setCountries] = useState<ExportMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products?limit=1", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.total === "number") setProductCount(data.total);
      })
      .catch(() => {});

    fetch("/api/export-markets", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setCountries(data.markets || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  // Combine multiple cities in the same country into one market card.
  const markets = Array.from(
    countries.reduce((groups, market) => {
      const key = market.country.trim().toLowerCase();
      const group = groups.get(key) ?? { ...market, cities: new Set<string>() };
      if (market.city?.trim()) group.cities.add(market.city.trim());
      groups.set(key, group);
      return groups;
    }, new Map<string, ExportMarket & { cities: Set<string> }>()).values()
  );

  const stats = [
    { value: "30+", label: "Countries Served" },
    { value: "1995", label: "Established" },
    { value: productCount, label: "Products" },
  ];

  return (
    <section className="py-12 md:py-20 px-5 sm:px-6 max-w-7xl mx-auto" aria-labelledby="global-reach-heading">
      <p className="font-label text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
        Trusted by Buyers Across 4 Continents
      </p>
      <h2 id="global-reach-heading" className="font-headline text-3xl md:text-4xl text-center text-on-surface mb-8 md:mb-12">
        Our Global Reach
      </h2>

      <dl className="grid grid-cols-3 divide-x divide-outline-variant/40 bg-surface-container-low rounded-2xl py-6 mb-8 md:mb-12 max-w-4xl mx-auto">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center px-2 sm:px-4">
            <dt className="font-label text-[10px] sm:text-xs leading-relaxed uppercase tracking-wide text-on-surface-variant">
              {stat.label}
            </dt>
            <dd translate="no" className="notranslate font-headline text-2xl sm:text-4xl text-primary mt-2">
              {stat.value ?? <span aria-label="Loading product count" className="inline-block w-10 h-7 rounded bg-surface-container animate-pulse" />}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto" aria-label="Export destinations" aria-busy={loading}>
        {loading && [0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i} aria-hidden="true" className="h-24 bg-surface-container rounded-xl animate-pulse" />
        ))}
        {!loading && markets.map((market) => (
          <li key={market.country} className="min-w-0 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 sm:p-5 flex items-start gap-3">
            <span translate="no" aria-hidden="true" className="notranslate shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-label text-xs font-semibold">
              {market.flag ? market.flag.toUpperCase() : <span className="material-symbols-outlined text-lg">public</span>}
            </span>
            <div className="min-w-0">
              <h3 className="font-body text-sm sm:text-base font-semibold leading-snug text-on-surface">{market.country}</h3>
              {market.cities.size > 0 && (
                <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed mt-1">{Array.from(market.cities).join(" · ")}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {!loading && markets.length === 0 && (
        <p className="text-center text-on-surface-variant font-body text-sm">Export market data coming soon.</p>
      )}
    </section>
  );
}
