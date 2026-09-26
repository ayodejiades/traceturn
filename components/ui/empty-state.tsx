import type { ReactNode } from "react";
import { Illustration } from "./illustration";

export function EmptyState({
  illustration = "no-data",
  title,
  description,
  action,
}: {
  illustration?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-none border border-[var(--border)] bg-[var(--surface)] p-10 text-center font-mono">
      <Illustration id={illustration} className="h-28 w-28" />
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[var(--fg)]">
          <span aria-hidden="true" className="text-[var(--accent)]">
            ${" "}
          </span>
          {title}
        </p>
        {description ? <p className="text-sm text-[var(--fg-muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
