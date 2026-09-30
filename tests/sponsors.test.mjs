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
