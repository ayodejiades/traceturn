/**
 * Agreement between the classifier and hand labels on a fixed sample. Pure, so
 * tools/verify-evidence.ts and the docs generator compute the same numbers.
 */
type Code = "I" | "C" | "E" | "X";
const CODE: Record<string, Code> = { INDEPENDENT: "I", CITED: "C", ECHO: "E" };

export interface AuditItem {
  id: string;
  corpus: string;
  predicted: "INDEPENDENT" | "CITED" | "ECHO";
  via: "statement" | "session" | null;
}

export interface AuditScore {
  items: number;
  /** Per predicted class: how many hand labels agree. */
  byClass: Record<"checked" | "credited" | "echoed", { agree: number; n: number }>;
  byStratum: Record<string, { agree: number; n: number }>;
  notAClaim: number;
  overall: { agree: number; n: number };
}

export function scoreAudit(items: AuditItem[], labels: Record<string, string>): AuditScore {
  const byClass = { checked: { agree: 0, n: 0 }, credited: { agree: 0, n: 0 }, echoed: { agree: 0, n: 0 } };
  const byStratum: Record<string, { agree: number; n: number }> = {};
  let notAClaim = 0;
  let agree = 0;
  for (const it of items) {
    const label = labels[it.id];
    if (!label) continue;
    const ok = CODE[it.predicted] === label;
    const cls = it.predicted === "INDEPENDENT" ? "checked" : it.predicted === "CITED" ? "credited" : "echoed";
    byClass[cls].n++;
    if (ok) byClass[cls].agree++;
    const stratum = `${it.corpus}/${it.predicted}${it.via ? `/${it.via}` : ""}`;
    byStratum[stratum] ??= { agree: 0, n: 0 };
    byStratum[stratum].n++;
    if (ok) byStratum[stratum].agree++;
    if (label === "X") notAClaim++;
    if (ok) agree++;
  }
  const n = Object.values(byClass).reduce((a, c) => a + c.n, 0);
  return { items: n, byClass, byStratum, notAClaim, overall: { agree, n } };
}

// ---------------------------------------------------------------------------
// Act precision: is a detected act a real act on the shared quantity?

/** Real acts: Y, plus YC (grounding missed a reported check) and YT (act preceded its correction). */
export const REAL_ACT = new Set(["Y", "YC", "YT"]);

export interface ActAuditItem {
  id: string;
  corpus: string;
  stratum: string;
  /** Acts in the pool this stratum was drawn from. */
  population: number;
  evidence: string;
  grounding: string;
}

export interface ActAuditScore {
  items: number;
  /** Items labelled U (cannot tell), left out of every rate. */
  unclear: number;
  real: number;
  codes: Record<string, number>;
  byCorpus: Record<string, { real: number; n: number }>;
  byEvidence: Record<string, { real: number; n: number }>;
  byGrounding: Record<string, { real: number; n: number }>;
  /** Precision weighted by each stratum's population, per corpus. */
  weighted: Record<string, number>;
}

export function scoreActAudit(items: ActAuditItem[], labels: Record<string, string>): ActAuditScore {
  const codes: Record<string, number> = {};
  const bump = (m: Record<string, { real: number; n: number }>, k: string, real: boolean) => {
    m[k] ??= { real: 0, n: 0 };
    m[k].n++;
    if (real) m[k].real++;
  };
  const byCorpus: ActAuditScore["byCorpus"] = {};
  const byEvidence: ActAuditScore["byEvidence"] = {};
  const byGrounding: ActAuditScore["byGrounding"] = {};
  const strata = new Map<string, { corpus: string; pop: number; real: number; n: number }>();
  let unclear = 0;
  let real = 0;
  for (const it of items) {
    const label = labels[it.id];
    if (!label) continue;
    codes[label] = (codes[label] ?? 0) + 1;
    if (label === "U") {
      unclear++;
      continue;
    }
    const ok = REAL_ACT.has(label);
    if (ok) real++;
    bump(byCorpus, it.corpus, ok);
    bump(byEvidence, `${it.corpus}/${it.evidence}`, ok);
    bump(byGrounding, it.grounding, ok);
    const s = strata.get(`${it.corpus}|${it.stratum}`) ?? { corpus: it.corpus, pop: it.population, real: 0, n: 0 };
    s.n++;
    if (ok) s.real++;
    strata.set(`${it.corpus}|${it.stratum}`, s);
  }
  const weighted: Record<string, number> = {};
  for (const corpus of Object.keys(byCorpus)) {
    let num = 0;
    let den = 0;
    for (const s of strata.values()) {
      if (s.corpus !== corpus) continue;
      num += (s.pop * s.real) / s.n;
      den += s.pop;
    }
    weighted[corpus] = den ? num / den : 0;
  }
  return { items: items.filter((i) => labels[i.id]).length, unclear, real, codes, byCorpus, byEvidence, byGrounding, weighted };
}
