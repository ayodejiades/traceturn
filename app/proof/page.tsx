import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-shell";
import { BTN_GHOST_ON_ART, BTN_PRIMARY, PageHero, Section, SectionHead } from "@/components/page-hero";
import { ReportView, type Tab } from "@/components/report-view";
import { CHECK_RATE, CORPORA, FIXTURES, FIXTURES_PASSING, type CorpusId } from "@/lib/evidence";
import { STATE, TONE_TEXT, fmtInt, pct } from "@/lib/tones";
import type { KernelState } from "@/lib/kernel";

export const metadata: Metadata = {
  title: "Findings",
  description: "Claim lineage over the AI Village chat corpus and the German Wiki incident: who checked a claim before repeating it.",
};

const NOT_CLAIMED = [
  "Independence is a lower bound. A check is counted when the speaker reports it, or (AI Village) opens a computer session to check that claim. A silent check counts as an echo; an echo is never promoted to a check.",
  "Most echoed numbers are probably true. What the report measures is how many speakers checked a number before repeating it.",
  "Claims are numbers: a quantity and what it counts in chat, a bare value on the wiki answer boards. Agreement with no number in it is out of scope.",
  "On the wiki, one account label is one speaker. Several labels may be one operator; the publishers redacted user names.",
  "The classifier is deterministic phrase matching, not a model. On a held-out, hand-labelled sample it agrees with the label 66% of the time (docs/AUDIT.md), and the labels are by the model that wrote the rules, not an independent annotator.",
];

const HERO: Record<CorpusId, (c: (typeof CORPORA)[CorpusId]) => { eyebrow: string; title: string; lede: string }> = {
  aivillage: (c) => ({
    eyebrow: "Findings · AI Village",
    title: `About one repeated claim in ${CHECK_RATE.oneIn} came with a check`,
    lede: `The classifier finds ${pct(c.report.totals.independent, c.report.totals.restatements)}; a hand-labelled audit puts the true rate near ${(CHECK_RATE.adjusted * 100).toFixed(0)}%. ${fmtInt(c.report.totals.episodes)} claims that three or more agents stated within 72 hours of each other, traced statement by statement through ${fmtInt(c.report.totals.turns)} messages and ${fmtInt(c.report.totals.sessions)} computer sessions.`,
  }),
  collusion: (c) => ({
    eyebrow: "Findings · German Wiki incident",
    title: `${fmtInt(c.report.totals.echoed)} answers repeated, ${c.report.totals.independent} checked`,
    lede: `${fmtInt(c.report.totals.turns)} wiki edits by ${fmtInt(c.report.totals.agents)} account labels, counting only the lines each edit added. ${fmtInt(c.report.verdicts.MATERIAL_DRIFT_DETECTED)} shared values trace to a single first post.`,
  }),
};

export default async function ProofPage({ searchParams }: { searchParams: Promise<{ ep?: string; corpus?: string; tab?: string }> }) {
  const { ep, corpus: requested, tab } = await searchParams;
  const initialTab: Tab = tab === "corrections" || tab === "repairs" || tab === "agents" ? tab : "episodes";
  const id: CorpusId = requested === "collusion" ? "collusion" : "aivillage";
  const corpus = CORPORA[id];
  const report = corpus.report;
  const hero = HERO[id](corpus);
  const v = report.verdicts;
  const strip: { state: KernelState; n: number }[] = [
    { state: "MATERIAL_DRIFT_DETECTED", n: v.MATERIAL_DRIFT_DETECTED },
    { state: "BENIGN_CONTROL_NO_DRIFT", n: v.BENIGN_CONTROL_NO_DRIFT },
    { state: "ON_TRACK", n: v.ON_TRACK },
    id === "aivillage"
      ? { state: "WAITING_TO_VERIFY", n: v.WAITING_TO_VERIFY }
      : { state: "ABSTAIN_AMBIGUOUS_SOURCE", n: v.ABSTAIN_AMBIGUOUS_SOURCE },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PageHero eyebrow={hero.eyebrow} title={hero.title} lede={hero.lede}>
        <nav aria-label="Corpus" className="mt-7 inline-flex rounded-full border border-white/20 bg-[var(--bg)]/60 p-1 backdrop-blur-md">
          {(Object.keys(CORPORA) as CorpusId[]).map((c) => (
            <Link
              key={c}
              href={`/proof?corpus=${c}#episodes`}
              aria-current={c === id ? "page" : undefined}
              data-demo={`corpus-${c}`}
              className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-white/80 transition-colors hover:text-white aria-[current=page]:bg-[var(--accent)] aria-[current=page]:text-[var(--accent-contrast)]"
            >
              {CORPORA[c].name}
            </Link>
          ))}
        </nav>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a href="#episodes" className={BTN_PRIMARY}>
            Read the lineages
          </a>
          <Link href={`/verify?corpus=${id}`} className={BTN_GHOST_ON_ART}>
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
            eyebrow={`The evidence · ${corpus.name}`}
            title="Every statement, in order, with its source"
            lede={`The ${report.episodes.length} lineages below are the widest gaps plus every kind of control. All ${fmtInt(report.totals.episodes)} verdicts are in the report's ledger.`}
          />
          <ReportView key={id} report={report} initialEpisode={ep} verifyCorpus={id} actor={corpus.actor} initialTab={initialTab} />
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
                {report.source.citation}
                {report.source.exportedAt ? ` Export of ${report.source.exportedAt.slice(0, 10)}.` : ""} The raw data is not in this repository;
                the report quotes single sentences written by {corpus.actors} and never quotes a human.
              </p>
              <dl className="mt-4 space-y-2 font-mono text-[11px]">
                {report.inputs.map((i) => (
                  <div key={i.file} className="flex flex-wrap justify-between gap-2">
                    <dt className="text-[var(--fg-muted)]">{i.file}</dt>
                    <dd className="break-all text-[var(--fg-subtle)]">sha256 {i.sha256.slice(0, 24)}…</dd>
                  </div>
                ))}
                <div className="flex flex-wrap justify-between gap-2 border-t border-[var(--border)] pt-2">
                  <dt className="text-[var(--fg-muted)]">evidence/{id}-report.json</dt>
                  <dd className="break-all text-[var(--accent)]">sha256 {report.reportSha256.slice(0, 24)}…</dd>
                </div>
              </dl>
              <pre className="mt-5 overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-[11px] leading-relaxed text-[var(--fg-muted)]">
{`pnpm analyze${id === "collusion" ? " collusion" : "          "}   # re-run over data/${id}/
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
                Parameters: claim key {report.params.claimKey} · episode gap {report.params.episodeGapHours}h · min speakers{" "}
                {report.params.minSpeakers} · copy shingle {report.params.shingleWords} words
              </p>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
