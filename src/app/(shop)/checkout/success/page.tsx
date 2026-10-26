"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";

  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>

      <h1 className="font-headline text-3xl lg:text-4xl text-on-surface mb-3">
        Order Placed Successfully!
      </h1>

      {orderNumber && (
        <p className="font-label text-lg text-primary font-semibold mb-2">
          Order #{orderNumber}
        </p>
      )}

      <p className="font-body text-on-surface-variant leading-relaxed mb-8 max-w-md mx-auto">
        Thank you for your order! We have received your order and will process it shortly.
        You will receive a confirmation email with your order details.
      </p>

      <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6 mb-8 max-w-sm mx-auto">
        <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">What happens next?</h3>
        <div className="space-y-3 text-left">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">mail</span>
            <p className="font-body text-sm text-on-surface-variant">Confirmation email sent to your inbox</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">inventory_2</span>
            <p className="font-body text-sm text-on-surface-variant">Our team will prepare your order</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">local_shipping</span>
            <p className="font-body text-sm text-on-surface-variant">You&apos;ll receive tracking info when shipped</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/products" className="mineral-glow text-on-primary font-label font-semibold px-8 py-3.5 rounded-xl">
          Continue Shopping
        </Link>
        <Link href="/account" className="border border-outline-variant/40 text-primary font-label font-semibold px-8 py-3.5 rounded-xl hover:bg-surface-container transition-colors">
          View My Orders
        </Link>
      </div>

      {/* WhatsApp Support */}
      <div className="mt-10 pt-6 border-t border-outline-variant/30">
        <p className="font-label text-xs text-on-surface-variant mb-3">Need help with your order?</p>
        <a
          href="https://wa.me/923207550055"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full font-label text-sm font-semibold hover:brightness-110 transition-all"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-surface-container" />
          <div className="h-8 bg-surface-container rounded w-64 mx-auto" />
          <div className="h-4 bg-surface-container rounded w-48 mx-auto" />
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
