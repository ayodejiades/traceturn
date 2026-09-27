"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { SPONSORS } from "@/lib/sponsors";
import { BENCHMARK_CASES, evaluateSafetyKernel } from "@/lib/kernel";

export default function Web2SponsorsPage() {
  const [disabledIds, setDisabledIds] = useState<Record<string, boolean>>({});
  const [selectedSponsorId, setSelectedSponsorId] = useState<string>(SPONSORS[0]?.id ?? "structured-llm");

  const toggleSponsor = (id: string) => {
    setDisabledIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeSponsor = SPONSORS.find((s) => s.id === selectedSponsorId) ?? SPONSORS[0];
  const sampleCase = BENCHMARK_CASES[0];
  const kernelAudit = evaluateSafetyKernel(sampleCase);
  const anyDisabled = Object.values(disabledIds).some(Boolean);

  return (
    <DashboardShell project="traceturn">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Assurance · Load-Bearing Sponsor Architecture
            </span>
            <h1 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[var(--fg)]">
              Sponsor Seam Kill-Switch &amp; Ablation Matrix
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-[var(--fg-muted)]">
              Every sponsor integration occupies a non-decorative seam in the pipeline. Toggle any integration off below to inspect the exact capability degradation while <code className="font-mono text-xs text-[var(--fg)]">lib/kernel.ts</code> preserves zero state corruption.
            </p>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 font-mono text-xs">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              Safety Kernel Status
            </div>
            <div className="mt-0.5 font-semibold text-[var(--ok)] num">
              {kernelAudit.invariantResults.filter((i) => i.passed).length}/{kernelAudit.invariantResults.length} INVARIANTS INTACT ({anyDisabled ? "ABLATED FALLBACK" : "FULL PIPELINE"})
            </div>
          </div>
        </div>

        {/* Interactive Kill-Switch Grid */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] md:grid-cols-2">
          {SPONSORS.map((s) => {
            const isOff = Boolean(disabledIds[s.id]);
            const isSelected = s.id === activeSponsor?.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedSponsorId(s.id)}
                className={`cursor-pointer bg-[var(--surface)] p-5 transition-colors ${
                  isSelected ? "ring-1 ring-inset ring-[var(--info)]" : "hover:bg-[var(--bg)]/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                      SEAM: {s.seam} · {s.codePath}
                    </span>
                    <h2 className="mt-1 text-base font-medium text-[var(--fg)]">{s.name}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSponsor(s.id);
                    }}
                    className={`rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                      isOff
                        ? "border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]"
                        : "border border-[var(--ok)]/30 bg-[var(--ok)]/10 text-[var(--ok)]"
                    }`}
                  >
                    {isOff ? "ABLATED (OFF)" : "LIVE SEAM (ON)"}
                  </button>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">{s.role}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-xs">
                  <div>
                    <div className="text-[10px] uppercase text-[var(--fg-muted)]">Active Metric</div>
                    <div className={`mt-0.5 font-medium num ${isOff ? "text-[var(--danger)]" : "text-[var(--fg)]"}`}>
                      {isOff ? s.ablation.removedMetric : s.ablation.fullSystemMetric}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[var(--fg-muted)]">Ablation Delta</div>
                    <div className="mt-0.5 text-[var(--fg-muted)] num">{s.ablation.accuracyDelta}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-[var(--fg-muted)]">
                  {isOff ? (
                    <span>
                      <strong className="font-medium text-[var(--danger)]">Degraded capability:</strong> {s.ablation.whatDisappears}{" "}
                      <strong className="font-medium text-[var(--fg)]">Still guaranteed:</strong> {s.ablation.whatRemains}
                    </span>
                  ) : (
                    <span>
                      <strong className="font-medium text-[var(--fg)]">Proven in repo:</strong> {s.proven}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Sponsor Deep-Dive & Integrator Finding */}
        {activeSponsor && (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--info)]">
                  Integrator Field Report · docs/SPONSOR_FINDINGS.md
                </span>
                <h3 className="mt-0.5 text-lg font-medium text-[var(--fg)]">
                  {activeSponsor.finding.title}
                </h3>
              </div>
              <span className="rounded border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 font-mono text-[11px] text-[var(--fg)]">
                {activeSponsor.finding.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                  Observed During Integration ({activeSponsor.finding.environment})
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg)]">
                  {activeSponsor.finding.observed}
                </p>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--danger)]">
                  Unmitigated Impact
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">
                  {activeSponsor.finding.impact}
                </p>
              </div>

              <div className="rounded border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ok)]">
                  Deterministic Guard in {activeSponsor.codePath}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--fg)]">
                  {activeSponsor.finding.fixInCode}
                </p>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                  Boundary Honesty (What Is Not Claimed)
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">
                  {activeSponsor.notClaimed}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
