/**
 * tools/verify-evidence.ts — re-derive every public number from committed artifacts.
 *
 * Checks, exiting 1 on any drift:
 *  1. evidence/aivillage-report.json: its sha256 matches its body; the verdict counts
 *     re-derive from the per-episode ledger; every pinned episode manifest re-derives its
 *     verdict through the kernel; every origin excerpt is verbatim in its source (INV-1).
 *     Every act re-derives its grounding and verdict from its manifest, its excerpt is
 *     verbatim in its source, act totals re-derive from the act ledger, and every act
 *     after a correction falls after that correction.
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
import { actManifest, episodeManifest, rederive, rederiveAct, reportDigest, type LineageReportJson } from "../lib/report";
import { SPONSORS } from "../lib/sponsors";
import { scoreAudit, type AuditItem } from "../lib/audit";

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
  // Acts: totals from the ledger, each listed act re-derived from its manifest and bound.
  const ledger = report.actLedger ?? [];
  const t = report.totals;
  const count = (g: string) => ledger.filter((r) => r[2] === g).length;
  if (ledger.length !== t.acts) fail(`${tag}: act ledger has ${ledger.length} rows, totals.acts says ${t.acts}`);
  if (count("UNGROUNDED") !== t.actsUngrounded || count("AFTER_CORRECTION") !== t.actsAfterCorrection || count("GROUNDED") !== t.actsGrounded)
    fail(`${tag}: act grounding totals do not re-derive from the act ledger`);
  for (const [id, , g, , , , state] of ledger) {
    if ((g === "GROUNDED") !== (state === "ON_TRACK") && state !== "ABSTAIN_UNBOUND_EXCERPT" && state !== "ABSTAIN_AMBIGUOUS_SOURCE")
      fail(`${tag} ${id}: ledger grounding ${g} disagrees with verdict ${state}`);
  }
  const actors = new Set(ledger.filter((r) => r[2] !== "GROUNDED").map((r) => r[7]));
  if (actors.size !== t.agentsActingUngrounded) fail(`${tag}: ${actors.size} agents acted without a check in the ledger, totals say ${t.agentsActingUngrounded}`);
  let actsOk = 0;
  for (const a of report.acts ?? []) {
    const d = rederiveAct(actManifest(a));
    const row = ledger.find((r) => r[0] === a.id);
    const c = corrections.find((x) => x.id === a.correctionId);
    const orderOk = a.grounding !== "AFTER_CORRECTION" || (!!c && c.at < a.at);
    if (d.grounding === a.grounding && d.decision.state === a.state && a.source.includes(a.excerpt) && row?.[2] === a.grounding && orderOk) actsOk++;
    else fail(`${tag} ${a.id}: act re-derives ${d.grounding}/${d.decision.state}, report says ${a.grounding}/${a.state}`);
  }
  for (const c of corrections) {
    const listedAfter = ledger.filter((r) => r[2] === "AFTER_CORRECTION" && (report.acts ?? []).some((a) => a.id === r[0] && a.correctionId === c.id)).length;
    if (listedAfter !== c.acts.after) fail(`${tag} ${c.id}: ${c.acts.after} acts after correction, ${listedAfter} listed`);
  }
  return { report, manifestsOk, bound, correctionsOk, actsOk };
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

// 3. Accuracy audit ---------------------------------------------------------------
type Labelled = AuditItem & { sentence: string };
const audit = (set: "dev" | "test") => {
  const sample = read(`evidence/audit-sample-${set}.json`) as { items: Labelled[] };
  const labels = read(`evidence/audit-labels-${set}.json`) as { labels: Record<string, string>; notes: Record<string, string> };
  const missing = sample.items.filter((i) => !labels.labels[i.id]).map((i) => i.id);
  if (missing.length) fail(`audit ${set}: ${missing.length} unlabelled items (${missing.slice(0, 3).join(", ")}…)`);
  return { sample, labels, score: scoreAudit(sample.items, labels.labels) };
};
const DEV = audit("dev");
const TEST = audit("test");
const WIKI_CHECKED = (() => {
  const sample = read("evidence/audit-sample-wiki-checked.json") as { items: Labelled[] };
  const labels = read("evidence/audit-labels-wiki-checked.json") as { labels: Record<string, string>; notes: Record<string, string> };
  return { sample, labels, score: scoreAudit(sample.items, labels.labels) };
})();

// Share of each AI Village stratum that the held-out labels mark as a real check, weighted
// by how many statements the classifier put in that stratum: an estimate of the true check rate.
function adjustedCheckRate() {
  const t = village.totals;
  const strata: [string, number][] = [
    ["aivillage/INDEPENDENT/statement", t.independent - t.independentBySession],
    ["aivillage/INDEPENDENT/session", t.independentBySession],
    ["aivillage/CITED", t.cited],
    ["aivillage/ECHO", t.echoed],
  ];
  let checks = 0;
  let total = 0;
  for (const [stratum, n] of strata) {
    const items = TEST.sample.items.filter((i) => `${i.corpus}/${i.predicted}${i.via ? `/${i.via}` : ""}` === stratum);
    const real = items.filter((i) => TEST.labels.labels[i.id] === "I").length;
    if (items.length) checks += (n * real) / items.length;
    total += n;
  }
  return total ? checks / total : 0;
}
const adjusted = adjustedCheckRate();

const frac = (x: { agree: number; n: number }) => `${x.agree}/${x.n} (${x.n ? Math.round((x.agree / x.n) * 100) : 0}%)`;
const pct = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`;

// 4. The findings write-up quotes numbers; each must still match the reports.
{
  const findings = fs.readFileSync(path.join(root, "docs", "FINDINGS.md"), "utf8");
  const n = (x: number) => x.toLocaleString("en-US");
  const vt = village.totals;
  const wt = wiki.totals;
  const wikiSeeders = [...wiki.profiles].filter((p) => p.driftOrigins > 0).sort((a, b) => b.driftOrigins - a.driftOrigins || b.reached - a.reached);
  const top10 = wikiSeeders.slice(0, 10).reduce((a, p) => a + p.driftOrigins, 0);
  const expected: [string, string][] = [
    ["AI Village messages", n(vt.turns)],
    ["AI Village restatements", n(vt.restatements)],
    ["AI Village checked", `${vt.independent} (${pct(vt.independent, vt.restatements)})`],
    ["audit-adjusted check rate", `${(adjusted * 100).toFixed(1)}%`],
    ["AI Village acts", `${n(vt.acts)} acts were taken on ${new Set(village.actLedger.map((r) => r[1])).size} shared numbers`],
    ["AI Village ungrounded acts", `${n(vt.actsUngrounded)} had no reported check behind them and ${vt.actsGrounded} did; ${vt.actsAfterCorrection} came after a correction`],
    ["AI Village agents acting unchecked", `${vt.agentsActingUngrounded} of the ${vt.agents} agents`],
    ["AI Village logged acts", `${n(vt.actsByEvidence.logged)} of the acts are shell commands`],
    ["wiki acts", `${n(wt.acts)} acts were taken on ${new Set(wiki.actLedger.map((r) => r[1])).size} shared answers: ${wt.actsUngrounded} with no reported check, ${wt.actsAfterCorrection} after a correction, by ${wt.agentsActingUngrounded} of the ${n(wt.agents)} labels`],
    ["repairs never confirmed", `${village.verdicts.WAITING_TO_VERIFY} were never confirmed`],
    ["wiki edits", n(wt.turns)],
    ["wiki labels", n(wt.agents)],
    ["wiki originators", `${wikiSeeders.length} of the ${n(wt.agents)}`],
    ["wiki top-10 share", `first posted ${top10} of the ${wiki.verdicts.MATERIAL_DRIFT_DETECTED} shared values`],
    ...village.corrections.map((c) => [`AI Village correction ${c.wrong}`, `| ${c.wrong.replace(/ .*/, "")} `] as [string, string]),
    ...wiki.corrections.slice(0, 4).map((c) => [`wiki correction ${c.wrong}`, `| ${c.before.length} | ${c.after.length} |`] as [string, string]),
    ["held-out checked", frac(TEST.score.byClass.checked)],
    ["held-out credited", frac(TEST.score.byClass.credited)],
    ["held-out echoed", frac(TEST.score.byClass.echoed)],
  ];
  for (const [what, text] of expected) {
    if (!findings.includes(text)) fail(`docs/FINDINGS.md: ${what} should read "${text}"`);
  }
}

if (failures.length) {
  console.error(`claim:verify FAILED (${failures.length}):\n  ${failures.join("\n  ")}`);
  process.exit(1);
}

// 3. Write the ledger from what was just proved --------------------------------
const t = village.totals;
const v = village.verdicts;
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
  `| Estimated true check rate (held-out audit) | ${(adjusted * 100).toFixed(1)}% | Class-weighted from ${TEST.score.items} hand-labelled items; see docs/AUDIT.md |`,
  `| Pinned episode manifests that re-derive | ${V.manifestsOk} of ${village.episodes.length} | rederive() through the kernel |`,
  `| Origin excerpts verbatim in source (INV-1) | ${V.bound} of ${village.episodes.length} | Substring check |`,
  `| Acts taken on a shared number | ${t.acts} (${t.actsByEvidence.reported} reported, ${t.actsByEvidence.planned} planned in a session goal, ${t.actsByEvidence.logged} logged tool calls) | Act ledger row count equals totals.acts |`,
  `| Acts with no observation behind the number | ${t.actsUngrounded} of ${t.acts}, by ${t.agentsActingUngrounded} agents | Re-counted from the act ledger |`,
  `| Listed act manifests that re-derive | ${V.actsOk} of ${village.acts.length} | rederiveAct() through the kernel; excerpt verbatim in source |`,
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
  `| Answers and other acts on a shared value | ${wiki.totals.acts} | Act ledger row count equals totals.acts |`,
  `| Acts on a value already corrected on the board | ${wiki.totals.actsAfterCorrection} | Re-counted from the act ledger; each falls after its correction |`,
  `| Acts on a value later corrected | ${wiki.totals.actsOnCorrectedValues} | Report totals, covered by the body sha256 |`,
  `| Acts with no observation behind the value | ${wiki.totals.actsUngrounded} of ${wiki.totals.acts} | Re-counted from the act ledger |`,
  `| Listed act manifests that re-derive | ${W.actsOk} of ${wiki.acts.length} | rederiveAct() through the kernel; excerpt verbatim in source |`,
  "",
  "## Constructed kernel fixtures",
  "",
  `${passing} of ${fixtureRows.length} pass. These are hand-written cases that pin each kernel rule; they are not drawn from the corpus.`,
  "",
].join("\n");

const auditMd = [
  "# Classifier accuracy audit",
  "",
  "Generated by `pnpm claim:verify` from the samples and labels in `evidence/`. Change a label and re-run to see the numbers move.",
  "",
  "**Who labelled:** Claude, the model that wrote the classification rules. These labels are not independent. A second annotator re-labelling `evidence/audit-labels-test.json` is the check that matters; the codes and every item's full sentence are in the sample files.",
  "",
  "## Method",
  "",
  "- Items are drawn per predicted class from both corpora, in a fixed order (sha256 of corpus, turn and claim), by `pnpm audit:sample`.",
  "- The **dev set** (`evidence/audit-sample-dev.json`, 100 items) was labelled first and used to fix the rules: sentence-scoped credit, reports of a check without \"I\", questions and disputes skipped, labels and targets excluded, stricter session goals.",
  "- The **held-out set** (`evidence/audit-sample-test.json`, 99 items) was drawn after the rules were frozen, excluding every dev item. Only its numbers describe the shipped classifier.",
  "- Codes: I checked (own observation), C credited (names its source), E echoed (no credit, no check), X not a statement of the claim.",
  "",
  "## Held-out precision (shipped rules)",
  "",
  "| Predicted | Agree with label |",
  "|---|---|",
  `| Checked | ${frac(TEST.score.byClass.checked)} |`,
  `| Credited | ${frac(TEST.score.byClass.credited)} |`,
  `| Echoed | ${frac(TEST.score.byClass.echoed)} |`,
  `| All | ${frac(TEST.score.overall)} |`,
  "",
  `${TEST.score.notAClaim} of ${TEST.score.items} held-out items were not statements of the claim at all (conjecture ids, version numbers, page titles).`,
  "",
  "| Stratum | Agree |",
  "|---|---|",
  ...Object.entries(TEST.score.byStratum).map(([k, v]) => `| ${k} | ${frac(v)} |`),
  "",
  "## What this does to the headline",
  "",
  `The classifier reports ${village.totals.independent} of ${village.totals.restatements} AI Village restatements as checked (${pct(village.totals.independent, village.totals.restatements)}). Weighting each class by the share of its held-out items labelled as real checks gives an estimated true check rate of **${(adjusted * 100).toFixed(1)}%**. Errors run both ways: some \"checked\" statements only read the number in chat, and some echoes were unmarked checks. The direction of the finding holds; the exact rate carries this uncertainty.`,
  "",
  "## Answer-board checks (second held-out set)",
  "",
  `The first held-out set did not sample German Wiki statements the classifier calls checked. That gap surfaced a rule error (\"R3 confirmed: …\" reports a round, not a check), which was fixed by scoping sentence-initial \"Confirmed\" to chat. A fresh sample of wiki checks was then drawn (\`evidence/audit-sample-wiki-checked.json\`): ${frac(WIKI_CHECKED.score.byClass.checked)} are real checks. The misses are passive reports of someone else's check (\"now independently confirmed by other cohorts\"). The AI Village report was byte-identical before and after that fix, so the numbers above still describe it.`,
  "",
  "German Wiki samples were drawn before answer keys stopped distinguishing \"16.40%\" from \"16.40\". The sampled statements and their labels are unchanged; only how values are grouped into episodes moved.",
  "",
  "## Dev set (before the fixes, for reference)",
  "",
  "| Predicted | Agree with label |",
  "|---|---|",
  `| Checked | ${frac(DEV.score.byClass.checked)} |`,
  `| Credited | ${frac(DEV.score.byClass.credited)} |`,
  `| Echoed | ${frac(DEV.score.byClass.echoed)} |`,
  "",
  "## Known failure modes (held-out notes)",
  "",
  ...Object.entries(TEST.labels.notes).map(([id, note]) => `- \`${id}\`: ${note}`),
].join("\n");
write("docs/AUDIT.md", auditMd);
write(
  "evidence/audit-results.json",
  JSON.stringify({ test: TEST.score, dev: DEV.score, adjustedCheckRate: Math.round(adjusted * 1000) / 1000 }, null, 2),
);

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
  `claim:verify: PASS (AI Village ${village.reportSha256.slice(0, 12)}…: ${t.episodes} episodes, ${V.manifestsOk}/${village.episodes.length} manifests; German Wiki ${wiki.reportSha256.slice(0, 12)}…: ${wiki.totals.episodes} episodes, ${W.manifestsOk}/${wiki.episodes.length} manifests; ${V.actsOk + W.actsOk}/${village.acts.length + wiki.acts.length} act manifests; ${passing}/${fixtureRows.length} fixtures)`,
);
