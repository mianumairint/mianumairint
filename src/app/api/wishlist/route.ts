import { NextResponse } from "next/server";
import { withUser } from "@/lib/api/route";
import { getUserSupabase, selectMany } from "@/lib/supabase/server";
import { TABLES, type WishlistItemRow } from "@/lib/supabase/types";
import type { ProductCard } from "@/lib/db/products";

export const GET = withUser("fetch wishlist", async (_req, _ctx, user) => {
  const wishlist = await selectMany<WishlistItemRow & { product: ProductCard | null }>(
    getUserSupabase()
      .from(TABLES.wishlistItem)
      .select(
        "*, product:Product(*, images:ProductImage(*), category:Category(id,name,slug))"
      )
      .eq("userId", user.id)
      .eq("product.images.isPrimary", true)
      .limit(1, { referencedTable: "product.images" })
      .order("createdAt", { ascending: false })
  );

  return NextResponse.json({ wishlist });
});
