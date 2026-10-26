import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { getSupabase, selectMany } from "@/lib/supabase/server";
import { TABLES, type ShippingRateRow, type ShippingZoneRow } from "@/lib/supabase/types";

export const POST = withRoute("fetch shipping rates", async (req) => {
  const { country, totalWeight } = await req.json();
  if (!country) throw new ApiError(400, "Country is required");

  const zones = await selectMany<ShippingZoneRow & { rates: ShippingRateRow[] }>(
    getSupabase()
      .from(TABLES.shippingZone)
      .select("*, rates:ShippingRate(*)")
      .contains("countries", [country])
      .order("price", { referencedTable: "rates", ascending: true })
  );

  const rates = zones.flatMap((zone) => zone.rates);

  // A rate with no minimum weight always applies; one with a minimum only
  // applies once the parcel is at least that heavy. Filtered here rather than
  // in the query because the comparison is against a request value, and the
  // rate list per country is a handful of rows.
  const weight = Number(totalWeight);
  const applicable = Number.isFinite(weight) && weight > 0
    ? rates.filter((rate) => rate.minWeight === null || Number(rate.minWeight) <= weight)
    : rates;

  return NextResponse.json({ rates: applicable });
});
