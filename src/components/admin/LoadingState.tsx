/**
 * The spinner-plus-caption block that every admin list and detail screen shows
 * while it loads. It was copied into eleven files; this renders exactly the
 * same markup from one place.
 *
 * `className` is the wrapper: list screens pad it inside their card
 * ("p-12 text-center"), while full-page loaders centre it themselves and pass
 * just "text-center".
 */
export default function LoadingState({
  label,
  className = "p-12 text-center",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="mt-3 font-label text-sm text-on-surface-variant">{label}</p>
    </div>
  );
}
