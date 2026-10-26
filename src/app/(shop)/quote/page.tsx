"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

/* ── Zod Schema ───────────────────────────────────────────── */

const productRowSchema = z.object({
  product: z.string().min(1, "Select a product"),
  quantity: z.number().min(1, "Enter quantity"),
  unit: z.enum(["kg", "pieces", "cartons"]),
});

const quoteSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().optional(),
  products: z.array(productRowSchema).min(1, "Add at least one product"),
  packaging: z.enum([
    "standard",
    "custom-branding",
    "private-label",
    "no-preference",
  ]),
  message: z.string().optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

/* ── Static Options ──────────────────────────────────────── */

const fallbackProductOptions = [
  "Natural Himalayan Salt Lamp",
  "Fine Grain Pink Salt",
  "Coarse Pink Salt",
  "Extra Coarse Pink Salt",
  "Black Salt Fine Powder",
  "Black Salt Coarse",
  "Pink Salt Tiles",
  "Pink Salt Bricks",
  "Salt Candle Holder",
  "Salt Crystal Bowl",
  "Salt Shot Glasses",
  "Himalayan Salt Grinder",
  "Bulk Sack 25kg",
  "Animal Lick Salt Block",
  "Himalayan Salt Inhaler",
  "Other",
];

const packagingOptions = [
  { value: "standard" as const, label: "Standard" },
  { value: "custom-branding" as const, label: "Custom Branding" },
  { value: "private-label" as const, label: "Private Label" },
  { value: "no-preference" as const, label: "No Preference" },
];

/* ── Input Component ──────────────────────────────────────── */

function InputField({
  label,
  error,
  ...props
}: {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-3 font-body text-on-surface outline-none transition-colors"
      />
      {error && (
        <p className="text-error text-xs mt-1 font-label">{error}</p>
      )}
    </div>
  );
}

/* ── Page Component ───────────────────────────────────────── */

