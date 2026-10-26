import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/api/route";
import { getUserSupabase, mutate, mutateOne } from "@/lib/supabase/server";
import { TABLES, type CouponRow } from "@/lib/supabase/types";

export const PUT = withAdmin<{ id: string }>("update coupon", async (req, { params }) => {
  const data = await req.json();

  const coupon = await mutateOne<CouponRow>(
    getUserSupabase()
      .from(TABLES.coupon)
      .update(data)
      .eq("id", params.id)
      .select("*")
      .single()
  );

  return NextResponse.json({ coupon });
});

export const DELETE = withAdmin<{ id: string }>(
  "delete coupon",
  async (_req, { params }) => {
    await mutate(getUserSupabase().from(TABLES.coupon).delete().eq("id", params.id));

    return NextResponse.json({ message: "Coupon deleted" });
  }
);
