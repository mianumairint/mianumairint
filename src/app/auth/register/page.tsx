"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Registration failed. Please try again.");
        return;
      }

      // Supabase only returns a session when email confirmation is off; the
      // login page shows the matching message for each case.
      router.push(
        result.needsEmailConfirmation
          ? "/auth/login?registered=confirm"
          : "/auth/login?registered=true"
      );
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl tonal-shadow p-8">
        {/* Brand */}
        <Link href="/" className="block text-center">
          <h1 className="font-headline text-xl text-primary">
            Mian Umair International
          </h1>
          <span className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
            Since 1995
          </span>
        </Link>

        {/* Heading */}
        <h2 className="font-headline text-2xl text-center mt-6 text-on-surface">
          Create Account
        </h2>
        <p className="font-body text-sm text-on-surface-variant text-center mt-2">
          Join us to track orders, save favorites, and get exclusive deals
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-error-container text-on-error-container text-sm font-label px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
              Full Name
            </label>
            <input
              type="text"
              {...register("fullName")}
              className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
              placeholder="Your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-error font-label">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error font-label">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
              Phone / WhatsApp <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="tel"
              {...register("phone")}
              className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
              placeholder="+92-300-000-0000"
            />
          </div>

          <div>
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
              placeholder="Minimum 6 characters"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-error font-label">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
              Confirm Password
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-error font-label">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mineral-glow text-on-primary font-label font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant font-label">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>

        <Link
          href="/"
          className="mt-4 block text-center text-xs text-on-surface-variant hover:text-primary transition-colors font-label"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
