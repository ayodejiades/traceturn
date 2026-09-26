# Sponsor Integration Field Findings

Concrete engineering findings observed while wiring each sponsor seam and how they are guarded in `lib/kernel.ts`.

## AI Village (`CAPTURE`)
- **Finding**: Truncated turns cannot support a lineage claim
- **Environment**: AI Village transcript slice, SWARM-07 fixture
- **Observed**: A turn marked '[transcript truncated]' was used by an agent to assert that a library entry had been updated again.
- **Deterministic Fix (`evidence/campaign-report.json`)**: INV-5 in lib/kernel.ts forces ABSTAIN_AMBIGUOUS_SOURCE whenever the source scope is ambiguous, so a truncated turn can never produce a blame assignment.
- **Boundary Honesty (Not Claimed)**: traceturn does not claim to have reproduced the Hugging Face incident itself; findings are scoped to committed fixtures only.

## Grove Research (`KERNEL_DB`)
- **Finding**: An agent asserted its own repair without independent proof
- **Environment**: AI Village transcript slice, SWARM-05 fixture
- **Observed**: Agent-44 stated the missing derivation was supplied and the premise now held; no later turn contained an independent confirming observation.
- **Deterministic Fix (`lib/kernel.ts#evaluateDeterministicKernel`)**: INV-3 holds the case in WAITING_TO_VERIFY until subsequentObservationProvesFix is set by a genuinely independent turn.
- **Boundary Honesty (Not Claimed)**: Absence of a derivation edge is a lower bound, not proof of fabrication. Coordination via side channels is explicitly out of scope.

## Anthropic (`EXTRACTION`)
- **Finding**: LLM assistance is structurally unable to touch the attribution layer
- **Environment**: DEMO_MODE=1 with no API key configured
- **Observed**: Every fixture produced byte-identical verdicts, invariants, and digests with no model reachable.
- **Deterministic Fix (`lib/kernel.ts#evaluateSafetyKernel`)**: The model call is confined to labelling; lib/kernel.ts graph construction and verdict selection are pure functions with no I/O.
- **Boundary Honesty (Not Claimed)**: The model never participates in attribution or in any state transition. It may only label subtrees the kernel has already flagged.
