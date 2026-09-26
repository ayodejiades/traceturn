import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

// The pack's most valuable component: dense, column-aligned, monospace,
// tabular-nums, no wrapping — a data table meant to be scanned like a log
// file, not a card-flavoured list.
export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={`w-full border-collapse whitespace-nowrap text-left font-mono text-sm tabular-nums text-[var(--fg)] ${className}`}
      {...props}
    />
  );
}

export function TableHead({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1 text-xs font-normal uppercase tracking-wide text-[var(--fg-muted)] ${className}`}
      {...props}
    />
  );
}

export function TableCell({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`border border-[var(--border)] px-2 py-1 ${className}`} {...props} />
  );
}
