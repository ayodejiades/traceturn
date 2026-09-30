/**
 * The report format shared by the CLI (tools/analyze.ts), the in-browser workspace
 * (/dashboard) and the findings page (/proof). One shape, one builder, so a number on
 * the landing page and a number computed from a dropped file come from the same code.
 */
import { findActs, type Act, type ActEvidence, type ActKind, type Grounding } from "./acts";
import { SCRUB_RE, analyzeLineage, type Correction, type Episode, type LineageParams, type RepairClaim, type Role } from "./lineage";
import { evaluateDeterministicKernel, type KernelState } from "./kernel";
import { canonicalJson, sha256Hex } from "./sha256";
import type { ParseResult } from "./transcript";

export interface ReportAssertion {
  turnId: string;
  agent: string;
  at: string;
  role: Role;
  parent: number;
  edge: "copies" | "cites" | "exposed" | null;
  /** Verbatim sentence from the turn; null for human messages, which are never quoted. */
  excerpt: string | null;
  /** For checked statements: the agent's own words, or a computer-use session it opened. */
  via?: "statement" | "session";
  session?: { id: string; at: string; goal: string };
}

export interface ReportEpisode {
  id: string;
  claim: string;
  state: KernelState;
  promised: number;
  observed: number;
  gap: number;
  summary: string;
  invariants: { id: string; passed: boolean }[];
  link: string | null;
  /** Window of the origin turn the excerpt is bound to (INV-1). Null when the origin is human. */
  source: string | null;
  /** The origin sentence reports the origin agent's own observation. */
  originObserved: boolean;
  /** Hours from the origin to the first reported observation; 0 when the origin observed; null when nobody did. */
  hoursToFirstCheck: number | null;
  assertions: ReportAssertion[];
}

export interface ReportAct {
  id: string;
  agent: string;
  at: string;
  kind: ActKind;
  evidence: ActEvidence;
  verb: string;
  claim: string;
  sourceId: string;
  to?: string;
  excerpt: string;
  /** Window of the source record the excerpt is bound to (INV-1). */
  source: string;
  episodeId: string | null;
  correctionId: string | null;
  observers: { agent: string; at: string }[];
  selfObserved: boolean;
  grounding: Grounding;
  correctedAt: string | null;
  reach: number;
  state: KernelState;
  link: string | null;
}

export interface ReportRepair {
  id: string;
  url: string;
  claimant: string;
  turnId: string;
  at: string;
  state: KernelState;
  excerpt: string;
  link: string | null;
  confirmedBy: { agent: string; turnId: string; at: string; excerpt: string } | null;
  disputedBy: { agent: string; turnId: string; at: string; excerpt: string } | null;
}

export interface ReportCorrection {
  id: string;
  wrong: string;
  right: string | null;
  correctedBy: string;
  alsoCorrectedBy: string[];
  turnId: string;
  at: string;
  excerpt: string;
  correctorChecked: boolean;
  /** Hours from the first statement of the wrong value to its correction. */
  hoursToCorrection: number;
  /** Hours from the correction to the last time another agent restated the wrong value; null if none did. */
  hoursPersisted: number | null;
  /** Acts taken on the wrong value before and after the correction. */
  acts: { before: number; after: number };
  link: string | null;
  before: { agent: string; turnId: string; at: string; excerpt: string; checked: boolean }[];
  after: { agent: string; turnId: string; at: string; excerpt: string }[];
}

export interface ReportProfile {
  agent: string;
  statements: number;
  originated: number;
  independent: number;
  cited: number;
  echoed: number;
  driftOrigins: number;
  reached: number;
}

