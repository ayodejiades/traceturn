import Link from "next/link";
import { SiteFooter } from "@/components/site-shell";
import { LineageGraph } from "@/components/lineage-graph";
import { BTN_GHOST_ON_ART, BTN_PRIMARY, BTN_SECONDARY, PageHero, Section, SectionHead } from "@/components/page-hero";
import { PipelineFlow } from "@/components/ui/pipeline-flow";
import { TelemetryTile } from "@/components/ui/telemetry-tile";
import { SAFETY_INVARIANTS } from "@/lib/kernel";
import { CorrectionCard } from "@/components/corrections-view";
import { SwarmTimeline } from "@/components/swarm-timeline";
import { ACT_PRECISION, VILLAGE_INCIDENT, CHECK_RATE, CORRECTIONS, FEATURED, FEATURED_WIKI, TOP_WIKI_CORRECTION, WIKI_CORRECTIONS, WIKI_SEEDERS, TOP_CORRECTION, FIXTURES, FIXTURES_PASSING, HEADLINE, VILLAGE, WIKI_HEADLINE } from "@/lib/evidence";
import { ROLE, TONE_TEXT, fmtClaim, fmtInt, pct, plain } from "@/lib/tones";

const STATS = [
  {
    value: fmtInt(HEADLINE.episodes),
    label: "Claims stated by 3+ agents",
    sub: `within 72h, across ${fmtInt(HEADLINE.messages)} messages`,
  },
  {
    value: `${(CHECK_RATE.adjusted * 100).toFixed(0)}%`,
    label: "Repeats with the agent's own check",
    sub: `audit-adjusted; classifier says ${pct(HEADLINE.independent, HEADLINE.restatements)}`,
  },
  {
    value: fmtInt(HEADLINE.echoed),
    label: "Stated as fact, uncredited",
    sub: "no source named, no observation",
  },
  {
    value: `${HEADLINE.repairsOpen}/${HEADLINE.repairs}`,
    label: "“I fixed it” never confirmed",
    sub: "by any other agent within 72h",
  },
] as const;

const ROLES = (["ORIGIN", "INDEPENDENT", "CITED", "ECHO"] as const).map((r) => ({ id: r, ...ROLE[r] }));

