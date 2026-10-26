import { formatPrice } from "@/lib/format";

/**
 * A product's price, or an invitation to ask for one.
 *
 * The catalogue is a B2B export list: most lines are quoted per shipment
 * rather than priced publicly, and those are stored with a price of 0. Showing
 * "$0.00" would read as free, so they show "Request a Quote" instead.
 *
 * The switch is on the price itself, not a flag, so the moment a real price is
 * entered in the dashboard that product starts showing it — no code change and
 * no mixed state where some products are priced and others are not.
 */

/** True when this product has no public price and must be quoted. */
export function isQuoteOnly(price: string | number | null | undefined): boolean {
  return !(Number(price) > 0);
}

export default function ProductPrice({
  price,
  comparePrice,
  size = "md",
}: {
  price: string | number | null | undefined;
  comparePrice?: string | number | null;
  /** Matches the surrounding type scale: cards use "md", the detail page "lg". */
  size?: "md" | "lg";
}) {
  const priceClass = size === "lg" ? "text-3xl" : "text-lg";

  if (isQuoteOnly(price)) {
    return (
      <span className="font-label text-xs uppercase tracking-widest text-primary">
        Request a Quote
      </span>
    );
  }

  return (
    <>
      <span className={`font-headline ${priceClass} text-primary`}>
        {formatPrice(price as string | number)}
      </span>
      {comparePrice ? (
        <span className="font-body text-sm text-on-surface-variant line-through">
          {formatPrice(comparePrice)}
        </span>
      ) : null}
    </>
  );
}
