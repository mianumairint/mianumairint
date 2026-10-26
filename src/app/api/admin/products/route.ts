import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withAdmin } from "@/lib/api/route";
import { getProductWithChildren, listAdminProducts } from "@/lib/db/products";
import { getUserSupabase, mutateOne, newRow, newTimestampedRow } from "@/lib/supabase/server";
import { TABLES, type ProductRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch products", async (req) => {
  const search = new URL(req.url).searchParams.get("search");
  const pagination = parsePagination(req.url);

  const { rows, total } = await listAdminProducts(search, pagination.from, pagination.to);

  return NextResponse.json({ products: rows, ...pageMeta(total, pagination) });
});

interface NewImage {
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

interface NewVariant {
  label: string;
  sku: string;
  price?: number | null;
  inventory?: number;
  isActive?: boolean;
}

/**
 * POST -- create a product with its images, variants and tags.
 *
 * The children are written after the product, because PostgREST has no nested
 * insert and no multi-statement transaction. If a child insert fails the
 * product is removed again, so a half-created product never shows up in the
 * catalogue.
 *
 * Tags are plain rows on `ProductTag` (one row per tag, per product). The
 * previous version tried to connect them to a shared tag table by a `name`
 * column that does not exist, so saving a product with tags always failed.
 */
export const POST = withAdmin("create product", async (req) => {
  const supabase = getUserSupabase();
  const { images, variants, tags, ...productData } = await req.json();

  const product = await mutateOne<ProductRow>(
    supabase
      .from(TABLES.product)
      .insert(newTimestampedRow(productData))
      .select("*")
      .single()
  );

  try {
    const children: PromiseLike<{ error: unknown }>[] = [];

    if (Array.isArray(images) && images.length) {
      children.push(
        supabase.from(TABLES.productImage).insert(
          (images as NewImage[]).map((image, index) =>
            newRow({
              productId: product.id,
              url: image.url,
              altText: image.altText ?? null,
              sortOrder: image.sortOrder ?? index,
              isPrimary: image.isPrimary ?? index === 0,
            })
          )
        )
      );
    }

    if (Array.isArray(variants) && variants.length) {
      children.push(
        supabase.from(TABLES.productVariant).insert(
          (variants as NewVariant[]).map((variant) =>
            newRow({
              productId: product.id,
              label: variant.label,
              sku: variant.sku,
              price: variant.price ?? null,
              inventory: variant.inventory ?? 0,
              isActive: variant.isActive ?? true,
            })
          )
        )
      );
    }

    if (Array.isArray(tags) && tags.length) {
      children.push(
        supabase.from(TABLES.productTag).insert(
          (tags as string[]).map((tag) => newRow({ productId: product.id, tag }))
        )
      );
    }

    const results = await Promise.all(children);
    const failure = results.find((result) => result.error);
    if (failure) throw failure.error;
  } catch (error) {
    await supabase.from(TABLES.product).delete().eq("id", product.id);
    throw error;
  }

  const saved = await getProductWithChildren(product.id);
  return NextResponse.json({ product: saved }, { status: 201 });
});
