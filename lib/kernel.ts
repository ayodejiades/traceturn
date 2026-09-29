/**
 * Deterministic Swarm Forensics Kernel ("Agents propose; deterministic code decides").
 *
 * traceturn reconstructs two interlocking graphs from a multi-agent transcript:
 *  - the CAUSAL BLAME DAG: which turn originated a failure, via parent-child delegation edges.
 *  - the CLAIM LINEAGE graph: how one unverified premise propagated until it became
 *    swarm consensus, via citation edges between agents.
 *
 * Both are pure functions of the transcript. No LLM participates in attribution.
 *
 * Core Invariants (enforced in both production routes and `pnpm verify:evidence`):
 * - INV-1 (Evidence-Excerpt Binding): Every decisive claim must carry a literal,
 *   whitespace-normalized substring found in the immutable source turn. Missing or
 *   paraphrased excerpts fail closed (`ABSTAIN_UNBOUND_EXCERPT`).
 * - INV-2 (Integer Derivation Arithmetic & Benign Rewording Discrimination):
 *   Independent-derivation counts are compared as exact integers, never floating-point
 *   ratios. A restatement that re-cites one origin resolves to `BENIGN_CONTROL_NO_DRIFT`.
 * - INV-3 (Verification Separation): An agent asserting a premise is resolved
 *   remains `WAITING_TO_VERIFY` until a subsequent independent observation reconciles.
 */
import { canonicalJson, sha256Hex } from "./sha256";

export type KernelState =
  | "ON_TRACK"
  | "BENIGN_CONTROL_NO_DRIFT"
  | "MATERIAL_DRIFT_DETECTED"
  | "WAITING_TO_VERIFY"
  | "VERIFIED_FIXED"
  | "ABSTAIN_UNBOUND_EXCERPT"
  | "ABSTAIN_AMBIGUOUS_SOURCE";

/**
 * `promisedDerivations` = how many agents assert they verified the premise.
 * `observedDerivations` = how many INDEPENDENT verification paths actually exist once
 * duplicate citations of a single origin are collapsed. promised > observed is the
 * signature of synthetic consensus: the swarm believes a premise is corroborated far
 * more strongly than it actually is.
 */
export interface ReconciliationInput {
  caseId: string;
  sourceCaptureT0: string;
  extractedExcerpt: string;
  promisedDerivations: number;
  observedDerivations: number;
  isCosmeticRewrite?: boolean;
  isAmbiguousSource?: boolean;
  providerClaimsFixed?: boolean;
  subsequentObservationProvesFix?: boolean;
}

export interface InvariantCheck {
  id: string;
  name: string;
  passed: boolean;
  detail: string;
}

export interface KernelDecision {
  caseId: string;
  state: KernelState;
  deltaDerivations: number;
  excerptBound: boolean;
  invariants: InvariantCheck[];
  summary: string;
}

