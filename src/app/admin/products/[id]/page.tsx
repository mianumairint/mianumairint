"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import ImageUploader, { ImageEntry } from "@/components/admin/ImageUploader";

interface Category {
  id: string;
  name: string;
}

interface VariantEntry {
  id?: string;
  label: string;
  sku: string;
  price: string;
  inventory: string;
  isActive: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Product fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [inventory, setInventory] = useState("0");
  const [lowStockAlert, setLowStockAlert] = useState("5");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [isActive, setIsActive] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);

  // Images
  const [images, setImages] = useState<ImageEntry[]>([]);

  // Variants
  const [variants, setVariants] = useState<VariantEntry[]>([]);

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch product and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${productId}`),
          fetch("/api/categories"),
        ]);

        if (!productRes.ok) throw new Error("Product not found");

        const { product } = await productRes.json();
        const { categories: cats } = await catRes.json();

        setCategories(cats || []);

        // Populate fields
        setName(product.name || "");
        setSlug(product.slug || "");
        setSku(product.sku || "");
        setDescription(product.description || "");
        setShortDesc(product.shortDesc || "");
        setPrice(String(product.price || ""));
        setComparePrice(product.comparePrice ? String(product.comparePrice) : "");
        setCategoryId(product.categoryId || "");
        setInventory(String(product.inventory ?? 0));
        setLowStockAlert(String(product.lowStockAlert ?? 5));
        setWeight(product.weight ? String(product.weight) : "");
        setWeightUnit(product.weightUnit || "kg");
        setIsActive(product.isActive ?? false);
        setIsFeatured(product.isFeatured ?? false);
        setIsBestSeller(product.isBestSeller ?? false);
        setIsNewArrival(product.isNewArrival ?? false);
        setMetaTitle(product.metaTitle || "");
        setMetaDesc(product.metaDesc || "");

        if (product.images?.length) {
          // Order lives in the array from here on, so the stored sortOrder is
          // applied once on the way in rather than carried around.
          setImages(
            [...product.images]
              .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((img: any) => ({
                url: img.url,
                altText: img.altText || "",
                isPrimary: img.isPrimary,
              }))
          );
        }

        if (product.variants?.length) {
          setVariants(
            product.variants.map((v: any) => ({
              id: v.id,
              label: v.label,
              sku: v.sku,
              price: v.price ? String(v.price) : "",
              inventory: String(v.inventory ?? 0),
              isActive: v.isActive ?? true,
            }))
          );
        }

        if (product.tags?.length) {
          setTags(product.tags.map((t: any) => t.tag || t.name || ""));
        }
      } catch {
        showToast("Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Variant helpers
  const addVariant = () => {
    setVariants([
      ...variants,
      { label: "", sku: "", price: "", inventory: "0", isActive: true },
    ]);
  };

  const updateVariant = (index: number, field: keyof VariantEntry, value: string | boolean) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Tag helpers
  const addTag = () => {
    const val = tagInput.trim().toLowerCase();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!price.trim() || isNaN(Number(price))) errs.price = "Valid price is required";
    if (!categoryId) errs.categoryId = "Category is required";
    if (!sku.trim()) errs.sku = "SKU is required";
    if (!description.trim()) errs.description = "Description is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const body: any = {
        name: name.trim(),
        slug: slug || generateSlug(name),
        sku: sku.trim(),
        description: description.trim(),
        shortDesc: shortDesc.trim() || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        categoryId,
        inventory: parseInt(inventory) || 0,
        lowStockAlert: parseInt(lowStockAlert) || 5,
        weight: weight ? parseFloat(weight) : null,
        weightUnit,
        isActive,
        isFeatured,
        isBestSeller,
        isNewArrival,
        metaTitle: metaTitle.trim() || null,
        metaDesc: metaDesc.trim() || null,
      };

      if (images.length > 0) {
        body.images = images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || name,
          isPrimary: img.isPrimary,
          sortOrder: idx,
        }));
      }

      if (variants.length > 0) {
        body.variants = variants
          .filter((v) => v.label.trim() && v.sku.trim())
          .map((v) => ({
            label: v.label.trim(),
            sku: v.sku.trim(),
            price: v.price ? parseFloat(v.price) : null,
            inventory: parseInt(v.inventory) || 0,
            isActive: v.isActive,
          }));
      }

      if (tags.length > 0) {
        body.tags = tags;
      }

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update product");
      }

      showToast("Product updated successfully");
    } catch (err: any) {
      setErrors({ submit: err.message || "Failed to update product" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/admin/products");
    } catch {
      showToast("Failed to delete product", "error");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-surface-container-low rounded animate-pulse" />
          <div className="h-5 w-32 bg-surface-container-low rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {[200, 300, 120].map((h, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-xl tonal-shadow animate-pulse"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {[160, 120, 160, 120].map((h, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-xl tonal-shadow animate-pulse"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl tonal-shadow font-label text-sm ${
            toast.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl text-on-surface">Edit Product</h1>
        <Link
          href="/admin/products"
          className="font-label text-sm text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Products
        </Link>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl font-label text-sm">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Product Name */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
            <input
              type="text"
              placeholder="Product Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full font-headline text-2xl text-on-surface placeholder:text-on-surface-variant/40 outline-none bg-transparent border-b pb-2 transition ${
                errors.name ? "border-red-400" : "border-outline-variant/30 focus:border-primary"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 font-label text-xs mt-1">{errors.name}</p>
            )}
            <div className="mt-3">
              <label className="font-label text-xs text-on-surface-variant block mb-1">
                SKU *
              </label>
              <input
                type="text"
                placeholder="e.g. PHS-FG-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border bg-transparent font-body text-sm outline-none transition ${
                  errors.sku ? "border-red-400" : "border-outline-variant/30 focus:border-primary"
                }`}
              />
              {errors.sku && (
                <p className="text-red-500 font-label text-xs mt-1">{errors.sku}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
            <label className="font-label text-sm font-medium text-on-surface">
              Description *
            </label>
            <textarea
              rows={8}
              placeholder="Full product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none bg-surface-container-low rounded-lg p-4 resize-y transition ${
                errors.description ? "ring-1 ring-red-400" : "focus:ring-1 focus:ring-primary"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 font-label text-xs">{errors.description}</p>
            )}
          </div>

          {/* Short Description */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
            <label className="font-label text-sm font-medium text-on-surface">
              Short Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief product summary for listings..."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full font-body text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none bg-surface-container-low rounded-lg p-4 resize-y focus:ring-1 focus:ring-primary transition"
            />
          </div>

          {/* Images */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
            <label className="font-label text-sm font-medium text-on-surface">
              Images
            </label>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          {/* Variants */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-label text-sm font-medium text-on-surface">
                Variants
              </label>
              <button
                type="button"
                onClick={addVariant}
                className="font-label text-sm text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Variant
              </button>
            </div>
            {variants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant/30">
                      <th className="text-left py-2 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                        Label
                      </th>
                      <th className="text-left py-2 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="text-left py-2 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-left py-2 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                        Inventory
                      </th>
                      <th className="text-left py-2 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                        Active
                      </th>
                      <th className="py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, i) => (
                      <tr key={i} className="border-t border-outline-variant/20">
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            value={v.label}
                            onChange={(e) => updateVariant(i, "label", e.target.value)}
                            placeholder="e.g. 500g Bag"
                            className="w-full px-3 py-1.5 rounded border border-outline-variant/30 font-body text-sm bg-transparent outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => updateVariant(i, "sku", e.target.value)}
                            placeholder="SKU"
                            className="w-full px-3 py-1.5 rounded border border-outline-variant/30 font-body text-sm bg-transparent outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            value={v.price}
                            onChange={(e) => updateVariant(i, "price", e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-1.5 rounded border border-outline-variant/30 font-body text-sm bg-transparent outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            value={v.inventory}
                            onChange={(e) => updateVariant(i, "inventory", e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-1.5 rounded border border-outline-variant/30 font-body text-sm bg-transparent outline-none focus:border-primary"
                          />
                        </td>
                        <td className="py-2 pr-3">
                          <button
                            type="button"
                            onClick={() => updateVariant(i, "isActive", !v.isActive)}
                            className={`w-9 h-5 rounded-full transition relative ${
                              v.isActive ? "bg-primary" : "bg-outline-variant"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                v.isActive ? "translate-x-4" : ""
                              }`}
                            />
                          </button>
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => removeVariant(i)}
                            className="p-1 rounded hover:bg-red-50 transition"
                          >
                            <span className="material-symbols-outlined text-red-500 text-[16px]">
                              close
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {variants.length === 0 && (
              <p className="font-body text-sm text-on-surface-variant/60">
                No variants. Click &quot;Add Variant&quot; to create size or weight options.
              </p>
            )}
          </div>

          {/* SEO */}
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
            <button
              type="button"
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between p-6"
            >
              <span className="font-label text-sm font-medium text-on-surface">
                SEO Settings
              </span>
              <span className="material-symbols-outlined text-on-surface-variant">
                {seoOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            {seoOpen && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="font-label text-xs text-on-surface-variant block mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-label text-xs text-on-surface-variant block mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary resize-y"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Sticky) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Publish Card */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-4">
              <h3 className="font-label text-sm font-medium text-on-surface">
                Publish
              </h3>
              <div className="flex items-center justify-between">
                <span className="font-label text-sm text-on-surface-variant">
                  {isActive ? "Active" : "Draft"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative w-11 h-6 rounded-full transition ${
                    isActive ? "bg-primary" : "bg-outline-variant"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      isActive ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 mineral-glow text-on-primary font-label text-sm px-4 py-2.5 rounded-lg disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Update Product"}
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
              <label className="font-label text-sm font-medium text-on-surface">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border bg-transparent font-body text-sm outline-none transition ${
                  errors.categoryId ? "border-red-400" : "border-outline-variant/30 focus:border-primary"
                }`}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-500 font-label text-xs">{errors.categoryId}</p>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
              <h3 className="font-label text-sm font-medium text-on-surface">
                Pricing
              </h3>
              <div>
                <label className="font-label text-xs text-on-surface-variant block mb-1">
                  Price ($) *
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-transparent font-body text-sm outline-none transition ${
                    errors.price ? "border-red-400" : "border-outline-variant/30 focus:border-primary"
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 font-label text-xs mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="font-label text-xs text-on-surface-variant block mb-1">
                  Compare Price ($)
                </label>
                <input
                  type="text"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
              <h3 className="font-label text-sm font-medium text-on-surface">
                Inventory
              </h3>
              <div>
                <label className="font-label text-xs text-on-surface-variant block mb-1">
                  Stock Count
                </label>
                <input
                  type="number"
                  value={inventory}
                  onChange={(e) => setInventory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label text-xs text-on-surface-variant block mb-1">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  value={lowStockAlert}
                  onChange={(e) => setLowStockAlert(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Weight */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
              <h3 className="font-label text-sm font-medium text-on-surface">
                Weight
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-transparent font-label text-sm outline-none focus:border-primary"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </select>
              </div>
            </div>

            {/* Product Flags */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
              <h3 className="font-label text-sm font-medium text-on-surface">
                Product Flags
              </h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant accent-primary"
                />
                <span className="font-label text-sm text-on-surface">Featured</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant accent-primary"
                />
                <span className="font-label text-sm text-on-surface">Best Seller</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant accent-primary"
                />
                <span className="font-label text-sm text-on-surface">New Arrival</span>
              </label>
            </div>

            {/* Tags */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3">
              <h3 className="font-label text-sm font-medium text-on-surface">
                Tags
              </h3>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className="salt-chip flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-primary"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-label text-sm hover:bg-primary/20 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 space-y-3 border border-red-200/50">
              <h3 className="font-label text-sm font-medium text-red-600">
                Danger Zone
              </h3>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="w-full px-4 py-2.5 rounded-lg border border-red-300 text-red-600 font-label text-sm hover:bg-red-50 transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
