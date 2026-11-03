"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductPrice from "@/components/shared/ProductPrice";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string; isPrimary: boolean }[];
  category: { name: string };
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products/featured");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || data || []);
        }
      } catch {
        // fallback silent
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const getImage = (p: Product) => {
    const primary = p.images?.find((img) => img.isPrimary);
    return primary?.url || p.images?.[0]?.url || null;
  };

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant text-center mb-3">
        Our Most Popular Exports
      </p>
      <h2 className="font-headline text-4xl text-center text-on-surface mb-12">
        Bestselling Products
      </h2>

      {loading ? (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6">
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
        <p className="text-center text-on-surface-variant font-body">No featured products yet.</p>
      ) : (
        // Columns rather than a grid: in a grid every cell in a row is as tall
        // as the tallest one, so a card can never be the height of its own
        // photograph. Here each card is as tall as it needs to be and the
        // columns pack themselves.
        <div className="columns-1 sm:columns-2 md:columns-3 gap-6">
          {products.slice(0, 6).map((product) => {
            const imgUrl = getImage(product);
            return (
              <div key={product.id} className="break-inside-avoid mb-6">
                <div className="bg-surface-container-lowest rounded-xl overflow-hidden tonal-shadow group">
                  <Link href={`/products/${product.slug}`} className="relative overflow-hidden block">
                    {imgUrl ? (
                      // Sized by its own file: width/height here only reserve
                      // space before it loads, and `h-auto` hands the box over
                      // to the photograph's real proportions once it has.
                      <Image
                        src={imgUrl}
                        alt={product.name}
                        width={1000}
                        height={1000}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="w-full h-auto group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">image</span>
                      </div>
                    )}
                    <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-[20px] text-primary">favorite</span>
                    </button>
                  </Link>

                  <div className="p-5">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-headline text-xl text-primary hover:text-primary-container transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">
                      {product.category?.name || ""}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                      <ProductPrice price={product.price} />
                      <Link
                        href="/quote"
                        className="mineral-glow px-4 py-2 rounded-lg font-label font-semibold text-xs text-on-primary"
                      >
                        Get a Quote
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center mt-12">
        <Link
          href="/products"
          className="font-label text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
        >
          View All Products &rarr;
        </Link>
      </div>
    </section>
  );
}
