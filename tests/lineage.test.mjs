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
  assert.deepEqual(keys("We are at 412 signups and $2,500 raised."), ["412 signups", "$2500"]);
  // On answer boards the value alone is the key, so one shared answer stays one claim.
  const { extractClaims: ec } = await load("lib/lineage.ts");
  assert.deepEqual(ec("answered 5,269 immediately", "value").map((h) => h.key), extractClaims("Business - 5,269 cached", "value").map((h) => h.key));
  assert.deepEqual(keys("Georgia $19,291,176,969.27 posted"), ["$19291176969.27"]);
  assert.deepEqual(keys("we hit 100% and 1000 users"), []);
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
  assert.equal(by["$2500"].decision.state, "ABSTAIN_AMBIGUOUS_SOURCE");

  // Ember checks the sheet and corrects the number four agents had repeated.
  assert.equal(r.corrections.length, 1);
  const [c] = r.corrections;
  assert.equal(c.wrong, "412 signups");
  assert.equal(c.right, "388 signups");
  assert.equal(c.correctedBy, "Ember");
  assert.equal(c.correctorChecked, true);
  assert.deepEqual(c.before.map((b) => b.agent), ["Atlas", "Birch", "Cedar", "Delta"]);
  // The correction names 412 to reject it, so it is not a fifth statement of 412.
  assert.equal(by["412 signups"].promised, 4);

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

for (const name of ["aivillage", "collusion"]) {
  test(`the committed ${name} report re-derives from its own ledger`, async () => {
    const report = JSON.parse(fs.readFileSync(path.join(root, `evidence/${name}-report.json`), "utf8"));
    const { reportDigest, episodeManifest, rederive } = await load("lib/report.ts");
    assert.equal(reportDigest(report), report.reportSha256, "report body was edited after generation");
    assert.equal(report.ledger.length, report.totals.episodes);
    const counts = {};
    for (const [, , state] of report.ledger) counts[state] = (counts[state] ?? 0) + 1;
    for (const [state, n] of Object.entries(counts)) assert.equal(report.verdicts[state], n, state);
    for (const e of report.episodes) assert.equal(rederive(episodeManifest(e)).state, e.state, e.id);
  });
}

test("wiki revisions: only the lines an edit inserted are that editor's text", async () => {
  const { parseJsonl } = await load("lib/transcript.ts");
  const row = (label, seq, body, hunks) =>
    JSON.stringify({ rev_id: `p@${seq}`, label, page_id: "dse/Board", time: `2026-06-16T10:0${seq}:00Z`, body, hunks });
  const parsed = parseJsonl(
    [
      row("A", 1, "Answer: 2,749", [{ op: "insert", a0: 0, a1: 0, b0: 0, b1: 1 }]),
      // B saves the page with A's line untouched and adds its own line below it.
      row("B", 2, "Answer: 2,749\nB was here", [{ op: "insert", a0: 1, a1: 1, b0: 1, b1: 2 }]),
    ].join("\n"),
  );
  assert.equal(parsed.format, "collusion-wiki");
  assert.deepEqual(parsed.turns.map((t) => [t.agent, t.text]), [["A", "Answer: 2,749"], ["B", "B was here"]]);
});

test("a computer session opened to check the claim counts as an independent path", async () => {
  const { analyzeLineage } = await load("lib/lineage.ts");
  const t = (agent, min, text) => ({ id: `${agent}${min}`, agent, room: "r", ts: Date.UTC(2026, 0, 1, 10, min), text, line: min });
  const turns = [t("A", 0, "The repo now has 128 claims."), t("B", 10, "Repo is at 128 claims."), t("C", 20, "Great, 128 claims total.")];
  const sessions = [{ id: "s1", agent: "C", ts: Date.UTC(2026, 0, 1, 10, 15), goal: "Pull main and run validate_claims.py to confirm 128 claims." }];
  const [plainEp] = analyzeLineage(turns).episodes;
  assert.equal(plainEp.observed, 1);
  const [withSession] = analyzeLineage(turns, {}, sessions).episodes;
  const c = withSession.assertions.find((a) => a.agent === "C");
  assert.equal(c.role, "INDEPENDENT");
  assert.equal(c.via, "session");
  assert.equal(withSession.observed, 2);
  // A session that does not name what is counted is not a check of this claim.
  const [unrelated] = analyzeLineage(turns, {}, [{ ...sessions[0], goal: "Confirm 128 words in the story." }]).episodes;
  assert.equal(unrelated.observed, 1);
});
