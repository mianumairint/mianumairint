import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { getUserSupabase } from "@/lib/supabase/server";

/**
 * Creates a customer account in Supabase Auth.
 *
 * The matching row in `public."User"` is created by a database trigger, not
 * here, so an account can never end up without a profile -- and the password
 * never reaches this code: Supabase stores and hashes it.
 *
 * Whether the account can sign in immediately depends on the project's
 * "Confirm email" setting. When it is on, Supabase returns no session and
 * sends a confirmation link; `needsEmailConfirmation` tells the page which
 * message to show.
 */
export const POST = withRoute("register", async (req) => {
  const { name, email, password, phone } = await req.json();

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  const { data, error } = await getUserSupabase().auth.signUp({
    email,
    password,
    // Read by the trigger to fill the profile's name and phone. The sign-up
    // form has always collected a phone number; it is now actually stored.
    options: { data: { name, phone: phone || null } },
  });

  if (error) {
    // Supabase explains a weak password, an invalid address, an address that
    // is already registered or too many attempts, and those messages are
    // useful to the person signing up. Its status is passed through, except
    // 422 which the form treats as an ordinary validation failure.
    const supabaseStatus = error.status ?? 0;
    const status =
      supabaseStatus === 422
        ? 400
        : supabaseStatus >= 400 && supabaseStatus < 500
          ? supabaseStatus
          : 400;

    throw new ApiError(status, error.message || "Could not create the account");
  }

  return NextResponse.json(
    {
      user: data.user ? { id: data.user.id, email: data.user.email, name } : null,
      needsEmailConfirmation: !data.session,
    },
    { status: 201 }
  );
});
