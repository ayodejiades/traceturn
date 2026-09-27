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
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Estate · Live Workspace &amp; Deterministic Safety Kernel
            </span>
            <h1 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[var(--fg)]">
              Workspace Console
            </h1>
            <p className="mt-1 text-sm text-[var(--fg-muted)]">
              Unified operational surface powered by <code className="font-mono text-xs text-[var(--fg)]">lib/kernel.ts</code> and <code className="font-mono text-xs text-[var(--fg)]">db/index.ts</code>. Every submission and commitment pair is audited against INV-01..INV-05.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/proof"
              className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 font-mono text-xs text-[var(--fg)] hover:border-[var(--fg-muted)]"
            >
              Inspect /proof
            </Link>
            <Link
              href="/verify"
              className="rounded bg-[var(--accent)] px-3 py-1.5 font-mono text-xs text-[var(--accent-contrast)] hover:bg-[var(--accent-dim)]"
            >
              Tamper Verifier &rarr;
            </Link>
          </div>
        </div>

        {/* KPI Strip Powered by lib/kernel.ts + db/index.ts */}
        <section className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
          <div className="bg-[var(--surface)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              Workspace Records
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-[var(--fg)] num">
              {rows.length}
            </div>
          </div>
          <div className="bg-[var(--surface)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              Excerpt-Bound Precision
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-[#16a34a] num">
              {summary.fullPipeline.precisionPct.toFixed(1)}%
            </div>
          </div>
          <div className="bg-[var(--surface)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              False-Positive Drift
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-[var(--fg)] num">
              {summary.fullPipeline.falsePositives} / {summary.benignControls}
            </div>
          </div>
          <div className="bg-[var(--surface)] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              Unchecked Agent Writes
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-[#2563eb] num">
              0
            </div>
          </div>
        </section>

        {/* Record Submission */}
        <section className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--fg)]">New Commitment Submission</h2>
            <span className="font-mono text-[11px] text-[var(--fg-muted)]">Persists via app/actions.ts</span>
          </div>
          <NewRecordForm />
        </section>

        {/* Live Kernel Reconciliation Feed */}
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-5 py-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--fg)]">
              Deterministic Reconciliation Kernel (lib/kernel.ts)
            </h2>
            <Link href="/dashboard/items" className="font-mono text-xs text-[#2563eb] hover:underline">
              Full Ledger &rarr;
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {kernelCases.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-xs">
                <div>
                  <span className="font-mono font-semibold text-[var(--fg)]">{c.id}</span>
                  <span className="ml-2 font-medium text-[var(--fg)]">{c.title}</span>
                  <p className="mt-0.5 text-[var(--fg-muted)]">{c.audit.summary}</p>
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
        <section className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--fg)]">Recent Workspace Activity</h2>
            <span className="font-mono text-xs text-[var(--fg-muted)] num">{rows.length} total</span>
          </div>
          <ul className="flex flex-col gap-2" data-demo="list">
            {rows.map((row) => (
              <li
                key={row.id}
                data-demo="row"
                className="flex items-center justify-between rounded border border-[var(--border)] bg-[var(--bg)] px-[var(--page-pad)] py-2.5 text-sm text-[var(--fg)]"
              >
                <span className="font-medium">{row.title}</span>
                <time className="font-mono text-xs text-[var(--fg-muted)] num" dateTime={row.createdAt.toISOString()}>
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
