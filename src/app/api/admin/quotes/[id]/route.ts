import { NextResponse } from "next/server";
import { ApiError, withAdmin } from "@/lib/api/route";
import { getUserSupabase, mutateOne, selectOne } from "@/lib/supabase/server";
import { TABLES, type QuoteRequestRow, type QuoteStatus } from "@/lib/supabase/types";

export const GET = withAdmin<{ id: string }>("fetch quote", async (_req, { params }) => {
  const quote = await selectOne<QuoteRequestRow>(
    getUserSupabase().from(TABLES.quoteRequest).select("*").eq("id", params.id).maybeSingle()
  );
  if (!quote) throw new ApiError(404, "Quote not found");

  return NextResponse.json({ quote });
});

/** PUT -- change a quote's status and the internal notes beside it. */
export const PUT = withAdmin<{ id: string }>("update quote", async (req, { params }) => {
  const { status, adminNotes } = await req.json();

  // Only the fields that were sent are written, so saving a note does not
  // reset the status.
  const patch: Partial<Pick<QuoteRequestRow, "status" | "adminNotes">> = {};
  if (status) patch.status = status as QuoteStatus;
  if (adminNotes !== undefined) patch.adminNotes = adminNotes || null;

  if (!Object.keys(patch).length) {
    throw new ApiError(400, "Nothing to update");
  }

  const quote = await mutateOne<QuoteRequestRow>(
    getUserSupabase()
      .from(TABLES.quoteRequest)
      .update(patch)
      .eq("id", params.id)
      .select("*")
      .single()
  );

  return NextResponse.json({ quote });
});