export interface LineageReportJson {
  generatedBy: string;
  engine: string;
  reportSha256: string;
  source: { name: string; citation: string | null; dataset: string | null; exportedAt: string | null };
  inputs: { file: string; sha256: string }[];
  params: LineageParams;
  totals: {
    turns: number;
    agents: number;
    from: string;
    to: string;
    claimsSeen: number;
    episodes: number;
    restatements: number;
    independent: number;
    /** Of `independent`, how many rest on a computer-use session rather than the agent's words. */
    independentBySession: number;
    sessions: number;
    cited: number;
    echoed: number;
    repairs: number;
    corrections: number;
    acts: number;
    actsUngrounded: number;
    actsAfterCorrection: number;
    actsGrounded: number;
    /** Acts on a value that was corrected at some point, before or after the correction. */
    actsOnCorrectedValues: number;
    actsByEvidence: Record<ActEvidence, number>;
    /** Distinct agents with at least one ungrounded or after-correction act. */
    agentsActingUngrounded: number;
  };
  verdicts: Record<KernelState, number>;
  profiles: ReportProfile[];
  /** [id, claim, state, promised, observed] for every episode, so totals can be re-derived. */
  ledger: [string, string, KernelState, number, number][];
  /** Drift episodes per calendar month (UTC), oldest first. */
  monthly: { month: string; episodes: number; drift: number }[];
  episodes: ReportEpisode[];
  repairs: ReportRepair[];
  /** Every wrong value that spread to 3+ agents and was later corrected. */
  corrections: ReportCorrection[];
  /** [id, claim, grounding, evidence, kind, reach, state, agent] for every act, so totals can be re-derived. */
  actLedger: [string, string, Grounding, ActEvidence, ActKind, number, KernelState, string][];
  /** Acts ranked by blast radius (see lib/acts.ts); a curated slice unless `full`. */
  acts: ReportAct[];
}

export interface BuildOptions {
  source: LineageReportJson["source"];
  inputs: LineageReportJson["inputs"];
  generatedBy: string;
  params?: Partial<LineageParams>;
  /** Village date (YYYY-MM-DD, rolled over at 17:00 UTC) -> day number, for deep links. */
  dayByDate?: Map<string, number>;
  /** Keep every episode and repair (workspace) or a curated slice (committed evidence). */
  full?: boolean;
}

const iso = (ts: number) => new Date(ts).toISOString();

/** Source window around the excerpt: short enough to quote, long enough to bind INV-1. */
function sourceWindow(text: string, excerpt: string, max = 900): string {
  if (text.length <= max) return text;
  const at = Math.max(0, text.indexOf(excerpt));
  const from = Math.max(0, Math.min(at - Math.floor((max - excerpt.length) / 2), text.length - max));
  return text.slice(from, from + Math.max(max, excerpt.length));
}

export function villageLink(ts: number, dayByDate?: Map<string, number>): string | null {
  if (!dayByDate || dayByDate.size === 0) return null;
  const day = dayByDate.get(new Date(ts - 17 * 3600_000).toISOString().slice(0, 10));
  return day ? `https://theaidigest.org/village?day=${day}&time=${ts}` : null;
}

const hours = (ms: number) => Math.round((ms / 3600_000) * 10) / 10;

function exportEpisode(e: Episode, days?: Map<string, number>): ReportEpisode {
  const origin = e.assertions[0];
  const firstCheck = e.originObserved ? origin : e.assertions.find((a) => a.role === "INDEPENDENT");
  return {
    id: e.id,
    claim: e.claim,
    state: e.decision.state,
    promised: e.promised,
    observed: e.observed,
    gap: e.decision.deltaDerivations,
    summary: e.decision.summary,
    invariants: e.decision.invariants.map((i) => ({ id: i.id, passed: i.passed })),
    link: villageLink(origin.ts, days),
    source: origin.human ? null : sourceWindow(e.originText, origin.excerpt),
    originObserved: e.originObserved,
    hoursToFirstCheck: firstCheck ? hours(firstCheck.ts - origin.ts) : null,
    assertions: e.assertions.map((a) => ({
      turnId: a.turnId,
      agent: a.human ? "human" : a.agent,
      at: iso(a.ts),
      role: a.role,
      parent: a.parent,
      edge: a.edge,
      excerpt: a.human ? null : a.excerpt,
      ...(a.via ? { via: a.via } : {}),
      ...(a.session ? { session: { id: a.session.id, at: iso(a.session.ts), goal: a.session.goal } } : {}),
    })),
  };
}

