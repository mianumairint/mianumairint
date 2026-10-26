import { NextResponse } from "next/server";
import { pageMeta, parsePagination, withAdmin } from "@/lib/api/route";
import { getUserSupabase, mutateOne, newRow, selectPage } from "@/lib/supabase/server";
import { TABLES, type CouponRow } from "@/lib/supabase/types";

export const GET = withAdmin("fetch coupons", async (req) => {
  const pagination = parsePagination(req.url);

  const { rows, total } = await selectPage<CouponRow>(
    getUserSupabase()
      .from(TABLES.coupon)
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(pagination.from, pagination.to)
  );

  return NextResponse.json({ coupons: rows, ...pageMeta(total, pagination) });
});

export const POST = withAdmin("create coupon", async (req) => {
  const data = await req.json();

  const coupon = await mutateOne<CouponRow>(
    getUserSupabase().from(TABLES.coupon).insert(newRow(data)).select("*").single()
  );

  return NextResponse.json({ coupon }, { status: 201 });
});