export function normalizeWhitespace(text: string | null | undefined): string {
  if (typeof text !== "string") return "";
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export function verifyExcerptBinding(sourceCaptureT0: string, extractedExcerpt: string): boolean {
  const normSource = normalizeWhitespace(sourceCaptureT0);
  const normExcerpt = normalizeWhitespace(extractedExcerpt);
  if (!normExcerpt || normExcerpt.length < 6) return false;
  return normSource.includes(normExcerpt);
}

export function evaluateDeterministicKernel(input: ReconciliationInput): KernelDecision {
  const excerptBound = verifyExcerptBinding(input.sourceCaptureT0, input.extractedExcerpt);
  const integerCountsValid =
    Number.isInteger(input.promisedDerivations) &&
    Number.isInteger(input.observedDerivations) &&
    input.promisedDerivations >= 0 &&
    input.observedDerivations >= 0;

  const deltaDerivations = input.promisedDerivations - input.observedDerivations;

  let state: KernelState = "ON_TRACK";
  let summary = "Independent-derivation count matches the asserted corroboration.";

  if (input.isAmbiguousSource) {
    state = "ABSTAIN_AMBIGUOUS_SOURCE";
    summary = "Source turn is truncated or out of scope; kernel abstains rather than guessing at lineage.";
  } else if (!excerptBound) {
    state = "ABSTAIN_UNBOUND_EXCERPT";
    summary = "Claim lacks a verbatim substring in the source turn; failed closed.";
  } else if (input.providerClaimsFixed) {
    // A self-reported repair is decided by independent confirmation alone, whatever the counts.
    if (input.subsequentObservationProvesFix) {
      state = "VERIFIED_FIXED";
      summary = "A different agent independently observed the repair; promoted to VERIFIED_FIXED.";
    } else {
      state = "WAITING_TO_VERIFY";
      summary = "The agent reports its own repair and no other agent has confirmed it; held in WAITING_TO_VERIFY.";
    }
  } else if (deltaDerivations === 0 && input.isCosmeticRewrite) {
    state = "BENIGN_CONTROL_NO_DRIFT";
    summary = "Restated with credit to the original speaker; no new corroboration claimed.";
  } else if (deltaDerivations > 0) {
    state = "MATERIAL_DRIFT_DETECTED";
    const paths = input.observedDerivations === 1 ? "1 independent derivation path exists" : `${input.observedDerivations} independent derivation paths exist`;
    summary = `Stated as known by ${input.promisedDerivations} agents, but only ${paths} (gap ${deltaDerivations}).`;
  }

  const invariants: InvariantCheck[] = [
    {
      id: "INV-1",
      name: "Literal Evidence-Excerpt Binding",
      passed: excerptBound || state === "ABSTAIN_UNBOUND_EXCERPT" || state === "ABSTAIN_AMBIGUOUS_SOURCE",
      detail: excerptBound
        ? `Verbatim match verified in T0 source (${input.extractedExcerpt.slice(0, 42)}…)`
        : "Unbound excerpt rejected -> failed closed to ABSTAIN (INV-1 upheld)",
    },
    {
      id: "INV-2",
      name: "Integer Derivation Arithmetic",
      passed: integerCountsValid,
      detail: `Promised=${input.promisedDerivations}, Observed=${input.observedDerivations}, Gap=${deltaDerivations}`,
    },
    {
      id: "INV-3",
      name: "Claim vs. Verified Separation",
      passed: !(input.providerClaimsFixed && !input.subsequentObservationProvesFix && state === "VERIFIED_FIXED"),
      detail:
        state === "WAITING_TO_VERIFY"
          ? "Unverified agent claim held in WAITING_TO_VERIFY"
          : "Resolution state strictly gated by independent observation",
    },
    {
      id: "INV-4",
      name: "Benign Rewording Discrimination",
      passed: !(input.isCosmeticRewrite && deltaDerivations === 0 && state === "MATERIAL_DRIFT_DETECTED"),
      detail: "Restated premises re-citing one origin never trigger false-positive consensus alerts",
    },
    {
      id: "INV-5",
      name: "Ambiguity Abstention Guard",
      passed: !input.isAmbiguousSource || state === "ABSTAIN_AMBIGUOUS_SOURCE",
      detail: "Out-of-scope or unverified inputs abstain cleanly without hallucination",
    },
  ];

  return {
    caseId: input.caseId,
    state: state,
    deltaDerivations,
    excerptBound,
    invariants,
    summary,
  };
}

export const SAFETY_INVARIANTS = [
  {
    id: "INV-01",
    name: "Literal Excerpt Binding",
    rule: "Every decisive extracted claim must match a whitespace-normalized substring in the immutable T0 source capture.",
  },
  {
    id: "INV-02",
    name: "Integer Derivation Arithmetic",
    rule: "Independent-derivation counts are evaluated as exact integers, never floating-point ratios.",
  },
  {
    id: "INV-03",
    name: "Verification Separation",
    rule: "An agent's claim that a premise is resolved remains in WAITING_TO_VERIFY until an independent observation confirms it.",
  },
  {
    id: "INV-04",
    name: "Benign Rewording Suppression",
    rule: "Restated premises that re-cite a single origin resolve to BENIGN_CONTROL_NO_DRIFT rather than false consensus alerts.",
  },
  {
    id: "INV-05",
    name: "Ambiguity Abstention Guard",
    rule: "Truncated or out-of-scope turns fail closed to ABSTAIN rather than guessing at lineage.",
  },
] as const;

export interface BenchmarkCase {
  id: string;
  title: string;
  beforeText: string;
  afterText: string;
  proposedExcerpt: string;
  promisedDerivations: number;
  observedDerivations: number;
  expectedActionable: boolean;
  isCosmeticRewrite?: boolean;
  providerClaimsFixed?: boolean;
  subsequentObservationProvesFix?: boolean;
}

export const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: "CASE-01",
    title: "Synthetic Consensus on an Unverified Exploit",
    beforeText: "Agent-07 records in the shared library that the Lean 4 proof checker accepts incomplete tactic blocks.",
    afterText: "Agent-12 cites the Agent-07 library entry and reports the exploit as an established property of the checker.",
    proposedExcerpt: "the Lean 4 proof checker accepts incomplete tactic blocks",
    promisedDerivations: 14,
    observedDerivations: 1,
    expectedActionable: true,
  },
  {
    id: "CASE-02",
    title: "Genuine Independent Corroboration",
    beforeText: "Agent-03 measures wall-clock latency of the evaluation harness at 412ms per proof obligation.",
    afterText: "Agent-19 independently measures the same harness at 418ms and reports agreement within tolerance.",
    proposedExcerpt: "wall-clock latency of the evaluation harness",
    promisedDerivations: 3,
    observedDerivations: 3,
    expectedActionable: false,
  },
  {
    id: "CASE-03",
    title: "Restated Premise, Single Origin (Benign Control)",
    beforeText: "Agent-22 writes that the shared library entry about tactic-block soundness was authored by Agent-07.",
    afterText: "Agent-31 rephrases the same attribution: the tactic-block note in the library traces back to Agent-07.",
    proposedExcerpt: "tactic-block soundness was authored",
    promisedDerivations: 2,
    observedDerivations: 2,
    expectedActionable: false,
    isCosmeticRewrite: true,
  },
  {
    id: "CASE-04",
    title: "Circular Peer Validation Ring",
    beforeText: "Agent-05 asserts that its proof draft is sound based on Agent-09 review.",
    afterText: "Agent-09 asserts its approval is sound based on the Agent-05 draft, closing the ring with no outside check.",
    proposedExcerpt: "its proof draft is sound",
    promisedDerivations: 8,
    observedDerivations: 0,
    expectedActionable: true,
  },
  {
    id: "CASE-05",
    title: "Unverified Self-Repair Claim",
    beforeText: "Agent-44 asserts the missing derivation was supplied and the premise now holds.",
    afterText: "No subsequent turn contains an independent observation confirming the supplied derivation.",
    proposedExcerpt: "the missing derivation was supplied",
    promisedDerivations: 6,
    observedDerivations: 1,
    expectedActionable: true,
    providerClaimsFixed: true,
  },
  {
    id: "CASE-06",
    title: "Confirmed Self-Repair",
    beforeText: "Agent-44 asserts the missing derivation was supplied and the premise now holds.",
    afterText: "Agent-51 independently confirms the supplied derivation in a later turn.",
    proposedExcerpt: "the missing derivation was supplied",
    promisedDerivations: 6,
    observedDerivations: 6,
    expectedActionable: false,
    providerClaimsFixed: true,
    subsequentObservationProvesFix: true,
  },
];

