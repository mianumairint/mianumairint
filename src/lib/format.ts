/**
 * DISPLAY FORMATTERS
 * ==================
 * Every page used to carry its own copy of these. They are collected here so a
 * price or a date is written the same way everywhere.
 *
 * There are deliberately three money formatters because the existing screens
 * render money three different ways. Pick the one that matches the screen:
 *
 *   formatPrice(12.5)            -> "$12.50"        line items, product prices
 *   formatCurrency(1234.5)       -> "$1,234.50"     totals and summaries
 *   formatCurrencyCompact(1234.5)-> "$1,235"        chart axes and tooltips
 *
 * `numeric` columns arrive from the database as strings, so each accepts both.
 */

type MoneyInput = number | string;

function toNumber(value: MoneyInput): number {
  return typeof value === "string" ? Number.parseFloat(value) : value;
}

/** Plain two-decimal price with no thousands separator. */
export function formatPrice(value: MoneyInput): string {
  return `$${toNumber(value).toFixed(2)}`;
}

/** As `formatPrice`, but renders null/undefined as a dash. */
export function formatPriceOrDash(value: MoneyInput | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return formatPrice(value);
}

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CURRENCY_COMPACT = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

/** Grouped currency, e.g. "$1,234.50". */
export function formatCurrency(value: MoneyInput): string {
  return CURRENCY.format(toNumber(value));
}

/** Grouped currency with no cents, e.g. "$1,235". */
export function formatCurrencyCompact(value: MoneyInput): string {
  return CURRENCY_COMPACT.format(toNumber(value));
}

/** A coupon's value, which is a percentage or an amount depending on `type`. */
export function formatCouponValue(type: string, value: MoneyInput): string {
  const num = toNumber(value);
  return type === "PERCENTAGE" ? `${num}%` : formatPrice(num);
}

/** Short date, e.g. "Oct 19, 2026". */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Date and time in the viewer's locale, e.g. "10/19/2026, 3:04:05 PM". */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

/** "HEALTH_WELLNESS" -> "Health & Wellness". */
export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, " & ").replace(/\b\w/g, (c) => c.toUpperCase());
}
