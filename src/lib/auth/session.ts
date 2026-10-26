import { getUserSupabase, selectOne } from "@/lib/supabase/server";
import { TABLES, type Role, type UserRow } from "@/lib/supabase/types";

/**
 * SERVER-SIDE SESSION
 * ===================
 * Identity comes from Supabase Auth: the session lives in httpOnly cookies
 * that `getUserSupabase()` reads, and Supabase verifies the token with the
 * project's own signing key. There is no application secret to set and no
 * fallback value to forget -- the two public Supabase variables are the whole
 * configuration.
 *
 * The profile row in `public."User"` carries the role and is created by a
 * database trigger whenever an account is added in Supabase, so an account
 * always has exactly one profile. See supabase/migrations.
 */

const ADMIN_ROLES: readonly Role[] = ["ADMIN", "SUPER_ADMIN"];

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as Role);
}

/**
 * The signed-in user with their role, or null.
 *
 * `getUser()` is used rather than `getSession()` because it validates the
 * token against Supabase instead of trusting whatever is in the cookie.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = getUserSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const profile = await selectOne<Pick<UserRow, "id" | "email" | "name" | "role">>(
    supabase.from(TABLES.user).select("id,email,name,role").eq("id", user.id).maybeSingle()
  );

  // No profile row means the trigger has not run for this account. Treat it as
  // signed out rather than guessing a role.
  if (!profile) {
    console.error(`No profile row for authenticated user ${user.id}.`);
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
  };
}

/** The signed-in user's id, or null. */
export async function getSessionUserId(): Promise<string | null> {
  const supabase = getUserSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** The signed-in user if they are an admin, otherwise null. */
export async function getAdminUser(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user && isAdminRole(user.role) ? user : null;
}
