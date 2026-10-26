"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Also set a non-httpOnly cookie so client JS can detect auth state
      document.cookie = `admin_token_exists=1; path=/; max-age=${8 * 60 * 60}; samesite=lax`;

      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-8">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <h1 className="font-headline text-2xl text-primary font-bold">
              Mian Umair
            </h1>
            <p className="font-label text-sm text-on-surface-variant mt-1">
              Admin Panel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-label text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mianumair.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm text-on-surface outline-none focus:border-primary transition disabled:opacity-50"
              />
            </div>
            <div>
              <label className="font-label text-xs text-on-surface-variant block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border border-outline-variant/30 bg-transparent font-body text-sm text-on-surface outline-none focus:border-primary transition disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mineral-glow text-on-primary font-label text-sm px-5 py-3 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center font-label text-xs text-on-surface-variant/60 mt-6">
            Admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
