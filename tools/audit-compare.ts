/**
 * tools/audit-compare.ts — score a second annotator against the first.
 *
 *   pnpm audit:compare path/to/filled-sheet.csv [--write name]
 *
 * Reads the `id` and `label` columns of a filled evidence/act-audit-labelsheet.csv and
 * compares them with evidence/act-audit-labels-test.json on the question the audit asks:
 * is this a real act on the shared quantity? Real = Y, YC, YT; not real = Q, N. U (cannot
 * tell) on either side is left out. Prints raw agreement, Cohen's kappa and every
 * disagreement. With --write it saves evidence/act-audit-independent-<name>.json.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = process.argv[2];
if (!file) {
  console.error("usage: pnpm audit:compare filled-sheet.csv [--write name]");
  process.exit(1);
}
const REAL = new Set(["Y", "YC", "YT"]);
const NOT = new Set(["Q", "N"]);

// Minimal RFC 4180 reader: quoted fields, doubled quotes, newlines inside quotes.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') (cur += '"'), i++;
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") (row.push(cur), (cur = ""));
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cur);
      cur = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cur += c;
  }
  if (cur !== "" || row.length) (row.push(cur), rows.push(row));
  return rows;
}

const table = parseCsv(fs.readFileSync(path.resolve(file), "utf8"));
const head = table[0].map((h) => h.trim().toLowerCase());
const iId = head.indexOf("id");
const iLabel = head.indexOf("label");
const iNote = head.indexOf("note");
if (iId < 0 || iLabel < 0) {
  console.error("the sheet needs `id` and `label` columns");
  process.exit(1);
}
const mine = JSON.parse(fs.readFileSync(path.join(root, "evidence/act-audit-labels-test.json"), "utf8")).labels as Record<string, string>;
const theirs: Record<string, { label: string; note: string }> = {};
for (const r of table.slice(1)) {
  const label = (r[iLabel] ?? "").trim().toUpperCase();
  if (r[iId] && label) theirs[r[iId].trim()] = { label, note: iNote >= 0 ? (r[iNote] ?? "").trim() : "" };
}

const unknown = Object.entries(theirs).filter(([, v]) => !REAL.has(v.label) && !NOT.has(v.label) && v.label !== "U");
if (unknown.length) {
  console.error(`unknown label codes: ${unknown.slice(0, 5).map(([id, v]) => `${id}=${v.label}`).join(", ")} (use Y, YC, YT, Q, N or U)`);
  process.exit(1);
}
const missingFromMine = Object.keys(theirs).filter((id) => !(id in mine));
if (missingFromMine.length) {
  console.error(`ids not in the held-out set: ${missingFromMine.slice(0, 5).join(", ")}`);
  process.exit(1);
}

let both = 0;
let agree = 0;
let a11 = 0; // both real
let a00 = 0; // both not real
let a10 = 0; // first real, second not
let a01 = 0; // first not, second real
let unclear = 0;
const disagreements: { id: string; first: string; second: string; note: string }[] = [];
for (const [id, t] of Object.entries(theirs)) {
  const m = mine[id];
  if (t.label === "U" || m === "U") {
    unclear++;
    continue;
  }
  const r1 = REAL.has(m);
  const r2 = REAL.has(t.label);
  both++;
  if (r1 === r2) (agree++, r1 ? a11++ : a00++);
  else {
    (r1 ? a10++ : a01++);
    disagreements.push({ id, first: m, second: t.label, note: t.note });
  }
}
if (both === 0) {
  console.error("no overlapping labelled items");
  process.exit(1);
}
const po = agree / both;
const p1 = (a11 + a10) / both;
const p2 = (a11 + a01) / both;
const pe = p1 * p2 + (1 - p1) * (1 - p2);
const kappa = pe === 1 ? 1 : (po - pe) / (1 - pe);
const precision2 = p2;

console.log(`items compared: ${both} (${unclear} unclear, left out)`);
console.log(`raw agreement on "real act": ${agree}/${both} (${(po * 100).toFixed(0)}%)`);
console.log(`Cohen's kappa: ${kappa.toFixed(2)}`);
console.log(`first annotator real: ${(p1 * 100).toFixed(0)}% · second annotator real: ${(precision2 * 100).toFixed(0)}%`);
console.log(`confusion (rows: first, cols: second): real/real ${a11}, real/not ${a10}, not/real ${a01}, not/not ${a00}`);
for (const d of disagreements) console.log(`  ${d.id}: first ${d.first}, second ${d.second}${d.note ? ` (${d.note})` : ""}`);

const w = process.argv.indexOf("--write");
if (w > 0 && process.argv[w + 1]) {
  const name = process.argv[w + 1].replace(/[^a-z0-9_-]/gi, "");
  const out = path.join(root, `evidence/act-audit-independent-${name}.json`);
  fs.writeFileSync(out, JSON.stringify({ annotator: name, compared: both, unclear, agreement: agree, kappa: Math.round(kappa * 100) / 100, secondAnnotatorRealRate: Math.round(precision2 * 1000) / 1000, disagreements, labels: Object.fromEntries(Object.entries(theirs).map(([k, v]) => [k, v.label])) }, null, 2) + "\n");
  console.log(`wrote ${path.relative(root, out)}`);
}
