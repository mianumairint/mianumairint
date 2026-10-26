import { DbError, getUserSupabase } from "@/lib/supabase/server";
import type { CouponType } from "@/lib/supabase/types";

/**
 * COUPONS
 * =======
 * Coupon codes are not publicly readable: a policy that let the checkout query
 * the table would also let anyone list every unused code. So the two things
 * the checkout needs go through database functions that return one coupon and
 * nothing else.
 *
 * `redeemCoupon` also makes the usage count correct. Reading the count and
 * writing count + 1 from here let two simultaneous checkouts both see the same
 * value and a limited coupon be used past its limit; incrementing inside the
 * function is a single statement, so it cannot.
 *
 * Both functions live in supabase/migrations.
 */

export type CouponStatus = "ok" | "not_found" | "inactive" | "expired" | "exhausted";

export interface CouponCheck {
  status: CouponStatus;
  code: string;
  type: CouponType;
  value: string;
  minOrderValue: string | null;
}

/** Message for each rejection, matching what the checkout has always shown. */
export const COUPON_ERRORS: Record<Exclude<CouponStatus, "ok">, string> = {
  not_found: "Invalid coupon code",
  inactive: "Coupon is no longer active",
  expired: "Coupon has expired",
  exhausted: "Coupon usage limit reached",
};

async function callCouponFn(fn: string, code: string): Promise<CouponCheck> {
  const { data, error } = await getUserSupabase().rpc(fn, { p_code: code });
  if (error) throw new DbError(error.message, error);

  // The functions return at most one row.
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { status: "not_found" } as CouponCheck;

  return {
    status: row.status as CouponStatus,
    code: row.code,
    type: row.type as CouponType,
    value: row.value,
    minOrderValue: row.min_order_value,
  };
}

/** Checks a code without consuming it. */
export function validateCoupon(code: string): Promise<CouponCheck> {
  return callCouponFn("validate_coupon", code);
}

/** Checks a code and, if usable, counts one use against it. */
export function redeemCoupon(code: string): Promise<CouponCheck> {
  return callCouponFn("redeem_coupon", code);
}

/** The discount a usable coupon takes off a subtotal. */
export function discountFor(coupon: CouponCheck, subtotal: number): number {
  if (coupon.status !== "ok") return 0;

  const minimum = coupon.minOrderValue === null ? 0 : Number(coupon.minOrderValue);
  if (subtotal < minimum) return 0;

  const value = Number(coupon.value);
  const discount = coupon.type === "PERCENTAGE" ? subtotal * (value / 100) : value;

  // Never discount more than the order is worth.
  return Math.min(discount, subtotal);
}
