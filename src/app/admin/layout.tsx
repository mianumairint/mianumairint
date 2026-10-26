"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const navLinks = [
  { label: "Dashboard", icon: "dashboard", href: "/admin" },
  { label: "Pages", icon: "description", href: "/admin/pages" },
  { label: "Products", icon: "inventory_2", href: "/admin/products" },
  { label: "Orders", icon: "receipt_long", href: "/admin/orders" },
  { label: "Quote Requests", icon: "request_quote", href: "/admin/quotes" },
  { label: "Customers", icon: "group", href: "/admin/customers" },
  { label: "Blog Posts", icon: "edit_note", href: "/admin/blog" },
  { label: "Media Library", icon: "perm_media", href: "/admin/media" },
  { label: "Catalogue", icon: "auto_stories", href: "/admin/catalogue" },
  { label: "Coupons", icon: "sell", href: "/admin/coupons" },
  { label: "Newsletter", icon: "newspaper", href: "/admin/newsletter" },
  { label: "Messages", icon: "chat", href: "/admin/messages" },
  { label: "Shipping", icon: "local_shipping", href: "/admin/shipping" },
  { label: "SEO Manager", icon: "search", href: "/admin/seo" },
  { label: "Settings", icon: "settings", href: "/admin/settings" },
];

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me");
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.user);
          setAuthChecked(true);
        } else {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      }
    }
    checkAuth();
  }, [isLoginPage, router]);

  // The session cookies are httpOnly, so clearing them from JavaScript never
  // worked -- the old logout only redirected and left the session alive. The
  // API route revokes it for real.
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await getSupabaseBrowser().auth.signOut();
    router.replace("/admin/login");
  }

  // Login page — no sidebar, render directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-primary mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-label text-sm text-on-surface-variant">Verifying access...</p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#1b1c1c] text-white/70 transition-all duration-300 z-40 overflow-y-auto flex flex-col ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          {!collapsed ? (
            <div>
              <h1 className="text-primary font-headline font-bold text-lg leading-tight">
                Mian Umair
              </h1>
              <span className="text-xs text-white/50">Admin</span>
            </div>
          ) : (
            <span className="text-primary font-headline font-bold text-lg mx-auto">
              MU
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-white/5"
              }`}
              title={collapsed ? link.label : undefined}
            >
              <span className="material-symbols-outlined text-[20px]">
                {link.icon}
              </span>
              {!collapsed && (
                <span className="font-label text-sm">{link.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom: Collapse + Logout */}
        <div className="px-3 mb-4 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition w-full"
          >
            <span className="material-symbols-outlined text-[20px]">
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
            {!collapsed && <span className="font-label text-sm">Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-500/10 text-red-400 transition w-full"
            title={collapsed ? "Logout" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {!collapsed && <span className="font-label text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-surface-container-lowest shadow flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none w-64"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-surface-container transition">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              </div>
              <span className="font-label text-sm text-on-surface">
                {admin?.name || admin?.email || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}
