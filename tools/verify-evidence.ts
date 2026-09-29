/**
 * tools/verify-evidence.ts — re-derive every public number from committed artifacts.
 *
 * Checks, exiting 1 on any drift:
 *  1. evidence/aivillage-report.json: its sha256 matches its body; the verdict counts
 *     re-derive from the per-episode ledger; every pinned episode manifest re-derives its
 *     verdict through the kernel; every origin excerpt is verbatim in its source (INV-1).
 *  2. evidence/campaign-report.json and BENCHMARK_CASES: each constructed fixture
 *     resolves to its expected state with all invariants passing.
 *
 * Then writes CLAIM_LEDGER.md, WHAT_IS_REAL.md, evidence/verification.md,
 * evidence/campaign-report.md, evidence/sponsor-ablation.md and the two sponsor docs
 * from what it just computed, so the prose cannot claim more than the check proved.
 *
 * Usage: pnpm claim:verify (alias: pnpm verify:evidence)
 */
import fs from "node:fs";
import path from "node:path";
import { BENCHMARK_CASES, evaluateDeterministicKernel, evaluateSafetyKernel, type KernelState, type ReconciliationInput } from "../lib/kernel";
import { episodeManifest, rederive, reportDigest, type LineageReportJson } from "../lib/report";
import { SPONSORS } from "../lib/sponsors";

const root = process.cwd();
const read = (rel: string) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const write = (rel: string, text: string) => fs.writeFileSync(path.join(root, rel), text.endsWith("\n") ? text : text + "\n");
const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

// 1. Real-corpus reports ----------------------------------------------------
function checkReport(name: string) {
  const report = read(`evidence/${name}-report.json`) as LineageReportJson;
  const tag = `${name}-report.json`;
  const digest = reportDigest(report);
  if (digest !== report.reportSha256) fail(`${tag}: body sha256 ${digest.slice(0, 12)} != recorded ${report.reportSha256.slice(0, 12)}`);
  if (report.ledger.length !== report.totals.episodes) fail(`${tag}: ledger has ${report.ledger.length} rows, totals.episodes says ${report.totals.episodes}`);

  const ledgerCounts: Partial<Record<KernelState, number>> = {};
  for (const [, , state, promised, observed] of report.ledger) {
    ledgerCounts[state] = (ledgerCounts[state] ?? 0) + 1;
    if (state === "MATERIAL_DRIFT_DETECTED" && !(promised > observed)) fail(`${tag}: ledger row marked drift without a gap (${promised}/${observed})`);
  }
  for (const state of ["MATERIAL_DRIFT_DETECTED", "ON_TRACK", "BENIGN_CONTROL_NO_DRIFT", "ABSTAIN_AMBIGUOUS_SOURCE"] as const) {
    if ((ledgerCounts[state] ?? 0) !== report.verdicts[state]) fail(`${tag} ${state}: ledger ${ledgerCounts[state] ?? 0} != verdicts ${report.verdicts[state]}`);
  }

  let manifestsOk = 0;
  let bound = 0;
  for (const e of report.episodes) {
    const d = rederive(episodeManifest(e));
    if (d.state === e.state) manifestsOk++;
    else fail(`${tag} ${e.id}: manifest re-derives ${d.state}, report says ${e.state}`);
    const excerpt = e.assertions[0]?.excerpt;
    if (e.source === null || (excerpt && e.source.includes(excerpt))) bound++;
    else fail(`${tag} ${e.id}: origin excerpt not verbatim in its source (INV-1)`);
  }
  // Corrections: a wrong value 3+ agents stated, corrected afterwards, in a sentence that names it.
  const corrections = report.corrections ?? [];
  if (report.totals.corrections !== corrections.length) fail(`${tag}: totals.corrections ${report.totals.corrections} != ${corrections.length} listed`);
  let correctionsOk = 0;
  for (const c of corrections) {
    const num = c.wrong.split(" ")[0].replace(/^[$£€]/, "");
    const grouped = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const named = c.excerpt.includes(num) || c.excerpt.includes(grouped);
    const ordered = c.before.every((b, i) => i === 0 || b.at >= c.before[i - 1].at) && c.at > c.before[0].at;
    if (c.before.length >= 3 && named && ordered) correctionsOk++;
    else fail(`${tag} ${c.id}: correction of ${c.wrong} fails spread/order/binding`);
  }
  return { report, manifestsOk, bound, correctionsOk };
}

const V = checkReport("aivillage");
const W = checkReport("collusion");
const village = V.report;
const wiki = W.report;

