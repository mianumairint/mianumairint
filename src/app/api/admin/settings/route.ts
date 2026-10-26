import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api/route";
import { getUserSupabase, mutate, newId, nowIso, selectMany } from "@/lib/supabase/server";
import { TABLES, type SiteSettingRow } from "@/lib/supabase/types";

/** GET -- all settings as a flat `{ key: value }` object. */
export const GET = withAdmin("fetch settings", async () => {
  const rows = await selectMany<Pick<SiteSettingRow, "key" | "value">>(
    getUserSupabase().from(TABLES.siteSetting).select("key,value")
  );

  return NextResponse.json({
    settings: Object.fromEntries(rows.map((row) => [row.key, row.value])),
  });
});

/**
 * PUT -- save a batch of settings.
 *
 * One upsert replaces the previous one-request-per-setting loop. The existing
 * ids are read first and reused, because an upsert rewrites every column it is
 * given: without this, saving the settings would hand each existing row a new
 * primary key.
 */
export const PUT = withAdmin("update settings", async (req) => {
  const settings: Record<string, unknown> = await req.json();
  const entries = Object.entries(settings);
  if (!entries.length) return NextResponse.json({ message: "Settings updated" });

  const supabase = getUserSupabase();

  const existing = await selectMany<Pick<SiteSettingRow, "id" | "key">>(
    supabase
      .from(TABLES.siteSetting)
      .select("id,key")
      .in("key", entries.map(([key]) => key))
  );
  const idByKey = new Map(existing.map((row) => [row.key, row.id]));

  const rows = entries.map(([key, value]) => ({
    id: idByKey.get(key) ?? newId(),
    key,
    value: String(value),
    group: "general",
    updatedAt: nowIso(),
  }));

  await mutate(supabase.from(TABLES.siteSetting).upsert(rows));

  return NextResponse.json({ message: "Settings updated" });
});
