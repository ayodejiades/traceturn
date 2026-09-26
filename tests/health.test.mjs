// tests/health.test.mjs — a real test that must pass in DEMO_MODE without a database.
// Uses Node's built-in test runner (`node --test`), no extra dependency.
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.DEMO_MODE = "1";

test("listRecords and createRecord round-trip in DEMO_MODE", async () => {
  const { listRecords, createRecord } = await import("../db/index.ts");
  const before = await listRecords();
  assert.ok(Array.isArray(before));
  assert.ok(before.length >= 1, "fixtures/records.json should seed at least one row");

  const created = await createRecord("test row");
  assert.equal(created.title, "test row");

  const after = await listRecords();
  assert.equal(after.length, before.length + 1);
});

test("deterministic safety kernel enforces excerpt binding, benign control, and resolution gating", async () => {
  const { evaluateDeterministicKernel } = await import("../lib/kernel.ts");

  // A premise asserted as corroborated 14x that traces back to a single origin.
  const synthetic = evaluateDeterministicKernel({
    caseId: "c1",
    sourceCaptureT0: "Agent-07 records that the proof checker accepts incomplete tactic blocks.",
    extractedExcerpt: "proof checker accepts incomplete tactic blocks",
    promisedDerivations: 14,
    observedDerivations: 1,
  });
  assert.equal(synthetic.state, "MATERIAL_DRIFT_DETECTED");
  assert.equal(synthetic.excerptBound, true);
  assert.equal(synthetic.deltaDerivations, 13);

  // Genuine independent corroboration must not false-positive.
  const genuine = evaluateDeterministicKernel({
    caseId: "c1b",
    sourceCaptureT0: "Agent-19 independently measures the harness at 418ms and reports agreement.",
    extractedExcerpt: "independently measures the harness",
    promisedDerivations: 3,
    observedDerivations: 3,
  });
  assert.equal(genuine.state, "ON_TRACK");

  const unbound = evaluateDeterministicKernel({
    caseId: "c2",
    sourceCaptureT0: "Agent-60 reports that the evaluation harness appears to have been modified.",
    extractedExcerpt: "harness was silently patched by the grader",
    promisedDerivations: 5,
    observedDerivations: 5,
  });
  assert.equal(unbound.state, "ABSTAIN_UNBOUND_EXCERPT");
  assert.equal(unbound.excerptBound, false);

  const unverifiedClaim = evaluateDeterministicKernel({
    caseId: "c3",
    sourceCaptureT0: "Agent-44 asserts the missing derivation was supplied and the premise now holds.",
    extractedExcerpt: "the missing derivation was supplied",
    promisedDerivations: 6,
    observedDerivations: 1,
    providerClaimsFixed: true,
    subsequentObservationProvesFix: false,
  });
  assert.equal(unverifiedClaim.state, "WAITING_TO_VERIFY");

  // A restatement re-citing one origin is benign, not a consensus alert.
  const benign = evaluateDeterministicKernel({
    caseId: "c4",
    sourceCaptureT0: "Agent-31 rephrases the attribution: the note traces back to Agent-07.",
    extractedExcerpt: "the note traces back to Agent-07",
    promisedDerivations: 2,
    observedDerivations: 2,
    isCosmeticRewrite: true,
  });
  assert.equal(benign.state, "BENIGN_CONTROL_NO_DRIFT");
});
