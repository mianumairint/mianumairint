import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api/route";
import { getUserSupabase, mutateOne } from "@/lib/supabase/server";
import { TABLES, type ContactMessageRow } from "@/lib/supabase/types";

export const PUT = withAdmin<{ id: string }>(
  "mark as read",
  async (_req, { params }) => {
    const message = await mutateOne<ContactMessageRow>(
      getUserSupabase()
        .from(TABLES.contactMessage)
        .update({ isRead: true })
        .eq("id", params.id)
        .select("*")
        .single()
    );

    return NextResponse.json({ message });
  }
);
