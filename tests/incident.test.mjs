/**
 * tests/incident.test.mjs — the downloadable incident report is a function of the committed
 * report, and every manifest in it re-derives through the kernel with a matching digest.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadIncident, incidentJson } = await import(path.join(root, "lib/incident.ts"));
const { rederive, rederiveAct, topIncident } = await import(path.join(root, "lib/report.ts"));
const { CORPORA } = await import(path.join(root, "lib/evidence.ts"));
const { canonicalJson, sha256Hex } = await import(path.join(root, "lib/sha256.ts"));

test("unknown corpus or episode has no incident", () => {
  assert.equal(loadIncident("nope", "EP-0001"), null);
  assert.equal(loadIncident("aivillage", "EP-9999"), null);
});

for (const corpus of ["aivillage", "collusion"]) {
  test(`${corpus}: the worst incident's download re-derives`, () => {
    const top = topIncident(CORPORA[corpus].report);
    assert.ok(top?.episode, "worst incident must be a listed episode so its page exists");
    const d = loadIncident(corpus, top.episode.id);
    assert.ok(d);
    assert.equal(d.ledger.total, top.acts.total);
    assert.equal(d.ledger.agents, top.agents);
    const j = incidentJson(d);
    assert.equal(j.episodeManifest.sha256, sha256Hex(canonicalJson(j.episodeManifest.manifest)));
    assert.equal(rederive(j.episodeManifest.manifest).state, j.episodeManifest.manifest.verdict);
    assert.ok(j.actManifests.length > 0, "the worst incident lists its acts");
    for (const a of j.actManifests) {
      assert.equal(a.sha256, sha256Hex(canonicalJson(a.manifest)));
      const r = rederiveAct(a.manifest);
      assert.equal(r.grounding, a.manifest.grounding);
      assert.equal(r.decision.state, a.manifest.verdict);
      assert.equal(r.decision.excerptBound, true);
    }
  });
}
