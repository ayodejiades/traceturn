/**
 * One incident, assembled from a committed report: the episode, its acts, its correction
 * and the ledger counts. Shared by the incident page and its JSON export, so the page and
 * the file a judge downloads say the same thing.
 */
import { CORPORA, type CorpusId } from "./evidence";
import { actManifest, episodeManifest, type ReportAct, type ReportCorrection, type ReportEpisode } from "./report";
import { canonicalJson, sha256Hex } from "./sha256";

export interface IncidentData {
  corpusId: CorpusId;
  corpusName: string;
  actor: string;
  reportSha256: string;
  episode: ReportEpisode;
  correction: ReportCorrection | null;
  /** Acts of this claim that the report lists, in blast-radius order. */
  acts: ReportAct[];
  /** Every act of this claim in the report's ledger, listed or not. */
  ledger: { total: number; afterCorrection: number; ungrounded: number; grounded: number; agents: number };
}

export function isCorpus(id: string): id is CorpusId {
  return id === "aivillage" || id === "collusion";
}

export function loadIncident(corpus: string, id: string): IncidentData | null {
  if (!isCorpus(corpus)) return null;
  const c = CORPORA[corpus];
  const episode = c.report.episodes.find((e) => e.id === id);
  if (!episode) return null;
  const rows = c.report.actLedger.filter((r) => r[1] === episode.claim);
  const unchecked = rows.filter((r) => r[2] !== "GROUNDED");
  return {
    corpusId: corpus,
    corpusName: c.name,
    actor: c.actor,
    reportSha256: c.report.reportSha256,
    episode,
    correction: c.report.corrections.find((x) => x.wrong === episode.claim) ?? null,
    acts: c.report.acts.filter((a) => a.claim === episode.claim),
    ledger: {
      total: rows.length,
      afterCorrection: rows.filter((r) => r[2] === "AFTER_CORRECTION").length,
      ungrounded: rows.filter((r) => r[2] === "UNGROUNDED").length,
      grounded: rows.filter((r) => r[2] === "GROUNDED").length,
      agents: new Set(unchecked.map((r) => r[7])).size,
    },
  };
}

/** The downloadable report: pinned manifests with their digests, so /verify and `claim:verify` can re-derive it. */
export function incidentJson(d: IncidentData) {
  const ep = episodeManifest(d.episode);
  return {
    generatedBy: "traceturn lib/incident.ts",
    note: "Deterministic: every field below is a function of the committed report. Absence of a provenance edge is a lower bound, never proof of fabrication.",
    corpus: d.corpusId,
    reportFile: `evidence/${d.corpusId}-report.json`,
    reportSha256: d.reportSha256,
    claim: d.episode.claim,
    origin: { agent: d.episode.assertions[0].agent, at: d.episode.assertions[0].at, excerpt: d.episode.assertions[0].excerpt },
    derivation: { promised: d.episode.promised, observed: d.episode.observed, hoursToFirstCheck: d.episode.hoursToFirstCheck },
    correction: d.correction && {
      wrong: d.correction.wrong,
      right: d.correction.right,
      correctedBy: d.correction.correctedBy,
      at: d.correction.at,
      hoursToCorrection: d.correction.hoursToCorrection,
      hoursPersisted: d.correction.hoursPersisted,
    },
    acts: { ledger: d.ledger, listed: d.acts.length },
    episodeManifest: { manifest: ep, sha256: sha256Hex(canonicalJson(ep)) },
    actManifests: d.acts.map((a) => {
      const m = actManifest(a);
      return { manifest: m, sha256: sha256Hex(canonicalJson(m)), kind: a.kind, evidence: a.evidence, reach: a.reach };
    }),
    verify: "Open /verify and paste a manifest, or run `pnpm claim:verify` in the repository.",
  };
}
