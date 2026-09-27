"use client";

import { useState } from "react";
import Link from "next/link";
import { BENCHMARK_CASES, evaluateSafetyKernel } from "@/lib/kernel";
import { StageStrip } from "@/components/stage-strip";

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
    <main id="main" className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Top Judge Bar */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-[var(--page-pad)] py-2.5">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <span className="rounded border border-[var(--info)]/30 bg-[var(--info)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--info)]">
              CAUSAL BLAME DAG AND CLAIM LINEAGE
            </span>
            <span className="hidden text-[var(--fg-muted)] md:inline">
              Agents Propose · Deterministic Code Decides
            </span>
          </div>
          {/* Six steps will not fit a phone, so this becomes a single scrollable
              strip rather than forcing the page to scroll sideways. */}
          <StageStrip current="03" />
        </div>
      </div>

      <div className="mx-auto max-w-[var(--content-max)] space-y-8 px-[var(--page-pad)] py-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-center">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--info)]">
              Interactive State Machine Walkthrough
            </p>
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--fg)] md:text-3xl">
              5-Stage Evidence Lifecycle (`Record &rarr; Watch &rarr; Detect &rarr; Resolve &rarr; Receipt`)
            </h1>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Step through a complete lifecycle or switch scenarios to watch the deterministic kernel refuse hallucinated excerpts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-demo="advance-stage"
              onClick={advanceStage}
              className="rounded-md bg-[var(--accent)] px-[var(--page-pad)] py-2.5 font-mono text-xs font-medium text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-dim)]"
            >
              Advance Lifecycle Stage ({stageIndex + 1}/5) &rarr;
            </button>
            <Link
              href="/dashboard"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-[var(--page-pad)] py-2.5 font-mono text-xs text-[var(--fg)] hover:border-[var(--fg-muted)]"
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
                  ? "border-[var(--info)] bg-[var(--surface)] ring-1 ring-inset ring-[var(--info)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-muted)]/40"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-[var(--info)]">{sc.caseData.id}</span>
                <span className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono text-[10px] text-[var(--fg-muted)]">
                  {sc.badge}
                </span>
              </div>
              <div className="text-sm font-medium text-[var(--fg)]">{sc.label}</div>
              <p className="mt-1 truncate text-xs text-[var(--fg-muted)]">{sc.caseData.title}</p>
            </button>
          ))}
        </div>

        {/* 5-Stage Pipeline Stepper */}
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] md:grid-cols-5">
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
                    ? "bg-[var(--surface)] ring-1 ring-inset ring-[var(--info)]"
                    : "bg-[var(--surface)] hover:bg-[var(--bg)]"
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[var(--fg-muted)]">STAGE 0{st.step}</span>
                  <span className={isCurrent ? "font-semibold text-[var(--info)]" : isPassed ? "text-[var(--ok)]" : "text-[var(--fg-muted)]"}>
                    {isCurrent ? "ACTIVE" : isPassed ? "DONE" : "PENDING"}
                  </span>
                </div>
                <div className="mb-1 text-xs font-medium text-[var(--fg)]">{st.title}</div>
                <div className="font-mono text-[10px] text-[var(--fg-muted)]">{st.seam}</div>
              </button>
            );
          })}
        </div>

        {/* Main Inspection Grid */}
        {/* min-w-0 on the columns: a grid child defaults to min-width:auto, so
            the `truncate` digest below would widen the track instead of
            ellipsising, and the page would scroll sideways on a phone. */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Live Stage Payload */}
          <div className="min-w-0 space-y-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase text-[var(--info)]">{currentStage.seam}</span>
                <h2 className="mt-0.5 text-lg font-medium text-[var(--fg)]">{currentStage.title}</h2>
                <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{currentStage.summary}</p>
              </div>
              <span
                className={`rounded px-3 py-1 font-mono text-xs font-medium ${
                  evaluation.approved
                    ? "border border-[var(--ok)]/30 bg-[var(--ok)]/10 text-[var(--ok)]"
                    : "border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]"
                }`}
              >
                {evaluation.verdict}
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3.5">
                <div className="mb-1 font-mono text-[10px] uppercase text-[var(--fg-muted)]">
                  Baseline Snapshot (`beforeText`)
                </div>
                <p className="font-mono text-xs leading-relaxed text-[var(--fg)]">
                  {activeScenario.caseData.beforeText}
                </p>
              </div>

              <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3.5">
                <div className="mb-1 font-mono text-[10px] uppercase text-[var(--fg-muted)]">
                  Captured Live DOM (`afterText`)
                </div>
                <p className="font-mono text-xs leading-relaxed text-[var(--fg)]">
                  {activeScenario.caseData.afterText}
                </p>
              </div>

              <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3.5">
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase">
                  <span className="text-[var(--info)]">Agent Proposed Literal Excerpt (`proposedExcerpt`)</span>
                  <span
                    className={
                      activeScenario.caseData.afterText.includes(activeScenario.caseData.proposedExcerpt)
                        ? "text-[var(--ok)]"
                        : "text-[var(--danger)]"
                    }
                  >
                    {activeScenario.caseData.afterText.includes(activeScenario.caseData.proposedExcerpt)
                      ? "EXACT BYTE SUBSTRING"
                      : "SUBSTRING MISMATCH"}
                  </span>
                </div>
                <p className="font-mono text-xs text-[var(--fg)]">
                  &ldquo;{activeScenario.caseData.proposedExcerpt}&rdquo;
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] p-3.5 font-mono text-xs">
              <span className="text-[var(--fg-muted)]">Deterministic Receipt SHA-256:</span>
              {/* min-w-0 lets truncate actually clip; a fixed max-width alone
                  still lets the flex row push the hash past the viewport. */}
              <span className="min-w-0 max-w-[320px] truncate text-[var(--fg)]">{evaluation.evidenceHash}</span>
            </div>
          </div>

          {/* Right 5 Cols: 5-Invariant Kernel Verdict */}
          <div className="min-w-0 space-y-6 lg:col-span-5">
            <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--fg)]">
                  5-Invariant Safety Kernel Gate
                </h3>
                <span className="font-mono text-xs text-[var(--fg-muted)]">lib/kernel.ts</span>
              </div>

              <div className="space-y-2">
                {evaluation.invariantResults.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-start justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--bg)] p-3"
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold text-[var(--fg)]">
                        {inv.id} · {inv.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--fg-muted)]">{inv.reason}</div>
                    </div>
                    <span
                      className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] ${
                        inv.passed
                          ? "border border-[var(--ok)]/30 bg-[var(--ok)]/10 text-[var(--ok)]"
                          : "border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]"
                      }`}
                    >
                      {inv.passed ? "PASS" : "REFUSED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
                Continue Judge Evaluation Path
              </div>
              <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
                <Link
                  href="/dashboard/sponsors"
                  className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 text-[var(--fg)] hover:border-[var(--fg-muted)]"
                >
                  Sponsor Kill-Switch &rarr;
                </Link>
                <Link
                  href="/proof"
                  className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 text-[var(--fg)] hover:border-[var(--fg-muted)]"
                >
                  Proof &amp; Ledger (/proof) &rarr;
                </Link>
                <Link
                  href="/verify"
                  className="col-span-2 rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 text-[var(--info)] hover:border-[var(--info)]"
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
