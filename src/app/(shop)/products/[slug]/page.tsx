"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import ProductPrice, { isQuoteOnly } from "@/components/shared/ProductPrice";
import { formatPrice } from "@/lib/format";

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

interface Variant {
  id: string;
  label: string;
  sku: string;
  price: number | null;
  inventory: number;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDesc: string | null;
  price: number;
  comparePrice: number | null;
  category: { id: string; name: string; slug: string };
  images: ProductImage[];
  variants: Variant[];
  tags: { tag: string }[];
  avgRating: number;
  reviewCount: number;
  inventory: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: { name: string };
  images: ProductImage[];
}

const tabs = ["Overview", "Benefits", "Specifications", "Shipping Info"];

const tabContent: Record<string, string> = {
  Overview:
    "Our premium Himalayan salt products are hand-mined from the ancient Khewra Salt Mines in Pakistan, formed over 250 million years ago. Each product retains its natural mineral composition, containing 84+ trace minerals including iron, magnesium, potassium, and calcium that give it the characteristic pink hue.",
  Benefits:
    "Himalayan salt is known for its rich mineral content and potential health benefits. It may help balance electrolytes, support hydration, improve respiratory health, and promote better sleep. Salt lamps are believed to purify indoor air by releasing negative ions.",
  Specifications:
    "Origin: Khewra Salt Mines, Punjab, Pakistan. Mineral Content: 84+ trace minerals. Certifications: ISO 9001, HACCP, Halal Certified. Packaging: Eco-friendly recyclable materials. Shelf Life: Indefinite when stored properly.",
  // Deliberately no delivery times, no free-shipping threshold and no country
  // count. Every one of those was invented, and on an export order the real
  // answer depends on the port, the volume and the Incoterms -- so the tab
  // sends the buyer to the people who can actually quote it.
  "Shipping Info":
    "Shipping is quoted per order. Freight, lead time and Incoterms depend on your destination port, the quantity and the packing you need, so our export team works them out with you directly. Contact us with your requirement and we will come back with the full shipping arrangement.",
};

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Overview");
  const [mainImage, setMainImage] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        if (res.ok) {
          const data = await res.json();
          const p = data.product || data;
          setProduct(p);
          // Set main image
          const primary = p.images?.find((img: ProductImage) => img.isPrimary);
          setMainImage(primary?.url || p.images?.[0]?.url || null);
          // Set default variant
          if (p.variants?.length > 0) {
            setSelectedVariant(p.variants[0]);
          }
          // Fetch related products from same category
          const relRes = await fetch(`/api/products?category=${p.category?.slug}&limit=4`);
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelated(
              (relData.products || []).filter((rp: RelatedProduct) => rp.id !== p.id).slice(0, 3)
            );
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const price = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price);
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      variantLabel: selectedVariant?.label,
      name: product.name,
      price,
      image: mainImage || "",
      quantity,
      slug: product.slug,
    });
  };

  const getImage = (p: RelatedProduct) => {
    const primary = p.images?.find((img) => img.isPrimary);
    return primary?.url || p.images?.[0]?.url || null;
  };

  const currentPrice = selectedVariant?.price ? Number(selectedVariant.price) : product ? Number(product.price) : 0;

  if (loading) {
    return (
      <div className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-7">
            <div className="aspect-square bg-surface-container rounded-xl" />
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="aspect-square bg-surface-container rounded-lg" />
              <div className="aspect-square bg-surface-container rounded-lg" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-surface-container rounded w-48" />
            <div className="h-10 bg-surface-container rounded w-3/4" />
            <div className="h-6 bg-surface-container rounded w-32" />
            <div className="h-8 bg-surface-container rounded w-24" />
            <div className="h-20 bg-surface-container rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">inventory_2</span>
        <h1 className="font-headline text-2xl text-on-surface mb-2">Product Not Found</h1>
        <Link href="/products" className="font-label text-sm text-primary hover:underline">Browse All Products &rarr;</Link>
      </div>
    );
  }

  const allImages = product.images || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left — Image Gallery */}
          <div className="lg:col-span-7">
            {/* Main Image. The one place a photograph is NOT cropped: on the
                grid a card has to match its neighbours, but here the buyer is
                looking at the product itself and wants all of it. */}
            <div className="aspect-square bg-surface-container-lowest rounded-xl overflow-hidden relative tonal-shadow">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                  className="object-contain p-6 hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-container-low">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">image</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {allImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setMainImage(img.url)}
                    className={`aspect-square rounded-lg overflow-hidden relative transition-all ${
                      mainImage === img.url ? "ring-2 ring-primary" : "ring-1 ring-outline-variant/20 hover:ring-primary/40"
                    }`}
                  >
                    <Image src={img.url} alt={img.altText || product.name} fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* A product with a single photo shows no thumbnail strip. There
                used to be two empty tiles here holding the layout open, but an
                empty tile with an image glyph in it reads as a photo that
                failed to load, not as deliberate spacing. */}
          </div>

          {/* Right — Product Info */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            {/* Breadcrumb */}
            <nav className="font-label text-xs text-on-surface-variant flex items-center gap-1 flex-wrap">
              <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
              <span>/</span>
              <Link href={`/products?category=${product.category?.slug}`} className="hover:text-primary transition-colors">
                {product.category?.name}
              </Link>
              <span>/</span>
              <span className="text-on-surface">{product.name}</span>
            </nav>

            <h1 className="font-headline text-3xl lg:text-4xl text-primary mt-4 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined text-base text-amber-500"
                    style={{ fontVariationSettings: `'FILL' ${star <= Math.round(Number(product.avgRating)) ? 1 : 0}` }}>
                    star
                  </span>
                ))}
              </div>
              <span className="font-label text-xs text-on-surface-variant">
                {Number(product.avgRating).toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <ProductPrice price={currentPrice} comparePrice={product.comparePrice} size="lg" />
            </div>

            {/* Short Description */}
            {product.shortDesc && (
              <p className="font-body text-on-surface-variant leading-relaxed mt-4">{product.shortDesc}</p>
            )}

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">Size / Variant</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.filter(v => v.isActive).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-lg font-label text-xs font-medium transition-all ${
                        selectedVariant?.id === v.id
                          ? "ring-2 ring-primary bg-primary/5 text-primary"
                          : "ring-1 ring-outline-variant/40 text-on-surface-variant hover:ring-primary/40"
                      }`}
                    >
                      {v.label}
                      {v.price && <span className="ml-1 text-on-surface-variant/60">${Number(v.price).toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <span className="font-headline text-lg text-on-surface w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            {/* A product with no public price cannot be added to a basket --
                doing so would build a $0.00 order -- so the quote link becomes
                the only, and primary, call to action. */}
            <div className="mt-8 flex flex-col gap-3">
              {!isQuoteOnly(currentPrice) && (
                <button onClick={handleAddToCart} className="mineral-glow w-full py-4 rounded-xl font-label font-semibold text-sm text-on-primary">
                  Add to Cart — {formatPrice(currentPrice * quantity)}
                </button>
              )}
              <Link
                href="/quote"
                className={
                  isQuoteOnly(currentPrice)
                    ? "mineral-glow w-full py-4 rounded-xl font-label font-semibold text-sm text-on-primary text-center"
                    : "border border-outline-variant/40 text-primary w-full py-4 rounded-xl font-label font-semibold text-sm hover:bg-primary/5 transition-colors text-center"
                }
              >
                Request Bulk Quote
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-col gap-2.5">
              {["100% Pure Himalayan Salt", "Direct from Khewra Mines", "ISO & Halal Certified"].map((badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-label text-xs text-on-surface-variant">{badge}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span key={t.tag} className="salt-chip">{t.tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="flex gap-8 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-3 font-label text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? "border-b-2 border-primary text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-6 max-w-3xl">
          {activeTab === "Overview" && product.description ? (
            <div className="font-body text-on-surface-variant leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }} />
          ) : (
            <p className="font-body text-on-surface-variant leading-relaxed">{tabContent[activeTab]}</p>
          )}

          {/* The shipping answer is a conversation, so this tab ends with the
              way to start one rather than leaving the reader to go looking. */}
          {activeTab === "Shipping Info" && (
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                href="/quote"
                className="mineral-glow text-on-primary font-label text-xs uppercase tracking-widest px-6 py-3 rounded-full"
              >
                Request a Shipping Quote
              </Link>
              <a
                href="https://wa.me/14372259136"
                target="_blank"
                rel="noopener noreferrer"
                className="salt-chip inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">chat</span>
                Ask on WhatsApp
              </a>
              <Link
                href="/contact"
                className="font-label text-xs uppercase tracking-widest text-primary hover:underline px-2"
              >
                Contact Us
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="py-12 px-6 max-w-7xl mx-auto bg-surface-container-low rounded-3xl mb-8">
          <h2 className="font-headline text-2xl text-on-surface mb-8 px-2">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
            {related.map((rp) => {
              const rpImg = getImage(rp);
              return (
                <Link key={rp.id} href={`/products/${rp.slug}`} className="block group">
                  <div className="bg-surface-container-lowest rounded-xl overflow-hidden tonal-shadow h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden">
                      {rpImg ? (
                        <Image src={rpImg} alt={rp.name} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-headline text-lg text-primary group-hover:underline">{rp.name}</h3>
                      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">{rp.category?.name}</p>
                      <p className="font-headline text-base text-primary mt-auto pt-2">${Number(rp.price).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}
