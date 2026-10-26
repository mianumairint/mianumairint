"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/shared/AuthProvider";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";

interface Category {
  name: string;
  slug: string;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function TopNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems);
  const openCart = useCartStore((s) => s.openCart);
  const { openSideNav, openSearch } = useUIStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsMenu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Closed on a click anywhere else and on Escape, so the panel cannot be
  // left hanging over the page after the pointer has moved on.
  useEffect(() => {
    if (!productsOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!productsMenu.current?.contains(event.target as Node)) setProductsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProductsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [productsOpen]);

  // A route change means the link was followed; the panel has done its job.
  useEffect(() => setProductsOpen(false), [pathname]);

  const linkClass = (href: string) =>
    `font-body text-[15px] tracking-tight transition-colors hover:text-primary ${
      pathname === href ? "text-primary border-b-2 border-primary pb-0.5" : "text-on-surface"
    }`;

  return (
    // A floating bar rather than one pinned edge to edge: it sits clear of the
    // page corners, so what is behind it still reads as the top of the page.
    // PageRenderer pulls a hero up underneath it.
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50">
      <nav className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16 pl-4 pr-3 sm:pl-5 sm:pr-4 rounded-full glass-nav tonal-shadow">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Mian Umair International — home">
            <Image
              src="/images/brand/logo.webp"
              alt="Mian Umair International"
              width={44}
              height={44}
              priority
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
            />
            <span className="hidden lg:flex flex-col leading-none">
              <span className="font-headline text-base text-primary font-bold tracking-tight whitespace-nowrap">
                Mian Umair International
              </span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant mt-0.5">
                Since 1995
              </span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7 flex-1 justify-center">
            {navLinks.map((link) =>
              link.label === "Products" ? (
                <div
                  key={link.href}
                  ref={productsMenu}
                  className="relative"
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setProductsOpen((open) => !open)}
                    aria-expanded={productsOpen}
                    aria-haspopup="true"
                    className={`${linkClass(link.href)} flex items-center gap-0.5`}
                  >
                    {link.label}
                    <span
                      className={`material-symbols-outlined text-[18px] transition-transform ${
                        productsOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {productsOpen && categories.length > 0 && (
                    // Sits on a bridge of padding, so the pointer can travel
                    // from the trigger to the panel without crossing a gap
                    // that would close it.
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4">
                      <div className="w-[34rem] max-w-[90vw] bg-surface-container-lowest rounded-2xl tonal-shadow p-3">
                        <div className="grid grid-cols-2 gap-1">
                          {categories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/products?category=${cat.slug}`}
                              className="font-body text-sm text-on-surface px-3 py-2 rounded-lg hover:bg-surface-container hover:text-primary transition-colors"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/products"
                          className="mt-2 block text-center font-label text-xs uppercase tracking-widest text-primary px-3 py-2.5 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                          All Products &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={openSearch}
              className="p-2 rounded-xl hover:bg-surface-container transition-colors"
              aria-label="Search"
            >
              <span className="material-symbols-outlined text-on-surface">search</span>
            </button>

            {/* Account / Login */}
            <Link
              href={user ? "/account" : "/auth/login"}
              className="hidden md:flex p-2 rounded-xl hover:bg-surface-container transition-colors"
              aria-label={user ? "My Account" : "Sign In"}
            >
              <span
                className={`material-symbols-outlined ${user ? "text-primary" : "text-on-surface"}`}
                style={user ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                account_circle
              </span>
            </Link>

            <button
              onClick={openCart}
              className="p-2 rounded-xl hover:bg-surface-container transition-colors relative"
              aria-label="Cart"
            >
              <span className="material-symbols-outlined text-on-surface">shopping_bag</span>
              {totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-on-primary mineral-glow rounded-full badge-pulse">
                  {totalItems()}
                </span>
              )}
            </button>

            <a
              href="https://wa.me/14372259136"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex p-2 rounded-xl hover:bg-surface-container transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>

            {/* The quote request is the point of the site for a trade buyer,
                so it is a button rather than one more link in the row. */}
            <Link
              href="/quote"
              className="hidden sm:inline-block mineral-glow text-on-primary font-label text-xs uppercase tracking-widest px-5 py-2.5 rounded-full whitespace-nowrap ml-1"
            >
              Get a Quote
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={openSideNav}
              className="md:hidden p-2 rounded-xl hover:bg-surface-container transition-colors"
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-on-surface">menu</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
