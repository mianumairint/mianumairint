"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function LegacyContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    console.log("Contact form submitted:", data);
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="bg-surface">
      {/* ── Hero ── */}
      <div className="pt-20 pb-12 text-center px-4">
        <motion.p
          className="salt-chip inline-block mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Contact Us
        </motion.p>
        <motion.h1
          className="font-headline text-5xl text-primary mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Get in Touch
        </motion.h1>
        <motion.p
          className="font-body text-on-surface-variant max-w-lg mx-auto text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Our team in Pakistan and Canada is ready to help.
        </motion.p>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Office Info ── */}
          <motion.div
            className="lg:col-span-5"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <div className="bg-surface-container-low rounded-xl p-8 space-y-8">
              <h2 className="font-headline text-2xl text-on-surface">
                Our Offices
              </h2>

              {/* Pakistan HQ */}
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-3xl mt-1 shrink-0">
                  landscape
                </span>
                <div>
                  <h3 className="font-headline text-lg text-on-surface mb-1">
                    Pakistan Headquarters
                  </h3>
                  <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                    Punjab Small Industrial Estate,
                    <br />
                    Faisalabad, Punjab 38850
                  </p>
                  <a
                    href="tel:+923207550055"
                    className="font-label text-sm text-primary mt-2 inline-block hover:underline"
                  >
                    +92-320-755-0055
                  </a>
                </div>
              </div>

              {/* Canada Office */}
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-3xl mt-1 shrink-0">
                  location_on
                </span>
                <div>
                  <h3 className="font-headline text-lg text-on-surface mb-1">
                    North American Office
                  </h3>
                  <p className="font-body text-on-surface-variant text-sm leading-relaxed">
                    16-593 Kennedy Road,
                    <br />
                    Scarborough, ON M1K 2B2,
                    <br />
                    Toronto, Canada
                  </p>
                  <a
                    href="tel:+14372259136"
                    className="font-label text-sm text-primary mt-2 inline-block hover:underline"
                  >
                    +1-437-225-9136
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary text-3xl mt-1 shrink-0">
                  mail
                </span>
                <div>
                  <h3 className="font-headline text-lg text-on-surface mb-1">
                    Email
                  </h3>
                  <a
                    href="mailto:mianumairint@gmail.com"
                    className="font-body text-on-surface-variant text-sm hover:text-primary transition-colors"
                  >
                    mianumairint@gmail.com
                  </a>
                </div>
              </div>

              {/* WhatsApp Chips */}
              <div className="space-y-3">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                  Quick Chat
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/923207550055"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25d366]/10 text-[#25d366] rounded-full px-4 py-2 font-label text-sm hover:bg-[#25d366]/20 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.704-1.228A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.326-.682-6.058-1.849l-.422-.295-3.09.807.844-3.028-.327-.466A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    +92-320-755-0055
                  </a>
                  <a
                    href="https://wa.me/14372259136"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25d366]/10 text-[#25d366] rounded-full px-4 py-2 font-label text-sm hover:bg-[#25d366]/20 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.704-1.228A11.947 11.947 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.24 0-4.326-.682-6.058-1.849l-.422-.295-3.09.807.844-3.028-.327-.466A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    </svg>
                    +1-437-225-9136
                  </a>
                </div>
              </div>

              {/* Social Icons Placeholder */}
              <div className="pt-4">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
                  Follow Us
                </p>
                <div className="flex gap-3">
                  {["facebook", "instagram", "linkedin", "youtube"].map(
                    (platform) => (
                      <div
                        key={platform}
                        className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors cursor-pointer"
                      >
                        <span className="font-label text-xs uppercase">
                          {platform[0]}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right Column: Form ── */}
          <motion.div
            className="lg:col-span-7"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-8">
              <h2 className="font-headline text-2xl text-on-surface mb-2">
                Send a Message
              </h2>
              <p className="font-body text-on-surface-variant text-sm mb-8">
                Fill in the form below and we will get back to you within 24
                hours.
              </p>

              {submitted && (
                <motion.div
                  className="bg-[#25d366]/10 text-[#25d366] rounded-xl p-4 mb-6 font-body text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Thank you! Your message has been sent. We will be in touch
                  soon.
                </motion.div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-transparent border-b border-outline-variant pb-2 font-body text-on-surface focus:border-primary focus:outline-none transition-colors placeholder:text-on-surface-variant/40"
                      placeholder="Your full name"
                      {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && (
                      <p className="text-error text-xs mt-1 font-label">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full bg-transparent border-b border-outline-variant pb-2 font-body text-on-surface focus:border-primary focus:outline-none transition-colors placeholder:text-on-surface-variant/40"
                      placeholder="you@company.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-error text-xs mt-1 font-label">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full bg-transparent border-b border-outline-variant pb-2 font-body text-on-surface focus:border-primary focus:outline-none transition-colors placeholder:text-on-surface-variant/40"
                      placeholder="+1 (000) 000-0000"
                      {...register("phone")}
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                      Subject
                    </label>
                    <select
                      className="w-full bg-transparent border-b border-outline-variant pb-2 font-body text-on-surface focus:border-primary focus:outline-none transition-colors appearance-none cursor-pointer"
                      {...register("subject", {
                        required: "Please select a subject",
                      })}
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Product Information">
                        Product Information
                      </option>
                      <option value="Bulk Order">Bulk Order</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="text-error text-xs mt-1 font-label">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    className="w-full bg-transparent border-b border-outline-variant pb-2 font-body text-on-surface focus:border-primary focus:outline-none transition-colors resize-none placeholder:text-on-surface-variant/40"
                    placeholder="Tell us about your inquiry..."
                    {...register("message", {
                      required: "Message is required",
                    })}
                  />
                  {errors.message && (
                    <p className="text-error text-xs mt-1 font-label">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="mineral-glow text-on-primary font-label text-sm uppercase tracking-widest px-10 py-4 rounded-full disabled:opacity-50 transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Map Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="relative rounded-3xl bg-surface-container-low h-[400px] overflow-hidden flex items-center justify-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Map placeholder */}
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
              map
            </span>
            <p className="font-headline text-xl text-on-surface-variant">
              Map
            </p>
          </div>

          {/* Floating Glass Card */}
          <div className="absolute bottom-6 left-6 bg-surface/80 backdrop-blur-xl rounded-xl p-6 tonal-shadow max-w-sm">
            <h3 className="font-headline text-lg text-on-surface mb-1">
              Mian Umair International
            </h3>
            <p className="font-body text-sm text-on-surface-variant">
              Punjab Small Industrial Estate, Faisalabad, Punjab 38850,
              Pakistan
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
