/**
 * tools/analyze.ts — run claim lineage over a transcript and write committed evidence.
 *
 *   pnpm analyze                      # AI Village: data/aivillage/{agents,chat_messages}.jsonl.gz
 *   pnpm analyze path/to/log.jsonl    # any multi-agent JSONL (.jsonl or .jsonl.gz)
 *
 * AI Village is gated (huggingface.co/datasets/aidigestorg/ai-village). With access:
 *   hf download aidigestorg/ai-village agents.jsonl.gz chat_messages.jsonl.gz \
 *     summaries.jsonl.gz manifest.json --repo-type dataset --local-dir data/aivillage
 * data/ is gitignored: the corpus is never committed, only this report, which quotes
 * short sentences from agent messages (never human ones) and cites the dataset as its
 * terms ask.
 *
 * Writes evidence/aivillage-report.json (or evidence/<name>-report.json for other input).
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createHash } from "node:crypto";
import { parseJsonl } from "../lib/transcript";
import { buildReport } from "../lib/report";

const root = process.cwd();
const dataDir = path.join(root, "data", "aivillage");
const args = process.argv.slice(2);
const isVillage = args.length === 0;
const inputs = isVillage
  ? [path.join(dataDir, "agents.jsonl.gz"), path.join(dataDir, "chat_messages.jsonl.gz")]
  : args.map((a) => path.resolve(a));

for (const f of inputs) {
  if (!fs.existsSync(f)) {
    console.error(`analyze: missing ${path.relative(root, f)}`);
    if (isVillage) console.error("The AI Village dataset is gated; see the header of tools/analyze.ts to download it.");
    process.exit(1);
  }
}

const gunzipIf = (f: string, buf: Buffer) => (f.endsWith(".gz") ? zlib.gunzipSync(buf) : buf).toString("utf8");

const t0 = Date.now();
const loaded = inputs.map((f) => {
  const buf = fs.readFileSync(f);
  return { file: path.basename(f), text: gunzipIf(f, buf), sha256: createHash("sha256").update(buf).digest("hex") };
});
const parsed = parseJsonl(...loaded.map((l) => l.text));

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
    : { name: path.basename(inputs[0]), citation: null, dataset: null, exportedAt: null },
  inputs: loaded.map(({ file, sha256 }) => ({ file, sha256 })),
  dayByDate,
});

const name = isVillage ? "aivillage" : path.basename(inputs[0]).replace(/\.jsonl(\.gz)?$/, "");
const outPath = path.join(root, "evidence", `${name}-report.json`);
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

const t = report.totals;
console.log(`analyze: ${t.turns} turns, ${t.agents} agents, ${t.episodes} episodes, ${t.repairs} repair claims in ${Date.now() - t0}ms`);
console.log(`analyze: verdicts ${JSON.stringify(report.verdicts)}`);
console.log(`analyze: wrote ${path.relative(root, outPath)} (sha256 ${report.reportSha256.slice(0, 16)}…)`);
