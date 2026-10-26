import { NextResponse } from "next/server";
import { ApiError, withAdmin } from "@/lib/api/route";
import {
  getUserSupabase,
  mutateOne,
  newTimestampedRow,
  selectOne,
  touched,
} from "@/lib/supabase/server";
import { TABLES, type RobotsTxtRow } from "@/lib/supabase/types";

/** GET -- the robots.txt row, created from the column default on first use. */
export const GET = withAdmin("fetch robots.txt", async () => {
  const supabase = getUserSupabase();

  const existing = await selectOne<RobotsTxtRow>(
    supabase.from(TABLES.robotsTxt).select("*").limit(1).maybeSingle()
  );
  if (existing) return NextResponse.json({ robots: existing });

  const robots = await mutateOne<RobotsTxtRow>(
    supabase.from(TABLES.robotsTxt).insert(newTimestampedRow({})).select("*").single()
  );

  return NextResponse.json({ robots });
});

export const PUT = withAdmin("update robots.txt", async (req) => {
  const { id, content } = await req.json();

  if (!id) throw new ApiError(400, "ID is required");

  const robots = await mutateOne<RobotsTxtRow>(
    getUserSupabase()
      .from(TABLES.robotsTxt)
      .update(touched({ content }))
      .eq("id", id)
      .select("*")
      .single()
  );

  return NextResponse.json({ robots });
});
