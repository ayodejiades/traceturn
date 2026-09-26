import Link from "next/link";
import { SPONSORS } from "@/lib/sponsors";

const BENCHMARK_ROWS = [
  {
    arm: "Naive LLM Prompt Wrapper",
    recall: "78.6% (11/14)",
    precision: "64.7%",
    falsePositives: "6 false alarms",
    grounded: "54.5% unverified",
    verdict: "Fails on cosmetic rewrites & prose",
    highlight: false,
  },
  {
    arm: "Regex / Heuristic Line Diff",
    recall: "64.3% (9/14)",
    precision: "64.3%",
    falsePositives: "5 false alarms",
    grounded: "100.0% literal",
    verdict: "Breaks on DOM chrome & layout changes",
    highlight: false,
  },
  {
    arm: "Full Pipeline + 5-Invariant Safety Kernel",
    recall: "100.0% (14/14)",
    precision: "100.0%",
    falsePositives: "0 false alarms",
    grounded: "100.0% INV-01 bound",
    verdict: "22/22 reconciled · 0 ungrounded commits",
    highlight: true,
  },
];

const BOUNDARY_COHORTS = [
  {
    cohort: "IMAGE_ONLY_UNOCR_SCAN",
    uplift: "0.0% (Abstains)",
    behavior: "Refused by INV-05 (Ambiguity Guard) when no extractable text layer exists; requires OCR seam.",
  },
  {
    cohort: "UNAUTHENTICATED_PORTAL_WALL",
    uplift: "Manual Upload",
    behavior: "Automated crawler abstains behind login walls; operator forwards statement or PDF directly.",
  },
];

export function AblationBenchmark() {
  return (
    <div className="space-y-8 text-[var(--fg,#171717)]">
      {/* Comparative Ablation Table */}
      <div className="overflow-hidden rounded-[12px] border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border,#e5e5e5)] px-5 py-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
              Empirical campaign benchmark
            </p>
            <h3 className="mt-0.5 text-[17px] font-semibold tracking-[-0.01em] text-[var(--fg,#171717)]">
              Measured across 22 corpus cases (14 material drift · 8 benign controls)
            </h3>
          </div>
          <Link href="/proof" className="font-mono text-[12px] font-medium text-[#2563eb] hover:underline">
            Inspect full campaign report (/proof) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] font-mono text-[11px] uppercase text-[var(--fg-muted,#525252)]">
              <tr>
                <th className="py-2.5 px-4 font-medium">Architecture arm</th>
                <th className="py-2.5 px-4 font-medium">Recall</th>
                <th className="py-2.5 px-4 font-medium">Precision</th>
                <th className="py-2.5 px-4 font-medium">False positives</th>
                <th className="py-2.5 px-4 font-medium">Excerpt binding</th>
                <th className="py-2.5 px-4 font-medium text-right">Measured behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border,#e5e5e5)]">
              {BENCHMARK_ROWS.map((row) => (
                <tr
                  key={row.arm}
                  className={row.highlight ? "bg-[#dcfce7]/30 font-medium" : "bg-[var(--surface,#ffffff)]"}
                >
                  <td className="py-3 px-4 font-semibold text-[var(--fg,#171717)]">{row.arm}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">{row.recall}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">{row.precision}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] ${
                        row.highlight
                          ? "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]"
                          : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                      }`}
                    >
                      {row.falsePositives}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[12px]">{row.grounded}</td>
                  <td className="py-3 px-4 text-right text-[12px] text-[var(--fg-muted,#525252)]">
                    {row.verdict}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Load-Bearing Sponsor Ablation Cards (Collapsed Hairline Grid) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
              Load-bearing sponsor seams
            </p>
            <h3 className="mt-0.5 text-[17px] font-semibold tracking-[-0.01em] text-[var(--fg,#171717)]">
              What breaks when each sponsor is removed — and how the safety kernel preserves state
            </h3>
          </div>
          <Link
            href="/dashboard/sponsors"
            className="font-mono text-[12px] font-medium text-[#2563eb] hover:underline"
          >
            Open interactive sponsor kill-switch (/dashboard/sponsors) →
          </Link>
        </div>

        <div className="grid gap-0 overflow-hidden rounded-[12px] border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] sm:grid-cols-2 lg:grid-cols-4">
          {SPONSORS.map((sp) => (
            <div
              key={sp.id}
              className="border-r border-b lg:border-b-0 border-[var(--border,#e5e5e5)] last:border-r-0 p-4 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#2563eb] font-semibold">{sp.layer}</span>
                  <span className="rounded-full border border-[#bbf7d0] bg-[#dcfce7] px-2 py-0.5 text-[#166534]">
                    LIVE SEAM
                  </span>
                </div>
                <h4 className="text-[14px] font-semibold text-[var(--fg,#171717)]">{sp.name}</h4>
                <p className="text-[12px] leading-snug text-[var(--fg-muted,#525252)]">{sp.role}</p>
              </div>

              <div className="space-y-1 border-t border-[var(--border,#e5e5e5)] pt-2.5 font-mono text-[11px]">
                <div className="text-[#166534]">Full: {sp.ablation.fullSystemMetric}</div>
                <div className="text-[#9a3412]">Removed: {sp.ablation.removedMetric}</div>
                <div className="text-[10px] text-[#737373] pt-1">
                  Not claimed: {sp.notClaimed}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Where This System Does Not Help (Boundary Honesty Strip) */}
      <div className="overflow-hidden rounded-[12px] border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#9a3412]">
              Disclosed boundary conditions
            </span>
            <h4 className="text-[15px] font-semibold text-[var(--fg,#171717)]">
              Where this system does not help (and abstains rather than guessing)
            </h4>
          </div>
          <Link href="/verify" className="font-mono text-[12px] text-[#2563eb] hover:underline">
            Test 1-byte tamper in /verify →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {BOUNDARY_COHORTS.map((b) => (
            <div
              key={b.cohort}
              className="rounded-[8px] border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5 text-[12px]"
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-semibold text-[var(--fg,#171717)]">{b.cohort}</span>
                <span className="text-[#9a3412]">{b.uplift}</span>
              </div>
              <p className="mt-1 text-[var(--fg-muted,#525252)]">{b.behavior}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
