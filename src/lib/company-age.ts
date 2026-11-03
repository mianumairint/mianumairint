/**
 * Figures that change with the calendar, worked out when the page renders
 * instead of being typed into content and going stale every January.
 *
 * In CMS text, write:
 *   {years} -> years in business, e.g. "{years} Years of Trust" -> "31 Years of Trust"
 *   {year}  -> the current year,  e.g. a milestone dated "{year}"
 */
export const FOUNDED_YEAR = 1995;

export function currentYear(): number {
  return new Date().getFullYear();
}

export function yearsInBusiness(): number {
  return currentYear() - FOUNDED_YEAR;
}

export function fillDateTokens(text: string): string {
  return text
    .replace(/\{years\}/gi, String(yearsInBusiness()))
    .replace(/\{year\}/gi, String(currentYear()));
}

/** Applies fillDateTokens to every string inside a section's data. */
export function fillDateTokensDeep<T>(value: T): T {
  if (typeof value === "string") return fillDateTokens(value) as T;
  if (Array.isArray(value)) return value.map(fillDateTokensDeep) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, fillDateTokensDeep(v)])
    ) as T;
  }
  return value;
}
