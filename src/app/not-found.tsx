import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(143,71,62,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Floating salt-chip elements */}
      <div className="absolute top-[15%] left-[10%] animate-bounce">
        <span className="salt-chip">Purity</span>
      </div>
      <div
        className="absolute bottom-[18%] right-[12%] animate-bounce"
        style={{ animationDelay: "0.5s" }}
      >
        <span className="salt-chip">Earthbound</span>
      </div>

      {/* Center content */}
      <div className="relative text-center px-4">
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
          Error Code 404
        </p>

        <h1 className="font-headline text-7xl lg:text-9xl text-primary font-bold leading-none">
          404
        </h1>

        <p className="font-headline text-xl italic text-on-surface-variant mt-6 max-w-md mx-auto">
          This mineral seems to be lost in the mines.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="mineral-glow text-on-primary font-label font-semibold px-8 py-3.5 rounded-xl transition-all inline-block"
          >
            Return Home
          </Link>
          <Link
            href="/products"
            className="text-primary font-label font-semibold hover:underline transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
