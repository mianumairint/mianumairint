import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ApiError, withAdmin } from "@/lib/api/route";
import { createPage, listPagesForAdmin, slugExists } from "@/lib/db/pages";
import { validateSlug } from "@/lib/pages/slug";

/** GET -- every page, drafts included. */
export const GET = withAdmin("fetch pages", async () => {
  const pages = await listPagesForAdmin();
  return NextResponse.json({ pages });
});

/** POST -- create a page. Pages made here are never system pages. */
export const POST = withAdmin("create page", async (req) => {
  const { title, slug, status, seoTitle, seoDesc } = await req.json();

  if (!title?.trim()) throw new ApiError(400, "Title is required");

  const check = validateSlug(slug || title, false);
  if (!check.ok) throw new ApiError(400, check.error ?? "Invalid URL");

  if (await slugExists(check.slug)) {
    throw new ApiError(409, `Another page already uses ${check.slug}`);
  }

  const page = await createPage({
    title: title.trim(),
    slug: check.slug,
    status: status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
    seoTitle: seoTitle?.trim() || null,
    seoDesc: seoDesc?.trim() || null,
  });

  revalidateTag(`page:${page.slug}`);
  if (page.status === "PUBLISHED") revalidatePath(page.slug);

  // A new page has no sections yet; the editor expects the key to be present.
  return NextResponse.json({ page: { ...page, sections: [] } }, { status: 201 });
});
