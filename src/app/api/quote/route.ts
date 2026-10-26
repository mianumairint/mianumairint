import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { getSupabase, mutate, newId, nowIso } from "@/lib/supabase/server";
import { TABLES, type QuoteRequestRow } from "@/lib/supabase/types";

/**
 * Stores a B2B enquiry from the quote form.
 *
 * As with the contact form, the row is written but not read back: the public
 * may submit an enquiry and may not read other people's. Every value is set
 * here, so the response is assembled from what was sent.
 */
export const POST = withRoute("create quote request", async (req) => {
  const {
    companyName,
    contactName,
    email,
    phone,
    country,
    products,
    message,
    packagingPreference,
  } = await req.json();

  if (!contactName || !email || !companyName || !country) {
    throw new ApiError(
      400,
      "Company name, contact name, email, and country are required"
    );
  }

  // There is no packaging column; it is prepended to the message so the
  // preference still reaches whoever reads the enquiry.
  const fullMessage = packagingPreference
    ? `Packaging: ${packagingPreference}\n\n${message || ""}`
    : message || null;

  const quote: QuoteRequestRow = {
    id: newId(),
    companyName,
    contactName,
    email,
    phone: phone || null,
    country,
    products: typeof products === "string" ? products : JSON.stringify(products),
    message: fullMessage,
    // Filled in by whoever reviews the enquiry, not by the submitter.
    adminNotes: null,
    status: "NEW",
    isRead: false,
    createdAt: nowIso(),
  };

  await mutate(getSupabase().from(TABLES.quoteRequest).insert(quote));

  return NextResponse.json({ quote }, { status: 201 });
});
