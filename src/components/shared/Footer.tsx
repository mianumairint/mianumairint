import Link from "next/link";

/**
 * The categories the catalogue actually carries. The previous list was written
 * before the catalogue was imported: every link pointed at a category slug
 * that does not exist, so each one filtered the product list down to nothing.
 */
const categories = [
  { label: "Edible Salt", href: "/products?category=edible-salt" },
  { label: "Black Salt", href: "/products?category=black-salt" },
  { label: "Natural Lamps", href: "/products?category=natural-lamps" },
  { label: "Crafted Lamps", href: "/products?category=crafted-lamps" },
  { label: "Salt Tiles", href: "/products?category=salt-tiles" },
  { label: "Salt Cooking Tiles", href: "/products?category=salt-cooking-tiles" },
  { label: "Salt Grinders", href: "/products?category=salt-grinders" },
  { label: "Bath Salt", href: "/products?category=bath-salt" },
  { label: "Animal Licks", href: "/products?category=animal-licks" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Licences & Certificates", href: "/certifications" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Get Quote", href: "/quote" },
];

export default function Footer() {
  return (
    <footer className="bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 xl:col-span-1 min-w-0">
            <h3 className="font-headline text-xl text-primary font-bold">
              Mian Umair International
            </h3>
            <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
              Exporting Earth&apos;s Purest Mineral Since 1995
            </p>
            <div translate="no" aria-label="Quality certifications" className="notranslate flex flex-wrap items-center gap-3 mt-5">
              <span className="font-label text-base font-bold uppercase tracking-wide text-primary">
                ISO
              </span>
              <span className="font-label text-base font-bold uppercase tracking-wide text-primary">
                Halal
              </span>
              <span className="font-label text-base font-bold uppercase tracking-wide text-primary">
                PCSIR
              </span>
              <span className="font-label text-base font-bold uppercase tracking-wide text-primary">
                GMP
              </span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-headline text-base font-bold text-on-surface mb-4">Products</h4>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="inline-flex items-center min-h-10 py-1 font-body text-sm leading-relaxed text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-headline text-base font-bold text-on-surface mb-4">Company</h4>
            <ul className="space-y-1">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center min-h-10 py-1 font-body text-sm leading-relaxed text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1 min-w-0 border-t border-outline-variant/40 pt-6 md:border-0 md:pt-0">
            <h4 className="font-headline text-base font-bold text-on-surface mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <a
                href="tel:+923207550055"
                className="flex items-center gap-2 min-h-10 font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">phone</span>
                +92-320-755-0055
              </a>
              <a
                href="tel:+14372259136"
                className="flex items-center gap-2 min-h-10 font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">phone</span>
                +1-437-225-9136
              </a>
              <a
                href="mailto:info@mianumairint.com"
                className="flex items-center gap-2 min-h-10 font-body text-sm break-all text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">mail</span>
                info@mianumairint.com
              </a>
              <a
                href="https://wa.me/14372259136"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-full text-sm font-label font-semibold mt-2 hover:brightness-110 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">
                Newsletter
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  aria-label="Email address for newsletter"
                  className="min-w-0 flex-1 bg-transparent border-b border-outline-variant text-sm font-body py-2 px-0 focus:outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/50"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="ml-2 p-2 text-primary hover:bg-surface-container rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-surface-container pt-4 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body text-xs leading-relaxed text-center sm:text-left text-on-surface-variant">
            &copy; {new Date().getFullYear()} Mian Umair International. All Rights Reserved.
          </p>
          <p className="font-body text-xs leading-relaxed text-center sm:text-right text-on-surface-variant">
            383 Imran Plaza, Layalpur Warehouses, Factory Area, Faisalabad 38000, Punjab, Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