function exportRepair(r: RepairClaim, days?: Map<string, number>): ReportRepair {
  const side = (x: RepairClaim["confirmedBy"]) =>
    x && { agent: x.agent, turnId: x.turnId, at: iso(x.ts), excerpt: x.excerpt };
  return {
    id: r.id,
    url: r.url,
    claimant: r.claimant,
    turnId: r.turnId,
    at: iso(r.ts),
    state: r.decision.state,
    excerpt: r.excerpt,
    link: villageLink(r.ts, days),
    confirmedBy: side(r.confirmedBy),
    disputedBy: side(r.disputedBy),
  };
}

function exportAct(a: Act, days?: Map<string, number>): ReportAct {
  return {
    id: a.id,
    agent: a.agent,
    at: iso(a.ts),
    kind: a.kind,
    evidence: a.evidence,
    verb: a.verb,
    claim: a.claim,
    sourceId: a.sourceId,
    ...(a.to ? { to: a.to } : {}),
    excerpt: a.excerpt,
    source: sourceWindow(a.sourceText, a.excerpt, 600),
    episodeId: a.episodeId,
    correctionId: a.correctionId,
    observers: a.observers.map((o) => ({ agent: o.agent, at: iso(o.ts) })),
    selfObserved: a.selfObserved,
    grounding: a.grounding,
    correctedAt: a.correctedAt === null ? null : iso(a.correctedAt),
    reach: a.reach,
    state: a.decision.state,
    link: villageLink(a.ts, days),
  };
}

function exportCorrection(c: Correction, acts: Act[], days?: Map<string, number>): ReportCorrection {
  const st = (w: Correction["before"][number]) => ({ agent: w.agent, turnId: w.turnId, at: iso(w.ts), excerpt: w.excerpt, checked: w.checked });
  const mine = acts.filter((a) => a.correctionId === c.id);
  const last = c.after[c.after.length - 1];
  return {
    id: c.id,
    wrong: c.wrong,
    right: c.right,
    correctedBy: c.correctedBy,
    alsoCorrectedBy: c.alsoCorrectedBy,
    turnId: c.turnId,
    at: iso(c.ts),
    excerpt: c.excerpt,
    correctorChecked: c.correctorChecked,
    hoursToCorrection: hours(c.ts - c.before[0].ts),
    hoursPersisted: last ? hours(last.ts - c.ts) : null,
    acts: { before: mine.filter((a) => a.grounding !== "AFTER_CORRECTION").length, after: mine.filter((a) => a.grounding === "AFTER_CORRECTION").length },
    link: villageLink(c.ts, days),
    before: c.before.map(st),
    after: c.after.map(({ agent, turnId, ts, excerpt }) => ({ agent, turnId, at: iso(ts), excerpt })),
  };
}

