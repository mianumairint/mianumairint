"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cart";

export default function CartSlideOver() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm z-50"
            onClick={closeCart}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="font-headline text-2xl text-on-surface">Your Cart</h2>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-xl hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">
                    shopping_bag
                  </span>
                  <p className="font-headline text-xl text-on-surface mb-2">Your cart is empty</p>
                  <p className="font-body text-sm text-on-surface-variant mb-6">
                    Discover our premium Himalayan salt products
                  </p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="mineral-glow text-on-primary font-label font-semibold text-sm uppercase tracking-wider px-6 py-3 rounded-xl"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-4 bg-surface-container-lowest rounded-xl p-3"
                    >
                      <div className="w-20 h-20 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-outline-variant">
                              image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-headline text-sm text-on-surface truncate">
                          {item.name}
                        </h3>
                        {item.variantLabel && (
                          <p className="font-label text-xs text-on-surface-variant mt-0.5">
                            {item.variantLabel}
                          </p>
                        )}
                        <p className="font-headline text-sm text-primary mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variantId)
                            }
                            className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">remove</span>
                          </button>
                          <span className="font-label text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variantId)
                            }
                            className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">add</span>
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="ml-auto p-1 text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-body text-on-surface-variant">Subtotal</span>
                  <span className="font-headline text-xl text-on-surface">
                    ${subtotal().toFixed(2)}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full text-center mineral-glow text-on-primary font-label font-semibold text-sm uppercase tracking-wider py-3.5 rounded-xl"
                >
                  Checkout
                </Link>
                <button
                  onClick={closeCart}
                  className="block w-full text-center font-body text-sm text-on-surface-variant hover:text-primary transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
