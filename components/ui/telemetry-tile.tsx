import { TONE_VAR, type Tone } from "@/lib/tones";

/**
 * A metric with the real series behind it. There are no default values: a tile
 * without data should not render a made-up sparkline.
 */
export function TelemetryTile({
  label,
  value,
  caption,
  series,
  seriesLabel,
  tone = "accent",
}: {
  label: string;
  value: string;
  caption: string;
  series: number[];
  seriesLabel: string;
  tone?: Tone;
}) {
  const width = 160;
  const height = 36;
  const max = Math.max(1, ...series);
  const step = series.length > 1 ? width / (series.length - 1) : width;
  const points = series.map((v, i) => `${(i * step).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`).join(" ");

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="eyebrow">{label}</div>
      <div className="flex items-end justify-between gap-4">
        <div className="tnum text-3xl font-semibold tracking-tight text-[var(--fg)]">{value}</div>
        {series.length > 1 && (
          <svg width={width} height={height} className="shrink-0 overflow-visible" role="img" aria-label={seriesLabel}>
            <polyline fill="none" stroke={TONE_VAR[tone]} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" points={points} />
          </svg>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3 border-t border-[var(--border)] pt-2 text-xs text-[var(--fg-muted)]">
        <span>{caption}</span>
        <span className="font-mono text-[10px] text-[var(--fg-subtle)]">{seriesLabel}</span>
      </div>
    </div>
  );
}
