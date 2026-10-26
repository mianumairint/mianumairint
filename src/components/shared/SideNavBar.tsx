"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/ui";
import { useCartStore } from "@/store/cart";
import { motion, AnimatePresence } from "framer-motion";

const sideLinks = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/products", label: "Products", icon: "inventory_2" },
  { href: "/catalogue", label: "Catalogue", icon: "auto_stories" },
  { href: "/about", label: "About Us", icon: "info" },
  { href: "/blog", label: "Blog", icon: "menu_book" },
  { href: "/contact", label: "Contact", icon: "mail" },
  { href: "/quote", label: "Get a Quote", icon: "request_quote" },
];

export default function SideNavBar() {
  const pathname = usePathname();
  const { isSideNavOpen, closeSideNav, openSearch } = useUIStore();
  const openCart = useCartStore((s) => s.openCart);

  return (
    <AnimatePresence>
      {isSideNavOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm z-50"
            onClick={closeSideNav}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-surface z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h2 className="font-headline text-xl text-primary font-bold">
                  Mian Umair International
                </h2>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-0.5">
                  Since 1995
                </p>
              </div>
              <button
                onClick={closeSideNav}
                className="p-1.5 rounded-xl hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {sideLinks.map((link) => {
                const isActive = pathname === link.href;
                const isQuote = link.href === "/quote";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeSideNav}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-body text-base ${
                      isQuote && isActive
                        ? "bg-primary text-white"
                        : isQuote
                        ? "bg-primary/10 text-primary font-semibold"
                        : isActive
                        ? "bg-surface-container text-primary font-semibold"
                        : "text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom CTA */}
            <div className="p-4 space-y-3">
              <Link
                href="/quote"
                onClick={closeSideNav}
                className="block w-full text-center mineral-glow text-on-primary font-label font-semibold text-sm uppercase tracking-wider py-3.5 rounded-xl"
              >
                Request Bulk Quote
              </Link>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    closeSideNav();
                    openSearch();
                  }}
                  className="p-2 rounded-xl hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">search</span>
                </button>
                <button
                  onClick={() => {
                    closeSideNav();
                    openCart();
                  }}
                  className="p-2 rounded-xl hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface-variant">shopping_bag</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
