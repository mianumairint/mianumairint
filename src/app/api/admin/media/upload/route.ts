import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ApiError, withAdmin } from "@/lib/api/route";
import { getUserSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * IMAGE UPLOAD
 * ============
 * Uploads to Supabase Storage using the same publishable key as the rest of
 * the app, and falls back to the local `public/uploads` folder when Storage is
 * not reachable -- which is also what happens before the bucket exists.
 *
 * The local fallback is NOT persistent on a serverless host: the file lives on
 * one instance's writable layer and disappears on redeploy. The response says
 * so via `persistent: false` and a `warning`, so the admin UI can tell the
 * difference instead of presenting an upload that will later 404.
 */

const BUCKET = "products";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const STORAGE_HINT =
  `Saved to local disk because Supabase Storage is unavailable. This file will be lost on redeploy. ` +
  `Create a public "${BUCKET}" bucket in Supabase and allow inserts for the anon role to store uploads permanently.`;

/** A safe extension: never taken verbatim from the uploaded file name. */
function extensionOf(fileName: string, mimeType: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (/^[a-z0-9]{1,5}$/.test(fromName)) return fromName;
  return mimeType.split("/")[1] ?? "jpg";
}

export const POST = withAdmin("upload file", async (req) => {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) throw new ApiError(400, "No file provided");

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ApiError(400, "Invalid file type. Allowed: JPG, PNG, WebP, GIF");
  }
  if (file.size > MAX_BYTES) {
    throw new ApiError(400, "File too large. Maximum 5MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionOf(
    file.name,
    file.type
  )}`;

  if (isSupabaseConfigured()) {
    const storage = getUserSupabase().storage.from(BUCKET);
    const { data, error } = await storage.upload(`${BUCKET}/${uniqueName}`, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      // Not fatal: fall through to the local fallback below.
      console.error("Supabase storage upload failed:", error.message);
    } else {
      return NextResponse.json({
        url: storage.getPublicUrl(data.path).data.publicUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
        storage: "supabase",
        persistent: true,
      });
    }
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", BUCKET);
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, uniqueName), buffer);

  return NextResponse.json({
    url: `/uploads/${BUCKET}/${uniqueName}`,
    filename: file.name,
    size: file.size,
    type: file.type,
    storage: "local",
    persistent: false,
    warning: STORAGE_HINT,
  });
});