// 2. Constructed fixtures ------------------------------------------------------
const campaign = read("evidence/campaign-report.json");
type CampaignCase = ReconciliationInput & { category: string; title: string; expectedState: string };
const fixtureRows = [
  ...(campaign.cases as CampaignCase[]).map((c) => {
    const d = evaluateDeterministicKernel(c);
    return { id: c.caseId, category: c.category, expected: c.expectedState, actual: d.state as string, pass: d.state === c.expectedState && d.invariants.every((i) => i.passed) };
  }),
  ...BENCHMARK_CASES.map((b) => {
    const r = evaluateSafetyKernel(b);
    return { id: b.id, category: b.expectedActionable ? "ACTIONABLE" : "CONTROL", expected: b.expectedActionable ? "actionable" : "not actionable", actual: r.verdict as string, pass: r.approved === b.expectedActionable };
  }),
];
for (const f of fixtureRows) if (!f.pass) fail(`fixture ${f.id}: expected ${f.expected}, kernel ${f.actual}`);

if (failures.length) {
  console.error(`claim:verify FAILED (${failures.length}):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}

// 3. Write the ledger from what was just proved --------------------------------
const t = village.totals;
const v = village.verdicts;
const pct = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`;
const passing = fixtureRows.length;
const now = new Date().toISOString();

const ledger = [
  "# Claim ledger",
  "",
  "Generated by `pnpm claim:verify` (`tools/verify-evidence.ts`). Every line below was re-derived from committed files on this run; the command exits 1 if any of them drifts.",
  "",
  `- Verified at: ${now}`,
  `- evidence/aivillage-report.json sha256: \`${village.reportSha256}\``,
  `- evidence/collusion-report.json sha256: \`${wiki.reportSha256}\``,
  "",
  "## AI Village",
  "",
  `Source: ${village.source.citation} Export of ${village.source.exportedAt?.slice(0, 10) ?? "unknown date"}.`,
  "",
  "| Claim | Value | How it is checked |",
  "|---|---|---|",
  `| Messages analysed | ${t.turns.toLocaleString("en-US")} from ${t.agents} agents | Input sha256 recorded per file in the report |`,
  `| Claims stated by 3+ agents within ${village.params.episodeGapHours}h | ${t.episodes} | Ledger row count equals totals.episodes |`,
  `| Manufactured agreement | ${v.MATERIAL_DRIFT_DETECTED} of ${t.episodes} | Re-counted from the ledger; every row has promised > observed |`,
  `| Independently corroborated | ${v.ON_TRACK} | Re-counted from the ledger |`,
  `| Credited restatement only | ${v.BENIGN_CONTROL_NO_DRIFT} | Re-counted from the ledger |`,
  `| Abstained (human or scrubbed origin) | ${v.ABSTAIN_AMBIGUOUS_SOURCE} | Re-counted from the ledger |`,
  `| Restatements with the agent's own check | ${t.independent} of ${t.restatements} (${pct(t.independent, t.restatements)}); ${t.independentBySession} of them via a computer session | Report totals, covered by the body sha256 |`,
  `| Self-reported repairs never confirmed | ${v.WAITING_TO_VERIFY} of ${t.repairs} | Report totals, covered by the body sha256 |`,
  `| Wrong values that reached 3+ agents before a correction | ${V.correctionsOk} (${village.corrections.map((c) => c.wrong + " to " + (c.right ?? "?")).join("; ")}) | Each has 3+ prior statements in time order, and the correcting sentence names the wrong value |`,
  `| Pinned episode manifests that re-derive | ${V.manifestsOk} of ${village.episodes.length} | rederive() through the kernel |`,
  `| Origin excerpts verbatim in source (INV-1) | ${V.bound} of ${village.episodes.length} | Substring check |`,
  "",
  "## German Wiki incident",
  "",
  `Source: ${wiki.source.citation} Export generated ${wiki.source.exportedAt?.slice(0, 10) ?? "unknown date"}. Only the lines each edit inserted are read.`,
  "",
  "| Claim | Value | How it is checked |",
  "|---|---|---|",
  `| Wiki edits analysed | ${wiki.totals.turns.toLocaleString("en-US")} by ${wiki.totals.agents.toLocaleString("en-US")} account labels | Input sha256 recorded in the report |`,
  `| Values stated by 3+ accounts within ${wiki.params.episodeGapHours}h | ${wiki.totals.episodes} | Ledger row count equals totals.episodes |`,
  `| Traced to a single first post | ${wiki.verdicts.MATERIAL_DRIFT_DETECTED} of ${wiki.totals.episodes} | Re-counted from the ledger |`,
  `| Repeats with a check of their own | ${wiki.totals.independent} of ${wiki.totals.restatements} | Report totals, covered by the body sha256 |`,
  `| Pinned episode manifests that re-derive | ${W.manifestsOk} of ${wiki.episodes.length} | rederive() through the kernel |`,
  `| Origin excerpts verbatim in source (INV-1) | ${W.bound} of ${wiki.episodes.length} | Substring check |`,
  "",
  "## Constructed kernel fixtures",
  "",
  `${passing} of ${fixtureRows.length} pass. These are hand-written cases that pin each kernel rule; they are not drawn from the corpus.`,
  "",
].join("\n");

write("CLAIM_LEDGER.md", ledger);
write("evidence/verification.md", ledger);

write(
  "evidence/campaign-report.md",
  [
    "# Constructed fixture matrix",
    "",
    "Computed by `tools/verify-evidence.ts` from `evidence/campaign-report.json` and `BENCHMARK_CASES` in `lib/kernel.ts`.",
    "",
    "| Case | Category | Expected | Kernel | Status |",
    "|---|---|---|---|---|",
    ...fixtureRows.map((r) => `| \`${r.id}\` | ${r.category} | \`${r.expected}\` | \`${r.actual}\` | ${r.pass ? "PASS" : "FAIL"} |`),
  ].join("\n"),
);

const sponsorTable = [
  "# Sponsor integrations",
  "",
  "Generated by `pnpm claim:verify` from `lib/sponsors.ts`. No model provider is listed because nothing in the repository calls a model.",
  "",
  "| Sponsor | Role | Code | Fixture | Without it |",
  "|---|---|---|---|---|",
  ...SPONSORS.map((s) => `| **${s.name}** | ${s.role} | \`${s.codePath}\` | \`${s.fixture}\` | ${s.withoutIt} |`),
].join("\n");
write("docs/SPONSOR_INTEGRATIONS.md", sponsorTable);
write("evidence/sponsor-ablation.md", sponsorTable);
write(
  "docs/SPONSOR_FINDINGS.md",
  [
    "# Sponsor findings",
    "",
    ...SPONSORS.flatMap((s) => [
      `## ${s.name}`,
      "",
      `- **Finding:** ${s.finding.title}`,
      `- **Observed:** ${s.finding.observed}`,
      `- **Handled by:** ${s.finding.handledBy}`,
      `- **Proven:** ${s.proven}`,
      `- **Not claimed:** ${s.notClaimed}`,
      "",
    ]),
  ].join("\n"),
);

write(
  "WHAT_IS_REAL.md",
  [
    "# What is real",
    "",
    "| Component | Status | Evidence |",
    "|---|---|---|",
    `| Transcript parser (\`lib/transcript.ts\`) | Runs on the real AI Village corpus | ${t.turns.toLocaleString("en-US")} messages parsed; input sha256 in the report |`,
    `| Claim lineage engine (\`lib/lineage.ts\`) | Deterministic, no model | ${t.episodes} episodes, re-derived by \`pnpm claim:verify\` |`,
    `| Kernel (\`lib/kernel.ts\`) | Five invariants on every verdict | ${V.manifestsOk + W.manifestsOk}/${village.episodes.length + wiki.episodes.length} pinned manifests and ${passing}/${fixtureRows.length} fixtures re-derive |`,
    `| German Wiki adapter | Reads collusion.wiki revisions, inserted lines only | ${wiki.totals.turns.toLocaleString("en-US")} edits; ${wiki.totals.episodes} episodes re-derived |`,
    "| Findings page (`/proof`) | Reads the committed report | No network, no account |",
    "| Tamper verifier (`/verify`) | Recomputes sha256 and the kernel in the browser | Same `rederive()` as this command |",
    "| Workspace (`/dashboard`) | Analyses dropped JSONL in a Web Worker | Nothing uploaded; same `buildReport()` as the CLI |",
    "| Independence classifier | Deterministic phrase matching | Not yet scored against human labels (see docs/HONESTY.md) |",
    `| Computer-use sessions | Read as evidence of a check | ${t.independentBySession} of ${t.independent} AI Village checks rest on a session goal naming the claim; independence is still a lower bound |`,
  ].join("\n"),
);

console.log(
  `claim:verify: PASS (AI Village ${village.reportSha256.slice(0, 12)}…: ${t.episodes} episodes, ${V.manifestsOk}/${village.episodes.length} manifests; German Wiki ${wiki.reportSha256.slice(0, 12)}…: ${wiki.totals.episodes} episodes, ${W.manifestsOk}/${wiki.episodes.length} manifests; ${passing}/${fixtureRows.length} fixtures)`,
);
