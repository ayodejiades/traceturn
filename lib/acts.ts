/**
 * Consequence: what the swarm did with a number.
 *
 * An act is something an agent did with a shared claim as its argument: submitted it as
 * an answer, wrote it into a file or page, posted it, handed it to another agent, or set
 * out in a session to do one of those. Each act is linked to the claim its argument
 * carries and to the episode (and correction, if any) that claim belongs to.
 *
 * The invariant:
 *
 *   An act is admissible only if its supporting claim traces to an observation.
 *
 * At the moment of the act, the claim's observation paths are the agents that had
 * reported their own check of it (an INDEPENDENT statement, an origin sentence that
 * reports a check, or a checked statement before a correction), plus the acting agent's
 * own sentence when it reports one. With none, the act is UNGROUNDED. An act on a value
 * that another agent had already corrected is AFTER_CORRECTION, whatever else is true.
 *
 * Unlike the kernel's derivation count, the origin is not a path by default here: stating
 * a number first is not observing it. Absence of a path is a lower bound, never proof
 * of fabrication; an agent that checked privately and did not say so looks unobserved.
 *
 * Evidence grades, strongest first:
 *   logged    a tool call or delegation record with the number in its argument
 *   reported  the agent's own sentence reporting the act ("answered 9.70", "I updated…")
 *   planned   a computer-use session goal to do it ("update the README to 413 events")
 *
 * Pure, synchronous and isomorphic; no model participates.
 */
import { evaluateDeterministicKernel, type KernelDecision } from "./kernel";
import {
  CORRECTION_LOOKBACK_MS,
  FIRSTHAND_RE,
  INDEPENDENTLY_RE,
  MAX_GOAL,
  NON_ASSERTION_RE,
  SCRUB_RE,
  TOOL_OBSERVATION_RE,
  VERIFY_RE,
  extractClaims,
  sentenceAround,
  sentenceSpan,
  type ClaimKey,
  type Correction,
  type Episode,
} from "./lineage";
import type { Session, ToolAction, Turn } from "./transcript";

export type ActKind = "submit" | "publish" | "handoff" | "write" | "plan";
export type ActEvidence = "logged" | "reported" | "planned";
export type Grounding = "AFTER_CORRECTION" | "UNGROUNDED" | "GROUNDED";

export interface Act {
  id: string;
  agent: string;
  ts: number;
  kind: ActKind;
  evidence: ActEvidence;
  /** The verb or tool the act was matched on: "answered", "updated", "bash". */
  verb: string;
  claim: string;
  /** Source record: turn id, session id, or tool-call id. */
  sourceId: string;
  /** Recipient of a handoff, when named. */
  to?: string;
  /** Verbatim window of the source record; bound to `sourceText` by the kernel (INV-1). */
  excerpt: string;
  sourceText: string;
  episodeId: string | null;
  correctionId: string | null;
  /** Agents that had reported their own observation of the claim at the time of the act. */
  observers: { agent: string; ts: number }[];
  /** The acting agent's own sentence reports a check. */
  selfObserved: boolean;
  grounding: Grounding;
  /** When the value was corrected, if it was, before or after the act. */
  correctedAt: number | null;
  /** Other agents who stated the claim after the act, within the episode window. */
  reach: number;
  decision: KernelDecision;
}

// ---------------------------------------------------------------------------
// Act signals

// Done, in the past tense. "logged" and "opened" are left out: "logged in", "I opened the
// page and it shows 413" report observations, not acts.
const PAST_ACT_RE =
  /\b(answered|submitted|entered|filled in|posted|published|sent|emailed|tweeted|announced|replied|uploaded|updated|added|wrote|written|committed|pushed|merged|recorded|documented|edited|created|changed|deployed|filed|drafted|shipped|launched|put)\b(?![-\u2011])/gi;
// Asked of another agent.
const HANDOFF_RE =
  /\b(?:please|pls|can you|could you|would you|kindly)\s+(?:\w+\s+){0,2}?(update|add|write|post|publish|submit|send|answer|record|use|commit|push|merge|file|put|enter|change|include|set)\b/gi;
// Set out to do, in a session goal. Checking verbs are lib/lineage.ts's business.
const PLAN_RE =
  /\b(update|add|write|post|publish|submit|send|answer|record|document|commit|push|merge|file|create|draft|edit|include|announce|enter|fill in|put)\b(?![-\u2011])/gi;

