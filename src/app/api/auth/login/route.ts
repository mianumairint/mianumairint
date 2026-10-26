import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { getSessionUser } from "@/lib/auth/session";
import { getUserSupabase } from "@/lib/supabase/server";

/**
 * Signs a customer in through Supabase Auth.
 *
 * Supabase sets the session cookies on this response, so the browser is signed
 * in for subsequent requests without the app minting a token of its own.
 */
export const POST = withRoute("login", async (req) => {
  const { email, password } = await req.json();

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const { error } = await getUserSupabase().auth.signInWithPassword({ email, password });

  // Supabase already answers "Invalid login credentials" without saying which
  // half was wrong, so registered addresses stay unguessable.
  if (error) throw new ApiError(401, "Invalid credentials");

  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Invalid credentials");

  return NextResponse.json({ user });
});
