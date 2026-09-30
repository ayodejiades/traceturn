/**
 * tools/audit-acts.ts — draw the act-precision audit sample.
 *
 *   pnpm audit:acts        # held-out test set
 *   pnpm audit:acts dev    # the development set the act rules may be fitted on
 *
 * Re-runs act detection on both corpora (needs data/aivillage, including
 * computer_use_turns.jsonl.gz, and data/collusion), then picks acts per stratum in a fixed
 * order (sha256 of salt, corpus, source record and claim), so the same data always yields
 * the same sample. Writes evidence/act-audit-sample-<set>.json with a wide window of each
 * act's source record. Labels live separately in evidence/act-audit-labels-<set>.json.
 *
 * The test set is drawn with a different salt and excludes every dev item; draw it only
 * after the act rules are frozen, or its numbers are fitted to the rules.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { parseJsonl } from "../lib/transcript";
import { analyzeLineage, extractClaims, type ClaimKey } from "../lib/lineage";
import { findActs, type Act } from "../lib/acts";
import { sha256Hex } from "../lib/sha256";
import { readTurns } from "./turns";

const root = process.cwd();
const SET = process.argv[2] === "dev" ? "dev" : "test";
const SALT = SET === "dev" ? "acts-dev-v1|" : "acts-held-out-v1|";
const keyOf = (corpus: string, a: Pick<Act, "sourceId" | "claim" | "kind">) => `${corpus}|${a.sourceId}|${a.claim}|${a.kind}`;
const devKeys = new Set<string>(
  SET === "test" && fs.existsSync(path.join(root, "evidence", "act-audit-sample-dev.json"))
    ? JSON.parse(fs.readFileSync(path.join(root, "evidence", "act-audit-sample-dev.json"), "utf8")).items.map((i: { key: string }) => i.key)
    : [],
);
const gz = (f: string) => zlib.gunzipSync(fs.readFileSync(path.join(root, f))).toString("utf8");

// Items per (corpus, stratum), stratum = evidence/grounding. Sized to the corpora: the
// ungrounded strata carry the headline counts, so they get the most items.
const PLANS: Record<string, Record<string, Record<string, number>>> = {
  dev: {
    aivillage: { "logged/UNGROUNDED": 20, "logged/GROUNDED": 5, "logged/AFTER_CORRECTION": 2, "reported/UNGROUNDED": 8, "reported/GROUNDED": 4, "planned/UNGROUNDED": 8, "planned/GROUNDED": 3 },
    collusion: { "reported/UNGROUNDED": 14, "reported/AFTER_CORRECTION": 8, "reported/GROUNDED": 6 },
  },
  test: {
    aivillage: { "logged/UNGROUNDED": 30, "logged/GROUNDED": 8, "logged/AFTER_CORRECTION": 2, "reported/UNGROUNDED": 10, "reported/GROUNDED": 5, "planned/UNGROUNDED": 10, "planned/GROUNDED": 5 },
    collusion: { "reported/UNGROUNDED": 20, "reported/AFTER_CORRECTION": 10, "reported/GROUNDED": 10 },
  },
};
const PLAN = PLANS[SET];

type Origins = Map<string, { agent: string; at: string; excerpt: string | null }>;
const originsOf = (eps: { id: string; assertions: { agent: string; ts: number; excerpt: string; human: boolean }[] }[]): Origins =>
  new Map(eps.map((e) => [e.id, { agent: e.assertions[0].agent, at: new Date(e.assertions[0].ts).toISOString(), excerpt: e.assertions[0].human ? null : e.assertions[0].excerpt }]));

async function actsFor(corpus: string): Promise<{ acts: Act[]; mode: ClaimKey; origins: Origins }> {
  if (corpus === "collusion") {
    const parsed = parseJsonl(gz("data/collusion/revisions.jsonl.gz"));
    const lineage = analyzeLineage(parsed.turns, { claimKey: "value" }, parsed.sessions);
    return { mode: "value", origins: originsOf(lineage.episodes), acts: findActs(parsed.turns, parsed.sessions, parsed.actions, lineage.episodes, lineage.corrections, lineage.params) };
  }
  const first = parseJsonl(...["agents", "chat_messages", "computer_use_sessions"].map((f) => gz(`data/aivillage/${f}.jsonl.gz`)));
  const lineage = analyzeLineage(first.turns, undefined, first.sessions);
  const tracked = new Set([...lineage.episodes.map((e) => e.claim), ...lineage.corrections.map((c) => c.wrong)]);
  const t = await readTurns(path.join(root, "data/aivillage/computer_use_turns.jsonl.gz"), (arg) =>
    extractClaims(arg, lineage.params.claimKey).some((h) => tracked.has(h.key)),
  );
  const parsed = parseJsonl(...["agents", "chat_messages", "computer_use_sessions"].map((f) => gz(`data/aivillage/${f}.jsonl.gz`)), ...t.chunks);
  const full = analyzeLineage(parsed.turns, undefined, parsed.sessions);
  return { mode: "quantity", origins: originsOf(full.episodes), acts: findActs(parsed.turns, parsed.sessions, parsed.actions, full.episodes, full.corrections, full.params) };
}

async function main() {
  const items: Record<string, unknown>[] = [];
  for (const corpus of ["aivillage", "collusion"]) {
    const { acts, origins } = await actsFor(corpus);
    const pool = new Map<string, { k: string; a: Act }[]>();
    for (const a of acts) {
      const stratum = `${a.evidence}/${a.grounding}`;
      if (!PLAN[corpus][stratum]) continue;
      const key = keyOf(corpus, a);
      if (devKeys.has(key)) continue;
      const list = pool.get(stratum) ?? [];
      list.push({ k: sha256Hex(`${SALT}${key}`), a });
      pool.set(stratum, list);
    }
    for (const [stratum, n] of Object.entries(PLAN[corpus])) {
      const all = pool.get(stratum) ?? [];
      for (const { a } of all.sort((x, y) => (x.k < y.k ? -1 : 1)).slice(0, n)) {
        const at = Math.max(0, a.sourceText.indexOf(a.excerpt));
        items.push({
          id: "",
          key: keyOf(corpus, a),
          corpus,
          stratum,
          population: all.length,
          agent: a.agent,
          at: new Date(a.ts).toISOString(),
          kind: a.kind,
          evidence: a.evidence,
          verb: a.verb,
          claim: a.claim,
          origin: a.episodeId ? (origins.get(a.episodeId) ?? null) : null,
          grounding: a.grounding,
          observers: a.observers.map((o) => o.agent),
          selfObserved: a.selfObserved,
          correctedAt: a.correctedAt ? new Date(a.correctedAt).toISOString() : null,
          to: a.to ?? null,
          excerpt: a.excerpt,
          window: a.sourceText.slice(Math.max(0, at - 350), at + a.excerpt.length + 350),
        });
      }
    }
  }
  const prefix = SET === "dev" ? "AD" : "AT";
  items.forEach((it, i) => (it.id = `${prefix}-${String(i + 1).padStart(3, "0")}`));
  const out = `evidence/act-audit-sample-${SET}.json`;
  fs.writeFileSync(path.join(root, out), JSON.stringify({ generatedBy: "tools/audit-acts.ts", set: SET, plan: PLAN, items }, null, 2) + "\n");
  console.log(`audit:acts: wrote ${items.length} ${SET} items to ${out}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
