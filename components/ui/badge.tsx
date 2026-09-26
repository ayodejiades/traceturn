import type { HTMLAttributes } from "react";

// A bracketed status tag, like a log-line level marker — never a pill.
export function Badge({ className = "", children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center border border-[var(--accent)] px-1.5 py-0.5 font-mono text-xs uppercase text-[var(--accent)] ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
