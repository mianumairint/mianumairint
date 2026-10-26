"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const registered = searchParams.get("registered");
  const justRegistered = registered === "true" || registered === "confirm";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");

    // Signing in through the browser client writes the session cookies the
    // server reads, so the API routes see the session on the very next request.
    const { error: signInError } = await getSupabaseBrowser().auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl tonal-shadow p-8">
      <Link href="/" className="block text-center">
        <h1 className="font-headline text-xl text-primary">
          Mian Umair International
        </h1>
        <span className="font-label text-[10px] tracking-widest uppercase text-on-surface-variant">
          Since 1995
        </span>
      </Link>

      <h2 className="font-headline text-2xl text-center mt-6 text-on-surface">
        Welcome Back
      </h2>

      {justRegistered && (
        <div className="mt-4 bg-green-50 text-green-800 text-sm font-label px-4 py-3 rounded-lg text-center">
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">check_circle</span>
          {registered === "confirm"
            ? "Account created. Check your email for the confirmation link, then sign in."
            : "Account created successfully! Please sign in."}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-error-container text-on-error-container text-sm font-label px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
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
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full bg-transparent border-b border-outline-variant py-2.5 text-on-surface font-body focus:border-primary focus:outline-none transition-colors"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-error font-label">{errors.password.message}</p>
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
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-on-surface-variant font-label">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary font-semibold hover:underline">
          Register
        </Link>
      </p>

      <Link
        href="/"
        className="mt-4 block text-center text-xs text-on-surface-variant hover:text-primary transition-colors font-label"
      >
        &larr; Back to Home
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <Suspense fallback={
        <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl tonal-shadow p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-surface-container rounded w-48 mx-auto" />
            <div className="h-4 bg-surface-container rounded w-24 mx-auto" />
            <div className="h-10 bg-surface-container rounded mt-8" />
            <div className="h-10 bg-surface-container rounded" />
            <div className="h-12 bg-surface-container rounded" />
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
