"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { KernelState } from "@/lib/kernel";
import type { LineageReportJson, ReportEpisode } from "@/lib/report";
import { LineageLegend, LineageView } from "@/components/lineage-view";
import { CorrectionsView } from "@/components/corrections-view";
import { ActsView } from "@/components/acts-view";
import { STATE, TONE_TEXT, fmtAt, fmtClaim, fmtInt, pct, plain } from "@/lib/tones";

export type Tab = "episodes" | "corrections" | "acts" | "repairs" | "agents";

const FILTERS: { id: string; label: string; states: KernelState[] }[] = [
  { id: "all", label: "All", states: [] },
  { id: "drift", label: "Manufactured", states: ["MATERIAL_DRIFT_DETECTED"] },
  { id: "ok", label: "Corroborated", states: ["ON_TRACK"] },
  { id: "credited", label: "Credited", states: ["BENIGN_CONTROL_NO_DRIFT"] },
  { id: "abstain", label: "Abstained", states: ["ABSTAIN_AMBIGUOUS_SOURCE", "ABSTAIN_UNBOUND_EXCERPT"] },
];

/** Profiles below this many statements are too thin for a rate to mean anything. */
const MIN_STATEMENTS = 20;

function StateTag({ state }: { state: KernelState }) {
  const s = STATE[state];
  return (
    <span className={`text-xs font-medium ${TONE_TEXT[s.tone]}`} title={state}>
      {s.label}
    </span>
  );
}

function SourceBinding({ episode }: { episode: ReportEpisode }) {
  const excerpt = episode.assertions[0]?.excerpt;
  if (!episode.source || !excerpt) {
    return (
      <p className="text-xs text-[var(--fg-subtle)]">
        The origin is a human message. It is not quoted, and the kernel abstains rather than blame the first agent to repeat it.
      </p>
    );
  }
  const at = episode.source.indexOf(excerpt);
  return (
    <p className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--fg-subtle)]">
      {at < 0 ? (
        episode.source
      ) : (
        <>
          {episode.source.slice(0, at)}
          <mark className="bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] text-[var(--fg)]">{excerpt}</mark>
          {episode.source.slice(at + excerpt.length)}
        </>
      )}
    </p>
  );
}

const ROW_LIMIT = 12;

function EpisodeDetail({ episode, verifyHref, incidentHref }: { episode: ReportEpisode; verifyHref?: string; incidentHref?: string }) {
  const [all, setAll] = useState(false);
  const hidden = episode.assertions.length - ROW_LIMIT;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="tnum text-2xl font-semibold tracking-tight text-[var(--fg)]">“{fmtClaim(episode.claim)}”</h3>
          <StateTag state={episode.state} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{episode.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-0 font-mono text-[11px] text-[var(--fg-subtle)]">
          <span>{episode.id}</span>
          <span>
            stated as known {episode.promised} · independent paths {episode.observed}
          </span>
          <span>
            invariants {episode.invariants.filter((i) => i.passed).length}/{episode.invariants.length} pass
          </span>
          {episode.link && (
            <a href={episode.link} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-[var(--accent)] hover:underline">
              Open this moment in the village ↗
            </a>
          )}
          {incidentHref && (
            <Link href={incidentHref} className="inline-block py-1 text-[var(--accent)] hover:underline" data-demo="open-incident">
              Open the incident report →
            </Link>
          )}
          {verifyHref && (
            <Link href={verifyHref} className="inline-block py-1 text-[var(--accent)] hover:underline">
              Tamper-check this verdict →
            </Link>
          )}
        </div>
      </div>

      <LineageLegend />

      <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3">
        <LineageView episode={episode} limit={all ? undefined : ROW_LIMIT} />
      </div>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          className="-mt-2 self-start rounded-full border border-[var(--border)] px-4 py-2 text-xs text-[var(--fg-muted)] hover:border-[var(--border-strong)] hover:text-[var(--fg)]"
        >
          {all ? "Show the first 12 statements" : `Show all ${episode.assertions.length} statements (${hidden} more)`}
        </button>
      )}

      <details className="group rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4">
        <summary className="cursor-pointer text-xs font-medium text-[var(--fg)]">
          Source binding (INV-1): the excerpt must appear verbatim in the origin turn
        </summary>
        <div className="mt-3">
          <SourceBinding episode={episode} />
        </div>
      </details>
    </div>
  );
}

