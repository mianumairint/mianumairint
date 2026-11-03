export default function Loading() {
  return (
    <div role="status" aria-label="Loading page" className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
      <div className="h-8 w-2/3 max-w-md rounded bg-surface-container mx-auto mb-8" />
      <div className="h-64 rounded-2xl bg-surface-container-low" />
      <span className="sr-only">Loading page...</span>
    </div>
  );
}
