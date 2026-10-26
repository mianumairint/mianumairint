"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().min(6, "Phone number is required"),
  streetAddress: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State / Province is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  paymentMethod: z.enum(["bank-transfer", "cod", "whatsapp"]),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const paymentOptions = [
  { value: "cod" as const, label: "Cash on Delivery", icon: "local_shipping" },
  { value: "bank-transfer" as const, label: "Bank Transfer", icon: "account_balance" },
  { value: "whatsapp" as const, label: "WhatsApp Order", icon: "chat" },
];

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const cartItems = useCartStore((s) => s.items);
  const subtotalFn = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { paymentMethod: "cod" as const },
  });

  const selectedPayment = watch("paymentMethod");
  const subtotal = subtotalFn();
  const shipping = cartItems.length > 0 ? 15.0 : 0;
  const total = subtotal + shipping;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            street: data.streetAddress,
            city: data.city,
            state: data.state,
            country: data.country,
            postalCode: data.postalCode,
          },
          paymentMethod: data.paymentMethod,
          shippingCost: shipping,
          notes: data.notes,
          guestEmail: data.email,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to place order");
      }

      const result = await res.json();
      const orderNum = result.order?.orderNumber || "";
      router.push(`/checkout/success?order=${orderNum}`);
      // Clear cart after redirect starts (small delay to prevent re-render showing empty cart)
      setTimeout(() => clearCart(), 500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors";

  if (cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="font-headline text-4xl text-primary mb-10">Review &amp; Finalize</h1>
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">shopping_cart</span>
          <h2 className="font-headline text-2xl text-on-surface mb-2">Your cart is empty</h2>
          <p className="font-body text-on-surface-variant mb-6">Add some products before proceeding to checkout.</p>
          <Link href="/products" className="mineral-glow text-on-primary font-label font-semibold px-8 py-3.5 rounded-xl inline-block">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="font-headline text-4xl text-primary mb-10">Review &amp; Finalize</h1>

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Billing Details */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl tonal-shadow p-8">
          <h2 className="font-headline text-xl text-on-surface mb-8">Billing Details</h2>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
            <div className="sm:col-span-2">
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Full Name</label>
              <input type="text" {...register("fullName")} className={inputClass} placeholder="Your full name" />
              {errors.fullName && <p className="mt-1 text-xs text-error font-label">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Email</label>
              <input type="email" {...register("email")} className={inputClass} placeholder="you@example.com" />
              {errors.email && <p className="mt-1 text-xs text-error font-label">{errors.email.message}</p>}
            </div>

            <div>
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Phone</label>
              <input type="tel" {...register("phone")} className={inputClass} placeholder="+92 300 1234567" />
              {errors.phone && <p className="mt-1 text-xs text-error font-label">{errors.phone.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Street Address</label>
              <input type="text" {...register("streetAddress")} className={inputClass} placeholder="123 Salt Mine Road" />
              {errors.streetAddress && <p className="mt-1 text-xs text-error font-label">{errors.streetAddress.message}</p>}
            </div>

            <div>
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">City</label>
              <input type="text" {...register("city")} className={inputClass} placeholder="Lahore" />
              {errors.city && <p className="mt-1 text-xs text-error font-label">{errors.city.message}</p>}
            </div>

            <div>
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">State / Province</label>
              <input type="text" {...register("state")} className={inputClass} placeholder="Punjab" />
              {errors.state && <p className="mt-1 text-xs text-error font-label">{errors.state.message}</p>}
            </div>

            <div>
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Country</label>
              <input type="text" {...register("country")} className={inputClass} placeholder="Pakistan" />
              {errors.country && <p className="mt-1 text-xs text-error font-label">{errors.country.message}</p>}
            </div>

            <div>
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Postal Code</label>
              <input type="text" {...register("postalCode")} className={inputClass} placeholder="54000" />
              {errors.postalCode && <p className="mt-1 text-xs text-error font-label">{errors.postalCode.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Order Notes <span className="normal-case tracking-normal">(optional)</span></label>
              <textarea {...register("notes")} rows={2} className={inputClass} placeholder="Any special instructions..." />
            </div>
          </div>

          {/* Payment Method */}
          <h3 className="font-headline text-lg text-on-surface mt-10 mb-4">Payment Method</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {paymentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("paymentMethod", opt.value)}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl font-label text-xs transition-all ${
                  selectedPayment === opt.value
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {selectedPayment === "bank-transfer" && (
            <div className="mt-4 bg-surface-container-low rounded-lg p-4">
              <p className="font-label text-xs text-on-surface-variant font-semibold mb-1">Bank Transfer Details</p>
              <p className="font-body text-xs text-on-surface-variant">
                After placing your order, transfer the amount to our bank account. Order will be confirmed after payment verification.
              </p>
            </div>
          )}

          {selectedPayment === "cod" && (
            <div className="mt-4 bg-surface-container-low rounded-lg p-4">
              <p className="font-label text-xs text-on-surface-variant font-semibold mb-1">Cash on Delivery</p>
              <p className="font-body text-xs text-on-surface-variant">
                Pay in cash when your order is delivered. Available for domestic orders only.
              </p>
            </div>
          )}

          {selectedPayment === "whatsapp" && (
            <div className="mt-4 bg-green-50 rounded-lg p-4">
              <p className="font-label text-xs text-green-800 font-semibold mb-1">
                <span className="material-symbols-outlined text-[14px] align-middle mr-1">chat</span>
                WhatsApp Order
              </p>
              <p className="font-body text-xs text-green-700">
                After placing your order, our team will contact you on WhatsApp to confirm details and arrange payment. Quick response within 30 minutes.
              </p>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-8 lg:sticky lg:top-28">
            <h2 className="font-headline text-xl text-on-surface mb-6">Order Summary</h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? ""}`} className="bg-surface-container-low rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-label text-sm text-on-surface font-medium truncate">{item.name}</p>
                      {item.variantLabel && (
                        <p className="font-label text-[11px] text-on-surface-variant/60">{item.variantLabel}</p>
                      )}
                      <p className="font-label text-xs text-on-surface-variant mt-0.5">${item.price.toFixed(2)} each</p>
                    </div>
                    <span className="font-headline text-sm text-primary font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        className="w-7 h-7 rounded bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="font-label text-sm w-6 text-center font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        className="w-7 h-7 rounded bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      title="Remove item"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-outline-variant/30 space-y-3">
              <div className="flex justify-between font-label text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-on-surface">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-label text-sm">
                <span className="text-on-surface-variant">Shipping</span>
                <span className="text-on-surface">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-label text-base font-bold pt-3 border-t border-outline-variant/30">
                <span className="text-on-surface">Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 mineral-glow text-on-primary font-label font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing Order...
                </span>
              ) : (
                `Confirm Order — $${total.toFixed(2)}`
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span className="font-label text-xs">Secure payment — your data is encrypted</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
