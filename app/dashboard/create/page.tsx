"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { NewRecordForm } from "@/components/new-record-form";
import { evaluateDeterministicKernel } from "@/lib/kernel";

export default function Web2CreateCommitmentPage() {
  const [sourceCaptureT0, setSourceCaptureT0] = useState(
    "Agent-07 records in the shared library that the Lean 4 proof checker accepts incomplete tactic blocks."
  );
  const [extractedExcerpt, setExtractedExcerpt] = useState(
    "the Lean 4 proof checker accepts incomplete tactic blocks"
  );
  const [promisedDerivations, setPromisedDerivations] = useState(14);
  const [observedDerivations, setObservedDerivations] = useState(1);

  const liveDecision = evaluateDeterministicKernel({
    caseId: "live-draft",
    sourceCaptureT0,
    extractedExcerpt,
    promisedDerivations,
    observedDerivations,
  });

  return (
    <DashboardShell project="traceturn">
      <div className="flex flex-col gap-6">
        <div className="border-b border-[var(--border,#e5e5e5)] pb-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-muted,#737373)]">
            Estate · Commitment Ingestion
          </span>
          <h1 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[var(--fg,#171717)]">
            Record &amp; Pre-Verify New Commitment
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-[var(--fg-muted,#737373)]">
            Test candidate extractions against the deterministic safety kernel (<code className="font-mono text-xs text-[var(--fg,#171717)]">lib/kernel.ts</code>) or persist a new commitment directly to the workspace ledger.
          </p>
        </div>

        <section className="rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted,#737373)]">
            1. Quick Workspace Record Persistence
          </div>
          <NewRecordForm />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div
            className="flex flex-col gap-4 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6 lg:col-span-7"
            data-demo="lab-simulator"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted,#737373)]">
              2. Live Excerpt-Binding &amp; Independent-Derivation Simulator
            </div>

            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-medium text-[var(--fg,#171717)]">Immutable T0 Source Capture</span>
              <textarea
                rows={3}
                value={sourceCaptureT0}
                onChange={(e) => setSourceCaptureT0(e.target.value)}
                className="rounded border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-2.5 font-mono text-xs text-[var(--fg,#171717)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs">
              <span className="font-medium text-[var(--fg,#171717)]">Candidate Extracted Excerpt (Must match T0 substring)</span>
              <input
                type="text"
                value={extractedExcerpt}
                onChange={(e) => setExtractedExcerpt(e.target.value)}
                className="rounded border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-2.5 font-mono text-xs text-[var(--fg,#171717)]"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-xs">
                <span className="font-medium text-[var(--fg,#171717)]">Promised Derivations (agents asserting)</span>
                <input
                  type="number"
                  value={promisedDerivations}
                  onChange={(e) => setPromisedDerivations(Number(e.target.value) || 0)}
                  className="rounded border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-2.5 font-mono text-xs text-[var(--fg,#171717)] num"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs">
                <span className="font-medium text-[var(--fg,#171717)]">Observed Derivations (independent paths)</span>
                <input
                  type="number"
                  value={observedDerivations}
                  onChange={(e) => setObservedDerivations(Number(e.target.value) || 0)}
                  className="rounded border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-2.5 font-mono text-xs text-[var(--fg,#171717)] num"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6 lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#2563eb]">
                  Live Kernel Verdict
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[11px] font-medium ${
                    liveDecision.excerptBound
                      ? "border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]"
                      : "border border-[#dc2626]/30 bg-[#dc2626]/10 text-[#dc2626]"
                  }`}
                >
                  {liveDecision.excerptBound ? "INV-1 BOUND" : "UNBOUND -> REFUSED"}
                </span>
              </div>
              <div className="mt-2 font-mono text-lg font-semibold text-[var(--fg,#171717)]">
                {liveDecision.state}
              </div>
              <p className="mt-1 text-xs text-[var(--fg-muted,#737373)]">{liveDecision.summary}</p>

              <div className="mt-4 divide-y divide-[var(--border,#e5e5e5)] rounded border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)]">
                {liveDecision.invariants.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-3 py-2 font-mono text-[11px]">
                    <span className="text-[var(--fg,#171717)]">
                      <strong>{inv.id}</strong> · {inv.name}
                    </span>
                    <span className={inv.passed ? "text-[#16a34a]" : "text-[#dc2626]"}>
                      {inv.passed ? "PASS" : "BLOCK"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
