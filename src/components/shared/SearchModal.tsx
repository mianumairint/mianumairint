"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/ui";

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      closeSearch();
      setQuery("");
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-50 flex items-start justify-center pt-[20vh]"
          onClick={closeSearch}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl mx-4 bg-surface-container-lowest rounded-2xl tonal-shadow overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent font-body text-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={closeSearch}
                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                  close
                </span>
              </button>
            </form>
            <div className="px-4 pb-4">
              <p className="font-label text-xs text-on-surface-variant">
                Press Enter to search products
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
