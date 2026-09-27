"use client";

import { useState } from "react";
import Link from "next/link";
import campaignData from "../../evidence/campaign-report.json";
import { evaluateDeterministicKernel, type ReconciliationInput } from "@/lib/kernel";

export default function Web2ProofPage() {
  const [selectedCaseId, setSelectedCaseId] = useState(campaignData.cases[0].caseId);

  const activeCase =
    (campaignData.cases.find((c) => c.caseId === selectedCaseId) as ReconciliationInput & {
      title: string;
      category: string;
      expectedState: string;
    }) ?? campaignData.cases[0];

  const decision = evaluateDeterministicKernel(activeCase);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <header className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6 max-w-[var(--content-max)] mx-auto w-full">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold tracking-tight text-[var(--fg)]">
            traceturn
          </Link>
          <span className="rounded border border-[var(--accent-dim)/30] bg-[var(--accent-dim)/10] px-2 py-0.5 text-xs text-[var(--accent)] font-mono">
            /proof · EVIDENCE & SAFETY KERNEL
          </span>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-[var(--fg-muted)] hover:text-[var(--fg)]">
            Overview
          </Link>
          <Link href="/dashboard" className="text-[var(--fg-muted)] hover:text-[var(--fg)]">
            Live Workspace
          </Link>
        </nav>
      </header>

      <main id="main" className="max-w-[var(--content-max)] mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Headline Measured Proof Banner */}
        <section className="flex flex-col gap-4 border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent)]">
                Inspectable Production & Campaign Proof (No Signup Required)
              </span>
              <h1 className="text-2xl font-semibold tracking-tight mt-1">
                AI Extracts; Deterministic Code Decides.
              </h1>
              <p className="text-sm text-[var(--fg-muted)] mt-1 max-w-3xl">
                Every extracted commitment requires a verbatim substring in the immutable T0 source capture. Unbound claims fail closed, benign rewrites are ignored, and provider claims are held in <code className="text-[var(--warn)]">WAITING_TO_VERIFY</code> until a later observation reconciles.
              </p>
            </div>
            <div className="flex flex-col items-end font-mono text-xs gap-1">
              <span className="rounded bg-[var(--accent-dim)/15] text-[var(--accent)] px-2.5 py-1 border border-[var(--accent-dim)/30]">
                verify:evidence {campaignData.summary.invariantsPassed} PASS
              </span>
              <span className="text-[var(--fg-muted)]">
                Mechanism: {campaignData.mechanismVersion}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-[var(--border)] font-mono text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[var(--fg-muted)]">EXCERPT-BOUND</span>
              <span className="text-base font-semibold text-[var(--accent)]">{campaignData.summary.evidenceBoundDecisions}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[var(--fg-muted)]">MATERIAL DRIFT</span>
              <span className="text-base font-semibold text-[var(--fg)]">{campaignData.summary.materialDriftDetected}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[var(--fg-muted)]">BENIGN CONTROL</span>
              <span className="text-base font-semibold text-[var(--fg)]">{campaignData.summary.benignChangesIgnored}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[var(--fg-muted)]">AMBIGUITY ABSTAIN</span>
              <span className="text-base font-semibold text-[var(--fg)]">{campaignData.summary.ambiguityAbstention}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[var(--fg-muted)]">FALSE VERIFIED</span>
              <span className="text-base font-semibold text-[var(--accent)]">{campaignData.summary.falseVerifiedClaims}</span>
            </div>
          </div>
          <p className="text-xs font-mono text-[var(--fg-muted)] border-t border-[var(--border)] pt-3">
            Disclosed calibration note: {campaignData.summary.benignChangesFirstRunNote}
          </p>
        </section>

        {/* Interactive Case & Refusal Tester */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[var(--fg-muted)]">
              1. Select Verification Fixture (Happy, Control, Refusal)
            </h2>
            {campaignData.cases.map((c) => {
              const isSelected = c.caseId === activeCase.caseId;
              return (
                <button
                  key={c.caseId}
                  type="button"
                  onClick={() => setSelectedCaseId(c.caseId)}
                  data-demo={`proof-case-${c.caseId}`}
                  className={`text-left p-4 rounded-lg border transition-colors flex flex-col gap-1.5 ${
                    isSelected
                      ? "border-[var(--accent-dim)] bg-[var(--surface-raised)]"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--fg-subtle)]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--accent)]">{c.category}</span>
                    <span className="text-[var(--fg-muted)]">{c.expectedState}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--fg)]">{c.title}</p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4 border border-[var(--border)] bg-[var(--surface)] p-6 rounded-lg">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <span className="text-xs font-mono text-[var(--accent)]">DETERMINISTIC KERNEL VERDICT</span>
                <h3 className="text-lg font-semibold mt-0.5">{decision.state}</h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono border ${
                  decision.excerptBound
                    ? "bg-[var(--accent-dim)/15] text-[var(--accent)] border-[var(--accent-dim)/30]"
                    : "bg-[var(--warn)/15] text-[var(--warn)] border-[var(--warn)/30]"
                }`}
              >
                {decision.excerptBound ? "EXCERPT BOUND (INV-1 PASS)" : "UNBOUND EXCERPT -> FAIL CLOSED"}
              </span>
            </div>

            <p className="text-sm text-[var(--fg-muted)]">{decision.summary}</p>

            <div className="grid grid-cols-1 gap-3 text-xs font-mono">
              <div className="rounded border border-[var(--border)] bg-[var(--bg)] p-3">
                <div className="text-[var(--fg-muted)] mb-1">IMMUTABLE T0 SOURCE CAPTURE</div>
                <div className="text-[var(--fg)]">{activeCase.sourceCaptureT0}</div>
              </div>
              <div className="rounded border border-[var(--border)] bg-[var(--bg)] p-3">
                <div className="text-[var(--fg-muted)] mb-1">MODEL-EXTRACTED EXCERPT CANDIDATE</div>
                <div className={decision.excerptBound ? "text-[var(--accent)]" : "text-[var(--danger)]"}>
                  &ldquo;{activeCase.extractedExcerpt}&rdquo;
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-mono uppercase text-[var(--fg-muted)]">
                Invariant Checks (lib/kernel.ts)
              </span>
              {decision.invariants.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-4 rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-mono"
                >
                  <span>
                    <strong className="text-[var(--accent)]">{inv.id}</strong> · {inv.name}
                  </span>
                  <span className="text-[var(--fg-muted)] truncate max-w-[320px]">{inv.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
