/**
 * The single source for every number a page shows.
 *
 * - VILLAGE: evidence/aivillage-report.json, produced by `pnpm analyze` over the real
 *   AI Village chat corpus and re-derived by `pnpm claim:verify`.
 * - WIKI: evidence/collusion-report.json, produced by `pnpm analyze collusion` over the
 *   German Wiki incident export from collusion.wiki.
 * - FIXTURES: the constructed kernel test cases in evidence/campaign-report.json plus
 *   BENCHMARK_CASES, evaluated here at import time, so the count and the pass/fail
 *   shown on a page are whatever the kernel returns now.
 */
import villageJson from "@/evidence/aivillage-report.json";
import collusionJson from "@/evidence/collusion-report.json";
import campaignJson from "@/evidence/campaign-report.json";
import auditJson from "@/evidence/audit-results.json";
import actAuditJson from "@/evidence/act-audit-results.json";
import { BENCHMARK_CASES, evaluateDeterministicKernel, evaluateSafetyKernel, type ReconciliationInput } from "./kernel";
import { topIncident, type LineageReportJson } from "./report";

export const VILLAGE = villageJson as unknown as LineageReportJson;
export const COLLUSION = collusionJson as unknown as LineageReportJson;

export type CorpusId = "aivillage" | "collusion";

export interface Corpus {
  id: CorpusId;
  name: string;
  /** What one speaker is: named agents in the village, pseudonymous accounts on the wiki. */
  actor: string;
  actors: string;
  /** What one turn is. */
  turnNoun: string;
  report: LineageReportJson;
}

export const CORPORA: Record<CorpusId, Corpus> = {
  aivillage: { id: "aivillage", name: "AI Village", actor: "agent", actors: "agents", turnNoun: "messages", report: VILLAGE },
  collusion: { id: "collusion", name: "German Wiki incident", actor: "account", actors: "accounts", turnNoun: "wiki edits", report: COLLUSION },
};

const t = VILLAGE.totals;
const v = VILLAGE.verdicts;

export const HEADLINE = {
  messages: t.turns,
  agents: t.agents,
  from: t.from.slice(0, 10),
  to: t.to.slice(0, 10),
  episodes: t.episodes,
  drift: v.MATERIAL_DRIFT_DETECTED,
  restatements: t.restatements,
  independent: t.independent,
  echoed: t.echoed,
  cited: t.cited,
  repairs: t.repairs,
  repairsOpen: v.WAITING_TO_VERIFY,
  repairsConfirmed: v.VERIFIED_FIXED,
  repairsDisputed: VILLAGE.repairs.filter((r) => r.disputedBy).length,
};

/** Wrong values that spread to 3+ agents before one of them corrected it. */
export const CORRECTIONS = VILLAGE.corrections ?? [];
export const TOP_CORRECTION = CORRECTIONS[0] ?? null;
export const WIKI_CORRECTIONS = COLLUSION.corrections ?? [];
export const TOP_WIKI_CORRECTION = WIKI_CORRECTIONS.find((c) => c.right) ?? null;

/** The landing page's featured lineage: the widest drift episode with a quotable origin. */
export const FEATURED =
  VILLAGE.episodes.find((e) => e.state === "MATERIAL_DRIFT_DETECTED" && e.source && e.assertions.length >= 6) ??
  VILLAGE.episodes[0];

/**
 * Held-out accuracy audit (docs/AUDIT.md). The adjusted rate re-weights the classifier's
 * output by how often its held-out calls were right, so pages lead with it and show the
 * classifier's raw rate beside it.
 */
export const AUDIT = auditJson as {
  adjustedCheckRate: number;
  test: { byClass: Record<"checked" | "credited" | "echoed", { agree: number; n: number }>; overall: { agree: number; n: number } };
};
export const CHECK_RATE = {
  raw: t.restatements ? t.independent / t.restatements : 0,
  adjusted: AUDIT.adjustedCheckRate,
  /** "one in N": the adjusted rate as a plain ratio. */
  oneIn: Math.round(1 / AUDIT.adjustedCheckRate),
};

const w = COLLUSION.totals;

export const WIKI_HEADLINE = {
  edits: w.turns,
  accounts: w.agents,
  from: w.from.slice(0, 10),
  to: w.to.slice(0, 10),
  episodes: w.episodes,
  drift: COLLUSION.verdicts.MATERIAL_DRIFT_DETECTED,
  restatements: w.restatements,
  independent: w.independent,
  echoed: w.echoed,
};

/**
 * Accounts that first posted the values others repeated, ranked by how many shared values
 * they seeded. On an answer board this is who fed the ring.
 */
export function seeders(report: LineageReportJson, top = 10) {
  const ranked = report.profiles
    .filter((p) => p.driftOrigins > 0)
    .sort((a, b) => b.driftOrigins - a.driftOrigins || b.reached - a.reached);
  const total = report.verdicts.MATERIAL_DRIFT_DETECTED;
  const head = ranked.slice(0, top);
  const seeded = head.reduce((a, p) => a + p.driftOrigins, 0);
  return { ranked: head, originators: ranked.length, total, share: total ? seeded / total : 0 };
}
export const WIKI_SEEDERS = seeders(COLLUSION);

/**
 * The wiki's featured lineage: a value its origin posted as a guess ("Hypothesis only",
 * "may be", "likely") that other accounts then submitted as their answer. Falls back to
 * the widest episode if no origin hedges.
 */
export const FEATURED_WIKI =
  COLLUSION.episodes.find((e) => /hypothes|may be|likely|guess/i.test(e.assertions[0]?.excerpt ?? "")) ?? COLLUSION.episodes[0];

type CampaignCase = ReconciliationInput & { category: string; title: string; expectedState: string };

export const FIXTURES = [
  ...(campaignJson.cases as CampaignCase[]).map((c) => {
    const d = evaluateDeterministicKernel(c);
    return {
      id: c.caseId,
      title: c.title,
      category: c.category,
      expected: c.expectedState,
      actual: d.state,
      pass: d.state === c.expectedState && d.invariants.every((i) => i.passed),
    };
  }),
  ...BENCHMARK_CASES.map((b) => {
    const r = evaluateSafetyKernel(b);
    return {
      id: b.id,
      title: b.title,
      category: b.expectedActionable ? "ACTIONABLE" : "CONTROL",
      expected: b.expectedActionable ? "actionable" : "not actionable",
      actual: r.verdict,
      pass: r.approved === b.expectedActionable,
    };
  }),
];

export const FIXTURES_PASSING = FIXTURES.filter((f) => f.pass).length;

/** The worst incident in each committed corpus (see rankIncidents in lib/report.ts). */
export const VILLAGE_INCIDENT = topIncident(VILLAGE);
export const WIKI_INCIDENT = topIncident(COLLUSION);

/** Held-out act precision, from evidence/act-audit-results.json (docs/ACT_AUDIT.md). */
export const ACT_PRECISION = (() => {
  const t = actAuditJson.test;
  const n = t.items - t.unclear;
  return { real: t.real, n, rate: t.real / n, village: t.weighted.aivillage as number, wiki: t.weighted.collusion as number };
})();
