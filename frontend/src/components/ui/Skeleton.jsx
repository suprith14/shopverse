// Skeletons: grey shapes in the layout of the real content, shown while it loads.
// Compared with a spinner, the page doesn't jump when data arrives (no "layout shift") and it
// feels faster because the structure is visible at once.
// motion-safe: the pulse only plays if the visitor hasn't asked their device to reduce motion.

export function Skeleton({ className = '' }) {
  return <div aria-hidden className={`rounded-md bg-slate-200 motion-safe:animate-pulse ${className}`} />;
}

// Same grid and card shape as ProductCard.
export function ProductGridSkeleton({ count = 8, className = 'grid grid-cols-2 gap-4 md:grid-cols-4' }) {
  return (
    <div className={className} role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-surface">
          <Skeleton className="aspect-square rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Same layout as the product page: gallery left, details right.
export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-10 md:grid-cols-2" role="status" aria-label="Loading product">
      <Skeleton className="aspect-square rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

// Rows like the cart, orders and similar lists.
export function ListSkeleton({ rows = 3 }) {
  return (
    <div
      className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-surface"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="size-16 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
