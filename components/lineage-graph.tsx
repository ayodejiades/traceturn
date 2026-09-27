"use client";

import { useEffect, useState } from "react";

/**
 * Hero visual: the tool's actual finding, rendered.
 *
 * A premise asserted by 14 agents resolves to 1 independent origin. Edges light up
 * in sequence while the independent-origin count stays at one -- the gap that a
 * transcript summary cannot see.
 *
 * Deterministic: node positions and pulse order are fixed, not random, so the hero
 * renders identically on the server and the client.
 */

const CITATIONS = 14;

function polar(index: number, total: number, radius: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
}

const LOG = [
  { id: "SWARM-01", state: "MATERIAL_DRIFT", tone: "flag" },
  { id: "SWARM-02", state: "ON_TRACK", tone: "pass" },
  { id: "SWARM-03", state: "BENIGN", tone: "pass" },
  { id: "SWARM-04", state: "MATERIAL_DRIFT", tone: "flag" },
  { id: "SWARM-05", state: "WAITING", tone: "wait" },
  { id: "SWARM-07", state: "ABSTAIN", tone: "wait" },
] as const;

const TONE = {
  flag: "text-[var(--accent)]",
  pass: "text-[var(--fg-muted)]",
  wait: "text-[var(--warn)]",
} as const;

export function LineageGraph() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(CITATIONS);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= CITATIONS) clearInterval(id);
    }, 150);
    return () => clearInterval(id);
  }, []);

  const origin = { x: 50, y: 50 };
  const nodes = Array.from({ length: CITATIONS }, (_, i) => polar(i, CITATIONS, 37));

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 60% 40%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 70%)",
        }}
      />

      <div className="relative overflow-hidden rounded-[14px] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-[var(--page-pad)] py-2.5">
          <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
          <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
          <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--border-strong)]" />
          <span className="ml-2 font-mono text-[11px] text-[var(--fg-subtle)]">
            traceturn / lineage · turn 4102
          </span>
        </div>

        <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2">
          <div className="bg-[var(--bg)] p-5">
            <div className="relative mx-auto aspect-square w-full max-w-[230px]">
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full overflow-visible"
                role="img"
                aria-label="A claim cited by 14 agents resolving to a single independent origin."
              >
                <defs>
                  <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx={origin.x} cy={origin.y} r="27" fill="url(#originGlow)" />
                {nodes.map((n, i) => (
                  <line
                    key={"e" + i}
                    x1={origin.x}
                    y1={origin.y}
                    x2={n.x}
                    y2={n.y}
                    stroke="var(--accent)"
                    strokeWidth={i < revealed ? 0.45 : 0.25}
                    strokeOpacity={i < revealed ? 0.7 : 0.14}
                    style={{ transition: "stroke-opacity 320ms ease, stroke-width 320ms ease" }}
                  />
                ))}
                {nodes.map((n, i) => (
                  <circle
                    key={"n" + i}
                    cx={n.x}
                    cy={n.y}
                    r={i < revealed ? 2.1 : 1.5}
                    fill={i < revealed ? "var(--accent)" : "var(--fg-subtle)"}
                    fillOpacity={i < revealed ? 1 : 0.3}
                    style={{ transition: "r 320ms ease, fill 320ms ease" }}
                  />
                ))}
                <circle cx={origin.x} cy={origin.y} r="5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.6" />
                <circle cx={origin.x} cy={origin.y} r="1.8" fill="var(--accent)" />
              </svg>
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[calc(100%+16px)] text-center">
                <div className="tnum text-base font-semibold text-[var(--accent)]">1</div>
                <div className="text-[9px] leading-tight text-[var(--fg-subtle)]">
                  independent
                  <br />
                  origin
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-sm)] bg-[var(--border)]">
              <div className="bg-[var(--surface)] px-3 py-2.5">
                <div className="eyebrow mb-0.5">Asserted</div>
                <div className="tnum text-lg font-semibold">{revealed}</div>
              </div>
              <div className="bg-[var(--surface)] px-3 py-2.5">
                <div className="eyebrow mb-0.5">Corroborated by</div>
                <div className="tnum text-lg font-semibold text-[var(--accent)]">1</div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg)] p-5">
            <div className="eyebrow mb-3">Verdict log</div>
            <div className="space-y-1.5">
              {LOG.map((row, i) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-[6px] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5"
                  style={{ opacity: i < revealed ? 1 : 0.25, transition: "opacity 320ms ease" }}
                >
                  <span className="font-mono text-[10px] text-[var(--fg-subtle)]">{row.id}</span>
                  <span className={`font-mono text-[10px] ${TONE[row.tone]}`}>{row.state}</span>
                </div>
              ))}
            </div>
            <div
              className="mt-3 rounded-[6px] border px-2.5 py-2"
              style={{
                borderColor: "color-mix(in oklab, var(--accent) 26%, transparent)",
                background: "color-mix(in oklab, var(--accent) 8%, transparent)",
              }}
            >
              <p className="text-[10px] leading-relaxed text-[var(--fg-muted)]">
                Synthetic consensus: 14 assertions, one origin, zero independent
                corroboration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
