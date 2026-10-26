import { NextResponse } from "next/server";
import { ApiError, withUser } from "@/lib/api/route";
import { getUserSupabase, mutateOne, newRow } from "@/lib/supabase/server";
import { TABLES, type ReviewRow } from "@/lib/supabase/types";

export const POST = withUser("create review", async (req, _ctx, user) => {
  const { productId, rating, title, body } = await req.json();

  if (!productId || !rating) {
    throw new ApiError(400, "productId and rating are required");
  }
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const review = await mutateOne<ReviewRow>(
    getUserSupabase()
      .from(TABLES.review)
      .insert(
        newRow({
          userId: user.id,
          productId,
          rating,
          title: title || null,
          body: body || null,
          // New reviews are held for moderation. The product's cached rating is
          // recalculated by a database trigger when a review is approved, so
          // this one does not affect it yet.
          isApproved: false,
        })
      )
      .select("*")
      .single()
  );

  return NextResponse.json({ review }, { status: 201 });
});
