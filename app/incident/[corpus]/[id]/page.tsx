import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-shell";
import { BTN_GHOST_ON_ART, BTN_PRIMARY, BTN_SECONDARY, PageHero, Section, SectionHead } from "@/components/page-hero";
import { ActRow } from "@/components/acts-view";
import { SwarmTimeline } from "@/components/swarm-timeline";
import { loadIncident } from "@/lib/incident";
import { ROLE, STATE, TONE_TEXT, fmtAt, fmtClaim, fmtInt, plain } from "@/lib/tones";

type Params = { corpus: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { corpus, id } = await params;
  const d = loadIncident(corpus, id);
  if (!d) return { title: "Incident not found" };
  return {
    title: `Incident: ${fmtClaim(d.episode.claim)}`,
    description: `Origin, derivation count and the acts taken on “${fmtClaim(d.episode.claim)}” in the ${d.corpusName} corpus.`,
  };
}

const span = (h: number) => (h < 48 ? `${Math.round(h)} hours` : `${Math.round(h / 24)} days`);

export default async function IncidentPage({ params }: { params: Promise<Params> }) {
  const { corpus, id } = await params;
  const d = loadIncident(corpus, id);
  if (!d) notFound();
  const { episode, correction, ledger, acts } = d;
  const origin = episode.assertions[0];
  const state = STATE[episode.state];
  const claim = fmtClaim(episode.claim);
  const unchecked = ledger.afterCorrection + ledger.ungrounded;
  const others = episode.assertions.length - 1;
  const checkedBy = episode.assertions.filter((a) => a.role === "INDEPENDENT").length;

  const title =
    ledger.agents > 0
      ? `${fmtInt(ledger.agents)} ${d.actor}${ledger.agents === 1 ? "" : "s"} acted on “${claim}” with no reported check`
      : `“${claim}”: ${fmtInt(episode.promised)} stated it, ${fmtInt(checkedBy)} checked`;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PageHero
        eyebrow={`Incident report · ${d.corpusName}`}
        title={title}
        lede={`An origin turn, a derivation count, and the acts taken on the gap, derived from the transcript with no model. ${state.label}.`}
      >
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href={`/incident/${d.corpusId}/${episode.id}/report.json`} download className={BTN_PRIMARY} data-demo="incident-json">
            Download the report (JSON)
          </a>
          <Link href={`/verify?corpus=${d.corpusId}&ep=${episode.id}`} className={BTN_GHOST_ON_ART}>
            Tamper-check the verdict
          </Link>
        </div>
      </PageHero>

      <main id="main" className="relative z-10">
        <Section>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-demo="incident-facts">
            <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="eyebrow">Origin turn</div>
              <div className="mt-2 text-base font-semibold text-[var(--fg)]">{origin.agent}</div>
              <div className="font-mono text-[11px] text-[var(--fg-subtle)]">{fmtAt(origin.at)}</div>
              <p className="mt-3 text-[13px] leading-snug text-[var(--fg-muted)] [overflow-wrap:anywhere]">
                {origin.excerpt ? <>&ldquo;{plain(origin.excerpt)}&rdquo;</> : "A human message; never quoted."}
              </p>
              {episode.link && (
                <a href={episode.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block font-mono text-[11px] text-[var(--accent)] hover:underline">
                  Open the moment in the village ↗
                </a>
              )}
            </div>

            <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="eyebrow">Derivation count</div>
              <div className="tnum mt-2 text-3xl font-semibold text-[var(--fg)]">
                {episode.observed} <span className="text-lg font-normal text-[var(--fg-muted)]">of {episode.promised}</span>
              </div>
              <p className="mt-2 text-[13px] leading-snug text-[var(--fg-muted)]">
                {episode.promised} {d.actor}s stated it as known; {episode.observed} traced to an observation (the origin counts as one).{" "}
                {episode.hoursToFirstCheck === null
                  ? "Nobody reported checking it."
                  : episode.hoursToFirstCheck === 0
                    ? "The origin reported its own check."
                    : `The first reported check came ${span(episode.hoursToFirstCheck)} in.`}
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="eyebrow">Acts on the gap</div>
              <div className="tnum mt-2 text-3xl font-semibold text-[var(--fg)]">{fmtInt(unchecked)}</div>
              <p className="mt-2 text-[13px] leading-snug text-[var(--fg-muted)]">
                of {fmtInt(ledger.total)} acts on this value had no reported check behind them: {fmtInt(ledger.afterCorrection)} after the correction,{" "}
                {fmtInt(ledger.ungrounded)} before any check, {fmtInt(ledger.grounded)} grounded. {fmtInt(acts.length)} listed below.
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="eyebrow">Correction</div>
              {correction ? (
                <>
                  <div className="mt-2 text-base font-semibold text-[var(--accent)]">
                    {correction.correctedBy}
                    {correction.right ? ` → ${fmtClaim(correction.right)}` : ""}
                  </div>
                  <p className="mt-2 text-[13px] leading-snug text-[var(--fg-muted)]">
                    Corrected {span(correction.hoursToCorrection)} after the value first appeared.{" "}
                    {correction.hoursPersisted === null
                      ? "No one repeated the wrong value afterwards."
                      : `Another ${d.actor} repeated it ${span(correction.hoursPersisted)} after the correction.`}{" "}
                    {correction.after.length > 0 && `${correction.after.length} more stated it afterwards.`}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-[13px] leading-snug text-[var(--fg-muted)]">No one corrected this value in so many words. That does not make it true.</p>
              )}
            </div>
          </div>
        </Section>

        <Section band>
          <SectionHead
            eyebrow="How it moved"
            title="Every statement and every act, in time order"
            lede="Rows are agents; circles are statements, diamonds are acts taken on the number. The dashed line is the correction."
          />
          <SwarmTimeline episode={episode} acts={acts} correction={correction} />
        </Section>

        {acts.length > 0 && (
          <Section>
            <SectionHead
              eyebrow="What the swarm did with it"
              title="Acts, ranked by blast radius"
              lede={`${acts.length === ledger.total ? "Every act" : `${acts.length} of ${ledger.total} acts`} on this value. After a correction first, then no reported check, then the widest downstream reach.`}
            />
            <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5">
              {acts.map((a) => (
                <ActRow key={a.id} a={a} />
              ))}
            </ul>
          </Section>
        )}

        <Section band>
          <SectionHead
            eyebrow="Provenance"
            title={`${others} later statements, by role`}
            lede="The same lineage the findings page shows, listed in order. A check is the agent's own reported observation."
          />
          <ol className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5">
            {episode.assertions.slice(0, 24).map((a, i) => {
              const role = ROLE[a.role];
              return (
                <li key={`${a.turnId}${i}`} className="py-3">
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
                    <span className="font-medium text-[var(--fg)]">{a.agent}</span>
                    <span className={`font-mono text-[10px] uppercase ${TONE_TEXT[role.tone]}`} title={role.help}>
                      {role.label}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-[var(--fg-subtle)]">{fmtAt(a.at)}</span>
                  </div>
                  {a.excerpt && <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[var(--fg-muted)] [overflow-wrap:anywhere]">{plain(a.excerpt)}</p>}
                </li>
              );
            })}
            {episode.assertions.length > 24 && <li className="py-3 text-xs text-[var(--fg-subtle)]">and {episode.assertions.length - 24} more in the report</li>}
          </ol>
        </Section>

        <Section>
          <SectionHead eyebrow="Check it yourself" title="This page is a function of the transcript" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="text-base font-semibold text-[var(--fg)]">Re-derive it</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                The downloaded JSON pins this episode and each listed act as a manifest with its sha256. Paste one into the verifier, change a field, and the kernel
                rejects it. Offline, <code className="text-[var(--accent)]">pnpm claim:verify</code> re-derives every total from the committed report (sha256{" "}
                <span className="font-mono text-[11px]">{d.reportSha256.slice(0, 16)}…</span>).
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={`/verify?corpus=${d.corpusId}&ep=${episode.id}`} className={BTN_SECONDARY}>
                  Open the verifier
                </Link>
                <Link href={`/proof?corpus=${d.corpusId}&tab=acts#episodes`} className={BTN_SECONDARY}>
                  All acts in this corpus
                </Link>
              </div>
            </div>
            <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h3 className="text-base font-semibold text-[var(--fg)]">What this does not prove</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--fg-muted)]">
                <li>Absence of a reported check is a lower bound. An agent that checked privately and did not say so looks unobserved.</li>
                <li>An act with no reported check is not claimed to be wrong. Most such numbers are probably true.</li>
                <li>Acts are found by phrase matching; on a hand-labelled sample about four in five were real acts on the number (docs/ACT_AUDIT.md), labelled by the model that wrote the rules.</li>
              </ul>
            </div>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </div>
  );
}
