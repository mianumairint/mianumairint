const testimonials = [
  {
    quote:
      "The quality of salt lamps from MUI is unmatched. Consistent sizes, beautiful glow, and always packed perfectly for international shipping.",
    company: "Fresh Foods Distributors",
    location: "Sydney, Australia",
  },
  {
    quote:
      "We've been sourcing edible pink salt from Mian Umair for over 5 years. Their pricing and reliability keep us coming back.",
    company: "Northern Spice Co.",
    location: "Ontario, Canada",
  },
  {
    quote:
      "The salt tiles we ordered for our spa project arrived in perfect condition. Their team handled everything from packaging to customs.",
    company: "Wellness Interiors",
    location: "Dallas, USA",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-surface py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-headline text-3xl text-center text-on-surface mb-12">
          What Our Buyers Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.company}
              className="bg-surface-container-lowest rounded-xl p-8 tonal-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-amber-500 text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="font-headline text-lg italic text-on-surface leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Attribution */}
              <p className="font-label text-sm text-on-surface-variant">
                {t.company}, {t.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
