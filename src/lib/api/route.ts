import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser, getSessionUser, type SessionUser } from "@/lib/auth/session";

/**
 * ROUTE HANDLER PLUMBING
 * ======================
 * Every API route repeated the same three things: a try/catch that logs and
 * returns a 500, an admin check that returns a 401, and the same pagination
 * arithmetic. They live here once so a handler is only its own logic.
 *
 * Response shapes are unchanged -- `{ error }` on failure, and the same keys
 * on success -- so existing clients keep working.
 */

/** Throw from a handler to return a specific status instead of a 500. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

type Handler<P> = (req: NextRequest, ctx: { params: P }) => Promise<NextResponse>;
type UserHandler<P> = (
  req: NextRequest,
  ctx: { params: P },
  user: SessionUser
) => Promise<NextResponse>;

/**
 * Next.js signals control flow with thrown errors: reading `cookies()` in a
 * route it is trying to render statically, `notFound()` and `redirect()` all
 * throw, and each carries a `digest`. Catching one of those turns a route that
 * should be dynamic into a cached error page, so they are passed straight
 * through instead.
 */
function isFrameworkSignal(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string";
}

/**
 * `label` names the route in server logs and in the fallback error message,
 * e.g. "fetch products" becomes "Failed to fetch products".
 */
function toFailure(label: string, error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return jsonError(error.message, error.status);
  }
  console.error(`[api] ${label} failed:`, error);
  return jsonError(`Failed to ${label}`, 500);
}

/** Wraps a public route: turns thrown errors into the right JSON response. */
export function withRoute<P = Record<string, never>>(
  label: string,
  handler: Handler<P>
): Handler<P> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (isFrameworkSignal(error)) throw error;
      return toFailure(label, error);
    }
  };
}

/**
 * Wraps a dashboard route: rejects anyone who is not an admin, then as
 * `withRoute`.
 *
 * The check here is the first of two. The database policies apply the same
 * rule to every row the handler touches, so a route that forgot this wrapper
 * would still be refused by Postgres rather than quietly exposing data.
 */
export function withAdmin<P = Record<string, never>>(
  label: string,
  handler: UserHandler<P>
): Handler<P> {
  return async (req, ctx) => {
    try {
      const admin = await getAdminUser();
      if (!admin) return jsonError("Unauthorized", 401);
      return await handler(req, ctx, admin);
    } catch (error) {
      if (isFrameworkSignal(error)) throw error;
      return toFailure(label, error);
    }
  };
}

/** Wraps a route that needs any signed-in customer. */
export function withUser<P = Record<string, never>>(
  label: string,
  handler: UserHandler<P>
): Handler<P> {
  return async (req, ctx) => {
    try {
      const user = await getSessionUser();
      if (!user) return jsonError("Not authenticated", 401);
      return await handler(req, ctx, user);
    } catch (error) {
      if (isFrameworkSignal(error)) throw error;
      return toFailure(label, error);
    }
  };
}

/**
 * Copies a request body without the fields the server owns.
 *
 * Update handlers receive the whole row back from the editor, including `id`
 * and the timestamps. Those must not be written from the client, and dropping
 * them by destructuring left a line of unused variables in every handler.
 */
export function omit<T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[]
): Omit<T, K> {
  const result = { ...source };
  for (const key of keys) delete result[key];
  return result;
}

/* ── Pagination ───────────────────────────────────────────── */

export interface Pagination {
  page: number;
  limit: number;
  /** Inclusive row range for `PostgrestFilterBuilder.range`. */
  from: number;
  to: number;
}

/**
 * Reads `page` and `limit` from the query string.
 * Both are clamped so a hand-edited URL cannot ask for a million rows or a
 * negative offset -- either of which previously produced an empty page or a
 * database error.
 */
export function parsePagination(url: string, defaultLimit = 20): Pagination {
  const params = new URL(url).searchParams;
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
  const requested = Number.parseInt(params.get("limit") || String(defaultLimit), 10);
  const limit = Math.min(100, Math.max(1, requested || defaultLimit));
  const from = (page - 1) * limit;

  return { page, limit, from, to: from + limit - 1 };
}

/** The `{ total, page, totalPages }` envelope every list route returns. */
export function pageMeta(total: number, { page, limit }: Pagination) {
  return { total, page, totalPages: Math.ceil(total / limit) };
}
