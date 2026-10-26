const certifications = ["ISO", "Halal", "PCSIR", "GMP"];

export default function Certifications() {
  return (
    <section className="bg-surface-container-low py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-10">
          Certified Quality &amp; Global Standards
        </p>

        <div className="flex items-center justify-center gap-12 flex-wrap">
          {certifications.map((cert) => (
            <div
              key={cert}
              className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default"
            >
              <span className="font-headline text-2xl text-primary font-bold">
                {cert}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
