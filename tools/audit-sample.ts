/**
 * tools/audit-sample.ts — draw the accuracy-audit sample.
 *
 *   pnpm audit:sample        # held-out test set (default)
 *   pnpm audit:sample dev    # the development set the rules were fitted on
 *
 * Re-runs the analysis on both corpora (needs data/aivillage and data/collusion), then
 * picks statements per predicted role in a fixed order (sha256 of corpus, turn id and
 * claim), so the same data always yields the same sample. Writes
 * evidence/audit-sample.json with the full sentence the classifier read for each item.
 * Labels live separately in evidence/audit-labels.json; tools/verify-evidence.ts joins
 * the two and recomputes agreement.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { parseJsonl } from "../lib/transcript";
import { analyzeLineage, claimSentence, extractClaims, type ClaimKey } from "../lib/lineage";
import { sha256Hex } from "../lib/sha256";

const root = process.cwd();
// The dev set (evidence/audit-sample-dev.json) was drawn before the audit fixes and used to
// write them. The test set is drawn with a different salt after the rules were frozen, and
// excludes every dev item, so its numbers are not fitted to the rules.
const SET = process.argv[2] === "dev" ? "dev" : "test";
const SALT = SET === "dev" ? "" : "held-out-v1|";
const devIds = new Set<string>(
  SET === "test" && fs.existsSync(path.join(root, "evidence", "audit-sample-dev.json"))
    ? JSON.parse(fs.readFileSync(path.join(root, "evidence", "audit-sample-dev.json"), "utf8")).items.map((i: { corpus: string; turnId: string; claim: string }) => `${i.corpus}|${i.turnId}|${i.claim}`)
    : [],
);
const gz = (f: string) => zlib.gunzipSync(fs.readFileSync(path.join(root, f))).toString("utf8");

// Items per (corpus, stratum). Strata follow the classifier's own output.
const PLAN: Record<string, Record<string, number>> = {
  aivillage: { "INDEPENDENT/statement": 20, "INDEPENDENT/session": 10, CITED: 20, ECHO: 25 },
  collusion: { ECHO: 15, CITED: 10 },
};

const corpora: { id: string; mode: ClaimKey; texts: string[] }[] = [
  {
    id: "aivillage",
    mode: "quantity",
    texts: ["data/aivillage/agents.jsonl.gz", "data/aivillage/chat_messages.jsonl.gz", "data/aivillage/computer_use_sessions.jsonl.gz"].map(gz),
  },
  { id: "collusion", mode: "value", texts: [gz("data/collusion/revisions.jsonl.gz")] },
];

const items: unknown[] = [];
for (const c of corpora) {
  const parsed = parseJsonl(...c.texts);
  const byId = new Map(parsed.turns.map((t) => [t.id, t]));
  const report = analyzeLineage(parsed.turns, { claimKey: c.mode }, parsed.sessions);
  const pool = new Map<string, { key: string; row: Record<string, unknown> }[]>();
  for (const e of report.episodes) {
    for (const a of e.assertions.slice(1)) {
      if (a.human) continue;
      const stratum = a.role === "INDEPENDENT" ? `INDEPENDENT/${a.via}` : a.role;
      if (!PLAN[c.id][stratum]) continue;
      const turn = byId.get(a.turnId)!;
      const hit = extractClaims(turn.text, c.mode).find((h) => h.key === e.claim)!;
      const row = {
        id: "",
        corpus: c.id,
        turnId: a.turnId,
        agent: a.agent,
        claim: e.claim,
        predicted: a.role,
        via: a.via ?? null,
        edge: a.edge,
        earlierSpeakers: e.assertions.slice(0, e.assertions.indexOf(a)).map((x) => x.agent),
        sentence: claimSentence(turn.text, hit.start, hit.end),
        sessionGoal: a.session?.goal ?? null,
      };
      const list = pool.get(stratum) ?? [];
      if (devIds.has(`${c.id}|${a.turnId}|${e.claim}`)) continue;
      list.push({ key: sha256Hex(`${SALT}${c.id}|${a.turnId}|${e.claim}`), row });
      pool.set(stratum, list);
    }
  }
  for (const [stratum, n] of Object.entries(PLAN[c.id])) {
    const picked = (pool.get(stratum) ?? []).sort((x, y) => (x.key < y.key ? -1 : 1)).slice(0, n);
    for (const p of picked) items.push(p.row);
  }
}
const prefix = SET === "dev" ? "A" : "T";
items.forEach((it, i) => ((it as { id: string }).id = `${prefix}-${String(i + 1).padStart(3, "0")}`));
const out = `evidence/audit-sample-${SET}.json`;
fs.writeFileSync(path.join(root, out), JSON.stringify({ generatedBy: "tools/audit-sample.ts", set: SET, plan: PLAN, items }, null, 2) + "\n");
console.log(`audit:sample: wrote ${items.length} ${SET} items to ${out}`);
