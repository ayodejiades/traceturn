/**
 * The report format shared by the CLI (tools/analyze.ts), the in-browser workspace
 * (/dashboard) and the findings page (/proof). One shape, one builder, so a number on
 * the landing page and a number computed from a dropped file come from the same code.
 */
import { SCRUB_RE, analyzeLineage, type Episode, type LineageParams, type RepairClaim, type Role } from "./lineage";
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
  assertions: ReportAssertion[];
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

export interface ReportProfile {
  agent: string;
  statements: number;
  originated: number;
  independent: number;
  cited: number;
  echoed: number;
  driftOrigins: number;
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
  };
  verdicts: Record<KernelState, number>;
  profiles: ReportProfile[];
  /** [id, claim, state, promised, observed] for every episode, so totals can be re-derived. */
  ledger: [string, string, KernelState, number, number][];
  /** Drift episodes per calendar month (UTC), oldest first. */
  monthly: { month: string; episodes: number; drift: number }[];
  episodes: ReportEpisode[];
  repairs: ReportRepair[];
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

function exportEpisode(e: Episode, days?: Map<string, number>): ReportEpisode {
  const origin = e.assertions[0];
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
    },
    verdicts: report.verdicts,
    profiles: report.profiles,
    ledger: report.episodes.map(
      (e) => [e.id, e.claim, e.decision.state, e.promised, e.observed] as [string, string, KernelState, number, number],
    ),
    monthly: [...months.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([month, v]) => ({ month, ...v })),
    episodes: episodes.map((e) => exportEpisode(e, days)),
    repairs: repairs.map((r) => exportRepair(r, days)),
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
