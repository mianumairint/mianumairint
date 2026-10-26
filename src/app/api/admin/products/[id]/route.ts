import { NextResponse } from "next/server";
import { ApiError, omit, withAdmin } from "@/lib/api/route";
import { getAdminProductById, getProductWithChildren } from "@/lib/db/products";
import { getUserSupabase, mutate, mutateOne, touched } from "@/lib/supabase/server";
import { TABLES, type ProductRow } from "@/lib/supabase/types";

export const GET = withAdmin<{ id: string }>(
  "fetch product",
  async (_req, { params }) => {
    const product = await getAdminProductById(params.id);
    if (!product) throw new ApiError(404, "Product not found");

    return NextResponse.json({ product });
  }
);

/**
 * PUT -- update the product's own fields.
 *
 * Images, variants and tags are edited through their own screens, so they are
 * dropped from the payload here rather than being replaced wholesale.
 */
export const PUT = withAdmin<{ id: string }>("update product", async (req, { params }) => {
  const productData = omit(await req.json(), ["images", "variants", "tags"]);

  await mutateOne<Pick<ProductRow, "id">>(
    getUserSupabase()
      .from(TABLES.product)
      .update(touched(productData))
      .eq("id", params.id)
      .select("id")
      .single()
  );

  const product = await getProductWithChildren(params.id);
  return NextResponse.json({ product });
});

export const DELETE = withAdmin<{ id: string }>(
  "delete product",
  async (_req, { params }) => {
    // Images, variants and tags cascade with the product.
    await mutate(getUserSupabase().from(TABLES.product).delete().eq("id", params.id));

    return NextResponse.json({ message: "Product deleted" });
  }
);
