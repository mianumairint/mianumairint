import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { getSupabase, mutate, newId, nowIso } from "@/lib/supabase/server";
import { TABLES } from "@/lib/supabase/types";

/**
 * Stores an enquiry from the contact form.
 *
 * The row is written but not read back: the public may send a message and may
 * not read the inbox, so there is no SELECT policy to return it through. The
 * id is generated here, which is all the response needs.
 */
export const POST = withRoute("send message", async (req) => {
  const { name, email, phone, subject, message } = await req.json();

  if (!name || !email || !message) {
    throw new ApiError(400, "Name, email, and message are required");
  }

  const id = newId();

  await mutate(
    getSupabase().from(TABLES.contactMessage).insert({
      id,
      name,
      email,
      phone: phone || null,
      // `subject` is NOT NULL. The forms always send one, but a direct API
      // call need not, and a missing subject must not be a 500.
      subject: subject?.trim() || "Website enquiry",
      message,
      isRead: false,
      createdAt: nowIso(),
    })
  );

  return NextResponse.json(
    { message: "Message sent successfully", id },
    { status: 201 }
  );
});