export function buildReport(parsed: ParseResult, opts: BuildOptions): LineageReportJson {
  // Answer boards pass bare values; chat passes quantities (see ClaimKey).
  const params = { claimKey: parsed.format === "collusion-wiki" ? ("value" as const) : ("quantity" as const), ...opts.params };
  const report = analyzeLineage(parsed.turns, params, parsed.sessions);
  const days = opts.dayByDate;
  const byState = (s: KernelState) => report.episodes.filter((e) => e.decision.state === s);
  const drift = byState("MATERIAL_DRIFT_DETECTED");

  // Curated slice for committed evidence: the widest gaps plus every kind of control.
  const episodes = opts.full
    ? report.episodes
    : [
        ...drift.slice(0, 24),
        ...byState("ON_TRACK").slice(0, 4),
        ...byState("BENIGN_CONTROL_NO_DRIFT").slice(0, 4),
        ...byState("ABSTAIN_AMBIGUOUS_SOURCE").slice(0, 2),
      ];
  const repairs = opts.full
    ? report.repairs
    : [
        // Disputed first: another agent found the "fixed" URL still broken.
        ...report.repairs.filter((r) => r.decision.state === "WAITING_TO_VERIFY" && r.disputedBy).slice(0, 8),
        ...report.repairs.filter((r) => r.decision.state === "VERIFIED_FIXED"),
        ...report.repairs.filter((r) => r.decision.state === "WAITING_TO_VERIFY" && !r.disputedBy).slice(0, 8),
      ];

  const acts = findActs(parsed.turns, parsed.sessions, parsed.actions, report.episodes, report.corrections, report.params);
  const actsIn = (g: Grounding) => acts.filter((a) => a.grounding === g);
  // Curated slice: every act on a corrected value, the widest ungrounded ones, and
  // grounded controls. The ledger keeps every act.
  const actSlice: Act[] = opts.full
    ? acts
    : [...actsIn("AFTER_CORRECTION"), ...actsIn("UNGROUNDED").slice(0, 40), ...actsIn("GROUNDED").slice(0, 8)];
  // The worst incident's acts are always listed, whatever their rank among all acts.
  const worst = rankIncidents(
    acts.map((a) => ({ claim: a.claim, grounding: a.grounding, reach: a.reach, agent: a.agent })),
    new Set(report.corrections.map((c) => c.wrong)),
  )[0];
  if (worst && !opts.full) {
    const listed = new Set(actSlice.map((a) => a.id));
    actSlice.push(...acts.filter((a) => a.claim === worst.claim && !listed.has(a.id)).slice(0, 24));
    actSlice.sort((a, b) => acts.indexOf(a) - acts.indexOf(b));
  }

  const restated = report.episodes.flatMap((e) => e.assertions.slice(1));
  const roleCount = (r: Role) => restated.filter((a) => a.role === r).length;

  const months = new Map<string, { episodes: number; drift: number }>();
  for (const e of report.episodes) {
    const m = iso(e.assertions[0].ts).slice(0, 7);
    const row = months.get(m) ?? { episodes: 0, drift: 0 };
    row.episodes++;
    if (e.decision.state === "MATERIAL_DRIFT_DETECTED") row.drift++;
    months.set(m, row);
  }

  const body = {
    source: opts.source,
    inputs: opts.inputs,
    params: report.params,
    totals: {
      turns: report.turns,
      agents: report.agents,
      from: iso(report.span.from),
      to: iso(report.span.to),
      claimsSeen: report.claimsSeen,
      episodes: report.episodes.length,
      restatements: restated.length,
      independent: roleCount("INDEPENDENT"),
      independentBySession: restated.filter((a) => a.via === "session").length,
      sessions: parsed.sessions.length,
      cited: roleCount("CITED"),
      echoed: roleCount("ECHO"),
      repairs: report.repairs.length,
      corrections: report.corrections.length,
      acts: acts.length,
      actsUngrounded: actsIn("UNGROUNDED").length,
      actsAfterCorrection: actsIn("AFTER_CORRECTION").length,
      actsGrounded: actsIn("GROUNDED").length,
      actsOnCorrectedValues: acts.filter((a) => a.correctionId !== null).length,
      actsByEvidence: {
        logged: acts.filter((a) => a.evidence === "logged").length,
        reported: acts.filter((a) => a.evidence === "reported").length,
        planned: acts.filter((a) => a.evidence === "planned").length,
      },
      agentsActingUngrounded: new Set(acts.filter((a) => a.grounding !== "GROUNDED").map((a) => a.agent)).size,
    },
    verdicts: report.verdicts,
    profiles: report.profiles,
    ledger: report.episodes.map(
      (e) => [e.id, e.claim, e.decision.state, e.promised, e.observed] as [string, string, KernelState, number, number],
    ),
    monthly: [...months.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([month, v]) => ({ month, ...v })),
    episodes: episodes.map((e) => exportEpisode(e, days)),
    repairs: repairs.map((r) => exportRepair(r, days)),
    corrections: report.corrections.map((c) => exportCorrection(c, acts, days)),
    actLedger: acts.map(
      (a) => [a.id, a.claim, a.grounding, a.evidence, a.kind, a.reach, a.decision.state, a.agent] as [string, string, Grounding, ActEvidence, ActKind, number, KernelState, string],
    ),
    acts: actSlice.map((a) => exportAct(a, days)),
  };

  return {
    generatedBy: opts.generatedBy,
    engine: "lib/lineage.ts + lib/kernel.ts",
    reportSha256: sha256Hex(canonicalJson(body)),
    ...body,
  };
}

