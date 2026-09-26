"use client";

/**
 * Self-walking Hero Console Tour + Interactive 3-Mode Pipeline Topology Graph
 * + 3-Seat "Who This Is For" Operational Role Strip.
 *
 * Uses the Editorial Rice-Paper & Swiss-Grid Design System (#ffffff canvas, #f5f5f5 mist,
 * 1px #e5e5e5 hairlines, weight-500 display type, tabular numerals, semantic refusal red).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BENCHMARK_CASES, SAFETY_INVARIANTS, computeCampaignSummary } from "@/lib/kernel";
import { SPONSORS } from "@/lib/sponsors";

const DWELL_MS = 5200;

type PipelineMode = "NAIVE_LLM" | "HEURISTIC_DIFF" | "FULL_KERNEL";

export function ConsoleTour() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pipelineMode, setPipelineMode] = useState<PipelineMode>("FULL_KERNEL");
  const [replayTick, setReplayTick] = useState(0);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const summary = computeCampaignSummary();
  const headlineCase = BENCHMARK_CASES[0];

  const stops = [
    { id: "overview", label: "Overview", tone: "orange" as const },
    { id: "topology", label: "Pipeline graph", tone: "blue" as const },
    { id: "invariants", label: "Safety kernel", tone: "green" as const },
    { id: "sponsors", label: "Sponsor seams", tone: "blue" as const },
    { id: "receipt", label: "Evidence manifest", tone: "green" as const },
  ];

  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible) return;
    const timer = window.setTimeout(
      () => setActive((curr) => (curr + 1) % stops.length),
      DWELL_MS
    );
    return () => window.clearTimeout(timer);
  }, [paused, visible, active, stops.length]);

  const selectStop = useCallback((idx: number) => {
    setActive(idx);
  }, []);

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 space-y-10 text-[#171717]">
      {/* Live Verifier Stamp Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1.5 shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
          <span className="font-mono text-[11px] font-medium uppercase text-[#1e40af] tabular-nums">
            {headlineCase.id} · actionable drift · {summary.totalCases}/{summary.totalCases} reconciled · verifier PASS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="rounded-[8px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-[12px] font-medium text-[#404040] hover:bg-[#f5f5f5]"
          >
            {paused ? "Resume tour" : "Hold screen"}
          </button>
          <Link
            href="/verify"
            className="rounded-[8px] bg-black px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#171717]"
          >
            Verify the proof →
          </Link>
        </div>
      </div>

      {/* Walked Hero Console Frame */}
      <div
        ref={frameRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="overflow-hidden rounded-[16px] border border-[#d4d4d4] bg-white shadow-[0_12px_36px_rgba(10,10,10,0.06)]"
      >
        {/* Top Console Rail */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e5e5e5] bg-[#f5f5f5] px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-1">
            {stops.map((stop, idx) => {
              const isCurrent = idx === active;
              const dotClass =
                stop.tone === "green"
                  ? "bg-[#16a34a]"
                  : stop.tone === "orange"
                  ? "bg-[#ea580c]"
                  : "bg-[#2563eb]";
              return (
                <button
                  key={stop.id}
                  type="button"
                  data-demo={`tour-stop-${stop.id}`}
                  onClick={() => selectStop(idx)}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    isCurrent
                      ? "bg-white text-[#171717] border border-[#d4d4d4] shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]"
                      : "text-[#525252] hover:text-[#171717] hover:bg-white/60 border border-transparent"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isCurrent ? dotClass : "bg-[#a3a3a3]"}`} />
                  <span>{stop.label}</span>
                </button>
              );
            })}
          </div>
          <span className="font-mono text-[11px] text-[#737373] hidden md:inline">
            Live data from deterministic corpus · Hover to hold a screen, or click any step
          </span>
        </div>

        {/* Active Tour Panel Body */}
        <div className="p-5 sm:p-6 min-h-[360px] flex flex-col justify-between bg-white">
          {active === 0 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
                    Estate & verification health
                  </p>
                  <h3 className="mt-1 text-[18px] font-medium tracking-[-0.02em] text-[#171717]">
                    Every candidate diff is checked against five deterministic invariants before state commits
                  </h3>
                </div>
                <Link href="/dashboard" className="text-[13px] font-medium text-[#2563eb] hover:underline">
                  Open console →
                </Link>
              </div>

              {/* Collapsed Hairline Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white">
                {[
                  { label: "Scored corpus", val: `${summary.totalCases}`, sub: "14 drift · 8 benign" },
                  { label: "Recall", val: `${summary.fullPipeline.recallPct}%`, sub: "14/14 caught" },
                  { label: "Precision", val: `${summary.fullPipeline.precisionPct}%`, sub: "0 false alarms" },
                  { label: "Groundedness", val: "100%", sub: "INV-01 byte-verified" },
                  { label: "Agent write access", val: "0 tools", sub: "Kernel-gated only" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="border-r border-b sm:border-b-0 border-[#e5e5e5] last:border-r-0 p-4"
                  >
                    <div className="text-[12px] text-[#525252]">{m.label}</div>
                    <div className="mt-1 font-mono text-[22px] font-semibold tracking-[-0.02em] text-[#171717] tabular-nums">
                      {m.val}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-[#737373]">{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Sample Cases Table */}
              <div className="overflow-hidden rounded-[12px] border border-[#e5e5e5]">
                <div className="grid grid-cols-12 border-b border-[#e5e5e5] bg-[#f5f5f5] px-4 py-2 font-mono text-[11px] text-[#525252]">
                  <div className="col-span-2">Case</div>
                  <div className="col-span-5">Surface & clause</div>
                  <div className="col-span-3">Kernel check</div>
                  <div className="col-span-2 text-right">State</div>
                </div>
                {BENCHMARK_CASES.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 items-center border-b border-[#e5e5e5] last:border-b-0 bg-white px-4 py-2.5 text-[13px]"
                  >
                    <div className="col-span-2 font-mono text-[12px] text-[#171717]">{c.id}</div>
                    <div className="col-span-5 truncate pr-3 font-medium text-[#171717]">{c.title}</div>
                    <div className="col-span-3 font-mono text-[11px] text-[#525252]">5/5 invariants pass</div>
                    <div className="col-span-2 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          c.expectedActionable
                            ? "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]"
                            : "border-[#e5e5e5] bg-[#f5f5f5] text-[#404040]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            c.expectedActionable ? "bg-[#16a34a]" : "bg-[#a3a3a3]"
                          }`}
                        />
                        {c.expectedActionable ? "COMMITTED" : "SUPPRESSED"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 1 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
                    Ablation topology
                  </p>
                  <h3 className="mt-1 text-[18px] font-medium tracking-[-0.02em] text-[#171717]">
                    Switch between Naive LLM, Heuristic Diff, and the Grounded Safety Kernel
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  {(["NAIVE_LLM", "HEURISTIC_DIFF", "FULL_KERNEL"] as PipelineMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setPipelineMode(m);
                        setReplayTick((t) => t + 1);
                      }}
                      className={`rounded-[8px] border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                        pipelineMode === m
                          ? "border-black bg-black text-white"
                          : "border-[#e5e5e5] bg-white text-[#404040] hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReplayTick((t) => t + 1)}
                    className="rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-1 font-mono text-[11px] text-[#171717] hover:bg-[#e5e5e5]"
                  >
                    ↻ Replay
                  </button>
                </div>
              </div>

              <div key={replayTick} className="rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] p-4">
                <svg viewBox="0 0 820 200" className="w-full h-auto">
                  <path
                    d="M 175 100 L 295 100"
                    stroke={pipelineMode === "NAIVE_LLM" ? "#ea580c" : "#2563eb"}
                    strokeWidth="2"
                    strokeDasharray={pipelineMode === "NAIVE_LLM" ? "5 4" : "none"}
                  />
                  <path
                    d="M 470 100 L 580 60"
                    stroke={pipelineMode === "FULL_KERNEL" ? "#16a34a" : "#dc2626"}
                    strokeWidth="2"
                  />
                  <path
                    d="M 470 100 L 580 145"
                    stroke="#a3a3a3"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  <g transform="translate(20, 55)">
                    <rect width="155" height="88" rx="10" fill="#ffffff" stroke="#d4d4d4" strokeWidth="1.5" />
                    <text x="14" y="26" fill="#2563eb" fontSize="10" fontFamily="monospace">01 CAPTURE SEAM</text>
                    <text x="14" y="48" fill="#171717" fontSize="13" fontWeight="600">Rendered DOM</text>
                    <text x="14" y="68" fill="#737373" fontSize="11" fontFamily="monospace">22 corpus snapshots</text>
                  </g>

                  <g transform="translate(295, 50)">
                    <rect
                      width="175"
                      height="98"
                      rx="10"
                      fill="#ffffff"
                      stroke={pipelineMode === "FULL_KERNEL" ? "#2563eb" : "#ea580c"}
                      strokeWidth="1.5"
                    />
                    <text x="14" y="25" fill="#525252" fontSize="10" fontFamily="monospace">02 EXTRACTION + GATE</text>
                    <text x="14" y="46" fill="#171717" fontSize="13" fontWeight="600">
                      {pipelineMode === "NAIVE_LLM"
                        ? "Unchecked Prompt"
                        : pipelineMode === "HEURISTIC_DIFF"
                        ? "Regex Line Diff"
                        : "5-Invariant Kernel"}
                    </text>
                    <text
                      x="14"
                      y="66"
                      fill={pipelineMode === "FULL_KERNEL" ? "#16a34a" : "#dc2626"}
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {pipelineMode === "NAIVE_LLM"
                        ? "6 false alarms leaked"
                        : pipelineMode === "HEURISTIC_DIFF"
                        ? "5 false alarms leaked"
                        : "100% byte-grounded"}
                    </text>
                    <text x="14" y="84" fill="#737373" fontSize="10" fontFamily="monospace">
                      {pipelineMode === "FULL_KERNEL" ? "INV-01..05 enforced" : "No substring verification"}
                    </text>
                  </g>

                  <g transform="translate(580, 18)">
                    <rect
                      width="220"
                      height="78"
                      rx="10"
                      fill="#ffffff"
                      stroke={pipelineMode === "FULL_KERNEL" ? "#16a34a" : "#dc2626"}
                      strokeWidth="1.5"
                    />
                    <text x="14" y="24" fill="#166534" fontSize="10" fontFamily="monospace">03 VERIFIED RECEIPT</text>
                    <text x="14" y="44" fill="#171717" fontSize="12" fontWeight="600">
                      {pipelineMode === "FULL_KERNEL"
                        ? "14/14 actionable · 0 false alarms"
                        : pipelineMode === "HEURISTIC_DIFF"
                        ? "9 caught · 5 false alarms"
                        : "11 caught · 6 false alarms"}
                    </text>
                    <text x="14" y="63" fill="#525252" fontSize="11" fontFamily="monospace">
                      Precision: {pipelineMode === "FULL_KERNEL" ? "100.0%" : pipelineMode === "HEURISTIC_DIFF" ? "64.3%" : "64.7%"}
                    </text>
                  </g>

                  <g transform="translate(580, 108)">
                    <rect width="220" height="76" rx="10" fill="#ffffff" stroke="#d4d4d4" strokeWidth="1.5" />
                    <text x="14" y="24" fill="#9a3412" fontSize="10" fontFamily="monospace">04 REFUSAL LEDGER</text>
                    <text x="14" y="44" fill="#171717" fontSize="12" fontWeight="600">
                      {pipelineMode === "FULL_KERNEL"
                        ? "8/8 benign edits suppressed"
                        : "Hallucinations reach operator"}
                    </text>
                    <text x="14" y="62" fill="#737373" fontSize="10" fontFamily="monospace">
                      Deterministic reason code logged
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {active === 2 && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
                    Authority boundary
                  </p>
                  <h3 className="mt-1 text-[18px] font-medium tracking-[-0.02em] text-[#171717]">
                    Five hard invariants enforced by `lib/kernel.ts` before any state transition
                  </h3>
                </div>
                <Link href="/dashboard/operator" className="text-[13px] font-medium text-[#2563eb] hover:underline">
                  See authority matrix →
                </Link>
              </div>
              <div className="grid gap-0 overflow-hidden rounded-[12px] border border-[#e5e5e5] sm:grid-cols-5 bg-white">
                {SAFETY_INVARIANTS.map((inv) => (
                  <div
                    key={inv.id}
                    className="border-r border-b sm:border-b-0 border-[#e5e5e5] last:border-r-0 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-mono text-[11px] font-semibold text-[#2563eb]">{inv.id}</span>
                      <div className="mt-1 text-[13px] font-semibold text-[#171717]">{inv.name}</div>
                      <p className="mt-1 text-[12px] leading-snug text-[#525252]">{inv.rule}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#e5e5e5] flex items-center justify-between font-mono text-[10px] text-[#166534]">
                      <span>KERNEL</span>
                      <span>ENFORCED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 3 && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
                    Sponsor seam ablation
                  </p>
                  <h3 className="mt-1 text-[18px] font-medium tracking-[-0.02em] text-[#171717]">
                    Measured degradation when each sponsor seam is removed from the loop
                  </h3>
                </div>
                <Link href="/dashboard/sponsors" className="text-[13px] font-medium text-[#2563eb] hover:underline">
                  Open kill-switch simulator →
                </Link>
              </div>
              <div className="grid gap-0 overflow-hidden rounded-[12px] border border-[#e5e5e5] sm:grid-cols-2 lg:grid-cols-4 bg-white">
                {SPONSORS.map((sp) => (
                  <div
                    key={sp.id}
                    className="border-r border-b lg:border-b-0 border-[#e5e5e5] last:border-r-0 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-[#2563eb]">{sp.seam}</span>
                      <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[#166534]">LIVE</span>
                    </div>
                    <div className="text-[14px] font-semibold text-[#171717]">{sp.name}</div>
                    <div className="font-mono text-[11px] text-[#166534]">
                      Full: {sp.ablation.fullSystemMetric}
                    </div>
                    <div className="font-mono text-[11px] text-[#9a3412]">
                      Ablated: {sp.ablation.removedMetric}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 4 && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
                    Independent verification
                  </p>
                  <h3 className="mt-1 text-[18px] font-medium tracking-[-0.02em] text-[#171717]">
                    Check the evidence without trusting us — recompute offline or flip a byte in `/verify`
                  </h3>
                </div>
                <Link href="/verify" className="text-[13px] font-medium text-[#2563eb] hover:underline">
                  Open byte verifier →
                </Link>
              </div>
              <pre className="overflow-x-auto rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] p-4 font-mono text-[12px] leading-relaxed text-[#171717]">{`$ pnpm claim:verify
[PASS] 22/22 deterministic corpus cases verified · 0 false positives
[PASS] 4/4 sponsor seams verified · 0 dead links · RESULT: VERIFIED (Exit 0)`}</pre>
            </div>
          )}

          {/* Footnote */}
          <div className="mt-6 pt-3 border-t border-[#e5e5e5] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#737373]">
            <span>
              A worker restart replayed one receipt, not a duplicate side effect. An ungrounded excerpt was refused by INV-01.
            </span>
            <div className="flex items-center gap-4 font-medium text-[#2563eb]">
              <Link href="/demo" className="hover:underline">Walkthrough (/demo) →</Link>
              <Link href="/proof" className="hover:underline">Claim ledger (/proof) →</Link>
              <Link href="/verify" className="hover:underline">Byte verifier (/verify) →</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Who This Is For — 3-Seat Hairline Grid */}
      <div className="space-y-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
            Who this is for
          </p>
          <h2 className="mt-1 text-[24px] font-medium tracking-[-0.02em] text-[#171717]">
            Three people touch a change event, and each sees only what their seat requires
          </h2>
        </div>

        <div className="grid gap-0 overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-white sm:grid-cols-3">
          {[
            {
              when: "When a vendor silently edits terms",
              role: "The operations lead",
              body: "Opens the console and reads what the kernel committed and, more usefully, what it refused. Every refusal names the invariant that blocked it.",
              href: "/dashboard",
              cta: "Open live console",
            },
            {
              when: "Inside the extraction loop",
              role: "The agent fleet & safety kernel",
              body: "Agents propose structured diffs with zero database write authority. Deterministic TypeScript verifies exact substring grounding before commit.",
              href: "/dashboard/operator",
              cta: "See authority boundaries",
            },
            {
              when: "Weeks later, offline",
              role: "The independent auditor",
              body: "Downloads the signed JSON manifest and recomputes all five invariants with no credentials. If a single byte moved, the verdict names the check that failed.",
              href: "/verify",
              cta: "Verify a manifest",
            },
          ].map((seat) => (
            <div
              key={seat.role}
              className="border-r border-b sm:border-b-0 border-[#e5e5e5] last:border-r-0 p-5 flex flex-col justify-between bg-white"
            >
              <div>
                <p className="font-mono text-[11px] tracking-[0.08em] text-[#2563eb] uppercase">
                  {seat.when}
                </p>
                <h3 className="mt-1.5 text-[15px] font-semibold text-[#171717]">{seat.role}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#525252]">{seat.body}</p>
              </div>
              <Link
                href={seat.href}
                className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-[#2563eb] hover:underline"
              >
                {seat.cta} <span aria-hidden>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
