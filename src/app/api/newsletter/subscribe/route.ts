import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { DbError, getSupabase, normalizeTimestamps } from "@/lib/supabase/server";
import type { NewsletterSubscriberRow } from "@/lib/supabase/types";

/**
 * Subscribing has to both insert a new address and reactivate one that
 * unsubscribed, which the public cannot be allowed to do directly -- an UPDATE
 * policy wide enough for that would also let anyone reactivate or read the
 * whole list. A database function does the decision instead, and the only
 * thing it exposes is the one row it just wrote.
 *
 * It is also the fix for a subtler problem: an upsert rewrites every column it
 * is given, so re-subscribing used to hand the existing row a new primary key.
 */
export const POST = withRoute("subscribe", async (req) => {
  const { email } = await req.json();
  if (!email) throw new ApiError(400, "Email is required");

  const { data, error } = await getSupabase().rpc("subscribe_newsletter", {
    p_email: email,
  });

  if (error) throw new DbError(error.message, error);

  const subscriber = normalizeTimestamps(
    (Array.isArray(data) ? data[0] : data) as NewsletterSubscriberRow
  );

  return NextResponse.json({ message: "Subscribed successfully", subscriber });
});
