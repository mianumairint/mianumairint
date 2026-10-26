import Link from "next/link";

export default function QuoteCTA() {
  return (
    <section className="mineral-glow w-full py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left */}
        <div>
          <h2 className="font-headline text-3xl text-white mb-2">
            Ready to Place a Bulk Order?
          </h2>
          <p className="text-white/80 font-body">
            Get a custom quote within 24 hours
          </p>
        </div>

        {/* Right */}
        <Link
          href="/quote"
          className="bg-white text-primary font-label font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-colors shrink-0"
        >
          Request a Quote
        </Link>
      </div>
    </section>
  );
}
