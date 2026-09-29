/**
 * The single source for every number a page shows.
 *
 * - VILLAGE: evidence/aivillage-report.json, produced by `pnpm analyze` over the real
 *   AI Village chat corpus and re-derived by `pnpm claim:verify`.
 * - FIXTURES: the constructed kernel test cases in evidence/campaign-report.json plus
 *   BENCHMARK_CASES, evaluated here at import time, so the count and the pass/fail
 *   shown on a page are whatever the kernel returns now.
 */
import villageJson from "@/evidence/aivillage-report.json";
import campaignJson from "@/evidence/campaign-report.json";
import { BENCHMARK_CASES, evaluateDeterministicKernel, evaluateSafetyKernel, type ReconciliationInput } from "./kernel";
import type { LineageReportJson } from "./report";

export const VILLAGE = villageJson as unknown as LineageReportJson;

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

/** The landing page's featured lineage: the widest drift episode with a quotable origin. */
export const FEATURED =
  VILLAGE.episodes.find((e) => e.state === "MATERIAL_DRIFT_DETECTED" && e.source && e.assertions.length >= 6) ??
  VILLAGE.episodes[0];

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