export function evaluateSafetyKernel(c: BenchmarkCase) {
  const decision = evaluateDeterministicKernel({
    caseId: c.id,
    // A claim may be bound in either the originating or the propagating turn, so the
    // immutable capture spans both sides of the citation edge.
    sourceCaptureT0: `${c.beforeText} ${c.afterText}`,
    extractedExcerpt: c.proposedExcerpt,
    promisedDerivations: c.promisedDerivations,
    observedDerivations: c.observedDerivations,
    isCosmeticRewrite: c.isCosmeticRewrite,
    providerClaimsFixed: c.providerClaimsFixed,
    subsequentObservationProvesFix: c.subsequentObservationProvesFix,
  });
  // Actionable means an investigator should look at this: either a live
  // corroboration gap, or an unverified self-repair claim held pending proof.
  // VERIFIED_FIXED is explicitly NOT actionable — a confirmed repair is closed.
  const approved =
    decision.state === "MATERIAL_DRIFT_DETECTED" || decision.state === "WAITING_TO_VERIFY";
  // SHA-256 over the canonical decision, so a changed input or verdict changes the receipt.
  const evidenceHash = sha256Hex(
    canonicalJson({
      caseId: c.id,
      state: decision.state,
      deltaDerivations: decision.deltaDerivations,
      excerpt: c.proposedExcerpt,
    }),
  );
  return {
    approved,
    verdict: decision.state,
    summary: decision.summary,
    evidenceHash,
    invariantResults: decision.invariants.map((inv) => ({
      id: inv.id,
      name: inv.name,
      passed: inv.passed,
      reason: inv.detail,
    })),
  };
}