export default function QuotePage() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      products: [{ product: "", quantity: 1, unit: "kg" }],
      packaging: "no-preference",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [productOptions, setProductOptions] = useState<string[]>(fallbackProductOptions);
  const [productsLoading, setProductsLoading] = useState(true);

  /* ── Fetch product names from API ── */
  useEffect(() => {
    setProductsLoading(true);
    fetch("/api/products?limit=100")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        const products = data.products ?? (Array.isArray(data) ? data : []);
        if (products.length > 0) {
          const names: string[] = products
            .map((p: Record<string, unknown>) => (p.name as string) || (p.title as string) || "")
            .filter((n: string) => n.length > 0);
          if (names.length > 0) {
            setProductOptions([...names, "Other"]);
          }
        }
      })
      .catch(() => {
        // keep fallback options on error
      })
      .finally(() => setProductsLoading(false));
  }, []);

  /**
   * Submits the enquiry to /api/quote, which stores it under Quotes in the
   * dashboard. Before this it only logged to the console and showed the
   * confirmation, so every B2B enquiry was silently thrown away.
   */
  const onSubmit = async (data: QuoteFormData) => {
    setSubmitError("");
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: data.companyName,
          contactName: data.fullName,
          email: data.email,
          phone: data.phone,
          country: data.city ? `${data.country} (${data.city})` : data.country,
          products: data.products
            .map((row) => `${row.product} - ${row.quantity} ${row.unit}`)
            .join("\n"),
          packagingPreference: data.packaging,
          message: data.message,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send your request");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to send your request"
      );
    }
  };

  const selectedPackaging = watch("packaging");

  return (
    <>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="bg-surface py-20 px-6 text-center">
        <span className="salt-chip mb-4 inline-block">B2B Inquiries</span>
        <h1 className="font-headline text-5xl text-primary mb-4">
          Request a Bulk Quote
        </h1>
        <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
          We respond within 24 hours
        </p>
        <p className="font-body text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Whether you need a single pallet or full container loads, tell us what
          you need and our export team will prepare a competitive quote tailored
          to your market.
        </p>
      </section>

      {/* ── Form + Sidebar ──────────────────────────────── */}
      <section className="bg-surface-container-low py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
          {/* ── Left: Form ──────────────────────────────── */}
          <div className="col-span-12 lg:col-span-8">
            {submitted ? (
              <div className="bg-surface-container-lowest rounded-2xl tonal-shadow p-8 lg:p-10 text-center">
                <span className="material-symbols-outlined text-primary text-5xl mb-4">
                  check_circle
                </span>
                <h2 className="font-headline text-3xl text-on-surface mb-3">
                  Quote Request Received
                </h2>
                <p className="font-body text-on-surface-variant mb-6">
                  Our export team will review your inquiry and get back to you
                  within 24 hours. Check your email for a confirmation.
                </p>
                <Link
                  href="/"
                  className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-8 py-3 rounded-full inline-block"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-surface-container-lowest rounded-2xl tonal-shadow p-8 lg:p-10 space-y-8"
              >
                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InputField
                    label="Company / Business Name *"
                    placeholder="Acme Trading Co."
                    {...register("companyName")}
                    error={errors.companyName?.message}
                  />
                  <InputField
                    label="Your Full Name *"
                    placeholder="John Doe"
                    {...register("fullName")}
                    error={errors.fullName?.message}
                  />
                  <InputField
                    label="Email Address *"
                    type="email"
                    placeholder="john@acme.com"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                  <InputField
                    label="Phone / WhatsApp Number *"
                    placeholder="+1 234 567 8900"
                    {...register("phone")}
                    error={errors.phone?.message}
                  />
                  <InputField
                    label="Country *"
                    placeholder="United States"
                    {...register("country")}
                    error={errors.country?.message}
                  />
                  <InputField
                    label="City / Port of Destination"
                    placeholder="Los Angeles"
                    {...register("city")}
                    error={errors.city?.message}
                  />
                </div>

                {/* Product Rows */}
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                    Products &amp; Quantities
                  </p>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-12 gap-3 items-end"
                      >
                        {/* Product Select */}
                        <div className="col-span-12 md:col-span-5">
                          <select
                            {...register(`products.${index}.product`)}
                            disabled={productsLoading}
                            className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-3 font-body text-on-surface outline-none disabled:opacity-50"
                          >
                            <option value="">
                              {productsLoading ? "Loading products..." : "Select a product"}
                            </option>
                            {productOptions.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          {errors.products?.[index]?.product && (
                            <p className="text-error text-xs mt-1 font-label">
                              {errors.products[index]?.product?.message}
                            </p>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="col-span-5 md:col-span-3">
                          <input
                            type="number"
                            min={1}
                            placeholder="Qty"
                            {...register(`products.${index}.quantity`)}
                            className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-3 font-body text-on-surface outline-none"
                          />
                        </div>

                        {/* Unit Select */}
                        <div className="col-span-5 md:col-span-3">
                          <select
                            {...register(`products.${index}.unit`)}
                            className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-3 font-body text-on-surface outline-none"
                          >
                            <option value="kg">kg</option>
                            <option value="pieces">pieces</option>
                            <option value="cartons">cartons</option>
                          </select>
                        </div>

                        {/* Remove */}
                        <div className="col-span-2 md:col-span-1 flex justify-center">
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-on-surface-variant hover:text-error transition-colors"
                            >
                              <span className="material-symbols-outlined text-xl">
                                close
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      append({ product: "", quantity: 1, unit: "kg" })
                    }
                    className="mt-4 flex items-center gap-2 text-primary font-label text-sm hover:underline"
                  >
                    <span className="material-symbols-outlined text-lg">
                      add
                    </span>
                    Add Another Product
                  </button>
                </div>

                {/* Packaging Preference */}
                <div>
                  <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4">
                    Packaging Preference
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {packagingOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`cursor-pointer rounded-full px-5 py-2 font-label text-sm transition-all ${
                          selectedPackaging === opt.value
                            ? "mineral-glow text-on-primary"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("packaging")}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-1 block">
                    Message / Special Requirements
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your specific needs, target price, or any questions..."
                    {...register("message")}
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-3 font-body text-on-surface outline-none resize-none"
                  />
                </div>

                {submitError && (
                  <p className="text-error text-xs font-label">{submitError}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest w-full py-4 rounded-full disabled:opacity-60 transition-all"
                >
                  {isSubmitting ? "Sending..." : "Send Quote Request"}
                </button>

                <p className="flex items-center justify-center gap-2 text-on-surface-variant text-xs font-label">
                  <span className="material-symbols-outlined text-sm">
                    lock
                  </span>
                  Your details are private and never shared
                </p>
              </form>
            )}
          </div>

          {/* ── Right: Sidebar ──────────────────────────── */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            {/* Response Time */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="mineral-glow w-10 h-10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-lg">
                    schedule
                  </span>
                </div>
                <div>
                  <p className="font-headline text-lg text-on-surface">
                    Fast Response
                  </p>
                  <p className="font-label text-xs text-on-surface-variant">
                    Within 24 hours
                  </p>
                </div>
              </div>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                Our export team reviews every inquiry personally and responds
                with a detailed quote, pricing, and shipping options.
              </p>
            </div>

            {/* WhatsApp Pakistan */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
              <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
                Contact Directly
              </p>
              <a
                href="https://wa.me/14372259136"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 mb-4 group"
              >
                <span className="material-symbols-outlined text-[#25D366] text-2xl">
                  chat
                </span>
                <div>
                  <p className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">
                    WhatsApp Pakistan
                  </p>
                  <p className="font-label text-xs text-on-surface-variant">
                    +92 320-7550055
                  </p>
                </div>
              </a>
              <a
                href="https://wa.me/16477779333"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span className="material-symbols-outlined text-[#25D366] text-2xl">
                  chat
                </span>
                <div>
                  <p className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">
                    WhatsApp Canada
                  </p>
                  <p className="font-label text-xs text-on-surface-variant">
                    +1 (647) 777-9333
                  </p>
                </div>
              </a>
            </div>

            {/* Why Buyers Trust Us */}
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
              <p className="font-headline text-lg text-on-surface mb-4">
                Why Buyers Trust Us
              </p>
              <ul className="space-y-4">
                {[
                  {
                    icon: "factory",
                    title: "Direct Mine Access",
                    desc: "We source directly from Khewra — no middlemen, no inflated pricing.",
                  },
                  {
                    icon: "verified",
                    title: "Certified Quality",
                    desc: "ISO, Halal, PCSIR, and GMP certified. Every shipment tested.",
                  },
                  {
                    icon: "local_shipping",
                    title: "Global Logistics",
                    desc: "FOB, CIF, EXW available. We handle documentation and freight.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">
                      {item.icon}
                    </span>
                    <div>
                      <p className="font-body text-sm text-on-surface font-medium">
                        {item.title}
                      </p>
                      <p className="font-label text-xs text-on-surface-variant leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
