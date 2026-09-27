import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { LineageGraph } from "@/components/lineage-graph";
import { BENCHMARK_CASES, evaluateSafetyKernel, SAFETY_INVARIANTS } from "@/lib/kernel";

const CAPABILITIES = [
  {
    title: "Causal blame DAG",
    body: "Names the turn a failure started in.",
  },
  {
    title: "Claim lineage",
    body: "Counts independent derivations behind a premise.",
  },
  {
    title: "Abstention guards",
    body: "Fails closed when the evidence cannot support a call.",
  },
  {
    title: "Reproducible offline",
    body: "Same verdict on every machine, no model in the loop.",
  },
] as const;

const STATS = [
  { value: "13/13", label: "Fixtures passing" },
  { value: "0", label: "False positives" },
  { value: "100%", label: "Runs offline" },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="mx-auto flex max-w-[var(--content-max)] items-center justify-center gap-2 px-[var(--page-pad)] py-2.5 text-[13px]">
          <span className="text-[var(--fg-muted)]">Built for the AI Swarm Dynamics Hackathon</span>
          <Link
            href="https://swarmchasing.com/"
            className="font-medium text-[var(--accent)] hover:opacity-80"
          >
            Read the brief →
          </Link>
        </div>
      </div>

      <SiteHeader />

      <main id="main" className="flex-1">
        <section className="relative overflow-hidden">
          <div className="hero-grid" aria-hidden />
          <div className="relative mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] pb-16 pt-20 sm:pt-28">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h1 className="h-display text-[2.75rem] sm:text-6xl">
                  Blame the turn.
                  <br />
                  <span className="text-[var(--fg-muted)]">Trace the belief.</span>
                </h1>
                <p className="prose-measure mt-6 text-lg">
                  Deterministic forensics for AI agent swarms.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/proof"
                    data-demo="launch-demo"
                    className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-dim)]"
                  >
                    Inspect the evidence
                  </Link>
                  <Link
                    href="/demo"
                    className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--surface)]"
                  >
                    Watch the demo
                  </Link>
                </div>
              </div>
              <div>
                <LineageGraph />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto grid max-w-[var(--content-max)] gap-px bg-[var(--border)] sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label} className="bg-[var(--bg-elevated)] px-[var(--page-pad)] py-10">
                <div className="tnum text-5xl font-semibold tracking-tight">{s.value}</div>
                <div className="mt-2 text-sm text-[var(--fg-muted)]">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-20">
          <h2 className="eyebrow mb-10">What it does</h2>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] bg-[var(--border)] sm:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="bg-[var(--surface)] p-8 transition-colors hover:bg-[var(--surface-raised)]"
              >
                <h3 className="text-lg font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-20">
            <blockquote className="max-w-3xl">
              <p className="h-section text-2xl sm:text-3xl">
                A hundred agents were told to prove theorems. One found an exploit in the
                grader. Nobody lied. The swarm simply agreed.
              </p>
              <footer className="mt-6 text-sm text-[var(--fg-muted)]">
                A Case Study on Emergent Cheating in Autonomous Research Swarms
              </footer>
            </blockquote>
          </div>
        </section>

        <section className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-20">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="h-section text-2xl sm:text-3xl">Five invariants. Always checked.</h2>
            <Link
              href="/verify"
              className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Run the suite →
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] bg-[var(--border)] sm:grid-cols-2">
            {SAFETY_INVARIANTS.map((inv) => (
              <div
                key={inv.id}
                className="bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-raised)]"
              >
                <div className="tnum mb-1 text-xs text-[var(--accent)]">{inv.id}</div>
                <h3 className="text-[15px] font-medium">{inv.name}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}