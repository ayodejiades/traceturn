import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { LineageGraph } from "@/components/lineage-graph";
import { BENCHMARK_CASES, evaluateSafetyKernel, SAFETY_INVARIANTS } from "@/lib/kernel";

const CAPABILITIES = [
  {
    title: "Causal blame DAG",
    body: "Reconstructs parent-child delegation edges across every turn and points at the exact turn a failure originated in — not a description of the incident, the turn itself.",
  },
  {
    title: "Claim lineage",
    body: "Counts independent derivation paths over citation edges. A premise asserted fourteen times that traces to one origin is not fourteen pieces of evidence. It is one.",
  },
  {
    title: "Abstention guards",
    body: "Truncated turns, paraphrased claims, and self-asserted repairs all fail closed to ABSTAIN rather than producing a confident wrong answer.",
  },
  {
    title: "Reproducible offline",
    body: "Graph construction is a pure function with no network and no model. Every verdict, invariant, and digest reproduces byte-identically on a judge's laptop.",
  },
] as const;

const PIPELINE = [
  { stage: "Parse", detail: "JSONL turns to typed records" },
  { stage: "Delegate", detail: "Reconstruct delegation edges" },
  { stage: "Cite", detail: "Resolve citation graph" },
  { stage: "Count", detail: "Independent derivations" },
  { stage: "Verdict", detail: "Deterministic, offline" },
] as const;

function LiveFixture() {
  const flagged = BENCHMARK_CASES.filter((c) => evaluateSafetyKernel(c).approved);
  const shown = BENCHMARK_CASES.find((c) => c.id === "CASE-01")!;
  const audit = evaluateSafetyKernel(shown);
  const gap = shown.promisedDerivations - shown.observedDerivations;

  return (
    <div className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <span className="eyebrow">Live kernel output</span>
        <span className="tnum text-xs text-[var(--fg-subtle)]">
          {BENCHMARK_CASES.length} fixtures · {flagged.length} flagged
        </span>
      </div>

      <div className="grid gap-px bg-[var(--border)] sm:grid-cols-3">
        {[
          { label: "Premised", value: shown.promisedDerivations, accent: false },
          { label: "Independent", value: shown.observedDerivations, accent: false },
          { label: "Gap", value: gap, accent: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--surface)] px-4 py-5">
            <div className="eyebrow mb-1.5">{stat.label}</div>
            <div
              className={`tnum text-3xl font-semibold tracking-tight ${
                stat.accent ? "text-[var(--accent)]" : "text-[var(--fg)]"
              }`}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-[var(--border)] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[var(--radius-sm)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-2 py-1 font-mono text-[11px] font-medium text-[var(--accent)] ring-1 ring-[color-mix(in_oklab,var(--accent)_30%,transparent)]">
            {audit.verdict}
          </span>
          <span className="text-xs text-[var(--fg-subtle)]">{shown.title}</span>
        </div>
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{audit.summary}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="relative mx-auto w-full max-w-6xl overflow-hidden px-6 pb-16 pt-20 sm:pt-28">
          <div className="hero-grid" aria-hidden />
          <div className="relative grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <div className="eyebrow mb-6 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                Incident response for AI swarms
              </div>
              <h1 className="h-display max-w-3xl text-[2.75rem] sm:text-6xl">
                Blame the turn.
                <br />
                <span className="text-[var(--fg-muted)]">Trace the belief.</span>
              </h1>
              <p className="prose-measure mt-7 text-base sm:text-lg">
                Two hundred thousand agent turns. One bad premise. An investigator has hours, not
                weeks. traceturn answers two questions a summary cannot: which turn started it, and
                how a single unverified claim convinced the whole swarm it was legitimate.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/proof"
                  data-demo="launch-demo"
                  className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-dim)]"
                >
                  Inspect the evidence
                </Link>
                <Link
                  href="/demo"
                  className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--fg-subtle)] hover:bg-[var(--surface-raised)]"
                >
                  Watch the walkthrough
                </Link>
                <Link
                  href="https://github.com/ayodejiades/traceturn"
                  className="px-2 py-2.5 font-mono text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
                >
                  github.com/ayodejiades/traceturn →
                </Link>
              </div>
            </div>

            <div className="lg:pl-4">
              <LineageGraph />
            </div>
          </div>
        </section>
        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <LiveFixture />
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                <h2 className="eyebrow mb-4">Why summaries fail</h2>
                <h3 className="h-section text-2xl sm:text-3xl">
                  Agreement and evidence look identical in plain text.
                </h3>
              </div>
              <div className="prose-measure space-y-5 text-base">
                <p>
                  In the kickoff research, a hundred agents were asked to prove mathematical
                  conjectures. One agent found an exploit in the grader, wrote it into a shared
                  library, and the swarm adopted it under competitive pressure. Nobody lied. The
                  swarm simply agreed.
                </p>
                <p>
                  Reading the transcript, a model summarising that will describe productive
                  collaboration. Counting the derivation paths shows something else: a premise
                  cited by dozens of agents with exactly one origin and no independent
                  corroboration. That gap is a property of the graph, not a matter of tone.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="eyebrow mb-4">What it does</h2>
          <h3 className="h-section mb-12 max-w-2xl text-2xl sm:text-3xl">
            Two graphs, one deterministic kernel.
          </h3>
          <div className="grid gap-px overflow-hidden rounded-[var(--radius)] bg-[var(--border)] sm:grid-cols-2">
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="bg-[var(--surface)] p-6 transition-colors hover:bg-[var(--surface-raised)]"
              >
                <h4 className="mb-2 text-[15px] font-semibold tracking-tight">{c.title}</h4>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{c.body}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="eyebrow mb-4">The pipeline</h2>
                <h3 className="h-section text-2xl sm:text-3xl">Five deterministic stages.</h3>
              </div>
              <p className="prose-measure text-sm">
                No LLM participates in attribution. The model may only label subtrees this stage
                has already isolated.
              </p>
            </div>
            <ol className="grid gap-px overflow-hidden rounded-[var(--radius)] bg-[var(--border)] sm:grid-cols-5">
              {PIPELINE.map((s, i) => (
                <li key={s.stage} className="bg-[var(--surface)] p-5">
                  <div className="tnum mb-3 text-xs text-[var(--fg-subtle)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="mb-1 text-sm font-semibold">{s.stage}</div>
                  <div className="font-mono text-[11px] leading-relaxed text-[var(--fg-subtle)]">
                    {s.detail}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="eyebrow mb-4">Guarantees</h2>
              <h3 className="h-section text-2xl sm:text-3xl">Five invariants, always checked.</h3>
            </div>
            <Link
              href="/verify"
              className="font-mono text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
            >
              Run the suite →
            </Link>
          </div>
          <div className="surface divide-y divide-[var(--border)]">
            {SAFETY_INVARIANTS.map((inv) => (
              <div key={inv.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
                <span className="tnum text-xs text-[var(--accent)]">{inv.id}</span>
                <div>
                  <div className="text-sm font-medium">{inv.name}</div>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">{inv.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="h-section mb-2 text-2xl">Check the claims yourself.</h3>
              <p className="prose-measure text-sm">
                Thirteen committed fixtures run offline with no API key and no database. The
                SHA-256 digest changes if any fixture or kernel line changes.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/verify"
                className="rounded-[var(--radius-sm)] bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-dim)]"
              >
                Run verification
              </Link>
              <Link
                href="/onboarding"
                className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--fg-subtle)] hover:bg-[var(--surface)]"
              >
                How it works
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
