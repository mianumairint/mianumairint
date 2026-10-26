"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

/**
 * CONTACT FORM SECTION
 * ====================
 * Posts to the existing /api/contact route so submissions appear under
 * Messages in the dashboard. (The original page-level form only simulated a
 * request; this section is the CMS-rendered replacement.)
 */

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

type Data = Record<string, any>;

export default function ContactFormSection({ data }: { data: Data }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (form: ContactFormData) => {
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          subject: form.subject?.trim() || "Website enquiry",
          message: form.message,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not send your message.");
      }
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors";

  return (
    <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-8">
      <h2 className="font-headline text-2xl text-on-surface mb-6">
        {data.heading || "Send Us a Message"}
      </h2>

      {submitted && (
        <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg font-body text-sm mb-6">
          {data.successMessage || "Thank you — your message has been sent. We'll reply shortly."}
        </div>
      )}

      {error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
        <div>
          <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
            Name
          </label>
          <input
            type="text"
            {...register("name", { required: "Name is required" })}
            className={inputClass}
            placeholder="Your name"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-error font-label">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
            Email
          </label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            className={inputClass}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-error font-label">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
            Phone <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input type="tel" {...register("phone")} className={inputClass} placeholder="+92 300 1234567" />
        </div>

        <div>
          <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
            Subject
          </label>
          <input
            type="text"
            {...register("subject")}
            className={inputClass}
            placeholder="How can we help?"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
            Message
          </label>
          <textarea
            rows={4}
            {...register("message", { required: "Message is required" })}
            className={inputClass}
            placeholder="Tell us about your requirement..."
          />
          {errors.message && (
            <p className="mt-1 text-xs text-error font-label">{errors.message.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="mineral-glow text-on-primary font-label font-semibold px-8 py-3.5 rounded-xl disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </div>
  );
}
