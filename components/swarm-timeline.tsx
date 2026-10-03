import type { ReportAct, ReportCorrection, ReportEpisode } from "@/lib/report";
import { fmtAt, fmtClaim } from "@/lib/tones";

/**
 * One claim's life as a picture: agents are rows, time runs left to right. Circles are
 * statements (coloured by what the statement was), diamonds are acts taken on the claim
 * (coloured by whether anyone had reported checking it), and a dashed line marks the
 * correction. Server-rendered SVG with <title> tooltips; no client state, so server and
 * client markup match.
 */

const W = 960;
const LABEL = 168;
const PAD_R = 24;
const ROW = 20;
const TOP = 30;
const BOTTOM = 34;

const ROLE_FILL: Record<string, string> = {
  ORIGIN: "var(--fg)",
  INDEPENDENT: "var(--accent)",
  CITED: "var(--fg-muted)",
  ECHO: "var(--danger)",
};
const ACT_FILL: Record<ReportAct["grounding"], string> = {
  AFTER_CORRECTION: "var(--danger)",
  UNGROUNDED: "var(--warn)",
  GROUNDED: "var(--accent)",
};
const ROLE_NAME: Record<string, string> = { ORIGIN: "stated first", INDEPENDENT: "checked", CITED: "credited a source", ECHO: "repeated, no check" };
const GROUNDING_NAME: Record<ReportAct["grounding"], string> = {
  AFTER_CORRECTION: "act after the correction",
  UNGROUNDED: "act, no reported check",
  GROUNDED: "act, grounded",
};

const t = (iso: string) => Date.parse(iso);

