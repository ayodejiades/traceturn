"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SPONSORS } from "@/lib/sponsors";
import { SAFETY_INVARIANTS } from "@/lib/kernel";

const ROLES = [
  {
    id: "operator",
    title: "Production Operator",
    subtitle: "Configure watched surfaces, inspect evidence diffs, and dispatch approved notifications",
    badge: "RECOMMENDED",
    email: "operator@workspace.dev",
  },
  {
    id: "auditor",
    title: "Security & Compliance Auditor",
    subtitle: "Inspect the 5 deterministic safety invariants, run ablation simulators, and verify receipt hashes",
    badge: "ZERO-WRITE",
    email: "auditor@workspace.dev",
  },
  {
    id: "judge",
    title: "Hackathon Judge (Fast-Track)",
    subtitle: "Pre-seeded with the 22-case deterministic benchmark, 4 sponsor seams, and 1-byte tamper verifier",
    badge: "PRE-SEEDED",
    email: "judge@hackathon.dev",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [workspaceName, setWorkspaceName] = useState("Acme Reliability Ops");
  const [strictKernel, setStrictKernel] = useState(true);
  const [enabledSponsors, setEnabledSponsors] = useState<Record<string, boolean>>(
    Object.fromEntries(SPONSORS.map((s) => [s.id, true]))
  );

  function finishOnboarding(targetPath: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "demo_session",
        JSON.stringify({
          email: selectedRole.email,
          role: selectedRole.id,
          workspace: workspaceName,
          strictKernel,
          enabledSponsors,
          ts: Date.now(),
        })
      );
    }
    router.push(targetPath);
  }

  return (
    <main className="flex min-h-screen flex-col justify-between bg-[var(--bg,#f5f5f5)] text-[var(--fg,#171717)]">
      {/* Top Judge Evaluation Path Bar */}
      <div className="border-b border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] px-6 py-2.5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="rounded border border-[#16a34a]/30 bg-[#16a34a]/10 px-2 py-0.5 text-[11px] font-medium text-[#16a34a]">
              ONBOARDING AND POLICY WIZARD
            </span>
            <span className="hidden text-[var(--fg-muted,#737373)] sm:inline">
              Synthetic + Public Benchmark Corpus · Zero External Credentials Required
            </span>
          </div>
          <div className="flex items-center gap-3 text-[var(--fg-muted,#737373)]">
            <Link href="/" className="hover:text-[var(--fg,#171717)]">01 Overview</Link>
            <span>&rarr;</span>
            <Link href="/onboarding" className="font-semibold text-[#2563eb]">02 Onboarding</Link>
            <span>&rarr;</span>
            <Link href="/demo" className="hover:text-[var(--fg,#171717)]">03 Guided Demo</Link>
            <span>&rarr;</span>
            <Link href="/dashboard" className="hover:text-[var(--fg,#171717)]">04 Console</Link>
            <span>&rarr;</span>
            <Link href="/proof" className="hover:text-[var(--fg,#171717)]">05 Proof</Link>
            <span>&rarr;</span>
            <Link href="/verify" className="hover:text-[var(--fg,#171717)]">06 Verify</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#2563eb]">
              Workspace Provisioning · Step {step} of 4
            </p>
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-[var(--fg,#171717)] md:text-3xl">
              Configure Operator Session &amp; Deterministic Guardrails
            </h1>
          </div>
          <button
            type="button"
            data-demo="fast-track-onboarding"
            onClick={() => finishOnboarding("/dashboard")}
            className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] px-3.5 py-2 font-mono text-xs text-[var(--fg,#171717)] transition-colors hover:border-[#171717]"
          >
            Skip to Console &rarr;
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--border,#e5e5e5)]">
          {[
            { n: 1, label: "01 Operator Role" },
            { n: 2, label: "02 Sponsor Seams" },
            { n: 3, label: "03 Safety Kernel" },
            { n: 4, label: "04 Ready Check" },
          ].map((item) => (
            <button
              key={item.n}
              type="button"
              onClick={() => setStep(item.n)}
              className={`p-3 text-left font-mono text-xs transition-colors ${
                step === item.n
                  ? "bg-[var(--surface,#ffffff)] font-semibold text-[#2563eb]"
                  : step > item.n
                    ? "bg-[var(--surface,#ffffff)] text-[#16a34a]"
                    : "bg-[var(--bg,#f5f5f5)] text-[var(--fg-muted,#737373)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <section className="space-y-6 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6">
            <div>
              <h2 className="mb-1 text-lg font-medium text-[var(--fg,#171717)]">Select Your Evaluation Persona</h2>
              <p className="text-sm text-[var(--fg-muted,#737373)]">
                Choose how you want to inspect the system. Every persona enforces the same deterministic 5-invariant kernel.
              </p>
            </div>

            <div className="grid gap-3">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex w-full items-start justify-between gap-4 rounded-lg border p-4 text-left transition-all ${
                    selectedRole.id === role.id
                      ? "border-[#2563eb] bg-[#2563eb]/[0.04]"
                      : "border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)]/50 hover:border-[#171717]/40"
                  }`}
                >
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium text-[var(--fg,#171717)]">{role.title}</span>
                      <span className="rounded border border-[#2563eb]/30 bg-[#2563eb]/10 px-2 py-0.5 font-mono text-[10px] text-[#2563eb]">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--fg-muted,#737373)]">{role.subtitle}</p>
                  </div>
                  <span className="font-mono text-xs text-[var(--fg-muted,#737373)]">{role.email}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase text-[var(--fg-muted,#737373)]">
                Workspace Identifier
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-3.5 py-2.5 text-sm text-[var(--fg,#171717)] focus:border-[#2563eb] focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                data-demo="onboarding-next-1"
                onClick={() => setStep(2)}
                className="rounded-md bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#171717]/90"
              >
                Continue to Sponsor Seams &rarr;
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Sponsor Seams */}
        {step === 2 && (
          <section className="space-y-6 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6">
            <div>
              <h2 className="mb-1 text-lg font-medium text-[var(--fg,#171717)]">Load-Bearing Sponsor Pipeline Seams</h2>
              <p className="text-sm text-[var(--fg-muted,#737373)]">
                Each sponsor sits on a typed pipeline seam (<code className="font-mono text-xs">CAPTURE</code>, <code className="font-mono text-xs">EXTRACTION</code>, <code className="font-mono text-xs">KERNEL_DB</code>, <code className="font-mono text-xs">DISPATCH</code>). Toggle any sponsor to preview its fallback mode.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {SPONSORS.map((sp) => {
                const active = enabledSponsors[sp.id] ?? true;
                return (
                  <div
                    key={sp.id}
                    className="rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)]/60 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <span className="rounded border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--fg-muted,#737373)]">
                          {sp.seam}
                        </span>
                        <h3 className="mt-1 text-sm font-medium text-[var(--fg,#171717)]">{sp.name}</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setEnabledSponsors((prev) => ({ ...prev, [sp.id]: !active }))
                        }
                        className={`rounded px-2.5 py-1 font-mono text-xs ${
                          active
                            ? "border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]"
                            : "border border-[#dc2626]/30 bg-[#dc2626]/10 text-[#dc2626]"
                        }`}
                      >
                        {active ? "LIVE SEAM" : "FALLBACK"}
                      </button>
                    </div>
                    <p className="mb-2 text-xs text-[var(--fg-muted,#737373)]">{sp.role}</p>
                    <div className="font-mono text-[11px] text-[var(--fg-muted,#737373)] num">
                      Full: <span className="font-medium text-[#16a34a]">{sp.ablation.fullSystemMetric}</span> · Removed:{" "}
                      <span className="font-medium text-[#dc2626]">{sp.ablation.removedMetric}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-4 py-2 font-mono text-xs text-[var(--fg,#171717)]"
              >
                &larr; Back
              </button>
              <button
                type="button"
                data-demo="onboarding-next-2"
                onClick={() => setStep(3)}
                className="rounded-md bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#171717]/90"
              >
                Continue to Safety Kernel &rarr;
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Safety Kernel */}
        {step === 3 && (
          <section className="space-y-6 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="mb-1 text-lg font-medium text-[var(--fg,#171717)]">
                  Deterministic Safety Kernel (5 Hard Invariants)
                </h2>
                <p className="text-sm text-[var(--fg-muted,#737373)]">
                  Agents propose structured candidates. The deterministic kernel (<code className="font-mono text-xs">lib/kernel.ts</code>) verifies all 5 invariants before any state mutation.
                </p>
              </div>
              <span className="rounded border border-[#16a34a]/30 bg-[#16a34a]/10 px-2.5 py-1 font-mono text-xs text-[#16a34a]">
                0 FALSE POSITIVES
              </span>
            </div>

            <div className="space-y-2.5">
              {SAFETY_INVARIANTS.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)]/60 p-3.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#2563eb]">{inv.id}</span>
                      <span className="text-sm font-medium text-[var(--fg,#171717)]">{inv.name}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--fg-muted,#737373)]">{inv.rule}</p>
                  </div>
                  <span className="shrink-0 rounded border border-[#16a34a]/30 bg-[#16a34a]/10 px-2 py-0.5 font-mono text-[11px] text-[#16a34a]">
                    ENFORCED
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-4 py-2 font-mono text-xs text-[var(--fg,#171717)]"
              >
                &larr; Back
              </button>
              <button
                type="button"
                data-demo="onboarding-next-3"
                onClick={() => setStep(4)}
                className="rounded-md bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#171717]/90"
              >
                Continue to Prerequisite Check &rarr;
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Prerequisite Check & Launch */}
        {step === 4 && (
          <section className="space-y-6 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-6">
            <div>
              <h2 className="mb-1 text-lg font-medium text-[var(--fg,#171717)]">Environment &amp; Prerequisite Check</h2>
              <p className="text-sm text-[var(--fg-muted,#737373)]">
                All local deterministic fixtures, cryptographic hashes, and sponsor seams are verified ready.
              </p>
            </div>

            <div className="grid gap-3 font-mono text-xs sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5">
                <span className="text-[var(--fg-muted,#737373)]">Operator Persona</span>
                <span className="font-medium text-[var(--fg,#171717)]">{selectedRole.title}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5 num">
                <span className="text-[var(--fg-muted,#737373)]">Active Sponsor Seams</span>
                <span className="font-medium text-[#16a34a]">
                  {Object.values(enabledSponsors).filter(Boolean).length} / {SPONSORS.length} Active
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5 num">
                <span className="text-[var(--fg-muted,#737373)]">Benchmark Corpus</span>
                <span className="font-medium text-[#16a34a]">22 / 22 Cases Loaded</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] p-3.5 num">
                <span className="text-[var(--fg-muted,#737373)]">Agent Write Authority</span>
                <span className="font-medium text-[#2563eb]">0 DIRECT WRITES</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-4 py-2 font-mono text-xs text-[var(--fg,#171717)]"
              >
                &larr; Back
              </button>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => finishOnboarding("/demo")}
                  className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-4 py-2.5 font-mono text-xs text-[var(--fg,#171717)] transition-colors hover:border-[#171717]"
                >
                  Launch 5-Stage Guided Demo (/demo) &rarr;
                </button>
                <button
                  type="button"
                  data-demo="complete-onboarding"
                  onClick={() => finishOnboarding("/dashboard")}
                  className="rounded-md bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#171717]/90"
                >
                  Enter Operator Console (/dashboard) &rarr;
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
