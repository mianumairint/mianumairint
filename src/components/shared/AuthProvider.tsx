"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

/**
 * CLIENT AUTH STATE
 * =================
 * Wraps the app so any component can ask who is signed in. The state comes
 * from Supabase's `onAuthStateChange`, so a sign-in or sign-out updates every
 * consumer at once without a page reload.
 *
 * Deliberately only the identity, not the role: nothing on the storefront
 * branches on a role, and a role read in the browser could be tampered with.
 * The dashboard asks the server instead, via /api/admin/me.
 */

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  status: "loading",
  signOut: async () => {},
});

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    const supabase = getSupabaseBrowser();

    // Fires once with the restored session and again on every change, so this
    // single subscription covers both the initial load and later updates.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const account = session?.user;
      setUser(
        account
          ? {
              id: account.id,
              email: account.email ?? "",
              name: (account.user_metadata?.name as string | undefined) ?? null,
            }
          : null
      );
      setStatus(account ? "authenticated" : "unauthenticated");
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      status,
      signOut: async () => {
        // The API route clears the httpOnly cookies the server reads; the
        // browser client clears its own copy so the UI updates immediately.
        await fetch("/api/auth/logout", { method: "POST" });
        await getSupabaseBrowser().auth.signOut();
      },
    }),
    [user, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
