"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart";
import ProductPrice from "@/components/shared/ProductPrice";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  category: { name: string; slug: string };
  images: { url: string; isPrimary: boolean }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
  { label: "Best Selling", value: "bestselling" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams();
        if (activeCategory) params.set("category", activeCategory);
        if (sort !== "featured") params.set("sort", sort);
        params.set("page", String(pageNum));
        params.set("limit", "12");

        const res = await fetch(`/api/products?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (append) {
            setProducts((prev) => [...prev, ...(data.products || [])]);
          } else {
            setProducts(data.products || []);
          }
          setTotalPages(data.totalPages || 1);
          setPage(pageNum);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, sort]
  );

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : data.categories || []))
      .catch(() => {});
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const getImage = (p: Product) => {
    const primary = p.images?.find((img) => img.isPrimary);
    return primary?.url || p.images?.[0]?.url || null;
  };

  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: p.id,
      name: p.name,
      price: Number(p.price),
      image: getImage(p) || "",
      quantity: 1,
      slug: p.slug,
    });
  };

  const handleLoadMore = () => {
    if (page < totalPages) fetchProducts(page + 1, true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Hero */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
          Himalayan Salt Products for Every Need
        </p>
        <h1 className="font-headline text-5xl lg:text-6xl text-primary mb-6">Our Complete Collection</h1>
        <p className="font-body text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          From hand-carved salt lamps to culinary-grade pink salt and therapeutic inhalers, explore our
          full range of premium Himalayan salt products sourced directly from the Khewra mines.
        </p>
      </section>

      {/* Sticky Filter Bar — offset to clear the floating header. */}
      <div className="sticky top-[88px] z-40 bg-surface/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Fifteen categories do not fit on one line. They used to scroll
              sideways behind a fade, which hid the last few behind the sort
              control with nothing to say they were there. From `sm` up they
              wrap instead, so every category is on screen; on a phone, where
              wrapping would push the grid off the bottom of a sticky bar, they
              still scroll. */}
          <div className="relative flex-1 min-w-0">
            <div className="overflow-x-auto hide-scrollbar sm:overflow-visible">
              <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
              <button
                onClick={() => setActiveCategory("")}
                className={`px-4 py-2 rounded-full font-label text-xs font-medium whitespace-nowrap transition-colors ${
                  !activeCategory
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full font-label text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-secondary-container text-on-secondary-container"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              </div>
            </div>
            {/* Only while the row is still a scroller. */}
            <div className="sm:hidden pointer-events-none absolute right-0 inset-y-0 w-10 bg-gradient-to-l from-surface to-transparent" />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-surface-container-low rounded-lg px-3 py-2 font-label text-xs text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[160px] shrink-0 self-start"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="break-inside-avoid mb-6 bg-surface-container-lowest rounded-xl overflow-hidden tonal-shadow animate-pulse">
                <div className="aspect-square bg-surface-container" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-surface-container rounded w-3/4" />
                  <div className="h-3 bg-surface-container rounded w-1/2" />
                  <div className="h-4 bg-surface-container rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">inventory_2</span>
            <p className="font-headline text-xl text-on-surface mb-2">No products found</p>
            <p className="font-body text-sm text-on-surface-variant">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          // Columns rather than a grid: in a grid every cell in a row is as
          // tall as the tallest one, so a card can never be the height of its
          // own photograph. Here each card is as tall as it needs to be and the
          // columns pack themselves.
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {products.map((product) => {
              const imgUrl = getImage(product);
              return (
                <div key={product.id} className="break-inside-avoid mb-6">
                  <Link href={`/products/${product.slug}`} className="block group">
                    <div className="bg-surface-container-lowest rounded-xl overflow-hidden tonal-shadow">
                      <div className="relative overflow-hidden">
                        {imgUrl ? (
                          // Sized by its own file: width/height here only
                          // reserve space before it loads, and `h-auto` hands
                          // the box over to the photograph's real proportions
                          // once it has.
                          <Image
                            src={imgUrl}
                            alt={product.name}
                            width={1000}
                            height={1000}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="w-full h-auto group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-surface-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">image</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="absolute bottom-4 right-4 w-10 h-10 rounded-full mineral-glow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[20px] text-on-primary">add_shopping_cart</span>
                        </button>
                      </div>
                      <div className="p-5">
                        <h3 className="font-headline text-xl text-primary">{product.name}</h3>
                        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">
                          {product.category?.name || ""}
                        </p>
                        <div className="flex items-center gap-2 pt-3">
                          <ProductPrice price={product.price} comparePrice={product.comparePrice} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {!loading && page < totalPages && (
          <div className="text-center mt-16">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="mineral-glow px-8 py-3 rounded-xl font-label font-semibold text-sm text-on-primary disabled:opacity-60"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                "Load More Products"
              )}
            </button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <p className="text-center mt-4 font-label text-xs text-on-surface-variant">
            Showing {products.length} products
          </p>
        )}
      </section>
    </motion.div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 px-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-surface-container rounded w-64 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden tonal-shadow">
                <div className="aspect-square bg-surface-container" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-surface-container rounded w-3/4" />
                  <div className="h-3 bg-surface-container rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
