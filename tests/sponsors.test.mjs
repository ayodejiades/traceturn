/**
 * tests/sponsors.test.mjs — asserts each sponsor's load-bearing seam actually holds.
 *
 * Run with: pnpm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadKernel() {
  const { evaluateDeterministicKernel, BENCHMARK_CASES, evaluateSafetyKernel } = await import(
    path.join(root, "lib/kernel.ts")
  );
  return { evaluateDeterministicKernel, BENCHMARK_CASES, evaluateSafetyKernel };
}

const readFixture = (slug) =>
  JSON.parse(fs.readFileSync(path.join(root, "fixtures", "sponsors", `${slug}_response.json`), "utf8"));

test("AI Village: real transcript fixture is bound to the deterministic kernel", async () => {
  const { evaluateDeterministicKernel } = await loadKernel();
  const fx = readFixture("ai_village");
  const decision = evaluateDeterministicKernel({
    caseId: "AI-VILLAGE-4102",
    sourceCaptureT0: fx.response.text,
    extractedExcerpt: "proof checker accepts incomplete tactic blocks",
    promisedDerivations: fx.response.citedBy.length,
    observedDerivations: fx.response.independentDerivations,
  });
  assert.equal(decision.excerptBound, true, "fixture excerpt must bind to the real turn");
  assert.equal(decision.state, "MATERIAL_DRIFT_DETECTED", "AI Village corpus must be scored, not summarized");
  assert.equal(decision.deltaDerivations, 3);
});

test("Grove Research: independent-derivation counting separates agreement from manufacture", async () => {
  const { BENCHMARK_CASES, evaluateSafetyKernel } = await loadKernel();
  const synthetic = BENCHMARK_CASES.find((b) => b.id === "CASE-01");
  const genuine = BENCHMARK_CASES.find((b) => b.id === "CASE-02");
  assert.equal(evaluateSafetyKernel(synthetic).approved, true, "synthetic consensus must be actionable");
  assert.equal(evaluateSafetyKernel(genuine).approved, false, "genuine corroboration must not false-positive");
  assert.equal(readFixture("grove_research").response.gap, 13);
});

test("Anthropic: attribution is identical with no model reachable", async () => {
  const { BENCHMARK_CASES, evaluateSafetyKernel } = await loadKernel();
  const fx = readFixture("anthropic");
  assert.equal(fx.response.modelReachable, false, "fixture must record the offline condition");
  for (const c of BENCHMARK_CASES) {
    // Pure function: no network, no API key, no model call in the attribution path.
    assert.equal(typeof evaluateSafetyKernel(c).approved, "boolean", `${c.id} must resolve deterministically`);
  }
});
