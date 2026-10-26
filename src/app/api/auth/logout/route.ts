import { NextResponse } from "next/server";
import { withRoute } from "@/lib/api/route";
import { getUserSupabase } from "@/lib/supabase/server";

/**
 * Ends the session. `signOut` revokes the refresh token at Supabase and clears
 * the session cookies on this response, so a copied cookie is no longer usable
 * either.
 */
export const POST = withRoute("logout", async () => {
  await getUserSupabase().auth.signOut();
  return NextResponse.json({ message: "Logged out successfully" });
});
