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

  const drift = evaluateDeterministicKernel({
    caseId: "c1",
    sourceCaptureT0: "Offer #1: $18.75 monthly bill credit for 24 months.",
    extractedExcerpt: "$18.75 monthly bill credit for 24 months",
    promisedCents: 1875,
    observedCents: 0,
  });
  assert.equal(drift.state, "MATERIAL_DRIFT_DETECTED");
  assert.equal(drift.excerptBound, true);

  const unbound = evaluateDeterministicKernel({
    caseId: "c2",
    sourceCaptureT0: "Standard retail purchase receipt.",
    extractedExcerpt: "hallucinated $50 credit",
    promisedCents: 5000,
    observedCents: 0,
  });
  assert.equal(unbound.state, "ABSTAIN_UNBOUND_EXCERPT");
  assert.equal(unbound.excerptBound, false);

  const unverifiedClaim = evaluateDeterministicKernel({
    caseId: "c3",
    sourceCaptureT0: "Offer #1: $18.75 monthly bill credit for 24 months.",
    extractedExcerpt: "$18.75 monthly bill credit for 24 months",
    promisedCents: 1875,
    observedCents: 0,
    providerClaimsFixed: true,
    subsequentObservationProvesFix: false,
  });
  assert.equal(unverifiedClaim.state, "WAITING_TO_VERIFY");
});
