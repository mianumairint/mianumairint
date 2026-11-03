import { createClient, type SupabaseClient, type PostgrestError } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { MISSING_CONFIG_MESSAGE, SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * SUPABASE SERVER CLIENTS
 * =======================
 * Two clients, because the database enforces row-level security and the right
 * one depends on who is asking:
 *
 *   getSupabase()      anonymous. Sees only what the policies expose to the
 *                      public: active products, published pages and posts.
 *                      Reads no cookies, so a route using it can still be
 *                      cached.
 *
 *   getUserSupabase()  carries the signed-in user's session from the auth
 *                      cookies, so auth.uid() and the admin check inside the
 *                      policies apply. Everything behind sign-in -- the whole
 *                      dashboard, a customer's own orders -- goes through this.
 *
 * Authorisation is therefore enforced twice on purpose: in the route, which
 * gives a clean 401/403, and again in the database, which is what still holds
 * if a route ever forgets.
 *
 * SERVER ONLY. Client components use ./browser instead.
 */

/** Thrown when a query fails or the connection is not configured. */
export class DbError extends Error {
  readonly cause?: PostgrestError;

  constructor(message: string, cause?: PostgrestError) {
    super(message);
    this.name = "DbError";
    this.cause = cause;
  }
}

/**
 * Next.js replaces the global `fetch` in the App Router with one that caches,
 * and supabase-js makes its requests through `fetch`. Left alone, the first
 * reply PostgREST gives is cached and then served for every later request --
 * so a page keeps showing whatever the database happened to hold the first
 * time that route ran, no matter how often the data changes afterwards.
 *
 * Every database read here is per-request by definition, so caching is opted
 * out of once, centrally, rather than at each call site where it would be
 * forgotten. Where a response genuinely should be cached, the route says so
 * itself with `revalidate`.
 */
const uncachedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

function assertServerSide(fn: string): void {
  if (typeof window !== "undefined") {
    throw new DbError(
      `${fn}() was called in the browser. Query it from a route handler or server component instead.`
    );
  }
  if (!isSupabaseConfigured()) throw new DbError(MISSING_CONFIG_MESSAGE);
}

// Reused across hot reloads in development so each edit does not leak a client.
const globalForSupabase = globalThis as unknown as { supabase?: SupabaseClient };

let contentClient: SupabaseClient | undefined;

/** Anonymous CMS/SEO reads, used only inside explicit Next.js cache boundaries.
 * Do not force no-store here: Next 14 otherwise cancels static rendering even
 * inside unstable_cache. Account and dashboard reads keep their uncached client.
 */
export function getContentSupabase(): SupabaseClient {
  assertServerSide("getContentSupabase");
  return contentClient ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Anonymous client for public reads. Safe to use in a cached route: it touches
 * no cookies and so never personalises a cached response.
 */
export function getSupabase(): SupabaseClient {
  assertServerSide("getSupabase");

  const existing = globalForSupabase.supabase;
  if (existing) return existing;

  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    // There is no browser session to persist or refresh on this one.
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: uncachedFetch },
  });

  if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = client;
  return client;
}

/**
 * Client bound to the request's auth cookies.
 *
 * Not cached: each request has its own session. Reading the cookies makes the
 * caller dynamic, which is correct -- a response that depends on who is signed
 * in must never be shared.
 *
 * Writing cookies throws inside a server component, so those failures are
 * swallowed; only the route handlers in src/app/api/auth refresh the session.
 */
export function getUserSupabase(): SupabaseClient {
  assertServerSide("getUserSupabase");

  const store = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { fetch: uncachedFetch },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) {
            store.set(name, value, options);
          }
        } catch {
          // Server components cannot set cookies. The session is still valid
          // for this request; the next route handler will persist the refresh.
        }
      },
    },
  });
}

export { isSupabaseConfigured };

/* ── Timestamp normalisation ──────────────────────────────────
 * The schema uses `timestamp` without a time zone, so PostgREST returns
 * "2026-10-17T12:53:54.444" with no offset. `new Date(...)` reads that as
 * local time, which shifts every rendered date by the viewer's offset.
 * Values are stored in UTC, so the missing "Z" is added back on read.
 */

const NAIVE_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/;

export function normalizeTimestamps<T>(value: T): T {
  if (typeof value === "string") {
    return (NAIVE_TIMESTAMP.test(value) ? `${value}Z` : value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(normalizeTimestamps) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = normalizeTimestamps(item);
    }
    return out as T;
  }
  return value;
}

/* ── Row construction ─────────────────────────────────────────
 * The schema was created by an ORM that filled two things in application code
 * rather than in the database:
 *
 *   `id`        TEXT NOT NULL with no DEFAULT
 *   `updatedAt` TIMESTAMP NOT NULL with no DEFAULT
 *
 * So an INSERT that omits either is rejected outright, and an UPDATE that omits
 * `updatedAt` silently leaves it stale. These helpers supply both, and are the
 * reason inserts go through `newRow`/`newTimestampedRow` instead of a literal.
 */

