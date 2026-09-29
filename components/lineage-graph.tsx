import Link from "next/link";
import type { ReportEpisode } from "@/lib/report";
import { ROLE, STATE, TONE_TEXT, TONE_VAR, fmtAt, fmtClaim } from "@/lib/tones";

/**
 * Landing-page graph of one real episode from the committed AI Village report.
 * The origin sits in the centre; every later statement is a node on the ring, coloured
 * by its role, with an edge to the statement it derives from. Nodes fade in in time
 * order with a CSS animation (globals.css `lineage-in`), which the reduced-motion rule
 * already disables. Counts are static, so no mid-animation number contradicts the copy.
 *
 * Deterministic layout, so server and client render the same markup.
 */
function polar(index: number, total: number, radius: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
}

export function LineageGraph({ episode, corpus }: { episode: ReportEpisode; corpus: "aivillage" | "collusion" }) {
  const rest = episode.assertions.slice(1);

  const pos = [{ x: 50, y: 50 }, ...rest.map((_, i) => polar(i, rest.length, 36))];
  // Past about 16 statements the ring is too dense for names; show the fan alone.
  const dense = rest.length > 16;
  const step = dense ? Math.min(260, 6000 / rest.length) : 260;
  const reveal = (i: number) => ({ animation: "lineage-in 360ms ease both", animationDelay: `${300 + i * step}ms` });
  const counts = { checked: 0, credited: 0, echoed: 0 };
  for (const a of rest) {
    if (a.role === "INDEPENDENT") counts.checked++;
    else if (a.role === "CITED") counts.credited++;
    else if (a.role === "ECHO") counts.echoed++;
  }
  const state = STATE[episode.state];

  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
      <div className="bg-[var(--surface)] p-5">
        <div className="mx-auto aspect-square w-full max-w-[260px]">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={`${episode.assertions.length} speakers stated “${fmtClaim(episode.claim)}”; ${episode.observed} had evidence of their own.`}
          >
            {rest.map((a, i) => {
              const from = pos[a.parent < 0 ? i + 1 : a.parent];
              const to = pos[i + 1];
              if (a.parent < 0 || !a.edge) return null;
              return (
                <line
                  key={`e${i}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={a.edge === "cites" ? "var(--fg-subtle)" : "var(--danger)"}
                  strokeWidth={0.5}
                  strokeDasharray={a.edge === "exposed" ? "1.4 1.2" : undefined}
                  strokeOpacity={0.8}
                  style={reveal(i)}
                />
              );
            })}
            {rest.map((a, i) => {
              const p = pos[i + 1];
              const tone = TONE_VAR[ROLE[a.role].tone];
              return (
                <g key={`n${i}`} style={reveal(i)}>
                  {a.role === "INDEPENDENT" && <circle cx={p.x} cy={p.y} r={dense ? 2.6 : 4.2} fill="none" stroke={tone} strokeWidth={0.6} />}
                  <circle cx={p.x} cy={p.y} r={dense ? 1.3 : 2.4} fill={tone} />
                  {!dense && (
                  <text
                    x={p.x}
                    y={p.y + (p.y >= 50 ? 7.5 : -5)}
                    textAnchor="middle"
                    className="fill-[var(--fg-subtle)]"
                    style={{ fontSize: 3.1 }}
                  >
                    {a.agent.length > 16 ? a.agent.slice(0, 15) + "…" : a.agent}
                  </text>
                  )}
                </g>
              );
            })}
            <circle cx={50} cy={50} r={6} fill="var(--bg)" stroke="var(--fg)" strokeWidth={1.2} />
            <circle cx={50} cy={50} r={2.2} fill="var(--fg)" />
            <text x={50} y={62} textAnchor="middle" className="fill-[var(--fg)]" style={{ fontSize: 3.4, fontWeight: 600 }}>
              {episode.assertions[0].agent}
            </text>
          </svg>
        </div>
      </div>

      <div className="flex flex-col bg-[var(--surface)] p-5">
        <div className="eyebrow mb-1">Claim</div>
        <div className="tnum text-2xl font-semibold text-[var(--fg)]">“{fmtClaim(episode.claim)}”</div>
        <div className="mt-1 font-mono text-[11px] text-[var(--fg-subtle)]">
          {episode.id} · first stated {fmtAt(episode.assertions[0].at)}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--border)]">
          {[
            ["Stated as known", episode.promised, "fg"],
            ["Independent paths", episode.observed, "accent"],
            ["Echoed", counts.echoed, "danger"],
            ["Credited", counts.credited, "muted"],
          ].map(([label, value, tone]) => (
            <div key={label as string} className="bg-[var(--bg)] px-3 py-2.5">
              <dt className="eyebrow mb-0.5">{label}</dt>
              <dd className={`tnum text-lg font-semibold ${TONE_TEXT[tone as keyof typeof TONE_TEXT]}`}>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
          <div className={`text-sm font-medium ${TONE_TEXT[state.tone]}`}>{state.label}</div>
          <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">{episode.summary}</p>
        </div>

        <Link
          href={`/proof?corpus=${corpus}&ep=${episode.id}#episodes`}
          className="mt-auto pt-4 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Read every statement in this lineage →
        </Link>
      </div>
    </div>
  );
}
