const trustItems = [
  "Exporting Since 1995",
  "30+ Countries Served",
  "ISO Certified Quality",
  "Halal Certified",
  "Direct from Khewra Mines",
  "Custom Packaging Available",
];

export default function TrustBar({ items = trustItems }: { items?: string[] }) {
  return (
    <section className="w-full bg-surface-container-low py-6">
      <ul className="max-w-7xl mx-auto grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 px-6">
        {items.map((item, i) => (
          <li key={`${item}-${i}`} className="flex items-start gap-2 min-w-0">
              <span aria-hidden="true" className="material-symbols-outlined shrink-0 text-primary text-lg">
                verified
              </span>
              <span className="font-label text-xs sm:text-sm leading-relaxed text-on-surface-variant">
                {item}
              </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
