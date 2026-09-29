/**
 * Two versions of a text side by side, with changed lines marked. Used by /verify to
 * show the pinned manifest against the edited one, so a single changed byte is visible.
 * Line-level comparison is enough here: manifests are canonical JSON, one field a line.
 */
export function CodeDiff({
  beforeTitle,
  afterTitle,
  beforeCode,
  afterCode,
}: {
  beforeTitle: string;
  afterTitle: string;
  beforeCode: string;
  afterCode: string;
}) {
  const a = beforeCode.split("\n");
  const b = afterCode.split("\n");
  const n = Math.max(a.length, b.length);
  const changed = Array.from({ length: n }, (_, i) => a[i] !== b[i]);
  const count = changed.filter(Boolean).length;

  const pane = (lines: string[], title: string, tone: "before" | "after") => (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between border-b border-[var(--border)] px-4 py-2.5">
        <span className="text-xs font-medium text-[var(--fg)]">{title}</span>
        {tone === "after" && (
          <span className={`font-mono text-[10px] ${count ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}>
            {count ? `${count} line${count > 1 ? "s" : ""} differ` : "identical"}
          </span>
        )}
      </div>
      {/* Focusable so keyboard users can scroll long lines sideways. */}
      <pre tabIndex={0} aria-label={title} className="overflow-x-auto py-2 font-mono text-[11px] leading-relaxed">
        {Array.from({ length: n }, (_, i) => (
          <div
            key={i}
            className={`px-4 ${
              changed[i]
                ? tone === "after"
                  ? "bg-[var(--danger-surface)] text-[var(--fg)]"
                  : "bg-[var(--surface-raised)] text-[var(--fg-muted)]"
                : "text-[var(--fg-muted)]"
            }`}
          >
            {lines[i] ?? " "}
          </div>
        ))}
      </pre>
    </div>
  );

  return (
    <div className="grid overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] md:grid-cols-2 md:divide-x md:divide-[var(--border)]">
      {pane(a, beforeTitle, "before")}
      {pane(b, afterTitle, "after")}
    </div>
  );
}
