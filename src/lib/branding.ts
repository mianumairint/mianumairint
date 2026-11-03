import { SUPABASE_URL } from "@/lib/supabase/config";

// These are actual image files uploaded to the project's public Storage bucket.
export const BRAND_ASSET_BASE = `${SUPABASE_URL}/storage/v1/object/public/products/brand`;

export const DEFAULT_SHARE_IMAGE = {
  url: `${BRAND_ASSET_BASE}/social-preview.jpg`,
  width: 800,
  height: 800,
  alt: "Mian Umair International Himalayan salt products",
};
