import { listRecords } from "@/db";
import { DashboardShell } from "@/components/dashboard-shell";
import { BENCHMARK_CASES, evaluateSafetyKernel } from "@/lib/kernel";

export default async function Web2ItemsLedgerPage() {
  const rows = await listRecords();
  const evaluatedCases = BENCHMARK_CASES.map((c) => ({
    ...c,
    audit: evaluateSafetyKernel(c),
  }));

  return (
    <DashboardShell project="traceturn">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Estate · Reconciliation &amp; Evidence Ledger
            </span>
            <h1 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[var(--fg)]">
              Commitment &amp; Drift Reconciliation Ledger
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-[var(--fg-muted)]">
              Every workspace record and T0-vs-Tn commitment pair is audited by <code className="font-mono text-xs text-[var(--fg)]">lib/kernel.ts</code> with integer-cent arithmetic and literal excerpt binding.
            </p>
          </div>
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 font-mono text-xs">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">
              Total Audited Entries
            </div>
            <div className="mt-0.5 font-semibold text-[var(--fg)] num">
              {evaluatedCases.length + rows.length} RECORDS
            </div>
          </div>
        </div>

        {/* Evaluated Kernel Cases */}
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] bg-[var(--bg)] px-5 py-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--fg)]">
              1. Kernel-Audited Commitment Pairs (lib/kernel.ts)
            </h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {evaluatedCases.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-[var(--info)]">{item.id}</span>
                    <span className="text-sm font-medium text-[var(--fg)]">{item.title}</span>
                  </div>
                  <span
                    className={`rounded px-2.5 py-0.5 font-mono text-[11px] font-medium ${
                      item.audit.verdict === "MATERIAL_DRIFT_DETECTED"
                        ? "border border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]"
                        : "border border-[var(--ok)]/30 bg-[var(--ok)]/10 text-[var(--ok)]"
                    }`}
                  >
                    {item.audit.verdict}
                  </span>
                </div>
                <p className="text-xs text-[var(--fg-muted)]">{item.audit.summary}</p>
                <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-[11px] text-[var(--fg-muted)] num">
                  <span>Promised: {item.promisedDerivations}</span>
                  <span>Observed: {item.observedDerivations}</span>
                  <span>Evidence Digest: {item.audit.evidenceHash.slice(0, 22)}…</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Persisted Workspace Records */}
        <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] bg-[var(--bg)] px-5 py-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--fg)]">
              2. Persisted Database Records ({rows.length})
            </h2>
          </div>
          <ul className="divide-y divide-[var(--border)]" data-demo="list">
            {rows.map((row) => (
              <li
                key={row.id}
                data-demo="row"
                className="flex items-center justify-between px-5 py-3.5 text-sm text-[var(--fg)]"
              >
                <span className="font-medium">{row.title}</span>
                <time className="font-mono text-xs text-[var(--fg-muted)] num" dateTime={row.createdAt.toISOString()}>
                  {row.createdAt.toISOString().slice(0, 10)}
                </time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardShell>
  );
}
