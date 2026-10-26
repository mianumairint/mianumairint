/**
 * STATUS BADGE COLOURS
 * ====================
 * The same Tailwind class maps were copied into five admin screens. They are
 * shared from here so a status looks the same wherever it appears.
 *
 * The fallback class differs by screen, so it stays at the call site:
 *   statusClass(ORDER_STATUS_COLORS, status, "bg-surface-container text-on-surface-variant")
 */

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-red-100 text-red-800",
};

/**
 * The dashboard has always shown REFUNDED in grey rather than red, unlike the
 * order screens. Kept as an explicit override so the difference is visible
 * instead of hidden in a second copy of the whole map.
 */
export const DASHBOARD_ORDER_STATUS_COLORS: Record<string, string> = {
  ...ORDER_STATUS_COLORS,
  REFUNDED: "bg-gray-100 text-gray-800",
};

export const QUOTE_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-primary/10 text-primary",
  REVIEWING: "bg-amber-100 text-amber-800",
  QUOTED: "bg-green-100 text-green-800",
  CLOSED: "bg-surface-container text-on-surface-variant",
};

/** Looks up a status class, falling back to the caller's neutral style. */
export function statusClass(
  colors: Record<string, string>,
  status: string,
  fallback: string
): string {
  return colors[status] || fallback;
}
