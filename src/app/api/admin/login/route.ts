import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { getSessionUser, isAdminRole } from "@/lib/auth/session";
import { getUserSupabase } from "@/lib/supabase/server";

/**
 * Signs an admin in through Supabase Auth.
 *
 * Admins are ordinary Supabase accounts whose profile row carries an ADMIN or
 * SUPER_ADMIN role -- there is no separate admin credential store and no
 * hardcoded account. Grant the role in Supabase; see supabase/migrations.
 *
 * A non-admin who signs in here is signed back out immediately, so a customer
 * account cannot leave a usable session behind on the dashboard.
 */
export const POST = withRoute("login", async (req) => {
  const { email, password } = await req.json();

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const supabase = getUserSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new ApiError(401, "Invalid credentials");

  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Invalid credentials");

  if (!isAdminRole(user.role)) {
    await supabase.auth.signOut();
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }

  return NextResponse.json({ user });
});
