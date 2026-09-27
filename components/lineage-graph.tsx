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
    <div className="surface relative overflow-hidden p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow">Claim lineage - turn 4102</span>
        <span className="tnum text-xs text-[var(--fg-subtle)]">synthetic consensus</span>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[380px]">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="A claim cited by 14 agents resolving to a single independent origin."
        >
          <defs>
            <radialGradient id="originGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={origin.x} cy={origin.y} r="26" fill="url(#originGlow)" />

          {nodes.map((n, i) => {
            const on = i < revealed;
            return (
              <line
                key={"e" + i}
                x1={origin.x}
                y1={origin.y}
                x2={n.x}
                y2={n.y}
                stroke="var(--accent)"
                strokeWidth={on ? 0.45 : 0.25}
                strokeOpacity={on ? 0.75 : 0.16}
                style={{ transition: "stroke-opacity 320ms ease, stroke-width 320ms ease" }}
              />
            );
          })}

          {nodes.map((n, i) => {
            const on = i < revealed;
            return (
              <circle
                key={"n" + i}
                cx={n.x}
                cy={n.y}
                r={on ? 2.1 : 1.5}
                fill={on ? "var(--accent)" : "var(--fg-subtle)"}
                fillOpacity={on ? 1 : 0.35}
                style={{ transition: "r 320ms ease, fill 320ms ease" }}
              />
            );
          })}

          <circle
            cx={origin.x}
            cy={origin.y}
            r="5"
            fill="var(--bg)"
            stroke="var(--accent)"
            strokeWidth="1.6"
          />
          <circle cx={origin.x} cy={origin.y} r="1.8" fill="var(--accent)" />
        </svg>

        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[calc(100%+18px)] text-center">
          <div className="tnum text-lg font-semibold text-[var(--accent)]">1</div>
          <div className="text-[10px] leading-tight text-[var(--fg-subtle)]">
            independent
            <br />
            origin
          </div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-sm)] bg-[var(--border)]">
        <div className="bg-[var(--surface)] px-3 py-3">
          <div className="eyebrow mb-1">Asserted</div>
          <div className="tnum text-xl font-semibold">{revealed}</div>
        </div>
        <div className="bg-[var(--surface)] px-3 py-3">
          <div className="eyebrow mb-1">Corroborated by</div>
          <div className="tnum text-xl font-semibold text-[var(--accent)]">1 origin</div>
        </div>
      </div>
    </div>
  );
}