export function ReportView({
  report,
  initialEpisode,
  verifyCorpus,
  actor = "agent",
  initialTab = "episodes",
}: {
  report: LineageReportJson;
  initialEpisode?: string;
  /** What one speaker is called in this corpus: "agent" or "account". */
  actor?: string;
  initialTab?: Tab;
  /** Link each episode to /verify; only committed reports, which /verify can load, pass this. */
  verifyCorpus?: string;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(
    report.episodes.find((e) => e.id === initialEpisode)?.id ?? report.episodes[0]?.id,
  );

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter)!;
    return f.states.length ? report.episodes.filter((e) => f.states.includes(e.state)) : report.episodes;
  }, [report.episodes, filter]);
  const episode = report.episodes.find((e) => e.id === selected) ?? visible[0];
  const profiles = report.profiles.filter((p) => p.statements >= MIN_STATEMENTS);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "episodes", label: "Claim lineages", count: report.episodes.length },
    { id: "corrections", label: "Wrong numbers", count: (report.corrections ?? []).length },
    { id: "acts", label: "Acts on the gap", count: report.totals.actsUngrounded + report.totals.actsAfterCorrection },
    { id: "repairs", label: "Repair claims", count: report.repairs.length },
    { id: "agents", label: `By ${actor}`, count: profiles.length },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Report sections" className="mb-6 flex flex-wrap justify-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            data-demo={`tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-[var(--fg)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--fg-muted)] hover:border-[var(--border-strong)] hover:text-[var(--fg)]"
            }`}
          >
            {t.label} <span className="tnum ml-1 text-[var(--fg-subtle)]">{fmtInt(t.count)}</span>
          </button>
        ))}
      </div>

      {tab === "episodes" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => {
                const n = f.states.length ? report.episodes.filter((e) => f.states.includes(e.state)).length : report.episodes.length;
                if (n === 0 && f.id !== "all") return null;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    aria-pressed={filter === f.id}
                    className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs transition-colors sm:min-h-8 ${
                      filter === f.id ? "bg-[var(--surface-raised)] text-[var(--fg)]" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                    }`}
                  >
                    {f.label} <span className="tnum text-[var(--fg-subtle)]">{n}</span>
                  </button>
                );
              })}
            </div>
            <ul className="max-h-[640px] overflow-y-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
              {visible.map((e) => (
                <li key={e.id} className="border-b border-[var(--border)] last:border-b-0">
                  <button
                    type="button"
                    data-demo={`episode-${e.id}`}
                    onClick={() => setSelected(e.id)}
                    aria-current={e.id === episode?.id}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      e.id === episode?.id ? "bg-[var(--surface-raised)]" : "hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="tnum block truncate text-sm font-medium text-[var(--fg)]">“{fmtClaim(e.claim)}”</span>
                      <span className="mt-0.5 block">
                        <StateTag state={e.state} />
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-right text-xs text-[var(--fg-subtle)]">
                      <span className="text-[var(--fg)]">{e.promised}</span> stated
                      <br />
                      <span className="text-[var(--accent)]">{e.observed}</span> independent
                    </span>
                  </button>
                </li>
              ))}
              {visible.length === 0 && <li className="px-4 py-6 text-center text-sm text-[var(--fg-muted)]">No episodes in this view.</li>}
            </ul>
          </div>
          <div className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 lg:col-span-7">
            {episode ? (
              <EpisodeDetail key={episode.id} episode={episode} verifyHref={verifyCorpus ? `/verify?corpus=${verifyCorpus}&ep=${episode.id}` : undefined} incidentHref={verifyCorpus ? `/incident/${verifyCorpus}/${episode.id}` : undefined} />
            ) : (
              <p className="py-10 text-center text-sm text-[var(--fg-muted)]">
                No claim was stated by {report.params.minSpeakers} or more agents within {report.params.episodeGapHours} hours of each
                other.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "corrections" && <CorrectionsView corrections={report.corrections ?? []} actors={`${actor}s`} />}

      {tab === "acts" && <ActsView report={report} actors={`${actor}s`} />}

      {tab === "repairs" && (
        <div>
          <p className="mx-auto mb-6 max-w-[var(--measure)] text-center text-sm text-[var(--fg-muted)]">
            An agent says it fixed something at a URL. The kernel keeps the claim open (INV-3) until a different agent reports its own
            observation of that URL working. {fmtInt(report.verdicts.WAITING_TO_VERIFY)} of {fmtInt(report.totals.repairs)} never got one.
          </p>
          <ul className="grid gap-4 md:grid-cols-2">
            {report.repairs.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--fg)]">{r.claimant}</span>
                  <StateTag state={r.state} />
                </div>
                <p className="text-[13px] leading-snug text-[var(--fg-muted)]">“{plain(r.excerpt)}”</p>
                <p className="truncate font-mono text-[11px] text-[var(--fg-subtle)]" title={r.url}>
                  {r.url}
                </p>
                {r.disputedBy && (
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] p-3">
                    <div className="text-[11px] font-medium text-[var(--danger)]">Disputed by {r.disputedBy.agent}</div>
                    <p className="mt-1 line-clamp-3 text-xs text-[var(--fg-muted)]">“{plain(r.disputedBy.excerpt)}”</p>
                  </div>
                )}
                {r.confirmedBy && (
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] p-3">
                    <div className="text-[11px] font-medium text-[var(--accent)]">Confirmed by {r.confirmedBy.agent}</div>
                    <p className="mt-1 line-clamp-3 text-xs text-[var(--fg-muted)]">“{plain(r.confirmedBy.excerpt)}”</p>
                  </div>
                )}
                {!r.confirmedBy && !r.disputedBy && (
                  <p className="text-xs text-[var(--fg-subtle)]">No other agent reported on this URL within {report.params.episodeGapHours} hours.</p>
                )}
                <div className="mt-auto flex justify-between font-mono text-[10px] text-[var(--fg-subtle)]">
                  <span>{fmtAt(r.at)}</span>
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
                      Open in village ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "agents" && (
        <div>
          <p className="mx-auto mb-6 max-w-[var(--measure)] text-center text-sm text-[var(--fg-muted)]">
            How each agent stated claims that other agents also stated. The check rate is a lower bound: an agent that checked and did
            not say so counts as an echo. Agents with fewer than {MIN_STATEMENTS} statements are left out.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  {[actor[0].toUpperCase() + actor.slice(1), "Statements", "Originated", "Checked", "Credited", "Echoed", "Check rate"].map((h, i) => (
                    <th key={h} className={`eyebrow px-4 py-3 font-medium ${i > 0 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const restated = p.statements - p.originated;
                  return (
                    <tr key={p.agent} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-4 py-2.5 text-[var(--fg)]">{p.agent}</td>
                      <td className="tnum px-4 py-2.5 text-right text-[var(--fg-muted)]">{p.statements}</td>
                      <td className="tnum px-4 py-2.5 text-right text-[var(--fg-muted)]">{p.originated}</td>
                      <td className="tnum px-4 py-2.5 text-right text-[var(--accent)]">{p.independent}</td>
                      <td className="tnum px-4 py-2.5 text-right text-[var(--fg-muted)]">{p.cited}</td>
                      <td className="tnum px-4 py-2.5 text-right text-[var(--danger)]">{p.echoed}</td>
                      <td className="tnum px-4 py-2.5 text-right text-[var(--fg)]">{pct(p.independent, restated)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
