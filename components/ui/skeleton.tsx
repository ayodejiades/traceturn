// A row of blinking monospace block characters, like a terminal progress
// indicator — not a smooth gradient shimmer.
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 font-mono text-[var(--border)] ${className}`} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
          █
        </span>
      ))}
    </div>
  );
}
