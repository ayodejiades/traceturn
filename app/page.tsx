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
      {/* Hero Painted Landscape Background with Soft Fade to Dark Canvas.
          The scrim is the warm canvas colour, not neutral black, so the painting
          dissolves into the page instead of being masked by a cold grey veil. */}
      <div className="absolute inset-x-0 top-0 h-[640px] sm:h-[780px] md:h-[860px] overflow-hidden pointer-events-none -z-0">
        <img
          src="/hero-landscape.jpg"
          alt="Atmospheric pastel landscape painting of mountains, winding river, and glowing sunset clouds"
          className="h-full w-full object-cover object-top"
        />
        {/* Two scrims, both in the warm canvas colour. The vertical one dissolves
            the painting into the page; the horizontal one darkens the left and
            right thirds so the nav labels keep contrast against a bright sky.
            Without it, "Evidence" sat on near-white cloud. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(16,13,10,0) 0%, rgba(16,13,10,0.06) 30%, rgba(16,13,10,0.34) 52%, rgba(16,13,10,0.72) 74%, rgba(16,13,10,0.94) 90%, var(--bg) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(16,13,10,0.58) 0%, rgba(16,13,10,0.14) 20%, rgba(16,13,10,0) 40%, rgba(16,13,10,0.10) 66%, rgba(16,13,10,0.45) 100%)",
          }}
        />
        {/* A whisper of warm light at the top keeps the sky's own colour visible;
            without it the upper band greys out against the dark header. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-40"
          style={{
            background:
              "linear-gradient(to bottom, rgba(219,199,183,0.14) 0%, rgba(219,199,183,0) 100%)",
          }}
        />
      </div>

      <SiteHeader />

      <main id="main" className="relative z-10 flex-1">
        {/* Hero Content Section */}
        <section className="pt-28 sm:pt-32 md:pt-36 pb-10 sm:pb-14 px-[var(--page-pad)] text-center">
          <div className="mx-auto max-w-[var(--measure)]">

            {/* Display Headline */}
            <h1 className="h-display text-4xl sm:text-6xl md:text-[4.25rem] font-semibold tracking-tight text-white leading-[1.08] text-balance">
              Every claim has a first author
              <br />
              Every claim has a lineage
            </h1>

            {/* Subtitle. Sits on its own soft scrim because the sky behind it can
                be near-white, and muted warm grey alone drops below 4.5:1 there. */}
            <p className="mx-auto mt-5 max-w-2xl text-base text-white sm:text-lg leading-relaxed text-pretty [text-shadow:0_1px_12px_rgba(16,13,10,0.9)]">
              The turn that started it. How one premise became consensus.
            </p>

            {/* CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
                className="rounded-full border border-white/25 bg-[var(--bg)]/50 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-white/45 hover:bg-[var(--bg)]/70"
              >
                Open console
              </Link>
            </div>
          </div>
        </section>

        {/* Benchmark finding. Deliberately a normal section -- same eyebrow/heading/
            prose shape as the sections below it. It used to sit inside a triple-nested
            fake app window (toolbar pill, inset card, traffic-light title bar), which
            read as a pasted-in screenshot rather than part of the page. */}
        <section className="relative bg-[var(--bg)] py-14 sm:py-16">
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)]">
            <div className="mb-8 text-center">
              <div className="mx-auto max-w-[var(--measure)]">
                <div className="eyebrow mb-2">
                  THE BENCHMARK FINDING
                </div>
                <h2 className="h-section text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--fg)]">
                  14 assertions trace to 1 independent origin
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)]">
                  Fourteen assertions of corroboration, one derivation path. The kernel counts
                  the other thirteen as re-citations of a single source, bound to the turn that
                  introduced it.
                </p>
              </div>
              <Link
                href="/proof"
                className="mt-6 inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--fg)] shadow-sm transition-all hover:bg-[var(--surface-raised)] hover:border-[var(--accent)]"
              >
                Open the case file
              </Link>
            </div>

            {/* The card is narrower than the page measure on purpose: at --content-max
                the graph pane is ~690px wide and a 230px diagram drifts in the middle
                of it. rem-based so it is a component width, not a second page
                container, and so scripts/check-design-tokens.py rule 2 still passes. */}
            <div className="mx-auto max-w-[56rem]">
              <LineageGraph />
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-12">
            <p className="eyebrow text-center mb-8 text-[var(--fg-subtle)]">
              MEASURED, NOT ESTIMATED
            </p>
            <div className="mx-auto grid max-w-[var(--measure)] grid-cols-1 gap-6 sm:grid-cols-3">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={
                    "pl-6 " +
                    // The left rule is what makes this read as a metrics log, but on the
                    // first cell it would draw a line against the page edge with nothing
                    // to divide from.
                    (i === 0 ? "" : "border-l border-[var(--border)] ")
                  }
                >
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
        <section className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-14 sm:py-16">
          <div className="mb-10 mx-auto max-w-[var(--measure)] text-center">
            <div className="eyebrow mb-3">AI BUILT FOR FORENSICS</div>
            <h2 className="h-section text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--fg)] leading-tight">
              Agents propose. Deterministic code decides.
            </h2>
            <p className="mt-4 text-base text-[var(--fg-muted)] leading-relaxed">
              No LLM decides a verdict. Agents propose; <code className="text-[var(--accent)]">lib/kernel.ts</code> disposes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CAPABILITIES.map((c, i) => (
              <div
                key={c.title}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)]"
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
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-16 sm:py-20">
            <blockquote className="mx-auto max-w-[48rem] text-center">
              <p className="h-section text-2xl sm:text-3xl font-medium leading-snug text-[var(--fg)]">
                &ldquo;A hundred agents were told to prove theorems. One found an exploit in the
                grader. Nobody lied. The swarm simply agreed.&rdquo;
              </p>
              <footer className="mt-8 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-[var(--border-strong)]" />
                <span className="font-mono text-xs text-[var(--fg-muted)]">
                  Forensic Case Study: Emergent Collusion in Autonomous Research Swarms
                </span>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Five Safety Invariants Section */}
        <section className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-14 sm:py-16">
          <div className="mb-10 text-center">
            <div className="mx-auto max-w-[var(--measure)]">
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
              className="mt-6 inline-flex rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--fg)] shadow-sm transition-all hover:bg-[var(--surface-raised)] hover:border-[var(--accent)]"
            >
              Run kernel suite
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:lg:col-span-1">
            {SAFETY_INVARIANTS.map((inv) => (
              <div
                key={inv.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)]"
              >
                <div className="mb-2 text-xs font-mono text-[var(--accent)] font-semibold">{inv.id}</div>
                <h3 className="text-base font-semibold text-[var(--fg)]">{inv.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">{inv.rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Clean Dark Mode CTA Section — NO picture as requested */}
        <section className="border-t border-[var(--border)] bg-[var(--bg-elevated)] py-14 sm:py-16 px-[var(--page-pad)]">
          <div className="mx-auto max-w-[var(--measure)] text-center">
            <span className="eyebrow mb-3 inline-block rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 text-[var(--accent)]">
              DETERMINISTIC VERIFICATION KERNEL
            </span>
            <h2 className="h-display mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-[var(--fg)]">
              Run all 13 fixtures yourself.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-[var(--fg-muted)] leading-relaxed">
              No setup, no API key, no model in the loop.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
                className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-7 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--surface-raised)]"
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