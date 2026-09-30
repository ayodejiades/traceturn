/**
 * tests/sponsors.test.mjs — each sponsor fixture is re-run through the code it describes.
 *
 * Run with: pnpm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readFixture = (slug) =>
  JSON.parse(fs.readFileSync(path.join(root, "fixtures", "sponsors", `${slug}_response.json`), "utf8"));

test("AI Village: the fixture row is the committed report's origin, and the kernel re-derives it", async () => {
  const { evaluateDeterministicKernel } = await import(path.join(root, "lib/kernel.ts"));
  const report = JSON.parse(fs.readFileSync(path.join(root, "evidence/aivillage-report.json"), "utf8"));
  const fx = readFixture("ai_village").response;
  const ep = report.episodes.find((e) => e.id === fx.episode);
  assert.ok(ep, "fixture episode must exist in the committed report");
  assert.equal(ep.assertions[0].turnId, fx.turnId);
  assert.equal(ep.assertions[0].excerpt, fx.excerpt);

  const d = evaluateDeterministicKernel({
    caseId: fx.episode,
    sourceCaptureT0: fx.source,
    extractedExcerpt: fx.excerpt,
    promisedDerivations: fx.promisedDerivations,
    observedDerivations: fx.observedDerivations,
  });
  assert.equal(d.excerptBound, true, "excerpt must be verbatim in the AI Village source turn");
  assert.equal(d.state, fx.verdict);
});

test("Grove Research: independent-derivation counting on the sample separates checked from repeated", async () => {
  const { parseJsonl } = await import(path.join(root, "lib/transcript.ts"));
  const { analyzeLineage } = await import(path.join(root, "lib/lineage.ts"));
  const fx = readFixture("grove_research").response;
  const sample = fs.readFileSync(path.join(root, "fixtures/transcripts/sample-swarm.jsonl"), "utf8");
  const ep = analyzeLineage(parseJsonl(sample).turns).episodes.find((e) => e.claim === fx.claim);
  assert.equal(ep.promised, fx.promisedDerivations);
  assert.equal(ep.observed, fx.observedDerivations);
  assert.equal(ep.decision.state, fx.verdict);
});

test("No model is called anywhere in the attribution path", () => {
  const files = ["lib/kernel.ts", "lib/lineage.ts", "lib/acts.ts", "lib/transcript.ts", "lib/report.ts", "lib/analyze.worker.ts"];
  for (const f of files) {
    const src = fs.readFileSync(path.join(root, f), "utf8");
    assert.doesNotMatch(src, /anthropic|openai|fetch\(/i, `${f} must stay a pure function of the transcript`);
  }
});

test("No page or component links to a model vendor", () => {
  const walk = (dir) =>
    fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
      const rel = path.join(dir, e.name);
      return e.isDirectory() ? walk(rel) : /\.(?:tsx?|mjs)$/.test(e.name) ? [rel] : [];
    });
  // A link or call to a vendor, not a model's name: the AI Village corpus names its agents.
  const VENDOR = /(?:claude\.ai|chatgpt\.com|chat\.openai\.com|gemini\.google\.com|perplexity\.ai|copilot\.microsoft\.com|grok\.com|api\.anthropic\.com|api\.openai\.com|generativelanguage\.googleapis\.com)|from\s+["'](?:@anthropic-ai|openai|@google\/generative-ai|@ai-sdk)|Summarize with/i;
  for (const f of [...walk("app"), ...walk("components"), ...walk("lib"), ...walk("tools")]) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, f), "utf8"), VENDOR, `${f} must not depend on or link to a model vendor`);
  }
});

test("Logged actions: tool calls and delegations are linked to the claim in their argument and graded", async () => {
  const { parseJsonl } = await import(path.join(root, "lib/transcript.ts"));
  const { analyzeLineage } = await import(path.join(root, "lib/lineage.ts"));
  const { findActs } = await import(path.join(root, "lib/acts.ts"));
  const fx = JSON.parse(fs.readFileSync(path.join(root, "fixtures/acts/logged-acts.json"), "utf8"));
  const parsed = parseJsonl(fs.readFileSync(path.join(root, fx.transcript), "utf8"));
  assert.ok(parsed.actions.length > 0, "tool-call rows must be kept as actions, not dropped as prose-less");
  const r = analyzeLineage(parsed.turns, undefined, parsed.sessions);
  const acts = findActs(parsed.turns, parsed.sessions, parsed.actions, r.episodes, r.corrections, r.params);
  const got = acts.map((a) => ({
    agent: a.agent, kind: a.kind, evidence: a.evidence, claim: a.claim, grounding: a.grounding,
    observers: a.observers.map((o) => o.agent), state: a.decision.state,
  }));
  assert.deepEqual(got, fx.expected);
  for (const a of acts) assert.equal(a.decision.excerptBound, true, `${a.id} excerpt must be verbatim in its source record`);
  assert.deepEqual(findActs(parsed.turns, parsed.sessions, parsed.actions, r.episodes, r.corrections, r.params).map((a) => a.id), acts.map((a) => a.id), "deterministic");
});