function fmtSpan(ms: number) {
  const h = ms / 3600_000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60_000))} min`;
  if (h < 48) return `${Math.round(h)} h`;
  return `${Math.round(h / 24)} d`;
}

export function SwarmTimeline({
  episode,
  acts,
  correction,
  maxRows = 40,
}: {
  episode: ReportEpisode;
  acts: ReportAct[];
  correction: ReportCorrection | null;
  /** Rows shown; agents with acts come first, then the rest in order of first appearance. */
  maxRows?: number;
}) {
  const events = [
    ...episode.assertions.map((a) => ({ kind: "statement" as const, agent: a.agent, ms: t(a.at), role: a.role, at: a.at })),
    ...acts.map((a) => ({ kind: "act" as const, agent: a.agent, ms: t(a.at), grounding: a.grounding, at: a.at, verb: a.verb, act: a })),
  ].sort((x, y) => x.ms - y.ms);

  const first = new Map<string, number>();
  const actors = new Set(acts.map((a) => a.agent));
  for (const e of events) if (!first.has(e.agent)) first.set(e.agent, e.ms);
  const order = [...first.keys()].sort((a, b) => Number(actors.has(b)) - Number(actors.has(a)) || first.get(a)! - first.get(b)!);
  const shown = order.slice(0, maxRows);
  const hidden = order.length - shown.length;
  const row = new Map(shown.map((a, i) => [a, i]));

  const correctedMs = correction ? t(correction.at) : null;
  const t0 = events[0].ms;
  const last = Math.max(events[events.length - 1].ms, correctedMs ?? 0);
  const span = Math.max(last - t0, 60_000);
  const x = (ms: number) => LABEL + ((ms - t0) / span) * (W - LABEL - PAD_R);
  const H = TOP + shown.length * ROW + BOTTOM;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ f, ms: t0 + span * f }));

  const nActs = acts.length;
  const label = `Timeline for “${fmtClaim(episode.claim)}”: ${episode.assertions.length} statements and ${nActs} listed acts by ${order.length} agents over ${fmtSpan(span)}${correction ? `, corrected by ${correction.correctedBy}` : ""}.`;

  return (
    <figure className="m-0">
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full min-w-[640px]" role="img" aria-label={label}>
          <title>{label}</title>
          {shown.map((agent, i) => (
            <g key={agent}>
              <line x1={LABEL} x2={W - PAD_R} y1={TOP + i * ROW + ROW / 2} y2={TOP + i * ROW + ROW / 2} stroke="var(--border)" strokeWidth={0.6} />
              <text x={LABEL - 8} y={TOP + i * ROW + ROW / 2 + 3.5} textAnchor="end" fontSize={10.5} fill={actors.has(agent) ? "var(--fg)" : "var(--fg-muted)"} fontFamily="var(--font-mono, ui-monospace, monospace)">
                {agent.length > 24 ? `${agent.slice(0, 23)}…` : agent}
              </text>
            </g>
          ))}
          {ticks.map(({ f, ms }) => (
            <g key={f}>
              <line x1={x(ms)} x2={x(ms)} y1={TOP - 6} y2={TOP + shown.length * ROW} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="2 4" />
              <text x={x(ms)} y={H - 14} textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"} fontSize={10} fill="var(--fg-subtle)" fontFamily="var(--font-mono, ui-monospace, monospace)">
                {f === 0 ? fmtAt(new Date(ms).toISOString()) : `+${fmtSpan(ms - t0)}`}
              </text>
            </g>
          ))}
          {correction && correctedMs !== null && (
            <g>
              <line x1={x(correctedMs)} x2={x(correctedMs)} y1={TOP - 12} y2={TOP + shown.length * ROW} stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="5 3" />
              <text x={x(correctedMs)} y={TOP - 16} textAnchor={x(correctedMs) > W - 140 ? "end" : "start"} fontSize={10.5} fill="var(--accent)" fontWeight={600}>
                corrected{correction.right ? ` to ${fmtClaim(correction.right)}` : ""}
              </text>
              <title>{`${correction.correctedBy} corrected it at ${fmtAt(correction.at)}`}</title>
            </g>
          )}
          {events.map((e, i) => {
            const r = row.get(e.agent);
            if (r === undefined) return null;
            const cx = x(e.ms);
            const cy = TOP + r * ROW + ROW / 2;
            if (e.kind === "statement") {
              return (
                <circle key={i} cx={cx} cy={cy} r={e.role === "ORIGIN" ? 5.2 : 3.8} fill={ROLE_FILL[e.role]} stroke="var(--surface)" strokeWidth={1}>
                  <title>{`${e.agent} · ${ROLE_NAME[e.role]} · ${fmtAt(e.at)}`}</title>
                </circle>
              );
            }
            const s = 5.2;
            return (
              <polygon
                key={i}
                points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
                fill={ACT_FILL[e.grounding]}
                stroke="var(--surface)"
                strokeWidth={1}
              >
                <title>{`${e.agent} · ${GROUNDING_NAME[e.grounding]} (${e.verb}) · ${fmtAt(e.at)}`}</title>
              </polygon>
            );
          })}
        </svg>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[var(--fg-muted)]">
        <Key shape="circle" color="var(--fg)" text="stated first" />
        <Key shape="circle" color="var(--accent)" text="checked" />
        <Key shape="circle" color="var(--fg-muted)" text="credited a source" />
        <Key shape="circle" color="var(--danger)" text="repeated, no check" />
        <Key shape="diamond" color="var(--warn)" text="act, no reported check" />
        <Key shape="diamond" color="var(--danger)" text="act after the correction" />
        <Key shape="diamond" color="var(--accent)" text="act, grounded" />
        {hidden > 0 && <span className="text-[var(--fg-subtle)]">+{hidden} more agents not drawn</span>}
      </figcaption>
    </figure>
  );
}

function Key({ shape, color, text }: { shape: "circle" | "diamond"; color: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
        {shape === "circle" ? <circle cx="6" cy="6" r="4" fill={color} /> : <polygon points="6,1 11,6 6,11 1,6" fill={color} />}
      </svg>
      {text}
    </span>
  );
}