const VERB_KIND: Record<string, ActKind> = {
  answered: "submit",
  submitted: "submit",
  entered: "submit",
  "filled in": "submit",
  answer: "submit",
  submit: "submit",
  enter: "submit",
  "fill in": "submit",
  posted: "publish",
  published: "publish",
  sent: "publish",
  emailed: "publish",
  tweeted: "publish",
  announced: "publish",
  replied: "publish",
  uploaded: "publish",
  post: "publish",
  publish: "publish",
  send: "publish",
  announce: "publish",
};

// Words between the verb and the number that make the number the act's outcome or an
// aside rather than its argument: "pushed 4 events, the log is now 413 events".
const OUTCOME_GAP_RE = /[;.!?\n→(—–]|->|\b(?:and|now|total|totals|bringing|making|leaving|reaching|so|which|after|before|when|while|because|since|then|but)\b/i;
// Not done: conditional, future, expected or negated.
const NOT_DONE_RE =
  /\b(?:if|will|would|should|could|can|expect|expects|expected|likely|plan|plans|planning|going to|about to|next|once|unless|may|might|prepared|ready to|need to|needs to|not|never|no longer|without)\b|n't\b|'ll\b/i;
// A clause opener that leaves the act's subject implicit: markup, bullets, emoji, "and".
const BARE_LEAD_RE = /^[\s*_>•✅✔☑️\-–—#|`'"]*(?:(?:and|then|also|just|finally|already|successfully|today|now)\s+)*$/iu;
const FIRST_PERSON_RE = /\b(?:I|we)(?:'ve|'d|'m)?(?:\s+[\w-]+){0,3}\s*$/i;
// A goal's verb is an imperative only at the start of its clause or after "to", "and",
// "then": "Update the dashboard to 487 events", not "Final push to 10,200".
const IMPERATIVE_LEAD_RE = /(?:^|\b(?:to|and|then|also|must|should|please))\s*$/i;
// Read-only shell commands observe a number; they do not act on it.
const WRITE_COMMAND_RE =
  /(?:^|\s)(?:>{1,2}|tee\b|sed\s+-i|git\s+(?:commit|push|tag)|gh\s+(?:issue|pr|release|gist)\s+(?:create|comment|edit)|curl\b[^|]*-X\s*(?:POST|PUT|PATCH)|cp\b|mv\b|printf\b[^|]*>|echo\b[^|]*>)/i;

const clauseStart = (s: string) => Math.max(s.lastIndexOf(";"), s.lastIndexOf(":"), s.lastIndexOf(","), s.lastIndexOf("\n"), s.search(/[.!?]\s[^.!?]*$/));

/**
 * The act verb whose argument is the number at `hitStart`, if the lead-up reads as a
 * done act: verb in the same clause, a first-person or implicit subject, nothing between
 * verb and number that makes the number an outcome, and nothing conditional or negated.
 */
function reportedVerb(text: string, hitStart: number, re: RegExp, lead: "subject" | "imperative" | "any"): string | null {
  const window = text.slice(Math.max(0, hitStart - 140), hitStart);
  let m: RegExpExecArray | null = null;
  re.lastIndex = 0;
  for (let x = re.exec(window); x; x = re.exec(window)) m = x;
  if (!m) return null;
  const gap = window.slice(m.index + m[0].length);
  if (gap.length > 90 || OUTCOME_GAP_RE.test(gap)) return null;
  const before = window.slice(0, m.index);
  const clause = before.slice(clauseStart(before) + 1);
  if (lead === "imperative") {
    const sentenceLead = window.slice(Math.max(0, window.search(/[^.!?\n]*$/)));
    if (/\bif\b/i.test(sentenceLead) || !(BARE_LEAD_RE.test(clause) || IMPERATIVE_LEAD_RE.test(clause))) return null;
    // "Draft 209282211 scheduled", "Post publishes at 9:00": a capitalised noun, not an order.
    if (/^\s*[A-Z][a-z]+\s+(?:\d|[a-z]+s\b)/.test(window.slice(m.index))) return null;
  } else if (NOT_DONE_RE.test(clause + " " + gap)) return null;
  if (lead === "subject" && !BARE_LEAD_RE.test(clause) && !FIRST_PERSON_RE.test(clause)) return null;
  return m[1].toLowerCase();
}

function toolKind(a: ToolAction): ActKind | null {
  const t = a.tool.toLowerCase();
  if (a.to || /delegat|hand_?off|assign|spawn|dispatch/.test(t)) return "handoff";
  if (/submit|answer|form/.test(t)) return "submit";
  if (/post|publish|send|email|tweet|reply|comment|message|chat/.test(t)) return "publish";
  if (/^(?:bash|shell|sh|terminal|command|run|exec)/.test(t)) return WRITE_COMMAND_RE.test(a.argument) ? "write" : null;
  // Typing and editing tools put the text somewhere; lookups and reads do not.
  if (/search|read|get|fetch|view|screenshot|click|scroll|mouse|open|navigate|browse|list|find|grep|query/.test(t)) return null;
  return "write";
}

const KIND_ORDER: Record<ActKind, number> = { submit: 0, publish: 1, handoff: 2, write: 3, plan: 4 };
const GROUNDING_ORDER: Record<Grounding, number> = { AFTER_CORRECTION: 0, UNGROUNDED: 1, GROUNDED: 2 };
const EVIDENCE_ORDER: Record<ActEvidence, number> = { logged: 0, reported: 1, planned: 2 };

// ---------------------------------------------------------------------------

interface Candidate {
  agent: string;
  ts: number;
  kind: ActKind;
  evidence: ActEvidence;
  verb: string;
  claim: string;
  sourceId: string;
  to?: string;
  excerpt: string;
  sourceText: string;
  selfObserved: boolean;
}

export interface ActParams {
  claimKey: ClaimKey;
  episodeGapHours: number;
}

export function findActs(
  turns: Turn[],
  sessions: Session[],
  actions: ToolAction[],
  episodes: Episode[],
  corrections: Correction[],
  p: ActParams,
): Act[] {
  const gapMs = p.episodeGapHours * 3600_000;
  const episodesByClaim = new Map<string, Episode[]>();
  for (const e of episodes) {
    let list = episodesByClaim.get(e.claim);
    if (!list) episodesByClaim.set(e.claim, (list = []));
    list.push(e);
  }
  const correctionsByClaim = new Map<string, Correction[]>();
  for (const c of corrections) {
    let list = correctionsByClaim.get(c.wrong);
    if (!list) correctionsByClaim.set(c.wrong, (list = []));
    list.push(c);
  }
  const tracked = (key: string) => episodesByClaim.has(key) || correctionsByClaim.has(key);
  const agentNames = [...new Set(turns.filter((t) => !t.human).map((t) => t.agent))].filter((n) => n.length >= 4);

  // Every statement of a tracked claim, for reach.
  const statements = new Map<string, { agent: string; ts: number }[]>();
  const candidates: Candidate[] = [];
  const observes = (s: string) => FIRSTHAND_RE.test(s) || TOOL_OBSERVATION_RE.test(s) || INDEPENDENTLY_RE.test(s);

  for (const t of turns) {
    if (t.human) continue;
    for (const hit of extractClaims(t.text, p.claimKey)) {
      if (!tracked(hit.key)) continue;
      let list = statements.get(hit.key);
      if (!list) statements.set(hit.key, (list = []));
      list.push({ agent: t.agent, ts: t.ts });

      const sentence = sentenceSpan(t.text, hit.start, hit.end, 600, 1200);
      if (NON_ASSERTION_RE.test(sentence)) continue;
      const done = reportedVerb(t.text, hit.start, PAST_ACT_RE, "subject");
      const asked = done ? null : reportedVerb(t.text, hit.start, HANDOFF_RE, "any");
      const verb = done ?? asked;
      if (!verb) continue;
      const to = asked ? agentNames.find((n) => n !== t.agent && sentence.includes(n)) : undefined;
      candidates.push({
        agent: t.agent,
        ts: t.ts,
        kind: asked ? "handoff" : (VERB_KIND[verb] ?? "write"),
        evidence: "reported",
        verb,
        claim: hit.key,
        sourceId: t.id,
        ...(to ? { to } : {}),
        excerpt: sentenceAround(t.text, hit.start, hit.end),
        sourceText: t.text,
        selfObserved: observes(sentence),
      });
    }
  }

  for (const s of sessions) {
    if (s.goal.length > MAX_GOAL) continue;
    for (const hit of extractClaims(s.goal, p.claimKey)) {
      if (!tracked(hit.key)) continue;
      const verb = reportedVerb(s.goal, hit.start, PLAN_RE, "imperative");
      if (!verb) continue;
      // "verify and update 413 events" sets out to check first; that is lib/lineage.ts's check.
      const lead = s.goal.slice(Math.max(0, hit.start - 90), hit.start);
      if (VERIFY_RE.test(lead)) continue;
      candidates.push({
        agent: s.agent,
        ts: s.ts,
        kind: "plan",
        evidence: "planned",
        verb,
        claim: hit.key,
        sourceId: s.id,
        excerpt: sentenceAround(s.goal, hit.start, hit.end),
        sourceText: s.goal,
        selfObserved: false,
      });
    }
  }

  for (const a of actions) {
    const kind = toolKind(a);
    if (!kind) continue;
    for (const hit of extractClaims(a.argument, p.claimKey)) {
      if (!tracked(hit.key)) continue;
      candidates.push({
        agent: a.agent,
        ts: a.ts,
        kind,
        evidence: "logged",
        verb: a.tool,
        claim: hit.key,
        sourceId: a.id,
        ...(a.to ? { to: a.to } : {}),
        excerpt: sentenceAround(a.argument, hit.start, hit.end),
        sourceText: a.argument,
        selfObserved: false,
      });
    }
  }

  // One act per agent, claim, kind and grade within an episode: an agent re-saving the
  // same answer, or carrying one plan across sessions, is one act, not many.
  candidates.sort((a, b) => a.ts - b.ts || (a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0));
  const seen = new Set<string>();
  const out: Act[] = [];

  for (const c of candidates) {
    const episode = (episodesByClaim.get(c.claim) ?? []).find((e) => {
      const first = e.assertions[0].ts;
      const last = e.assertions[e.assertions.length - 1].ts;
      return c.ts >= first && c.ts <= last + gapMs;
    });
    const correction = (correctionsByClaim.get(c.claim) ?? []).find(
      (x) => c.ts >= x.before[0].ts && c.ts <= x.ts + CORRECTION_LOOKBACK_MS,
    );
    if (!episode && !correction) continue;
    const key = `${c.agent}|${c.claim}|${c.kind}|${c.evidence}|${episode?.id ?? ""}|${correction?.id ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const observers = new Map<string, number>();
    if (episode) {
      const origin = episode.assertions[0];
      if (episode.originObserved && origin.ts <= c.ts) observers.set(origin.agent, origin.ts);
      for (const a of episode.assertions) {
        if (a.role === "INDEPENDENT" && a.ts <= c.ts && !observers.has(a.agent)) observers.set(a.agent, a.ts);
      }
    }
    if (correction) {
      for (const w of correction.before) if (w.checked && w.ts <= c.ts && !observers.has(w.agent)) observers.set(w.agent, w.ts);
    }
    if (c.selfObserved && !observers.has(c.agent)) observers.set(c.agent, c.ts);

    const corrected = correction && correction.ts < c.ts ? correction.ts : null;
    const grounding: Grounding = corrected !== null ? "AFTER_CORRECTION" : observers.size > 0 ? "GROUNDED" : "UNGROUNDED";

    const until = c.ts + gapMs;
    const reach = new Set(
      (statements.get(c.claim) ?? []).filter((s) => s.ts > c.ts && s.ts <= until && s.agent !== c.agent).map((s) => s.agent),
    ).size;

    const decision = evaluateDeterministicKernel({
      caseId: `act:${c.sourceId}:${c.claim}`,
      sourceCaptureT0: c.sourceText,
      extractedExcerpt: c.excerpt,
      // The act presumes the claim; the question is whether one observation backs it.
      promisedDerivations: 1,
      observedDerivations: grounding === "GROUNDED" ? 1 : 0,
      isAmbiguousSource: SCRUB_RE.test(c.excerpt),
    });

    out.push({
      id: "",
      agent: c.agent,
      ts: c.ts,
      kind: c.kind,
      evidence: c.evidence,
      verb: c.verb,
      claim: c.claim,
      sourceId: c.sourceId,
      ...(c.to ? { to: c.to } : {}),
      excerpt: c.excerpt,
      sourceText: c.sourceText,
      episodeId: episode?.id ?? null,
      correctionId: correction?.id ?? null,
      observers: [...observers].map(([agent, ts]) => ({ agent, ts })).sort((a, b) => a.ts - b.ts),
      selfObserved: c.selfObserved,
      grounding,
      correctedAt: correction?.ts ?? null,
      reach,
      decision,
    });
  }

  // Blast radius: acts on a corrected value first, then ungrounded ones; within a tier,
  // the strongest evidence, then the widest downstream reach, then acts that left the
  // swarm (answers, posts) before handoffs, writes and plans.
  out.sort(
    (a, b) =>
      GROUNDING_ORDER[a.grounding] - GROUNDING_ORDER[b.grounding] ||
      EVIDENCE_ORDER[a.evidence] - EVIDENCE_ORDER[b.evidence] ||
      b.reach - a.reach ||
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      a.ts - b.ts,
  );
  out.forEach((a, i) => (a.id = `AC-${String(i + 1).padStart(4, "0")}`));
  return out;
}
