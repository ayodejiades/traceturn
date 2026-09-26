"use client";

import { useState } from "react";
import Link from "next/link";
import { BENCHMARK_CASES, evaluateSafetyKernel } from "@/lib/kernel";

const STAGES = [
  {
    step: 1,
    code: "01_RECORD",
    title: "01 · Record Baseline Commitment",
    seam: "KERNEL_DB (Drizzle / Postgres)",
    summary: "Operator registers a watched vendor surface and pins the baseline snapshot SHA-256 hash.",
  },
  {
    step: 2,
    code: "02_WATCH",
    title: "02 · Watch & Capture Live DOM",
    seam: "CAPTURE (Firecrawl / Snapshot)",
    summary: "Headless capture records rendered DOM text and computes canonical byte digest.",
  },
  {
    step: 3,
    code: "03_DETECT",
    title: "03 · Agent Extraction vs. Safety Kernel",
    seam: "EXTRACTION (Structured Schema) -> KERNEL",
    summary: "Agent proposes structured diff; deterministic 5-invariant kernel verifies byte-substring grounding.",
  },
  {
    step: 4,
    code: "04_RESOLVE",
    title: "04 · Deterministic State Transition",
    seam: "KERNEL_DB + DISPATCH (Signed Webhook)",
    summary: "If all 5 invariants pass, state transitions to MATERIAL_DRIFT_DETECTED and dispatches operator packet.",
  },
  {
    step: 5,
    code: "05_RECEIPT",
    title: "05 · Signed Evidence Packet & Hash",
    seam: "VERIFY (/verify CLI & Browser)",
    summary: "Produces a canonical SHA-256 receipt packet verifiable offline without credentials.",
  },
];