export default function HomePage() {
  const months = VILLAGE.monthly;
  // Agents other than the origin who reported their own observation of the number.
  const rechecked = FEATURED.observed - 1;
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PageHero
        size="tall"
        title="When a swarm agrees, see who checked."
        lede={`traceturn traces every repeated number back to the agent that said it first, and every act taken on it back to whether anyone had checked. In the AI Village, about one repeat in ${CHECK_RATE.oneIn} came with the agent's own check.`}
      >
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/proof" data-demo="launch-demo" className={BTN_PRIMARY}>
            See the findings
          </Link>
          <Link href="/dashboard" className={BTN_GHOST_ON_ART}>
            Analyze a transcript
          </Link>
        </div>
        <p className="mt-5 font-mono text-xs text-white/80 [text-shadow:0_1px_10px_rgba(16,13,10,0.9)]">
          Run on {fmtInt(HEADLINE.messages)} AI Village messages and {fmtInt(WIKI_HEADLINE.edits)} German Wiki incident edits
        </p>
      </PageHero>

      <main id="main" className="relative z-10">
        {TOP_CORRECTION && (
          <Section>
            <SectionHead
              eyebrow="A wrong number, traced"
              title={
                <>
                  {TOP_CORRECTION.before.length} agents repeated “{fmtClaim(TOP_CORRECTION.wrong)}”.{" "}
                  {TOP_CORRECTION.right ? `It was ${fmtClaim(TOP_CORRECTION.right).split(" ")[0]}.` : "It was wrong."}
                </>
              }
              lede={`${TOP_CORRECTION.before.some((b) => b.checked) ? "Almost none" : "None"} of them had checked. ${TOP_CORRECTION.correctedBy} ${TOP_CORRECTION.correctorChecked ? "checked for itself and corrected it" : "corrected it"}, ${Math.round(TOP_CORRECTION.hoursToCorrection)} hours after the number first appeared. traceturn found ${CORRECTIONS.length} wrong values in the AI Village that spread to three or more agents before anyone checked them.`}
            >
              <Link href="/proof?corpus=aivillage&tab=corrections#episodes" className={`${BTN_SECONDARY} mt-6`}>
                See all {CORRECTIONS.length} wrong numbers
              </Link>
            </SectionHead>
            <div className="mx-auto max-w-[44rem]">
              <CorrectionCard c={TOP_CORRECTION} compact />
            </div>
            {TOP_WIKI_CORRECTION && (
              <p className="mx-auto mt-8 max-w-[var(--measure)] text-center text-sm leading-relaxed text-[var(--fg-muted)]">
                The same happened on the German Wiki answer board, at scale. {TOP_WIKI_CORRECTION.before.length} accounts submitted{" "}
                <span className="tnum text-[var(--danger)]">{fmtClaim(TOP_WIKI_CORRECTION.wrong)}</span> before one queried the live source and
                found <span className="tnum text-[var(--accent)]">{fmtClaim(TOP_WIKI_CORRECTION.right ?? "")}</span>: the board had copied a
                rounded display value. {TOP_WIKI_CORRECTION.after.length} more accounts submitted the rounded value after the correction.{" "}
                <Link href="/proof?corpus=collusion&tab=corrections#episodes" className="text-[var(--accent)] underline underline-offset-2">
                  See all {WIKI_CORRECTIONS.length}
                </Link>
                .
              </p>
            )}
          </Section>
        )}

        {VILLAGE_INCIDENT?.episode && VILLAGE_INCIDENT.top.length > 0 && (
          <Section band id="consequence">
            <SectionHead
              eyebrow="Then: what the swarm did with it"
              title={`${VILLAGE_INCIDENT.agents} agents acted on “${fmtClaim(VILLAGE_INCIDENT.claim)}” before anyone checked it`}
              lede={`${VILLAGE_INCIDENT.acts.total} acts were taken on it${
                VILLAGE_INCIDENT.correction?.right ? `; ${VILLAGE_INCIDENT.correction.correctedBy} later found ${fmtClaim(VILLAGE_INCIDENT.correction.right)}` : ""
              }. Across the AI Village, ${fmtInt(VILLAGE.totals.actsUngrounded + VILLAGE.totals.actsAfterCorrection)} of ${fmtInt(VILLAGE.totals.acts)} acts on shared numbers had no reported check behind them, by ${VILLAGE.totals.agentsActingUngrounded} of ${VILLAGE.totals.agents} agents. A check an agent did not report is invisible, so that is an upper bound on unchecked work.`}
            >
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href={`/incident/aivillage/${VILLAGE_INCIDENT.episode.id}`} className={BTN_SECONDARY} data-demo="landing-incident">
                  Open the incident report
                </Link>
                <Link href="/proof?corpus=aivillage&tab=acts#episodes" className={BTN_SECONDARY}>
                  See every act
                </Link>
              </div>
            </SectionHead>
            <div className="mx-auto max-w-[60rem]">
              <SwarmTimeline episode={VILLAGE_INCIDENT.episode} acts={VILLAGE_INCIDENT.top} correction={VILLAGE_INCIDENT.correction} maxRows={14} />
            </div>
            <p className="mx-auto mt-6 max-w-[var(--measure)] text-center text-sm text-[var(--fg-muted)]">
              Acts are found by phrase matching, and {ACT_PRECISION.real} of {ACT_PRECISION.n} acts in a held-out, hand-labelled sample were real acts on the number
              ({(ACT_PRECISION.village * 100).toFixed(0)}% weighted for the AI Village). The labels are by the model that wrote the rules, so they are not
              independent.{" "}
              <Link href="/proof#sources" className="text-[var(--accent)] underline underline-offset-2">
                What is not claimed
              </Link>
              .
            </p>
          </Section>
        )}

        <Section>
          <SectionHead
            eyebrow="From the AI Village corpus"
            title={
              <>
                {FEATURED.promised} agents stated “{fmtClaim(FEATURED.claim)}”. {rechecked === 0 ? "None" : rechecked === 1 ? "One" : rechecked}{" "}
                re-checked it.
              </>
            }
            lede="Each agent's first statement of the number, in time order. The kernel counts who reported their own observation, who named a source, and who repeated it as fact with neither."
          />
          <div className="mx-auto max-w-[56rem]">
            <LineageGraph episode={FEATURED} corpus="aivillage" />
          </div>
        </Section>

        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-12">
            <p className="eyebrow mb-8 text-center">
              Measured on AI Village chat, {HEADLINE.from} to {HEADLINE.to}
            </p>
            <div className="mx-auto grid max-w-[64rem] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((s, i) => (
                <div key={s.label} className={`pl-5 ${i % 2 === 1 ? "sm:border-l sm:border-[var(--border)]" : ""} ${i > 0 ? "lg:border-l lg:border-[var(--border)]" : ""}`}>
                  <div className="tnum text-4xl font-semibold tracking-tight text-[var(--fg)]">{s.value}</div>
                  <div className="mt-2 text-sm font-medium text-[var(--fg-muted)]">{s.label}</div>
                  <div className="mt-0.5 font-mono text-xs text-[var(--fg-subtle)]">{s.sub}</div>
                </div>
              ))}
            </div>
            <div className="mx-auto mt-10 grid max-w-[64rem] gap-4 md:grid-cols-2">
              <TelemetryTile
                label="Claims stated by 3+ agents"
                value={fmtInt(HEADLINE.episodes)}
                caption="Episodes per month"
                series={months.map((m) => m.episodes)}
                seriesLabel={`${months[0]?.month} to ${months[months.length - 1]?.month}`}
                tone="muted"
              />
              <TelemetryTile
                label="Manufactured agreement"
                value={fmtInt(HEADLINE.drift)}
                caption="Episodes where uncredited echoes outnumber checks"
                series={months.map((m) => m.drift)}
                seriesLabel="per month"
                tone="danger"
              />
            </div>
          </div>
        </section>

        <Section>
          <SectionHead
            eyebrow="From the German Wiki incident"
            title={
              <>
                One account guessed {fmtClaim(FEATURED_WIKI.claim)}. {FEATURED_WIKI.promised - 1} more submitted it.
              </>
            }
            lede={
              <>
                Agents used a public wiki as an answer board. The first post of this value said{" "}
                <q className="text-[var(--fg)]">{plain(FEATURED_WIKI.assertions[0].excerpt ?? "").slice(0, 110)}…</q> None of the accounts
                that repeated it reported checking it. Of those that logged both times, most answered one second after the question
                arrived; others held it &ldquo;cached&rdquo; before the question came.
              </>
            }
          />
          <div className="mx-auto max-w-[56rem]">
            <LineageGraph episode={FEATURED_WIKI} corpus="collusion" />
          </div>
          <p className="mx-auto mt-6 max-w-[var(--measure)] text-center text-sm text-[var(--fg-muted)]">
            Across {fmtInt(WIKI_HEADLINE.edits)} edits by {fmtInt(WIKI_HEADLINE.accounts)} account labels, {fmtInt(WIKI_HEADLINE.drift)} shared
            values trace to one first post, and {WIKI_HEADLINE.independent} of {fmtInt(WIKI_HEADLINE.restatements)} repeats carry a check of
            their own. {WIKI_SEEDERS.ranked.length} accounts first posted {pct(WIKI_SEEDERS.share, 1, 0)} of those values.{" "}
            <Link href="/proof?corpus=collusion#seeders" className="text-[var(--accent)] underline underline-offset-2">
              See who fed the board
            </Link>
            .
          </p>
        </Section>

        <Section id="method">
          <SectionHead
            eyebrow="Method"
            title="Agents propose. Deterministic code decides."
            lede={
              <>
                No model reads the transcript. Every verdict is a pure function in{" "}
                <code className="text-[var(--accent)]">lib/lineage.ts</code> and <code className="text-[var(--accent)]">lib/kernel.ts</code>, so
                the same file gives the same report on any machine, offline.
              </>
            }
          />
          <PipelineFlow
            stages={[
              { id: "parse", name: "Parse", code: "lib/transcript.ts", detail: "JSONL rows become ordered turns. AI Village chat and events, or any {agent, content, timestamp} log.", metric: `${fmtInt(HEADLINE.messages)} turns` },
              { id: "extract", name: "Extract claims", code: "extractClaims()", detail: "A claim is a quantity and what it counts: “237 files”, “$542 raised”. Labels like “Day 259” are skipped.", metric: `${fmtInt(VILLAGE.totals.claimsSeen)} claims` },
              { id: "group", name: "Group episodes", code: "analyzeLineage()", detail: "Statements of one claim by 3+ agents, split wherever the thread goes quiet for 72 hours.", metric: `${fmtInt(HEADLINE.episodes)} episodes` },
              { id: "classify", name: "Classify repeats", code: "buildEpisode()", detail: "Each later agent: own observation, credited source, copied wording, or a bare restatement.", metric: `${fmtInt(HEADLINE.restatements)} repeats` },
              { id: "acts", name: "Link acts", code: "findActs()", detail: "Each submit, post, write or handoff on a shared number, from the agent's words, a session goal or a logged tool call, graded by whether anyone had reported checking it.", metric: `${fmtInt(VILLAGE.totals.acts)} acts` },
              { id: "decide", name: "Kernel verdict", code: "evaluateDeterministicKernel()", detail: "Stated-as-known against own-evidence paths, with the excerpt bound verbatim to its source turn.", metric: "0 model calls" },
            ]}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {ROLES.map((r) => (
              <div key={r.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className={`mb-2 font-mono text-xs font-medium ${TONE_TEXT[r.tone]}`}>{r.label}</div>
                <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{r.help}</p>
              </div>
            ))}
          </div>
        </Section>

        <section className="border-y border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-16 sm:py-20">
            <blockquote className="mx-auto max-w-[48rem] text-center">
              <p className="h-section text-2xl font-medium leading-snug text-[var(--fg)] sm:text-3xl">
                &ldquo;Treat an agent&rsquo;s narration as a claim, not ground truth.&rdquo;
              </p>
              <footer className="mt-8 flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-[var(--border-strong)]" />
                <a
                  href="https://huggingface.co/datasets/aidigestorg/ai-village"
                  className="inline-block py-1.5 font-mono text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]"
                >
                  AI Village dataset card, AI Digest
                </a>
              </footer>
              <p className="mx-auto mt-6 max-w-xl text-sm text-[var(--fg-muted)]">
                traceturn applies that rule to every claim in a transcript, and shows which agents followed it.
              </p>
            </blockquote>
          </div>
        </section>

        <Section>
          <SectionHead
            eyebrow="Auditable by default"
            title="Five invariants. Checked on every verdict."
            lede={`${FIXTURES_PASSING} of ${FIXTURES.length} constructed kernel fixtures pass on every build, and the AI Village report re-derives from its own ledger.`}
          >
            <Link href="/verify" className={`${BTN_SECONDARY} mt-6`}>
              Tamper with a verdict
            </Link>
          </SectionHead>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAFETY_INVARIANTS.map((inv) => (
              <div key={inv.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="mb-2 font-mono text-xs font-semibold text-[var(--accent)]">{inv.id}</div>
                <h3 className="text-base font-semibold text-[var(--fg)]">{inv.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--fg-muted)]">{inv.rule}</p>
              </div>
            ))}
          </div>
        </Section>

        <section className="border-t border-[var(--border)] bg-[var(--bg-elevated)] px-[var(--page-pad)] py-14 sm:py-16">
          <div className="mx-auto max-w-[var(--measure)] text-center">
            <h2 className="h-display text-3xl font-semibold tracking-tight text-[var(--fg)] sm:text-5xl">Run it on your own transcript.</h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--fg-muted)]">
              Drop a JSONL log into the workspace. It is analysed in your browser; nothing is uploaded.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard" className={BTN_PRIMARY}>
                Open the workspace
              </Link>
              <Link href="/proof" className={BTN_SECONDARY}>
                See the findings
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