/** Recompute a report's digest over everything except the digest fields themselves. */
export function reportDigest(r: LineageReportJson): string {
  const { generatedBy: _g, engine: _e, reportSha256: _d, ...body } = r;
  void _g;
  void _e;
  void _d;
  return sha256Hex(canonicalJson(body));
}

export interface EpisodeManifest {
  id: string;
  claim: string;
  source: string | null;
  excerpt: string | null;
  promisedDerivations: number;
  observedDerivations: number;
  creditedRestatements: number;
  verdict: KernelState;
}

/** Canonical manifest for one episode: what /verify pins and re-derives. */
export function episodeManifest(e: ReportEpisode): EpisodeManifest {
  return {
    id: e.id,
    claim: e.claim,
    source: e.source,
    excerpt: e.assertions[0]?.excerpt ?? null,
    promisedDerivations: e.promised,
    observedDerivations: e.observed,
    creditedRestatements: e.assertions.filter((a) => a.role === "CITED").length,
    verdict: e.state,
  };
}

/**
 * Re-run the kernel on a manifest's own fields. The verdict written in the manifest
 * must equal the one the kernel derives from its counts and source, or it was edited.
 */
export function rederive(m: EpisodeManifest) {
  const echoes = m.promisedDerivations - m.observedDerivations;
  const independent = m.observedDerivations - 1;
  return evaluateDeterministicKernel({
    caseId: m.id,
    sourceCaptureT0: m.source ?? "",
    extractedExcerpt: m.excerpt ?? "",
    promisedDerivations: m.promisedDerivations,
    observedDerivations: m.observedDerivations,
    isCosmeticRewrite: echoes === 0 && independent === 0 && m.creditedRestatements > 0,
    isAmbiguousSource: m.source === null || SCRUB_RE.test(m.excerpt ?? ""),
  });
}

export interface ActManifest {
  id: string;
  claim: string;
  agent: string;
  at: string;
  source: string;
  excerpt: string;
  /** Agents that had reported an observation of the claim by the time of the act. */
  observers: number;
  correctedAt: string | null;
  grounding: Grounding;
  verdict: KernelState;
}

/** Canonical manifest for one act: what /verify pins and re-derives. */
export function actManifest(a: ReportAct): ActManifest {
  return {
    id: a.id,
    claim: a.claim,
    agent: a.agent,
    at: a.at,
    source: a.source,
    excerpt: a.excerpt,
    observers: a.observers.length,
    correctedAt: a.correctedAt,
    grounding: a.grounding,
    verdict: a.state,
  };
}

/**
 * Re-derive an act's grounding and verdict from its own fields: corrected before the act
 * wins, then any observer grounds it. Both must match what the manifest states.
 */
export function rederiveAct(m: ActManifest) {
  const grounding: Grounding =
    m.correctedAt !== null && m.correctedAt < m.at ? "AFTER_CORRECTION" : m.observers > 0 ? "GROUNDED" : "UNGROUNDED";
  const decision = evaluateDeterministicKernel({
    caseId: `act:${m.id}`,
    sourceCaptureT0: m.source,
    extractedExcerpt: m.excerpt,
    promisedDerivations: 1,
    observedDerivations: grounding === "GROUNDED" ? 1 : 0,
    isAmbiguousSource: SCRUB_RE.test(m.excerpt),
  });
  return { grounding, decision };
}