export default function GuidedDemoPage() {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState<number>(0);
  const [stageIndex, setStageIndex] = useState<number>(0);

  const demoCases = [
    {
      label: "Scenario A · Actionable Drift (Approved)",
      badge: "ACTIONABLE",
      caseData: BENCHMARK_CASES[0],
    },
    {
      label: "Scenario B · Benign Rephrasing (Suppressed)",
      badge: "BENIGN CONTROL",
      caseData: BENCHMARK_CASES[2],
    },
    {
      label: "Scenario C · Adversarial Hallucination (Kernel Refusal)",
      badge: "REFUSED BY INV-01",
      caseData: {
        ...BENCHMARK_CASES[0],
        id: "CASE-ADV-99",
        title: "Injected Hallucinated Clause (Unverified Substring)",
        proposedExcerpt: "Enterprise SLA credits are permanently waived upon 24h notice.",
      },
    },
  ];

  const activeScenario = demoCases[selectedCaseIndex] ?? demoCases[0];
  const evaluation = evaluateSafetyKernel(activeScenario.caseData);
  const currentStage = STAGES[stageIndex] ?? STAGES[0];

  function advanceStage() {
    setStageIndex((prev) => (prev + 1) % STAGES.length);
  }

  return (
    <main className="min-h-screen bg-[var(--bg,#f5f5f5)] text-[var(--fg,#171717)]">
      {/* Top Judge Bar */}
      <div className="border-b border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] px-6 py-2.5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="rounded border border-[#2563eb]/30 bg-[#2563eb]/10 px-2 py-0.5 text-[11px] font-medium text-[#2563eb]">
              STEP 03 · ZERO-SIGNUP 5-STAGE LIFECYCLE WALKTHROUGH
            </span>
            <span className="hidden text-[var(--fg-muted,#737373)] md:inline">
              Agents Propose · Deterministic Code Decides
            </span>
          </div>
          <div className="flex items-center gap-3 text-[var(--fg-muted,#737373)]">
            <Link href="/" className="hover:text-[var(--fg,#171717)]">01 Overview</Link>
            <span>&rarr;</span>
            <Link href="/onboarding" className="hover:text-[var(--fg,#171717)]">02 Onboarding</Link>
            <span>&rarr;</span>
            <Link href="/demo" className="font-semibold text-[#2563eb]">03 Guided Demo</Link>
            <span>&rarr;</span>
            <Link href="/dashboard" className="hover:text-[var(--fg,#171717)]">04 Console</Link>
            <span>&rarr;</span>
            <Link href="/proof" className="hover:text-[var(--fg,#171717)]">05 Proof</Link>
            <span>&rarr;</span>
            <Link href="/verify" className="hover:text-[var(--fg,#171717)]">06 Verify</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border,#e5e5e5)] pb-6 md:flex-row md:items-center">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#2563eb]">
              Interactive State Machine Walkthrough
            </p>
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--fg,#171717)] md:text-3xl">
              5-Stage Evidence Lifecycle (`Record &rarr; Watch &rarr; Detect &rarr; Resolve &rarr; Receipt`)
            </h1>
            <p className="mt-1 text-sm text-[var(--fg-muted,#737373)]">
              Step through a complete lifecycle or switch scenarios to watch the deterministic kernel refuse hallucinated excerpts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-demo="advance-stage"
              onClick={advanceStage}
              className="rounded-md bg-[#171717] px-4 py-2.5 font-mono text-xs font-medium text-white transition-colors hover:bg-[#171717]/90"
            >
              Advance Lifecycle Stage ({stageIndex + 1}/5) &rarr;
            </button>
            <Link
              href="/dashboard"
              className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] px-4 py-2.5 font-mono text-xs text-[var(--fg,#171717)] hover:border-[#171717]"
            >
              Open Full Console &rarr;
            </Link>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="grid gap-3 md:grid-cols-3">
          {demoCases.map((sc, idx) => (
            <button
              key={sc.label}
              type="button"
              data-demo={`scenario-${idx}`}
              onClick={() => {
                setSelectedCaseIndex(idx);
                setStageIndex(2);
              }}
              className={`rounded-lg border p-4 text-left transition-all ${
                selectedCaseIndex === idx
                  ? "border-[#2563eb] bg-[var(--surface,#ffffff)] ring-1 ring-inset ring-[#2563eb]"
                  : "border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] hover:border-[#171717]/40"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[#2563eb]">{sc.caseData.id}</span>
                <span className="rounded border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-2 py-0.5 font-mono text-[10px] text-[var(--fg-muted,#737373)]">
                  {sc.badge}
                </span>
              </div>
              <div className="text-sm font-medium text-[var(--fg,#171717)]">{sc.label}</div>
              <p className="mt-1 truncate text-xs text-[var(--fg-muted,#737373)]">{sc.caseData.title}</p>
            </button>
          ))}
        </div>

        {/* 5-Stage Pipeline Stepper */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--border,#e5e5e5)] md:grid-cols-5">
          {STAGES.map((st, idx) => {
            const isCurrent = idx === stageIndex;
            const isPassed = idx < stageIndex;
            return (
              <button
                key={st.code}
                type="button"
                onClick={() => setStageIndex(idx)}
                className={`p-3.5 text-left transition-all ${
                  isCurrent
                    ? "bg-[var(--surface,#ffffff)] ring-1 ring-inset ring-[#2563eb]"
                    : "bg-[var(--surface,#ffffff)] hover:bg-[var(--bg,#f5f5f5)]"
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[var(--fg-muted,#737373)]">STAGE 0{st.step}</span>
                  <span className={isCurrent ? "font-semibold text-[#2563eb]" : isPassed ? "text-[#16a34a]" : "text-[var(--fg-muted,#737373)]"}>
                    {isCurrent ? "ACTIVE" : isPassed ? "DONE" : "PENDING"}
                  </span>
                </div>
                <div className="mb-1 text-xs font-medium text-[var(--fg,#171717)]">{st.title}</div>
                <div className="font-mono text-[10px] text-[var(--fg-muted,#737373)]">{st.seam}</div>
              </button>
            );
          })}
        </div>

        {/* Main Inspection Grid */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Live Stage Payload */}
          <div className="space-y-5 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[var(--border,#e5e5e5)] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase text-[#2563eb]">{currentStage.seam}</span>
                <h2 className="mt-0.5 text-lg font-medium text-[var(--fg,#171717)]">{currentStage.title}</h2>
                <p className="mt-0.5 text-xs text-[var(--fg-muted,#737373)]">{currentStage.summary}</p>
              </div>
              <span
                className={`rounded px-3 py-1 font-mono text-xs font-medium ${
                  evaluation.approved
                    ? "border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]"
                    : "border border-[#dc2626]/30 bg-[#dc2626]/10 text-[#dc2626]"
                }`}
              >
                {evaluation.verdict}
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5">
                <div className="mb-1 font-mono text-[10px] uppercase text-[var(--fg-muted,#737373)]">
                  Baseline Snapshot (`beforeText`)
                </div>
                <p className="font-mono text-xs leading-relaxed text-[var(--fg,#171717)]">
                  {activeScenario.caseData.beforeText}
                </p>
              </div>

              <div className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5">
                <div className="mb-1 font-mono text-[10px] uppercase text-[var(--fg-muted,#737373)]">
                  Captured Live DOM (`afterText`)
                </div>
                <p className="font-mono text-xs leading-relaxed text-[var(--fg,#171717)]">
                  {activeScenario.caseData.afterText}
                </p>
              </div>

              <div className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase">
                  <span className="text-[#2563eb]">Agent Proposed Literal Excerpt (`proposedExcerpt`)</span>
                  <span
                    className={
                      activeScenario.caseData.afterText.includes(activeScenario.caseData.proposedExcerpt)
                        ? "text-[#16a34a]"
                        : "text-[#dc2626]"
                    }
                  >
                    {activeScenario.caseData.afterText.includes(activeScenario.caseData.proposedExcerpt)
                      ? "EXACT BYTE SUBSTRING"
                      : "SUBSTRING MISMATCH"}
                  </span>
                </div>
                <p className="font-mono text-xs text-[var(--fg,#171717)]">
                  &ldquo;{activeScenario.caseData.proposedExcerpt}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5 font-mono text-xs">
              <span className="text-[var(--fg-muted,#737373)]">Deterministic Receipt SHA-256:</span>
              <span className="max-w-[320px] truncate text-[var(--fg,#171717)]">{evaluation.evidenceHash}</span>
            </div>
          </div>

          {/* Right 5 Cols: 5-Invariant Kernel Verdict */}
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-4 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--fg,#171717)]">
                  5-Invariant Safety Kernel Gate
                </h3>
                <span className="font-mono text-xs text-[var(--fg-muted,#737373)]">lib/kernel.ts</span>
              </div>

              <div className="space-y-2">
                {evaluation.invariantResults.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-start justify-between gap-3 rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3"
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold text-[var(--fg,#171717)]">
                        {inv.id} · {inv.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--fg-muted,#737373)]">{inv.reason}</div>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] ${
                        inv.passed
                          ? "border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]"
                          : "border border-[#dc2626]/30 bg-[#dc2626]/10 text-[#dc2626]"
                      }`}
                    >
                      {inv.passed ? "PASS" : "REFUSED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted,#737373)]">
                Continue Judge Evaluation Path
              </div>
              <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                <Link
                  href="/dashboard/sponsors"
                  className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3 text-[var(--fg,#171717)] hover:border-[#171717]"
                >
                  Sponsor Kill-Switch &rarr;
                </Link>
                <Link
                  href="/proof"
                  className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3 text-[var(--fg,#171717)] hover:border-[#171717]"
                >
                  Proof &amp; Ledger (/proof) &rarr;
                </Link>
                <Link
                  href="/verify"
                  className="col-span-2 rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3 text-[#2563eb] hover:border-[#2563eb]"
                >
                  1-Byte Tamper &amp; Receipt Verifier (/verify) &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
