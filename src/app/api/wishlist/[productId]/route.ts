import { NextResponse } from "next/server";
import { withUser } from "@/lib/api/route";
import { getUserSupabase, mutate, mutateOne, newRow, selectOne } from "@/lib/supabase/server";
import { TABLES, type WishlistItemRow } from "@/lib/supabase/types";

export const POST = withUser<{ productId: string }>(
  "add to wishlist",
  async (_req, { params }, user) => {
    const supabase = getUserSupabase();

    const existing = await selectOne<Pick<WishlistItemRow, "id">>(
      supabase
        .from(TABLES.wishlistItem)
        .select("id")
        .eq("userId", user.id)
        .eq("productId", params.productId)
        .maybeSingle()
    );

    if (existing) return NextResponse.json({ message: "Already in wishlist" });

    const item = await mutateOne<WishlistItemRow>(
      supabase
        .from(TABLES.wishlistItem)
        .insert(newRow({ userId: user.id, productId: params.productId }))
        .select("*")
        .single()
    );

    return NextResponse.json({ item }, { status: 201 });
  }
);

export const DELETE = withUser<{ productId: string }>(
  "remove from wishlist",
  async (_req, { params }, user) => {
    await mutate(
      getUserSupabase()
        .from(TABLES.wishlistItem)
        .delete()
        .eq("userId", user.id)
        .eq("productId", params.productId)
    );

    return NextResponse.json({ message: "Removed from wishlist" });
  }
);
