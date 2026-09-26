import Link from "next/link";
import { listRecords } from "@/db";
import { NewRecordForm } from "@/components/new-record-form";
import { DashboardShell } from "@/components/dashboard-shell";
import { BENCHMARK_CASES, evaluateSafetyKernel, computeCampaignSummary } from "@/lib/kernel";

export default async function DashboardPage() {
  const rows = await listRecords();
  const summary = computeCampaignSummary();
  const kernelCases = BENCHMARK_CASES.map((c) => ({
    ...c,
    audit: evaluateSafetyKernel(c),
  }));

  return (
    <DashboardShell project="traceturn">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border,#e5e5e5)] pb-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-muted,#737373)]">
              Estate · Live Workspace &amp; Deterministic Safety Kernel
            </span>
            <h1 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[var(--fg,#171717)]">
              Workspace Console
            </h1>
            <p className="mt-1 text-sm text-[var(--fg-muted,#737373)]">
              Unified operational surface powered by <code className="font-mono text-xs text-[var(--fg,#171717)]">lib/kernel.ts</code> and <code className="font-mono text-xs text-[var(--fg,#171717)]">db/index.ts</code>. Every submission and commitment pair is audited against INV-01..INV-05.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/proof"
              className="rounded border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] px-3 py-1.5 font-mono text-xs text-[var(--fg,#171717)] hover:border-[#171717]"
            >
              Inspect /proof
            </Link>
            <Link
              href="/verify"
              className="rounded bg-[#171717] px-3 py-1.5 font-mono text-xs text-white hover:bg-[#171717]/90"
            >
              Tamper Verifier &rarr;
            </Link>
          </div>
        </div>

        {/* KPI Strip Powered by lib/kernel.ts + db/index.ts */}
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--border,#e5e5e5)] sm:grid-cols-4">
          <div className="bg-[var(--surface,#ffffff)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted,#737373)]">
              Workspace Records
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-[var(--fg,#171717)] num">
              {rows.length}
            </div>
          </div>
          <div className="bg-[var(--surface,#ffffff)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted,#737373)]">
              Excerpt-Bound Precision
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-[#16a34a] num">
              {summary.fullPipeline.precisionPct.toFixed(1)}%
            </div>
          </div>
          <div className="bg-[var(--surface,#ffffff)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted,#737373)]">
              False-Positive Drift
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-[var(--fg,#171717)] num">
              {summary.fullPipeline.falsePositives} / {summary.benignControls}
            </div>
          </div>
          <div className="bg-[var(--surface,#ffffff)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted,#737373)]">
              Unchecked Agent Writes
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-[#2563eb] num">
              0
            </div>
          </div>
        </section>

        {/* Record Submission */}
        <section className="flex flex-col gap-3 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--fg,#171717)]">New Commitment Submission</h2>
            <span className="font-mono text-[11px] text-[var(--fg-muted,#737373)]">Persists via app/actions.ts</span>
          </div>
          <NewRecordForm />
        </section>

        {/* Live Kernel Reconciliation Feed */}
        <section className="overflow-hidden rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)]">
          <div className="flex items-center justify-between border-b border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-5 py-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--fg,#171717)]">
              Deterministic Reconciliation Kernel (lib/kernel.ts)
            </h2>
            <Link href="/dashboard/items" className="font-mono text-xs text-[#2563eb] hover:underline">
              Full Ledger &rarr;
            </Link>
          </div>
          <div className="divide-y divide-[var(--border,#e5e5e5)]">
            {kernelCases.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-xs">
                <div>
                  <span className="font-mono font-semibold text-[var(--fg,#171717)]">{c.id}</span>
                  <span className="ml-2 font-medium text-[var(--fg,#171717)]">{c.title}</span>
                  <p className="mt-0.5 text-[var(--fg-muted,#737373)]">{c.audit.summary}</p>
                </div>
                <span
                  className={`rounded px-2.5 py-0.5 font-mono text-[11px] font-medium ${
                    c.audit.verdict === "MATERIAL_DRIFT_DETECTED"
                      ? "border border-[#dc2626]/30 bg-[#dc2626]/10 text-[#dc2626]"
                      : "border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a]"
                  }`}
                >
                  {c.audit.verdict}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Persisted Records */}
        <section className="flex flex-col gap-4 rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--fg,#171717)]">Recent Workspace Activity</h2>
            <span className="font-mono text-xs text-[var(--fg-muted,#737373)] num">{rows.length} total</span>
          </div>
          <ul className="flex flex-col gap-2" data-demo="list">
            {rows.map((row) => (
              <li
                key={row.id}
                data-demo="row"
                className="flex items-center justify-between rounded border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-4 py-2.5 text-sm text-[var(--fg,#171717)]"
              >
                <span className="font-medium">{row.title}</span>
                <time className="font-mono text-xs text-[var(--fg-muted,#737373)] num" dateTime={row.createdAt.toISOString()}>
                  {row.createdAt.toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
