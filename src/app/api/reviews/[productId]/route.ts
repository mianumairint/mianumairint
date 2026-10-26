import { NextResponse } from "next/server";
import { withRoute } from "@/lib/api/route";
import { getSupabase, selectMany } from "@/lib/supabase/server";
import { TABLES, type ReviewRow } from "@/lib/supabase/types";

export const GET = withRoute<{ productId: string }>(
  "fetch reviews",
  async (_req, { params }) => {
    const reviews = await selectMany<ReviewRow & { user: { name: string | null } | null }>(
      getSupabase()
        .from(TABLES.review)
        .select("*, user:User(name)")
        .eq("productId", params.productId)
        .eq("isApproved", true)
        .order("createdAt", { ascending: false })
    );

    return NextResponse.json({ reviews });
  }
);
