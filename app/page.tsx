import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { LineageGraph } from "@/components/lineage-graph";
import { SAFETY_INVARIANTS } from "@/lib/kernel";

const CAPABILITIES = [
  {
    title: "Causal blame DAG",
    subtitle: "Pinpoint origin turn",
    body: "Delegation edges across every turn point at where a failure started.",
  },
  {
    title: "Claim lineage",
    subtitle: "Count independent derivations",
    body: "A premise cited 40 times can trace to one origin. That gap is the finding.",
  },
  {
    title: "Abstention guards",
    subtitle: "Fail closed",
    body: "Truncated or unbindable evidence returns ABSTAIN, never a guess.",
  },
  {
    title: "Reproducible offline",
    subtitle: "Zero LLMs in adjudication",
    body: "Same verdict on any machine, Wi-Fi off. No temperature drift, no token cost.",
  },
] as const;

const STATS = [
  { value: "13/13", label: "Fixtures passing", subtext: "Strict excerpt binding" },
  { value: "0", label: "False positives", subtext: "Benign controls suppressed" },
  { value: "100%", label: "Runs offline", subtext: "No model in the loop" },
] as const;

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans selection:bg-[var(--accent)] selection:text-[var(--accent-contrast)]">
      {/* Hero Painted Landscape Background with Soft Fade to Dark Canvas */}
      <div className="absolute inset-x-0 top-0 h-[640px] sm:h-[780px] md:h-[860px] overflow-hidden pointer-events-none -z-0">
        <img
          src="/hero-landscape.jpg"
          alt="Atmospheric pastel landscape painting of mountains, winding river, and glowing sunset clouds"
          className="h-full w-full object-cover object-top filter brightness-[0.92] contrast-[1.05]"
        />
        {/* Soft gradient fade into dark theme canvas */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,9,10,0) 0%, rgba(8,9,10,0.1) 25%, rgba(8,9,10,0.45) 50%, rgba(8,9,10,0.82) 75%, var(--bg) 95%, var(--bg) 100%)",
          }}
        />
      </div>

      <SiteHeader />

      <main id="main" className="relative z-10 flex-1">
        {/* Hero Content Section */}
        <section className="pt-20 sm:pt-32 md:pt-40 pb-16 sm:pb-24 px-6 text-center">
          <div className="mx-auto max-w-4xl">

            {/* Display Headline */}
            <h1 className="h-display text-4xl sm:text-6xl md:text-[4.25rem] font-semibold tracking-tight text-white leading-[1.08] text-balance">
              Two questions a
              <br />
              summary can&rsquo;t answer
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[var(--fg-muted)] leading-relaxed text-pretty">
              Which turn started it. How one premise became consensus.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/proof"
                data-demo="launch-demo"
                className="rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition-all hover:bg-[var(--accent-dim)] hover:shadow-[0_0_24px_rgba(16,185,129,0.35)]"
              >
                Inspect evidence
              </Link>
              <Link
                href="/dashboard"
                data-demo="launch-demo"
                className="rounded-full border border-white/20 bg-black/40 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-black/70 hover:border-white/40"
              >
                Open console
              </Link>
            </div>
          </div>

          {/* Interactive Forensic Telemetry Showcase Card */}
          <div className="mx-auto mt-16 sm:mt-24 max-w-5xl">
            <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-4 sm:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4 text-left">
                <div>
                  <div className="eyebrow text-[11px] text-[var(--fg-subtle)]">
                    ACTIVE SWARM AUDIT · BENCHMARK SWARM-01
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--fg)] mt-0.5">
                    14 Assertions Trace to 1 Independent Origin
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/15 px-3 py-1 font-mono text-[11px] text-[var(--accent)]">
                    MATERIAL_DRIFT_DETECTED
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 sm:p-6 shadow-inner">
                <LineageGraph />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-16">
            <p className="eyebrow text-center mb-12 text-[var(--fg-subtle)]">
              MEASURED, NOT ESTIMATED
            </p>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="border-l border-[var(--border)] pl-6">
                  <div className="tnum text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--fg)]">
                    {s.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-[var(--fg-muted)]">{s.label}</div>
                  <div className="mt-0.5 font-mono text-xs text-[var(--fg-subtle)]">{s.subtext}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities Grid */}
        <section className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-20 sm:py-24">
          <div className="mb-16 max-w-2xl">
            <div className="eyebrow mb-3">AI BUILT FOR FORENSICS</div>
            <h2 className="h-section text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--fg)] leading-tight">
              Agents propose. Deterministic code decides.
            </h2>
            <p className="mt-4 text-base text-[var(--fg-muted)] leading-relaxed">
              No LLM decides a verdict. Agents propose; <code className="text-[var(--accent)]">lib/kernel.ts</code> disposes.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {CAPABILITIES.map((c, i) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)]"
              >
                <div className="font-mono text-xs text-[var(--accent)] mb-2 font-medium">
                  0{i + 1} / {c.subtitle}
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-[var(--fg)]">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonial Quote Block */}
        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-24 sm:py-28">
            <blockquote className="max-w-3xl">
              <p className="h-section text-2xl sm:text-3xl font-medium leading-snug text-[var(--fg)]">
                &ldquo;A hundred agents were told to prove theorems. One found an exploit in the
                grader. Nobody lied. The swarm simply agreed.&rdquo;
              </p>
              <footer className="mt-8 flex items-center gap-3">
                <div className="h-px w-8 bg-[var(--border-strong)]" />
                <span className="font-mono text-xs text-[var(--fg-muted)]">
                  Forensic Case Study: Emergent Collusion in Autonomous Research Swarms
                </span>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Five Safety Invariants Section */}
        <section className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-20 sm:py-24">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow mb-2">AUDITABLE BY DEFAULT</div>
              <h2 className="h-section text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--fg)]">
                Five invariants. Always checked.
              </h2>
              <p className="mt-2 text-sm text-[var(--fg-muted)]">
                Every verdict clears all five.
              </p>
            </div>
            <Link
              href="/verify"
              className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--fg)] shadow-sm transition-all hover:bg-[var(--surface-raised)] hover:border-[var(--accent)]"
            >
              Run kernel suite →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:lg:col-span-1">
            {SAFETY_INVARIANTS.map((inv) => (
              <div
                key={inv.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)]"
              >
                <div className="mb-2 text-xs font-mono text-[var(--accent)] font-semibold">{inv.id}</div>
                <h3 className="text-base font-semibold text-[var(--fg)]">{inv.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">{inv.rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Clean Dark Mode CTA Section — NO picture as requested */}
        <section className="border-t border-[var(--border)] bg-[var(--bg-elevated)] py-20 sm:py-24 px-[var(--page-pad)]">
          <div className="mx-auto max-w-4xl text-center">
            <span className="eyebrow mb-3 inline-block rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-[var(--accent)]">
              DETERMINISTIC VERIFICATION KERNEL
            </span>
            <h2 className="h-display mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--fg)]">
              Run all 13 fixtures yourself.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-[var(--fg-muted)] leading-relaxed">
              No setup, no API key, no model in the loop.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/proof"
                data-demo="launch-demo"
                className="rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition-all hover:bg-[var(--accent-dim)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Inspect evidence
              </Link>
              <Link
                href="/dashboard"
                data-demo="launch-demo"
                className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-7 py-3 text-sm font-medium text-[var(--fg)] transition-all hover:bg-[var(--surface-raised)]"
              >
                Open console
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}