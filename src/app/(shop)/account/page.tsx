"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import Image from "next/image";
import Link from "next/link";

/* ── Types ────────────────────────────────────────────────── */

type Tab = "overview" | "orders" | "addresses" | "wishlist" | "newsletter" | "news" | "settings";

interface Order {
  id: string;
  date: string;
  items: number;
  total: string;
  status: string;
  products: string[];
}

interface WishlistItem {
  id: string;
  name: string;
  price: string;
  image: string;
}

interface NewsArticle {
  title: string;
  category: string;
  date: string;
  excerpt: string;
  slug: string;
  image: string;
}

/* Saved addresses have no API behind them yet. This screen used to fill the
   gap with two invented ones -- a customer signing in saw "Ahmed Khan, 123
   Salt Mine Road" listed as their own address. An empty state is honest. */

/* ── Status Chip ──────────────────────────────────────────── */

const statusStyles: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  PROCESSING: "bg-amber-100 text-amber-800",
  PENDING: "border border-outline-variant text-on-surface-variant",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-800",
};

/* ── Nav Items ────────────────────────────────────────────── */

const navItems: { key: Tab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "orders", label: "My Orders", icon: "receipt_long" },
  { key: "wishlist", label: "Wishlist", icon: "favorite" },
  { key: "addresses", label: "Addresses", icon: "location_on" },
  { key: "newsletter", label: "Newsletter", icon: "mail" },
  { key: "news", label: "Latest News", icon: "newspaper" },
  { key: "settings", label: "Settings", icon: "settings" },
];

/* ── Loading Skeleton ─────────────────────────────────────── */

function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8 animate-pulse space-y-4">
      <div className="h-6 w-40 bg-surface-container-low rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-surface-container-low rounded-lg" />
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */

