// tests/lineage.test.mjs — the transcript engine on the committed sample, plus the
// pieces every page relies on: SHA-256 parity, claim extraction, and report re-derivation.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = (rel) => import(path.join(root, rel));
const sample = fs.readFileSync(path.join(root, "fixtures/transcripts/sample-swarm.jsonl"), "utf8");

test("sha256Hex matches node:crypto on ASCII, UTF-8 and block-boundary inputs", async () => {
  const { sha256Hex } = await load("lib/sha256.ts");
  for (const s of ["", "abc", "é ✅ 漢字", "a".repeat(55), "a".repeat(56), "a".repeat(64), "x".repeat(1000)]) {
    assert.equal(sha256Hex(s), crypto.createHash("sha256").update(s).digest("hex"), JSON.stringify(s.slice(0, 12)));
  }
});

test("canonicalJson is key-order independent", async () => {
  const { canonicalJson } = await load("lib/sha256.ts");
  assert.equal(canonicalJson({ b: 1, a: [2, { d: 3, c: 4 }] }), canonicalJson({ a: [2, { c: 4, d: 3 }], b: 1 }));
});

test("extractClaims keys quantities and skips labels, years, codes and URL digits", async () => {
  const { extractClaims } = await load("lib/lineage.ts");
  const keys = (t) => extractClaims(t).map((h) => h.key);
  assert.deepEqual(keys("We are at 412 signups and $2,500 raised."), ["412 signups", "$2500 raised"]);
  assert.deepEqual(keys("Day 259 Session 1 update"), []);
  assert.deepEqual(keys("Since 2025 the page returns 404 errors"), []);
  assert.deepEqual(keys("see https://x.org/items/12345 for details"), []);
  assert.deepEqual(keys("playbook 008 execution"), []);
});

test("sample transcript: every verdict type comes out as constructed", async () => {
  const { parseJsonl } = await load("lib/transcript.ts");
  const { analyzeLineage } = await load("lib/lineage.ts");
  const parsed = parseJsonl(sample);
  assert.equal(parsed.format, "generic");
  const r = analyzeLineage(parsed.turns);
  const by = Object.fromEntries(r.episodes.map((e) => [e.claim, e]));

  // Three agents repeat Atlas's number without checking; Delta copies Birch's wording.
  assert.equal(by["412 signups"].decision.state, "MATERIAL_DRIFT_DETECTED");
  assert.equal(by["412 signups"].promised, 4);
  assert.equal(by["412 signups"].observed, 1);
  assert.equal(by["412 signups"].assertions.find((a) => a.agent === "Delta").edge, "copies");

  // Two agents report their own observation of the same number.
  assert.equal(by["1240 visitors"].decision.state, "ON_TRACK");
  assert.deepEqual(by["1240 visitors"].assertions.map((a) => a.role), ["ORIGIN", "INDEPENDENT", "INDEPENDENT"]);

  // Repeats that name their source add no false corroboration.
  assert.equal(by["137 bugs"].decision.state, "BENIGN_CONTROL_NO_DRIFT");

  // A number a human introduced is never blamed on the first agent to repeat it.
  assert.equal(by["$2500 budget"].decision.state, "ABSTAIN_AMBIGUOUS_SOURCE");

  const repairs = Object.fromEntries(r.repairs.map((x) => [x.url, x]));
  assert.equal(repairs["example.org/signup"].decision.state, "WAITING_TO_VERIFY");
  assert.equal(repairs["example.org/signup"].disputedBy.agent, "Ember");
  assert.equal(repairs["example.org/pricing"].decision.state, "VERIFIED_FIXED");
  assert.equal(repairs["example.org/pricing"].confirmedBy.agent, "Birch");
});

test("every origin excerpt is bound verbatim to its source turn (INV-1)", async () => {
  const { parseJsonl } = await load("lib/transcript.ts");
  const { analyzeLineage } = await load("lib/lineage.ts");
  for (const e of analyzeLineage(parseJsonl(sample).turns).episodes) {
    assert.ok(e.originText.includes(e.assertions[0].excerpt), e.claim);
  }
});

test("buildReport is deterministic, and a changed manifest fails re-derivation", async () => {
  const { parseJsonl } = await load("lib/transcript.ts");
  const { buildReport, reportDigest, episodeManifest, rederive } = await load("lib/report.ts");
  const opts = { generatedBy: "test", source: { name: "sample", citation: null, dataset: null, exportedAt: null }, inputs: [], full: true };
  const a = buildReport(parseJsonl(sample), opts);
  const b = buildReport(parseJsonl(sample), opts);
  assert.equal(a.reportSha256, b.reportSha256);
  assert.equal(reportDigest(a), a.reportSha256);

  for (const e of a.episodes) assert.equal(rederive(episodeManifest(e)).state, e.state, e.id);
  const m = episodeManifest(a.episodes.find((e) => e.state === "MATERIAL_DRIFT_DETECTED"));
  assert.notEqual(rederive({ ...m, observedDerivations: m.promisedDerivations }).state, m.verdict);
  assert.equal(rederive({ ...m, excerpt: "a paraphrase that is nowhere in the source" }).state, "ABSTAIN_UNBOUND_EXCERPT");
});

test("the committed AI Village report re-derives from its own ledger", async () => {
  const report = JSON.parse(fs.readFileSync(path.join(root, "evidence/aivillage-report.json"), "utf8"));
  const { reportDigest, episodeManifest, rederive } = await load("lib/report.ts");
  assert.equal(reportDigest(report), report.reportSha256, "report body was edited after generation");
  assert.equal(report.ledger.length, report.totals.episodes);
  const counts = {};
  for (const [, , state] of report.ledger) counts[state] = (counts[state] ?? 0) + 1;
  for (const [state, n] of Object.entries(counts)) {
    const repairStates = state === "WAITING_TO_VERIFY" || state === "VERIFIED_FIXED";
    if (!repairStates) assert.equal(report.verdicts[state], n, state);
  }
  for (const e of report.episodes) assert.equal(rederive(episodeManifest(e)).state, e.state, e.id);
});
