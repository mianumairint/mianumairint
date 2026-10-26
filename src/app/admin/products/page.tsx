"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string | number;
  inventory: number;
  isActive: boolean;
  category: { id: string; name: string } | null;
  images: ProductImage[];
  _count: { reviews: number; variants: number };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      let filtered = data.products as Product[];

      if (categoryFilter) {
        filtered = filtered.filter((p) => p.category?.id === categoryFilter);
      }
      if (statusFilter === "active") {
        filtered = filtered.filter((p) => p.isActive);
      } else if (statusFilter === "draft") {
        filtered = filtered.filter((p) => !p.isActive);
      }

      setProducts(filtered);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchProducts, search]);

  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isActive: !p.isActive } : p
        )
      );
      showToast(`Product ${!product.isActive ? "activated" : "deactivated"}`);
    } catch {
      showToast("Failed to update product status", "error");
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Product deleted successfully");
      fetchProducts();
    } catch {
      showToast("Failed to delete product", "error");
    }
  };


  return (
    <div className="space-y-6">
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
        <h1 className="font-headline text-2xl text-on-surface">Products</h1>
        <Link
          href="/admin/products/new"
          className="mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest font-body text-sm text-on-surface outline-none focus:border-primary transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest font-label text-sm text-on-surface outline-none focus:border-primary transition"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-lowest font-label text-sm text-on-surface outline-none focus:border-primary transition"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-surface-container-low rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container-low rounded w-1/3" />
                  <div className="h-3 bg-surface-container-low rounded w-1/4" />
                </div>
                <div className="h-4 bg-surface-container-low rounded w-16" />
                <div className="h-4 bg-surface-container-low rounded w-16" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">
              inventory_2
            </span>
            <p className="font-label text-sm text-on-surface-variant">
              No products found
            </p>
            <Link
              href="/admin/products/new"
              className="inline-block mt-4 mineral-glow text-on-primary font-label text-sm px-5 py-2.5 rounded-lg"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Image
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  SKU
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition"
                >
                  <td className="px-6 py-3">
                    <div className="w-12 h-12 bg-surface-container-low rounded flex items-center justify-center overflow-hidden">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                          image
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3 font-label text-sm font-medium text-on-surface">
                    {product.name}
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                    {product.sku}
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                    {product.category?.name || "—"}
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`font-label text-sm ${
                        product.inventory <= 5
                          ? "text-red-600 font-bold"
                          : "text-on-surface"
                      }`}
                    >
                      {product.inventory}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        product.isActive ? "bg-primary" : "bg-outline-variant"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          product.isActive ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-1.5 rounded-lg hover:bg-surface-container transition"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                          edit
                        </span>
                      </Link>
                      <button
                        onClick={() => deleteProduct(product)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        <span className="material-symbols-outlined text-red-500 text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="font-label text-sm text-on-surface-variant">
            Showing {products.length} of {total} products
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg font-label text-sm text-on-surface-variant hover:bg-surface-container transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded-lg font-label text-sm transition ${
                  p === page
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg font-label text-sm text-on-surface-variant hover:bg-surface-container transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
