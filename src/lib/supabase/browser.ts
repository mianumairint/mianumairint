"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/**
 * SUPABASE BROWSER CLIENT
 * =======================
 * Used only for authentication: signing in, signing up, signing out and
 * watching the session. Data still comes from the app's own API routes, so
 * this client never queries a table directly.
 *
 * It writes the session to the same cookies the server reads, which is how a
 * sign-in in the browser becomes a session the route handlers can see.
 *
 * One instance per browser: a second one would keep its own copy of the
 * session and the two would drift apart.
 */

let client: SupabaseClient | undefined;

export function getSupabaseBrowser(): SupabaseClient {
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