export interface Incident {
  claim: string;
  /** The claim's episode, when the report lists it (a curated report may not). */
  episode: ReportEpisode | null;
  promised: number;
  observed: number;
  correction: ReportCorrection | null;
  acts: { total: number; afterCorrection: number; ungrounded: number; grounded: number };
  /** Distinct agents that acted on the claim with no reported check behind it (ungrounded or after a correction). */
  agents: number;
  /** Listed acts on the claim, in blast-radius order. */
  top: ReportAct[];
}

interface ClaimActs {
  claim: string;
  after: number;
  ungrounded: number;
  grounded: number;
  /** Agents that stated the value after an ungrounded or after-correction act. */
  reach: number;
  /** Distinct agents that acted with no reported check behind them. */
  agents: number;
  corrected: boolean;
}

/**
 * Claims with acts on them, worst first. Blast radius, in order:
 *  1. The value was later corrected. A number another agent showed to be wrong is an
 *     incident; a widely repeated number nobody challenged may simply be true.
 *  2. Distinct agents that acted on it with no reported check (ungrounded or after a
 *     correction). One agent re-saving a value many times is one decision; several agents
 *     each relying on it is a swarm failure.
 *  3. Acts taken after the correction.
 *  4. Downstream reach: agents that stated the value after such an act.
 *  5. Ungrounded acts.
 */
export function rankIncidents(rows: { claim: string; grounding: Grounding; reach: number; agent: string }[], corrected: Set<string>): ClaimActs[] {
  const byClaim = new Map<string, ClaimActs & { who: Set<string> }>();
  for (const { claim, grounding: g, reach, agent } of rows) {
    const row = byClaim.get(claim) ?? { claim, after: 0, ungrounded: 0, grounded: 0, reach: 0, agents: 0, corrected: corrected.has(claim), who: new Set<string>() };
    if (g === "AFTER_CORRECTION") row.after++;
    else if (g === "UNGROUNDED") row.ungrounded++;
    else row.grounded++;
    if (g !== "GROUNDED") {
      row.reach += reach;
      row.who.add(agent);
      row.agents = row.who.size;
    }
    byClaim.set(claim, row);
  }
  return [...byClaim.values()].sort(
    (x, y) =>
      Number(y.corrected) - Number(x.corrected) ||
      y.agents - x.agents ||
      y.after - x.after ||
      y.reach - x.reach ||
      y.ungrounded - x.ungrounded ||
      (x.claim < y.claim ? -1 : 1),
  );
}

/** The report's worst incident (see rankIncidents). Null when no act was taken on a shared claim. */
export function topIncident(r: LineageReportJson): Incident | null {
  const ranked = rankIncidents(
    r.actLedger.map(([, claim, grounding, , , reach, , agent]) => ({ claim, grounding, reach, agent })),
    new Set(r.corrections.map((c) => c.wrong)),
  );
  if (ranked.length === 0) return null;
  const n = ranked[0];
  const claim = n.claim;
  const episode = r.episodes.find((e) => e.claim === claim) ?? null;
  const row = r.ledger.find((l) => l[1] === claim);
  return {
    claim,
    episode,
    promised: episode?.promised ?? row?.[3] ?? 0,
    observed: episode?.observed ?? row?.[4] ?? 0,
    correction: r.corrections.find((c) => c.wrong === claim) ?? null,
    acts: { total: n.after + n.ungrounded + n.grounded, afterCorrection: n.after, ungrounded: n.ungrounded, grounded: n.grounded },
    agents: n.agents,
    top: r.acts.filter((a) => a.claim === claim),
  };
}
