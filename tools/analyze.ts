/**
 * tools/analyze.ts — run claim lineage over a transcript and write committed evidence.
 *
 *   pnpm analyze                      # AI Village: data/aivillage/{agents,chat_messages,computer_use_sessions}.jsonl.gz
 *                                     # plus computer_use_turns.jsonl.gz (2.5 GB) when present: its actions are the logged acts
 *   pnpm analyze collusion            # German Wiki incident: data/collusion/revisions.jsonl.gz
 *   pnpm analyze path/to/log.jsonl    # any multi-agent JSONL (.jsonl or .jsonl.gz)
 *
 * AI Village is gated (huggingface.co/datasets/aidigestorg/ai-village). With access:
 *   hf download aidigestorg/ai-village agents.jsonl.gz chat_messages.jsonl.gz \
 *     summaries.jsonl.gz manifest.json --repo-type dataset --local-dir data/aivillage
 * data/ is gitignored: the corpus is never committed, only this report, which quotes
 * short sentences from agent messages (never human ones) and cites the dataset as its
 * terms ask.
 *
 * collusion.wiki publishes its export at https://collusion.wiki/explorer/download; fetch
 * revisions.jsonl.gz into data/collusion/ and check it against the SHA256SUMS on that page.
 *
 * Writes evidence/<name>-report.json: aivillage, collusion, or the input file's name.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createHash } from "node:crypto";
import { parseJsonl } from "../lib/transcript";
import { analyzeLineage, extractClaims } from "../lib/lineage";
import { readTurns } from "./turns";
import { buildReport, topIncident } from "../lib/report";

const root = process.cwd();
const dataDir = path.join(root, "data", "aivillage");
const args = process.argv.slice(2);
const isVillage = args.length === 0;
const isCollusion = args.length === 1 && args[0] === "collusion";
const sessionsFile = path.join(dataDir, "computer_use_sessions.jsonl.gz");
// Optional and large (2.5 GB): the executed action of every computer-use step, read as a
// stream because it does not fit in one string. Actions are what lib/acts.ts links to claims.
const turnsFile = path.join(dataDir, "computer_use_turns.jsonl.gz");
const useTurns = fs.existsSync(turnsFile);
const inputs = isVillage
  ? [
      path.join(dataDir, "agents.jsonl.gz"),
      path.join(dataDir, "chat_messages.jsonl.gz"),
      // Optional: sessions let an agent's silent check count as an independent path.
      ...(fs.existsSync(sessionsFile) ? [sessionsFile] : []),
    ]
  : isCollusion
    ? [path.join(root, "data", "collusion", "revisions.jsonl.gz")]
    : args.map((a) => path.resolve(a));

for (const f of inputs) {
  if (!fs.existsSync(f)) {
    console.error(`analyze: missing ${path.relative(root, f)}`);
    if (isVillage) console.error("The AI Village dataset is gated; see the header of tools/analyze.ts to download it.");
    process.exit(1);
  }
}

const gunzipIf = (f: string, buf: Buffer) => (f.endsWith(".gz") ? zlib.gunzipSync(buf) : buf).toString("utf8");

async function main() {
  const t0 = Date.now();
  const loaded = inputs.map((f) => {
    const buf = fs.readFileSync(f);
    return { file: path.basename(f), text: gunzipIf(f, buf), sha256: createHash("sha256").update(buf).digest("hex") };
  });
  const texts = loaded.map((l) => l.text);
  if (isVillage && useTurns) {
    // Pass 1: the claims the swarm shared and the values it corrected, from chat and sessions alone.
    const first = parseJsonl(...texts);
    const lineage = analyzeLineage(first.turns, undefined, first.sessions);
    const tracked = new Set([...lineage.episodes.map((e) => e.claim), ...lineage.corrections.map((c) => c.wrong)]);
    // Pass 2: only the actions that carry one of them.
    const t = await readTurns(turnsFile, (arg) => extractClaims(arg, lineage.params.claimKey).some((h) => tracked.has(h.key)));
    console.log(`analyze: computer_use_turns ${t.rows} rows, ${t.kept} actions on ${tracked.size} tracked claims, in ${Date.now() - t0}ms`);
    texts.push(...t.chunks);
    loaded.push({ file: path.basename(turnsFile), text: "", sha256: t.sha256 });
  }
  const parsed = parseJsonl(...texts);

  // Village day numbers for deep links, from the dated daily summaries.
  const dayByDate = new Map<string, number>();
  const summaries = path.join(dataDir, "summaries.jsonl.gz");
  if (isVillage && fs.existsSync(summaries)) {
    for (const line of gunzipIf(summaries, fs.readFileSync(summaries)).split("\n")) {
      if (!line) continue;
      const r = JSON.parse(line);
      if (r.type === "daily" && r.summary_date && /^\d+$/.test(r.summary_target ?? "")) {
        dayByDate.set(r.summary_date, Number(r.summary_target));
      }
    }
  }

  const manifestPath = path.join(dataDir, "manifest.json");
  const manifest = isVillage && fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : null;

  const report = buildReport(parsed, {
    generatedBy: "tools/analyze.ts",
    source: isVillage
      ? {
          name: "AI Village",
          citation: 'AI Digest, "AI Village dataset", 2026. https://theaidigest.org/village',
          dataset: "https://huggingface.co/datasets/aidigestorg/ai-village",
          exportedAt: manifest?.exportedAt ?? null,
        }
      : isCollusion
        ? {
            name: "German Wiki incident (collusion.wiki)",
            citation: "collusion.wiki, German Wiki incident export (revisions.jsonl), user names and half of every IP redacted by the publishers. https://collusion.wiki/",
            dataset: "https://collusion.wiki/explorer/download",
            exportedAt: JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, "data", "collusion", "manifest.json.gz"))).toString()).generated_at ?? null,
          }
        : { name: path.basename(inputs[0]), citation: null, dataset: null, exportedAt: null },
    inputs: loaded.map(({ file, sha256 }) => ({ file, sha256 })),
    dayByDate,
  });

  const name = isVillage ? "aivillage" : isCollusion ? "collusion" : path.basename(inputs[0]).replace(/\.jsonl(\.gz)?$/, "");
  const outPath = path.join(root, "evidence", `${name}-report.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

  const t = report.totals;
  console.log(`analyze: ${t.turns} turns, ${t.agents} agents, ${t.episodes} episodes, ${t.repairs} repair claims in ${Date.now() - t0}ms`);
  console.log(`analyze: verdicts ${JSON.stringify(report.verdicts)}`);
  console.log(`analyze: wrote ${path.relative(root, outPath)} (sha256 ${report.reportSha256.slice(0, 16)}…)`);
  console.log(`analyze: ${t.acts} acts on shared numbers: ${t.actsAfterCorrection} after a correction, ${t.actsUngrounded} with no observation behind them, ${t.actsGrounded} grounded`);

  // The incident, as an investigator reads it: which turn, how many paths, what was done.
  const inc = topIncident(report);
  if (inc) {
    const clip = (s: string, n = 110) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
    // An act sentence ends on the act ("…; answered 9.90% at +1s"), so keep its end.
    const tail = (s: string, n = 90) => (s.length > n ? "…" + s.slice(s.length - n + 1) : s);
    const origin = inc.episode?.assertions[0];
    console.log(`\nincident: ${inc.claim}${inc.episode ? ` (${inc.episode.id})` : ""}`);
    if (origin) console.log(`  origin      ${origin.agent} at ${origin.at}, turn ${origin.turnId}: "${clip(origin.excerpt ?? "(human message, not quoted)")}"`);
    console.log(`  derivation  stated as known by ${inc.promised}; ${inc.observed - (inc.episode?.originObserved === false ? 1 : 0)} reported an observation of their own`);
    if (inc.correction) {
      const c = inc.correction;
      console.log(`  corrected   by ${c.correctedBy} at ${c.at} to ${c.right ?? "(no value given)"}, ${c.hoursToCorrection}h after it first appeared; ${c.after.length} more stated it afterwards`);
    }
    console.log(`  agents      ${inc.agents} acted on it with no reported check`);
    console.log(`  acts        ${inc.acts.total} taken on it: ${inc.acts.afterCorrection} after the correction, ${inc.acts.ungrounded} with no observation behind it, ${inc.acts.grounded} grounded`);
    for (const a of inc.top.slice(0, 5)) {
      console.log(`    ${a.id}  ${a.grounding.padEnd(16)} ${a.kind.padEnd(7)} ${a.agent} at ${a.at}: "${tail(a.excerpt)}"`);
    }
  }

  // The AI Village sponsor fixture is the report's first origin row; keep it in step so
  // tests/sponsors.test.mjs always checks the committed report, not an older one.
  if (isVillage) {
    const e = report.episodes[0];
    const o = e.assertions[0];
    const fixturePath = path.join(root, "fixtures", "sponsors", "ai_village_response.json");
    const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
    fixture.response = {
      episode: e.id,
      claim: e.claim,
      turnId: o.turnId,
      agent: o.agent,
      at: o.at,
      excerpt: o.excerpt,
      source: e.source,
      promisedDerivations: e.promised,
      observedDerivations: e.observed,
      verdict: e.state,
    };
    fs.writeFileSync(fixturePath, JSON.stringify(fixture, null, 2) + "\n");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
