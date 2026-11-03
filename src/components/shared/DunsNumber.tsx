export const DUNS_NUMBER = "75-337-5748";

/** Dun & Bradstreet registration, shown beside the contact details so buyers
 * can verify the company before placing an order. */
export default function DunsNumber() {
  return (
    <div className="flex gap-4">
      <span className="material-symbols-outlined text-primary text-3xl mt-1 shrink-0">
        verified
      </span>
      <div>
        <h3 className="font-headline text-lg text-on-surface mb-1">D&amp;B D-U-N-S&reg; Number</h3>
        <p className="font-label text-sm text-primary tabular-nums select-all">{DUNS_NUMBER}</p>
        <p className="font-body text-xs text-on-surface-variant mt-1">
          Registered with Dun &amp; Bradstreet as Mian Umair International
        </p>
      </div>
    </div>
  );
}
