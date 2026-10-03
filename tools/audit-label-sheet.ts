/**
 * tools/audit-label-sheet.ts — a blind labelling sheet for the act-precision audit.
 *
 *   pnpm audit:sheet            # every held-out item
 *   pnpm audit:sheet 40         # a stratified, deterministic subset of 40
 *
 * Writes evidence/act-audit-labelsheet.csv with each item's source window and the episode's
 * origin sentence, and NO labels or notes from the first annotator. Fill the `label` column
 * with a code from docs/LABELLING.md and score it with `pnpm audit:compare <file.csv>`.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sample = JSON.parse(fs.readFileSync(path.join(root, "evidence/act-audit-sample-test.json"), "utf8")) as {
  items: { id: string; corpus: string; stratum: string; evidence: string; kind: string; verb: string; agent: string; at: string; claim: string; origin: { agent: string; at: string; excerpt: string | null } | null; excerpt: string; window: string }[];
};
const n = Number(process.argv[2]) || sample.items.length;

// Deterministic stratified subset: take items round-robin across strata in file order.
const byStratum = new Map<string, typeof sample.items>();
for (const it of sample.items) byStratum.set(`${it.corpus}/${it.stratum}`, [...(byStratum.get(`${it.corpus}/${it.stratum}`) ?? []), it]);
const picked: typeof sample.items = [];
for (let round = 0; picked.length < Math.min(n, sample.items.length); round++) {
  let any = false;
  for (const list of byStratum.values()) {
    if (round < list.length && picked.length < n) {
      picked.push(list[round]);
      any = true;
    }
  }
  if (!any) break;
}
picked.sort((a, b) => (a.id < b.id ? -1 : 1));

const cell = (v: unknown) => `"${String(v ?? "").replace(/\r?\n/g, " ↵ ").replace(/"/g, '""')}"`;
const header = ["id", "agent", "claim", "origin_sentence", "act_kind", "how_found", "act_excerpt", "source_window", "label", "note"];
const rows = picked.map((i) =>
  [i.id, i.agent, i.claim, i.origin?.excerpt ?? "(human message, not quoted)", i.kind, i.evidence, i.excerpt, i.window, "", ""].map(cell).join(","),
);
const out = path.join(root, "evidence/act-audit-labelsheet.csv");
fs.writeFileSync(out, [header.join(","), ...rows].join("\n") + "\n");
console.log(`audit:sheet: wrote ${picked.length} blind items to ${path.relative(root, out)}`);
