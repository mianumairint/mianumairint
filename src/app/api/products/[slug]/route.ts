import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { getProductBySlug } from "@/lib/db/products";

export const GET = withRoute<{ slug: string }>("fetch product", async (_req, { params }) => {
  const product = await getProductBySlug(params.slug);
  if (!product) throw new ApiError(404, "Product not found");

  return NextResponse.json({ product });
});
