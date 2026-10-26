import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError, withAdmin } from "@/lib/api/route";
import {
  deletePage,
  getPageById,
  getPageByIdForAdmin,
  slugExists,
  updatePage,
} from "@/lib/db/pages";
import { validateSlug } from "@/lib/pages/slug";
import type { PageRow } from "@/lib/supabase/types";

/** GET -- one page with its sections, drafts and hidden sections included. */
export const GET = withAdmin<{ id: string }>("fetch page", async (_req, { params }) => {
  const page = await getPageByIdForAdmin(params.id);
  if (!page) throw new ApiError(404, "Page not found");

  return NextResponse.json({ page });
});

type PagePatch = Partial<Pick<PageRow, "title" | "slug" | "status" | "seoTitle" | "seoDesc">>;

/** PUT -- update a page's settings: title, URL, status, SEO. */
export const PUT = withAdmin<{ id: string }>("update page", async (req, { params }) => {
  const existing = await getPageById(params.id);
  if (!existing) throw new ApiError(404, "Page not found");

  const { title, slug, status, seoTitle, seoDesc } = await req.json();
  const patch: PagePatch = {};

  if (title !== undefined) {
    if (!title?.trim()) throw new ApiError(400, "Title cannot be empty");
    patch.title = title.trim();
  }

  // System pages keep their slug: it is the route that renders them.
  if (slug !== undefined && !existing.isSystem) {
    const check = validateSlug(slug, false);
    if (!check.ok) throw new ApiError(400, check.error ?? "Invalid URL");

    if (check.slug !== existing.slug) {
      if (await slugExists(check.slug)) {
        throw new ApiError(409, `Another page already uses ${check.slug}`);
      }
      patch.slug = check.slug;
    }
  }

  if (status !== undefined) {
    patch.status = status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  }
  if (seoTitle !== undefined) patch.seoTitle = seoTitle?.trim() || null;
  if (seoDesc !== undefined) patch.seoDesc = seoDesc?.trim() || null;

  await updatePage(params.id, patch);
  const page = await getPageByIdForAdmin(params.id);

  // Refresh both URLs when the slug moved, so neither keeps stale output.
  revalidatePath(existing.slug);
  if (page && page.slug !== existing.slug) revalidatePath(page.slug);

  return NextResponse.json({ page });
});

/** DELETE -- remove a page. System pages can be unpublished but not deleted. */
export const DELETE = withAdmin<{ id: string }>(
  "delete page",
  async (_req, { params }) => {
    const existing = await getPageById(params.id);
    if (!existing) throw new ApiError(404, "Page not found");

    if (existing.isSystem) {
      throw new ApiError(
        400,
        "Built-in pages cannot be deleted. Set them to Draft instead."
      );
    }

    await deletePage(params.id);
    revalidatePath(existing.slug);

    return NextResponse.json({ message: "Page deleted" });
  }
);
