import type { ReportEpisode } from "@/lib/report";
import { ROLE, TONE_TEXT, TONE_VAR, fmtAt, fmtOffset, plain } from "@/lib/tones";

const ROW = 88; // px; rows are fixed-height so the edge gutter can be drawn without measuring
const NODE_X = 46;

/** Wrap the claim's number in <mark> so the eye finds it in each sentence. */
function Highlighted({ text, claim }: { text: string; claim: string }) {
  const needle = claim.split(" ")[0].replace(/^[$£€]/, "");
  const variants = [needle, Number(needle.replace(/[^\d.]/g, "")).toLocaleString("en-US")];
  const lower = text.toLowerCase();
  let at = -1;
  let len = 0;
  for (const v of variants) {
    const i = lower.indexOf(v.toLowerCase());
    if (v && i >= 0) {
      at = i;
      len = v.length;
      break;
    }
  }
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[3px] bg-[var(--surface-raised)] px-0.5 text-[var(--fg)]">{text.slice(at, at + len)}</mark>
      {text.slice(at + len)}
    </>
  );
}

/**
 * One episode as a derivation graph. Each row is one agent's first statement of the
 * claim, in time order; the gutter draws the edge to the statement it derives from.
 *   solid red    copies wording from that statement
 *   dashed red   said after it in the same room, with no credit and no own observation
 *   grey         credits it by name
 *   green ring   an independent path: no incoming edge that carries the claim
 */
export function LineageView({ episode }: { episode: ReportEpisode }) {
  const rows = episode.assertions;
  const h = rows.length * ROW;
  const y = (i: number) => i * ROW + 22;
  const origin = rows[0];

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-0 top-0"
        width={NODE_X + 10}
        height={h}
        aria-hidden
      >
        {rows.map((a, i) => {
          if (a.parent < 0 || !a.edge) return null;
          const y1 = y(a.parent);
          const y2 = y(i);
          const bulge = Math.min(NODE_X - 6, 10 + (i - a.parent) * 7);
          const stroke = a.edge === "cites" ? "var(--fg-subtle)" : "var(--danger)";
          return (
            <path
              key={i}
              d={`M ${NODE_X} ${y1} C ${NODE_X - bulge} ${y1}, ${NODE_X - bulge} ${y2}, ${NODE_X} ${y2}`}
              fill="none"
              stroke={stroke}
              strokeWidth={a.edge === "copies" ? 1.6 : 1.2}
              strokeDasharray={a.edge === "exposed" ? "3 3" : undefined}
              strokeOpacity={a.edge === "cites" ? 0.8 : 0.75}
            />
          );
        })}
        {rows.map((a, i) => {
          const tone = TONE_VAR[ROLE[a.role].tone];
          const root = a.role === "ORIGIN" || a.role === "INDEPENDENT";
          return (
            <g key={`n${i}`}>
              {root && <circle cx={NODE_X} cy={y(i)} r={7} fill="none" stroke={tone} strokeWidth={1.2} strokeOpacity={0.6} />}
              <circle cx={NODE_X} cy={y(i)} r={4} fill={tone} />
            </g>
          );
        })}
      </svg>

      <ol className="relative" style={{ paddingLeft: NODE_X + 18 }}>
        {rows.map((a, i) => {
          const role = ROLE[a.role];
          return (
            <li key={a.turnId + i} className="overflow-hidden border-b border-[var(--border)] last:border-b-0" style={{ height: ROW }}>
              <div className="flex min-w-0 items-center gap-2 pt-3 text-xs">
                <span className="min-w-0 truncate font-medium text-[var(--fg)]">{a.agent === "human" ? "A human participant" : a.agent}</span>
                <span className={`shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] ${TONE_TEXT[role.tone]}`} title={role.help}>
                  {role.label}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--fg-subtle)]">
                  {i === 0 ? (
                    <>
                      <span className="hidden sm:inline">{fmtAt(a.at)}</span>
                      <span className="sm:hidden">{a.at.slice(0, 10)}</span>
                    </>
                  ) : (
                    fmtOffset(origin.at, a.at)
                  )}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[var(--fg-muted)]">
                {a.excerpt ? (
                  <Highlighted text={plain(a.excerpt)} claim={episode.claim} />
                ) : (
                  <span className="italic text-[var(--fg-subtle)]">Human message, not quoted.</span>
                )}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LineageLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[var(--fg-muted)]">
      {(["ORIGIN", "INDEPENDENT", "CITED", "ECHO"] as const).map((r) => (
        <li key={r} className="flex items-center gap-1.5" title={ROLE[r].help}>
          <span className="h-2 w-2 rounded-full" style={{ background: TONE_VAR[ROLE[r].tone] }} />
          <span className={TONE_TEXT[ROLE[r].tone]}>{ROLE[r].label}</span>
          <span className="hidden text-[var(--fg-subtle)] sm:inline">· {ROLE[r].help}</span>
        </li>
      ))}
    </ul>
  );
}