/** A fresh primary key. Any unique string works: the column is TEXT. */
export function newId(): string {
  return crypto.randomUUID();
}

/** Current time in the format Postgres `timestamp` columns expect. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Insert payload for a table without an `updatedAt` column. */
export function newRow<T extends object>(data: T): T & { id: string } {
  return { id: newId(), ...data };
}

/** Insert payload for a table with an `updatedAt` column. */
export function newTimestampedRow<T extends object>(
  data: T
): T & { id: string; updatedAt: string } {
  return { id: newId(), updatedAt: nowIso(), ...data };
}

/** Update payload for a table with an `updatedAt` column. */
export function touched<T extends object>(data: T): T & { updatedAt: string } {
  return { ...data, updatedAt: nowIso() };
}

/* ── Query result helpers ─────────────────────────────────────
 * Every read goes through one of these so error handling and timestamp
 * normalisation are applied in exactly one place.
 */

interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

interface CountedResult<T> extends QueryResult<T> {
  count: number | null;
}

/** Rows from a list query. Throws `DbError` if the query failed. */
export async function selectMany<T>(query: PromiseLike<QueryResult<T[]>>): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw new DbError(error.message, error);
  return normalizeTimestamps(data ?? []);
}

/**
 * A single row, or null when nothing matched.
 * Pair with `.maybeSingle()` so "no rows" is not an error.
 */
export async function selectOne<T>(query: PromiseLike<QueryResult<T>>): Promise<T | null> {
  const { data, error } = await query;
  if (error) throw new DbError(error.message, error);
  return data === null ? null : normalizeTimestamps(data);
}

/**
 * Asking for a page past the end of the table is a 416 from PostgREST, not an
 * empty result, so a list screen left on page 3 when the data shrinks to one
 * page would fail outright. The row count is in the error text, which is how
 * the real total survives into the empty page below.
 */
const RANGE_NOT_SATISFIABLE = "PGRST103";
const ROWS_AVAILABLE = /only (\d+) rows/;

function totalFromRangeError(error: PostgrestError): number {
  const match = `${error.details ?? ""} ${error.message}`.match(ROWS_AVAILABLE);
  return match ? Number(match[1]) : 0;
}

/**
 * One page of rows plus the total match count. Pair with
 * `.select(columns, { count: "exact" })` and `.range(from, to)`.
 *
 * A page beyond the last one comes back empty rather than as an error, which
 * is how the ORM behaved and what every list screen already renders.
 */
export async function selectPage<T>(
  query: PromiseLike<CountedResult<T[]>>
): Promise<{ rows: T[]; total: number }> {
  const { data, error, count } = await query;

  if (error) {
    if (error.code === RANGE_NOT_SATISFIABLE) {
      return { rows: [], total: totalFromRangeError(error) };
    }
    throw new DbError(error.message, error);
  }

  return { rows: normalizeTimestamps(data ?? []), total: count ?? 0 };
}

/** Number of matching rows, without transferring them. */
export async function selectCount(
  query: PromiseLike<CountedResult<unknown>>
): Promise<number> {
  const { error, count } = await query;
  if (error) throw new DbError(error.message, error);
  return count ?? 0;
}

/**
 * Adds up one `numeric` column across every matching row.
 *
 * PostgREST aggregate functions (`total.sum()`) are disabled on this project,
 * so the column is fetched and summed here. Reads are chunked because PostgREST
 * caps a response at the project's "max rows" setting, which would otherwise
 * truncate the total without reporting an error. The cursor advances by how
 * many rows actually came back, so the loop is correct whatever that cap is.
 *
 * `buildPage` receives an inclusive row range and returns the query for it.
 */
export async function sumNumericColumn<T extends Record<string, unknown>>(
  column: keyof T & string,
  buildPage: (from: number, to: number) => PromiseLike<QueryResult<T[]>>,
  chunkSize = 1000
): Promise<number> {
  let total = 0;
  let offset = 0;

  for (;;) {
    const { data, error } = await buildPage(offset, offset + chunkSize - 1);
    if (error) throw new DbError(error.message, error);

    const rows = data ?? [];
    for (const row of rows) total += Number(row[column]) || 0;

    if (rows.length === 0 || rows.length < chunkSize) return total;
    offset += rows.length;
  }
}

/** A write that returns the affected row. Throws if it failed or matched nothing. */
export async function mutateOne<T>(query: PromiseLike<QueryResult<T>>): Promise<T> {
  const { data, error } = await query;
  if (error) throw new DbError(error.message, error);
  if (data === null) throw new DbError("The row no longer exists.");
  return normalizeTimestamps(data);
}

/** A write whose result is not needed. Throws if it failed. */
export async function mutate(query: PromiseLike<{ error: PostgrestError | null }>): Promise<void> {
  const { error } = await query;
  if (error) throw new DbError(error.message, error);
}
