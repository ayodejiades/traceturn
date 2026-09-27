export function TelemetryTile({
  label,
  value,
  sparkline = [14, 18, 16, 22, 20, 26, 24, 32, 29, 38],
  delta = "+4.8%",
  status = "live",
  unit = "",
}: {
  label: string;
  value: string;
  sparkline?: number[];
  delta?: string;
  status?: "live" | "nominal" | "warning";
  unit?: string;
}) {
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;
  const width = 120;
  const height = 32;

  // Build SVG polyline points
  const points = sparkline
    .map((val, index) => {
      const x = (index / (sparkline.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-mono text-[var(--fg-muted)]">
        <span className="uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "live"
                ? "bg-[var(--accent)] animate-pulse"
                : status === "warning"
                ? "bg-[var(--warn)]"
                : "bg-[var(--info)]"
            }`}
          />
          <span className="text-[10px] uppercase font-mono">{status}</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tracking-tight font-mono text-[var(--fg)]">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-[var(--fg-muted)]">{unit}</span>
          )}
        </div>

        {/* Inline SVG Sparkline */}
        <div className="shrink-0">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--fg-muted)] pt-1 border-t border-[var(--border)]">
        <span className="text-[var(--accent)]">{delta}</span>
        <span>rolling window</span>
      </div>
    </div>
  );
}