export default function AccountPage() {
  const { user, status, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(true);

  /* ── Data state ── */
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  /* ── Fetch orders ── */
  useEffect(() => {
    if (status !== "authenticated") return;
    setOrdersLoading(true);
    fetch("/api/orders")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        const raw = Array.isArray(data) ? data : data.orders ?? [];
        setOrders(
          raw.map((o: any) => ({
            id: o.orderNumber || o.id,
            date: o.createdAt
              ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "",
            items: o.items?.length || 0,
            total: `$${Number(o.total || 0).toFixed(2)}`,
            status: o.status || "PENDING",
            products: o.items?.map((i: any) => i.product?.name || "Product").slice(0, 3) || [],
          }))
        );
      })
      .catch((err) => setOrdersError(err.message))
      .finally(() => setOrdersLoading(false));
  }, [status]);

  /* ── Fetch wishlist ── */
  useEffect(() => {
    if (status !== "authenticated") return;
    setWishlistLoading(true);
    fetch("/api/wishlist")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load wishlist");
        const data = await res.json();
        setWishlist(Array.isArray(data) ? data : data.items ?? []);
      })
      .catch((err) => setWishlistError(err.message))
      .finally(() => setWishlistLoading(false));
  }, [status]);

  /* ── Fetch latest news ── */
  useEffect(() => {
    setNewsLoading(true);
    fetch("/api/blog?limit=4")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load news");
        const data = await res.json();
        const posts = data.posts ?? (Array.isArray(data) ? data : []);
        setLatestNews(
          posts.map((p: Record<string, unknown>) => ({
            title: p.title ?? "",
            category: p.category ?? "",
            date: p.publishedAt
              ? new Date(p.publishedAt as string).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : (p.date ?? ""),
            excerpt: p.excerpt ?? "",
            slug: p.slug ?? "",
            image: (p.coverImage as string) || (p.image as string) || "",
          }))
        );
      })
      .catch(() => {})
      .finally(() => setNewsLoading(false));
  }, []);

  /* ── Computed stats ── */
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const inProgressCount = orders.filter((o) => ["SHIPPED", "PROCESSING", "CONFIRMED", "PENDING"].includes(o.status)).length;

  // If not logged in, show a nice prompt
  if (status === "unauthenticated") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <span className="material-symbols-outlined text-7xl text-primary/30 mb-4">account_circle</span>
        <h1 className="font-headline text-3xl text-on-surface mb-2">Sign In to Your Account</h1>
        <p className="font-body text-on-surface-variant mb-8 max-w-md">
          Track your orders, manage your wishlist, subscribe to our newsletter, and stay updated with the latest news from Mian Umair International.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/auth/login" className="mineral-glow text-on-primary font-label font-semibold px-8 py-3.5 rounded-xl">
            Sign In
          </Link>
          <Link href="/auth/register" className="border border-outline-variant text-primary font-label font-semibold px-8 py-3.5 rounded-xl hover:bg-surface-container transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const userName = user?.name || "Customer";
  const userEmail = user?.email || "";

  return (
    <div className="max-w-6xl mx-auto py-8 lg:py-12 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="font-headline text-3xl lg:text-4xl text-primary">
            Welcome, {userName}
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 border border-outline-variant text-on-surface-variant font-label font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-surface-container transition-colors self-start"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        {/* Sidebar */}
        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible hide-scrollbar pb-2 lg:pb-0">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label text-sm whitespace-nowrap transition-colors ${
                activeTab === item.key
                  ? "text-primary bg-surface-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={activeTab === item.key ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="min-w-0">

          {/* === OVERVIEW === */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Orders", value: ordersLoading ? "-" : String(orders.length), icon: "shopping_bag" },
                  { label: "Delivered", value: ordersLoading ? "-" : String(deliveredCount), icon: "check_circle" },
                  { label: "In Progress", value: ordersLoading ? "-" : String(inProgressCount), icon: "local_shipping" },
                  { label: "Wishlist Items", value: wishlistLoading ? "-" : String(wishlist.length), icon: "favorite" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-surface-container-lowest rounded-xl tonal-shadow p-5 text-center">
                    <span className="material-symbols-outlined text-3xl text-primary/60 mb-2">{stat.icon}</span>
                    <p className="font-headline text-2xl text-primary">{stat.value}</p>
                    <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline text-xl text-on-surface">Recent Orders</h2>
                  <button onClick={() => setActiveTab("orders")} className="font-label text-sm text-primary hover:underline">
                    View All &rarr;
                  </button>
                </div>
                {ordersLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-surface-container-low rounded-lg" />
                    ))}
                  </div>
                ) : ordersError ? (
                  <p className="font-body text-sm text-on-surface-variant py-4">{ordersError}</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">shopping_bag</span>
                    <p className="font-body text-sm text-on-surface-variant">No orders yet.</p>
                    <Link href="/products" className="font-label text-sm text-primary hover:underline mt-2 inline-block">Browse Products &rarr;</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface-container-low rounded-lg px-4 py-3">
                        <div>
                          <p className="font-label font-semibold text-on-surface text-sm">{order.id}</p>
                          <p className="font-label text-xs text-on-surface-variant">{order.date} &middot; {order.items} items</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-headline text-sm text-on-surface">{order.total}</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-label font-semibold uppercase tracking-wider ${statusStyles[order.status] || "bg-surface-container text-on-surface-variant"}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Latest News Preview */}
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline text-xl text-on-surface">Latest News</h2>
                  <button onClick={() => setActiveTab("news")} className="font-label text-sm text-primary hover:underline">
                    View All &rarr;
                  </button>
                </div>
                {newsLoading ? (
                  <div className="grid sm:grid-cols-2 gap-4 animate-pulse">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-20 h-20 rounded-lg bg-surface-container-low flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-full bg-surface-container-low rounded" />
                          <div className="h-4 w-2/3 bg-surface-container-low rounded" />
                          <div className="h-3 w-20 bg-surface-container-low rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : latestNews.length === 0 ? (
                  <p className="font-body text-sm text-on-surface-variant py-4">No news available.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {latestNews.slice(0, 2).map((article) => (
                      <Link key={article.slug} href={`/blog/${article.slug}`} className="flex gap-3 group">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container-low">
                          {article.image ? (
                            <Image src={article.image} alt={article.title} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-2xl text-on-surface-variant/20">image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-headline text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">{article.title}</p>
                          <p className="font-label text-[10px] text-on-surface-variant mt-1">{article.date}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === ORDERS === */}
          {activeTab === "orders" && (
            ordersLoading ? (
              <CardSkeleton rows={5} />
            ) : ordersError ? (
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-error/40 mb-2">error</span>
                <p className="font-body text-on-surface-variant">{ordersError}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8 text-center py-16">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">receipt_long</span>
                <p className="font-body text-on-surface-variant mb-2">You have no orders yet.</p>
                <Link href="/products" className="font-label text-sm text-primary hover:underline">Browse Products &rarr;</Link>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8">
                <h2 className="font-headline text-xl text-on-surface mb-6">Order History</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-surface-container-low rounded-xl p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="font-label font-bold text-on-surface">{order.id}</p>
                          <p className="font-label text-xs text-on-surface-variant mt-0.5">{order.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-headline text-lg text-primary">{order.total}</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-label font-semibold uppercase tracking-wider ${statusStyles[order.status] || "bg-surface-container text-on-surface-variant"}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      {order.products && order.products.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {order.products.map((p) => (
                            <span key={p} className="salt-chip text-[10px]">{p}</span>
                          ))}
                        </div>
                      )}
                      {order.status === "SHIPPED" && (
                        <div className="mt-3 flex items-center gap-2 text-cyan-700 bg-cyan-50 px-3 py-2 rounded-lg">
                          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                          <span className="font-label text-xs">Your order is on its way!</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* === WISHLIST === */}
          {activeTab === "wishlist" && (
            wishlistLoading ? (
              <CardSkeleton rows={4} />
            ) : wishlistError ? (
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-error/40 mb-2">error</span>
                <p className="font-body text-on-surface-variant">{wishlistError}</p>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8">
                <h2 className="font-headline text-xl text-on-surface mb-6">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">favorite</span>
                    <p className="font-body text-on-surface-variant">Your wishlist is empty</p>
                    <Link href="/products" className="font-label text-sm text-primary hover:underline mt-2 inline-block">Browse Products &rarr;</Link>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-surface-container-low rounded-xl p-4 group">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-2xl text-on-surface-variant/20">image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-headline text-sm text-on-surface truncate">{item.name}</p>
                          <p className="font-headline text-primary font-bold mt-1">{item.price}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" title="Add to Cart">
                            <span className="material-symbols-outlined text-[18px] text-primary">add_shopping_cart</span>
                          </button>
                          <button className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center hover:bg-error/20 transition-colors" title="Remove">
                            <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}

          {/* === ADDRESSES === */}
          {activeTab === "addresses" && (
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline text-xl text-on-surface">Saved Addresses</h2>
                <button className="mineral-glow text-on-primary font-label font-semibold px-5 py-2.5 rounded-xl text-sm">
                  <span className="material-symbols-outlined text-[16px] align-middle mr-1">add</span>
                  Add Address
                </button>
              </div>
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">
                  location_off
                </span>
                <p className="font-body text-sm text-on-surface-variant">
                  No saved addresses yet. Add one to check out faster next time.
                </p>
              </div>
            </div>
          )}

          {/* === NEWSLETTER === */}
          {activeTab === "newsletter" && (
            <div className="space-y-6">
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8">
                <h2 className="font-headline text-xl text-on-surface mb-2">Newsletter Subscription</h2>
                <p className="font-body text-sm text-on-surface-variant mb-6">
                  Stay updated with our latest products, exclusive deals, health tips, and industry news.
                </p>

                <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-2xl ${isSubscribed ? "text-green-600" : "text-on-surface-variant"}`}>
                      {isSubscribed ? "mark_email_read" : "mail"}
                    </span>
                    <div>
                      <p className="font-label font-semibold text-on-surface text-sm">
                        {isSubscribed ? "You are subscribed" : "Not subscribed"}
                      </p>
                      <p className="font-label text-xs text-on-surface-variant">
                        {isSubscribed ? "You receive our weekly newsletter" : "Subscribe to get updates"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`font-label font-semibold text-sm px-5 py-2 rounded-xl transition-all ${
                      isSubscribed
                        ? "border border-outline-variant text-on-surface-variant hover:border-error hover:text-error"
                        : "mineral-glow text-on-primary"
                    }`}
                  >
                    {isSubscribed ? "Unsubscribe" : "Subscribe"}
                  </button>
                </div>

                {!isSubscribed && (
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email to subscribe"
                      className="flex-1 bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => setIsSubscribed(true)}
                      className="mineral-glow text-on-primary font-label font-semibold px-6 py-2.5 rounded-xl text-sm"
                    >
                      Subscribe
                    </button>
                  </div>
                )}

                <h3 className="font-headline text-lg text-on-surface mt-8 mb-4">What you&apos;ll receive</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: "local_offer", title: "Exclusive Deals", desc: "Early access to special prices and bulk offers" },
                    { icon: "inventory_2", title: "New Products", desc: "Be the first to know about new arrivals" },
                    { icon: "health_and_safety", title: "Health Tips", desc: "Benefits and uses of Himalayan salt" },
                    { icon: "public", title: "Industry News", desc: "Export updates and market insights" },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3 bg-surface-container-low rounded-lg p-4">
                      <span className="material-symbols-outlined text-primary">{item.icon}</span>
                      <div>
                        <p className="font-label font-semibold text-on-surface text-sm">{item.title}</p>
                        <p className="font-label text-xs text-on-surface-variant">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === LATEST NEWS === */}
          {activeTab === "news" && (
            newsLoading ? (
              <CardSkeleton rows={4} />
            ) : (
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8">
                <h2 className="font-headline text-xl text-on-surface mb-6">Latest News & Articles</h2>
                {latestNews.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3">newspaper</span>
                    <p className="font-body text-on-surface-variant">No news available at the moment.</p>
                    <Link href="/blog" className="font-label text-sm text-primary hover:underline mt-2 inline-block">Visit Blog &rarr;</Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {latestNews.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/blog/${article.slug}`}
                        className="flex flex-col sm:flex-row gap-4 group bg-surface-container-low rounded-xl p-4 hover:tonal-shadow transition-all"
                      >
                        <div className="w-full sm:w-48 h-36 rounded-lg overflow-hidden flex-shrink-0 relative bg-surface-container">
                          {article.image ? (
                            <Image src={article.image} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl text-on-surface-variant/20">image</span>
                            </div>
                          )}
                          <span className="salt-chip absolute top-2 left-2 text-[9px]">{article.category}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-label text-xs text-on-surface-variant">{article.date}</p>
                          <h3 className="font-headline text-lg text-on-surface group-hover:text-primary transition-colors mt-1">{article.title}</h3>
                          <p className="font-body text-sm text-on-surface-variant mt-2 line-clamp-2">{article.excerpt}</p>
                          <span className="font-label text-sm text-primary mt-3 inline-block">Read More &rarr;</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <div className="text-center mt-8">
                  <Link href="/blog" className="mineral-glow text-on-primary font-label font-semibold px-8 py-3 rounded-xl text-sm">
                    View All Articles
                  </Link>
                </div>
              </div>
            )
          )}

          {/* === SETTINGS === */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Edit Profile */}
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8">
                <h2 className="font-headline text-xl text-on-surface mb-6">Edit Profile</h2>
                <form className="max-w-lg space-y-5">
                  <div>
                    <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Full Name</label>
                    <input
                      type="text"
                      defaultValue={userName}
                      className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Email</label>
                    <input
                      type="email"
                      defaultValue={userEmail}
                      className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="+92-300-000-0000"
                      className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <button type="button" className="mineral-glow text-on-primary font-label font-semibold px-6 py-3 rounded-xl">
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 lg:p-8">
                <h2 className="font-headline text-xl text-on-surface mb-6">Change Password</h2>
                <form className="max-w-lg space-y-5">
                  <div>
                    <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Current Password</label>
                    <input type="password" className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">New Password</label>
                    <input type="password" className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Confirm New Password</label>
                    <input type="password" className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors" />
                  </div>
                  <button type="button" className="mineral-glow text-on-primary font-label font-semibold px-6 py-3 rounded-xl">
                    Update Password
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-surface-container-lowest rounded-xl border border-error/20 p-6 lg:p-8">
                <h2 className="font-headline text-xl text-error mb-2">Danger Zone</h2>
                <p className="font-body text-sm text-on-surface-variant mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="border border-error text-error font-label font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-error hover:text-on-error transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
