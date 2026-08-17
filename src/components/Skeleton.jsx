
export function SkeletonLine({ className = "" }) {
  return <div className={`skeleton-shimmer animate-shimmer rounded-full ${className}`} />;
}

export function SkeletonCircle({ size = 44, className = "" }) {
  return (
    <div
      className={`skeleton-shimmer animate-shimmer rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <SkeletonCircle size={44} />
      <div className="flex-1 min-w-0 space-y-1.5">
        <SkeletonLine className="h-3 w-2/5" />
        <SkeletonLine className="h-2.5 w-4/5" />
        <SkeletonLine className="h-2.5 w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonStory() {
  return (
    <div className="flex flex-col items-center gap-1.5 w-[68px] shrink-0">
      <SkeletonCircle size={64} />
      <SkeletonLine className="h-2 w-12" />
    </div>
  );
}

export function SkeletonFeed({ count = 5 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
