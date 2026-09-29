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
