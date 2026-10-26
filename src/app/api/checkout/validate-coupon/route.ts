import { NextResponse } from "next/server";
import { ApiError, withRoute } from "@/lib/api/route";
import { COUPON_ERRORS, validateCoupon } from "@/lib/db/coupons";

export const POST = withRoute("validate coupon", async (req) => {
  const { code } = await req.json();
  if (!code) throw new ApiError(400, "Coupon code is required");

  const coupon = await validateCoupon(code);

  if (coupon.status !== "ok") {
    // "Not found" has always been a 404 here; the other rejections are 400.
    throw new ApiError(
      coupon.status === "not_found" ? 404 : 400,
      COUPON_ERRORS[coupon.status]
    );
  }

  return NextResponse.json({
    valid: true,
    discount: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue,
    },
  });
});
