// Tabular-aligned numerals in a hard-bordered box — a metrics readout, not a
// soft dashboard tile.
export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-none border border-[var(--border)] bg-[var(--surface)] p-4 font-mono">
      <span className="text-xs uppercase tracking-wide text-[var(--fg-muted)]">{label}</span>
      <span className="text-2xl tabular-nums text-[var(--accent)]">{value}</span>
      {hint ? <span className="text-xs text-[var(--fg-muted)]">{hint}</span> : null}
    </div>
  );
}
