const trustItems = [
  "Exporting Since 1995",
  "30+ Countries Served",
  "ISO Certified Quality",
  "Halal Certified",
  "Direct from Khewra Mines",
  "Custom Packaging Available",
];

export default function TrustBar() {
  return (
    <section className="w-full bg-surface-container-low py-6">
      <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar px-6 md:justify-center">
        {trustItems.map((item, i) => (
          <div key={item} className="flex items-center gap-6 shrink-0">
            {i > 0 && (
              <div className="w-px h-6 bg-outline-variant/30" />
            )}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                verified
              </span>
              <span className="font-label text-sm text-on-surface-variant whitespace-nowrap">
                {item}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
