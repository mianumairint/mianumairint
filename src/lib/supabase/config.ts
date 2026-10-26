/**
 * SUPABASE CONFIGURATION
 * ======================
 * The whole app is configured from two public environment variables and
 * nothing else -- no connection string, no service-role key:
 *
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
 *
 * Supabase renamed the public key from "anon" to "publishable"; both names are
 * read so an existing .env keeps working either way.
 *
 * Both values are safe in the browser: with row-level security enabled, this
 * key grants exactly what the policies allow for the signed-in user, and
 * nothing when nobody is signed in.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

export const MISSING_CONFIG_MESSAGE =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.";

/** Throws unless both variables are present. */
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured()) throw new Error(MISSING_CONFIG_MESSAGE);
}
