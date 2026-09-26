import { DashboardShell } from "@/components/dashboard-shell";
import { SAFETY_INVARIANTS, BENCHMARK_CASES, evaluateSafetyKernel } from "@/lib/kernel";

const AGENT_SEATS = [
  {
    id: "extractor-agent",
    name: "Structured Extraction Worker",
    readAccess: "T0 & Tn immutable HTML/PDF snapshots",
    proposeAccess: "Candidate JSON schema (rateCents, verbatimExcerpt)",
    writeAuthority: "0 DIRECT DB WRITES (Gated by INV-01..INV-05)",
    failureMode: "Paraphrased or missing substring fails closed to ABSTAIN_UNBOUND_EXCERPT",
  },
  {
    id: "drift-watcher",
    name: "Scheduled Terms Drift Monitor",
    readAccess: "Public offer URLs & user-uploaded billing statements",
    proposeAccess: "Candidate integer-cent schedule diff",
    writeAuthority: "0 STATE TRANSITIONS (Cannot mark MATERIAL_DRIFT without kernel pass)",
    failureMode: "Cosmetic DOM changes with 0c delta resolve to BENIGN_CONTROL_NO_DRIFT",
  },
  {
    id: "reply-ingestor",
    name: "Inbound Support Reply Classifier",
    readAccess: "Signed webhook thread payloads",
    proposeAccess: "Candidate provider resolution claim",
    writeAuthority: "0 CLOSURE AUTHORITY (Locked in WAITING_TO_VERIFY by INV-03)",
    failureMode: "Cannot mark VERIFIED_FIXED until subsequent independent observation reconciles",
  },
];

export default function Web2OperatorPage() {
  const evaluations = BENCHMARK_CASES.map((c) => ({
    caseItem: c,
    result: evaluateSafetyKernel(c),
  }));

  return (
    <DashboardShell project="traceturn">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border,#e5e5e5)] pb-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-muted,#737373)]">
              Assurance · Non-Custodial AI Boundary
            </span>
            <h1 className="mt-1 text-2xl font-medium tracking-[-0.02em] text-[var(--fg,#171717)]">
              Agent Authority Matrix &amp; Deterministic Safety Kernel
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-[var(--fg-muted,#737373)]">
              Models extract candidate fields; deterministic code in <code className="font-mono text-xs text-[var(--fg,#171717)]">lib/kernel.ts</code> decides whether state may transition. No agent holds direct database write or closure authority.
            </p>
          </div>
          <div className="rounded-md border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)] px-3.5 py-2 font-mono text-xs">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted,#737373)]">
              Unchecked Agent Write Authority
            </div>
            <div className="mt-0.5 font-semibold text-[#16a34a] num">0 DIRECT MUTATIONS</div>
          </div>
        </div>

        {/* Agent Seat Authority Table */}
        <section className="overflow-hidden rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)]">
          <div className="border-b border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-5 py-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--fg,#171717)]">
              1. Worker Capability &amp; Write-Boundary Matrix
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border,#e5e5e5)] font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--fg-muted,#737373)]">
                  <th className="px-4 py-3">Worker Seat</th>
                  <th className="px-4 py-3">Permitted Read Scope</th>
                  <th className="px-4 py-3">Permitted Proposal</th>
                  <th className="px-4 py-3">Direct Write Authority</th>
                  <th className="px-4 py-3">Deterministic Refusal Guard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border,#e5e5e5)]">
                {AGENT_SEATS.map((seat) => (
                  <tr key={seat.id} className=" align-top">
                    <td className="px-4 py-3.5 font-medium text-[var(--fg,#171717)]">{seat.name}</td>
                    <td className="px-4 py-3.5 text-[var(--fg-muted,#737373)]">{seat.readAccess}</td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[var(--fg,#171717)]">{seat.proposeAccess}</td>
                    <td className="px-4 py-3.5 font-mono text-[11px] font-medium text-[#16a34a]">{seat.writeAuthority}</td>
                    <td className="px-4 py-3.5 text-[var(--fg-muted,#737373)]">{seat.failureMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5 Safety Invariants */}
        <section className="overflow-hidden rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)]">
          <div className="border-b border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-5 py-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--fg,#171717)]">
              2. Enforced Safety Invariants (lib/kernel.ts)
            </h2>
          </div>
          <div className="divide-y divide-[var(--border,#e5e5e5)]">
            {SAFETY_INVARIANTS.map((inv) => (
              <div key={inv.id} className="flex flex-col justify-between gap-2 px-5 py-3.5 sm:flex-row sm:items-center">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#2563eb]">{inv.id}</span>
                  <span className="ml-2 text-sm font-medium text-[var(--fg,#171717)]">{inv.name}</span>
                  <p className="mt-0.5 text-xs text-[var(--fg-muted,#737373)]">{inv.rule}</p>
                </div>
                <span className="shrink-0 rounded border border-[#16a34a]/30 bg-[#16a34a]/10 px-2.5 py-1 font-mono text-[11px] font-medium text-[#16a34a]">
                  ENFORCED · FAIL-CLOSED
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Live Kernel Verification Across Benchmark Cases */}
        <section className="overflow-hidden rounded-lg border border-[var(--border,#e5e5e5)] bg-[var(--surface,#ffffff)]">
          <div className="border-b border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-5 py-3">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--fg,#171717)]">
              3. Live Kernel Evaluation Matrix ({evaluations.length} Canonical Cases)
            </h2>
          </div>
          <div className="divide-y divide-[var(--border,#e5e5e5)]">
            {evaluations.map(({ caseItem, result }) => (
              <div key={caseItem.id} className="flex flex-col justify-between gap-2 px-5 py-3.5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[var(--fg,#171717)]">{caseItem.id}</span>
                    <span className="text-sm font-medium text-[var(--fg,#171717)]">{caseItem.title}</span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-[var(--fg-muted,#737373)] num">
                    Promised: Promised: {caseItem.promisedDerivations} · Observed: {caseItem.observedDerivations} · Hash: {result.evidenceHash.slice(0, 18)}…
                  </p>
                </div>
                <span className="shrink-0 rounded border border-[var(--border,#e5e5e5)] bg-[var(--bg,#f5f5f5)] px-2.5 py-1 font-mono text-xs text-[var(--fg,#171717)]">
                  {result.verdict}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
