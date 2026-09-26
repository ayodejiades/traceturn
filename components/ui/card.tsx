import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-none border border-[var(--border)] bg-[var(--surface)] p-6 ${className}`}
      {...props}
    />
  );
}
