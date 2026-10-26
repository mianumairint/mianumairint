"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";

const bottomLinks = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/products", label: "Products", icon: "inventory_2" },
  { href: "/quote", label: "Quote", icon: "request_quote" },
  { href: "#cart", label: "Cart", icon: "shopping_bag" },
  { href: "#menu", label: "Menu", icon: "menu" },
];

export default function BottomNavBar() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.totalItems);
  const openCart = useCartStore((s) => s.openCart);
  const openSideNav = useUIStore((s) => s.openSideNav);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface rounded-t-3xl tonal-shadow">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {bottomLinks.map((link) => {
          const isActive = link.href === pathname;
          const isCart = link.href === "#cart";
          const isMenu = link.href === "#menu";

          if (isCart) {
            return (
              <button
                key="cart"
                onClick={openCart}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative"
              >
                <span
                  className="material-symbols-outlined text-[22px] text-on-surface-variant"
                  style={totalItems() > 0 ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  shopping_bag
                </span>
                {totalItems() > 0 && (
                  <span className="absolute top-0.5 right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-on-primary mineral-glow rounded-full">
                    {totalItems()}
                  </span>
                )}
                <span className="font-label text-[10px] text-on-surface-variant">Cart</span>
              </button>
            );
          }

          if (isMenu) {
            return (
              <button
                key="menu"
                onClick={openSideNav}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5"
              >
                <span className="material-symbols-outlined text-[22px] text-on-surface-variant">
                  menu
                </span>
                <span className="font-label text-[10px] text-on-surface-variant">Menu</span>
              </button>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5"
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {link.icon}
              </span>
              <span
                className={`font-label text-[10px] ${
                  isActive ? "text-primary font-semibold" : "text-on-surface-variant"
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
