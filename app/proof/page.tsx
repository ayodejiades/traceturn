import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-shell";
import { BTN_GHOST_ON_ART, BTN_PRIMARY, PageHero, Section, SectionHead } from "@/components/page-hero";
import { ReportView } from "@/components/report-view";
import { FIXTURES, FIXTURES_PASSING, HEADLINE, VILLAGE } from "@/lib/evidence";
import { STATE, TONE_TEXT, fmtInt, pct } from "@/lib/tones";
import type { KernelState } from "@/lib/kernel";

export const metadata: Metadata = {
  title: "AI Village findings",
  description: `Claim lineage over ${HEADLINE.messages.toLocaleString("en-US")} AI Village chat messages: who checked, who credited, who echoed.`,
};

const NOT_CLAIMED = [
  "Independence is a lower bound. An agent that checked privately and did not say so is counted as an echo, never the other way round.",
  "Most echoed numbers here are probably true. What the report measures is how many agents checked a number before repeating it.",
  "Claims are quantities (a number and what it counts). Agreement about things with no number in them is out of scope.",
  "Only the group chat is read. Computer-use sessions, where an agent may have verified silently, are not in this run.",
  "The classifier is deterministic phrase matching, not a model. It has not been scored against human labels yet.",
];

export default async function ProofPage({ searchParams }: { searchParams: Promise<{ ep?: string }> }) {
  const { ep } = await searchParams;
  const v = VILLAGE.verdicts;
  const strip: { state: KernelState; n: number }[] = [
    { state: "MATERIAL_DRIFT_DETECTED", n: v.MATERIAL_DRIFT_DETECTED },
    { state: "BENIGN_CONTROL_NO_DRIFT", n: v.BENIGN_CONTROL_NO_DRIFT },
    { state: "ON_TRACK", n: v.ON_TRACK },
    { state: "ABSTAIN_AMBIGUOUS_SOURCE", n: v.ABSTAIN_AMBIGUOUS_SOURCE },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PageHero
        eyebrow="Findings · AI Village"
        title={`Only ${pct(HEADLINE.independent, HEADLINE.restatements)} of repeated claims were reported as checked`}
        lede={`${fmtInt(HEADLINE.episodes)} claims that three or more agents stated within 72 hours of each other, traced statement by statement through ${fmtInt(HEADLINE.messages)} messages.`}
      >
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href="#episodes" className={BTN_PRIMARY}>
            Read the lineages
          </a>
          <Link href="/verify" className={BTN_GHOST_ON_ART}>
            Tamper-check a verdict
          </Link>
        </div>
      </PageHero>

      <main id="main" className="relative z-10">
        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto grid max-w-[var(--content-max)] grid-cols-2 gap-6 px-[var(--page-pad)] py-10 lg:grid-cols-4">
            {strip.map(({ state, n }) => (
              <div key={state} className="text-center">
                <div className={`tnum text-3xl font-semibold ${TONE_TEXT[STATE[state].tone]}`}>{fmtInt(n)}</div>
                <div className="mt-1 text-sm text-[var(--fg-muted)]">{STATE[state].label}</div>
                <div className="font-mono text-[10px] text-[var(--fg-subtle)]">{state}</div>
              </div>
            ))}
          </div>
        </section>

        <Section id="episodes">
          <SectionHead
            eyebrow="The evidence"
            title="Every statement, in order, with its source"
            lede={`The ${VILLAGE.episodes.length} lineages below are the widest gaps plus every kind of control. All ${fmtInt(HEADLINE.episodes)} verdicts are in the report's ledger.`}
          />
          <ReportView report={VILLAGE} initialEpisode={ep} verifyLinks />
        </Section>

        <Section id="fixtures" band>
          <SectionHead
            eyebrow="Kernel fixtures"
            title={`${FIXTURES_PASSING} of ${FIXTURES.length} constructed cases pass`}
            lede="Hand-written cases that pin each kernel rule, run on every build. They are constructed to exercise the rules, not drawn from the corpus."
          />
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  {["Case", "What it pins", "Expected", "Kernel", ""].map((h) => (
                    <th key={h} className="eyebrow px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FIXTURES.map((f) => (
                  <tr key={f.id} data-demo={`proof-case-${f.id}`} className="border-b border-[var(--border)] last:border-b-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--fg-subtle)]">{f.id}</td>
                    <td className="px-4 py-2.5 text-[var(--fg)]">{f.title}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--fg-muted)]">{f.expected}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--fg-muted)]">{f.actual}</td>
                    <td className={`px-4 py-2.5 text-right font-mono text-[11px] ${f.pass ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
                      {f.pass ? "PASS" : "FAIL"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="sources">
          <SectionHead eyebrow="Provenance" title="Where these numbers come from" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="text-base font-semibold text-[var(--fg)]">Source data</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                {VILLAGE.source.citation} Gated research release
                {VILLAGE.source.exportedAt ? `, export of ${VILLAGE.source.exportedAt.slice(0, 10)}` : ""}. The corpus is not in this
                repository; the report quotes single sentences from agent messages and never quotes a human.
              </p>
              <dl className="mt-4 space-y-2 font-mono text-[11px]">
                {VILLAGE.inputs.map((i) => (
                  <div key={i.file} className="flex flex-wrap justify-between gap-2">
                    <dt className="text-[var(--fg-muted)]">{i.file}</dt>
                    <dd className="break-all text-[var(--fg-subtle)]">sha256 {i.sha256.slice(0, 24)}…</dd>
                  </div>
                ))}
                <div className="flex flex-wrap justify-between gap-2 border-t border-[var(--border)] pt-2">
                  <dt className="text-[var(--fg-muted)]">evidence/aivillage-report.json</dt>
                  <dd className="break-all text-[var(--accent)]">sha256 {VILLAGE.reportSha256.slice(0, 24)}…</dd>
                </div>
              </dl>
              <pre className="mt-5 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-[11px] leading-relaxed text-[var(--fg-muted)]">
{`pnpm analyze        # re-run over data/aivillage/
pnpm claim:verify   # re-derive every total from the ledger`}
              </pre>
            </div>
            <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="text-base font-semibold text-[var(--fg)]">What is not claimed</h3>
              <ul className="mt-3 space-y-3">
                {NOT_CLAIMED.map((c) => (
                  <li key={c} className="text-sm leading-relaxed text-[var(--fg-muted)]">
                    {c}
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-mono text-[11px] text-[var(--fg-subtle)]">
                Parameters: episode gap {VILLAGE.params.episodeGapHours}h · min speakers {VILLAGE.params.minSpeakers} · copy shingle{" "}
                {VILLAGE.params.shingleWords} words
              </p>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
