import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError, withAdmin } from "@/lib/api/route";
import {
  getPageById,
  getPageByIdForAdmin,
  replacePageSections,
  type IncomingSection,
} from "@/lib/db/pages";
import { SECTION_SCHEMAS } from "@/types/page";

const VALID_TYPES = new Set<string>(SECTION_SCHEMAS.map((schema) => schema.type));

/**
 * PUT -- replace the full section list for a page.
 *
 * The editor always sends the complete, ordered array, which makes add, edit,
 * reorder and delete a single operation. `sortOrder` is taken from array
 * position so the order cannot drift.
 */
export const PUT = withAdmin<{ id: string }>("save sections", async (req, { params }) => {
  const page = await getPageById(params.id);
  if (!page) throw new ApiError(404, "Page not found");

  const body = await req.json();
  const incoming: IncomingSection[] = Array.isArray(body?.sections) ? body.sections : [];

  // Section types are a Postgres enum, so an unknown one would fail deep in
  // the write with an opaque message. Rejected up front instead.
  const unsupported = incoming.find((section) => !VALID_TYPES.has(section.type));
  if (unsupported) {
    throw new ApiError(400, `Unsupported section type: ${unsupported.type}`);
  }

  await replacePageSections(page.id, incoming);

  const updated = await getPageByIdForAdmin(page.id);

  // Published content is cached -- drop the cached render for this URL.
  revalidatePath(page.slug);

  return NextResponse.json({ page: updated });
});
