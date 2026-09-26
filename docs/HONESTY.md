# Honesty & Production Disclosure Matrix: traceturn

This file exists so a judge can check every claim against what the code actually does.
Read it before trusting any number in this repository.

## What is real and verified

| Component | Hackathon scope (this repo) | Production architecture | What it buys |
| :--- | :--- | :--- | :--- |
| **Causal blame DAG** | Deterministic reconstruction of parent-child delegation edges from JSONL turns. Pure function, no I/O. | Incremental graph rebuild over a streaming transcript store with turn-level indexing. | Names the turn a failure originated in, instead of describing the incident. |
| **Claim lineage graph** | Independent-derivation counting over citation edges. A premise cited N times tracing to 1 origin is flagged as synthetic consensus. | Cross-corpus lineage with provenance from external sources (git, web, issue trackers). | Separates widespread agreement from manufactured agreement. |
| **Abstention guards** | INV-1 (excerpt binding), INV-5 (ambiguous source) fail closed to ABSTAIN. | Same, plus a calibrated abstention-rate monitor and reviewer feedback loop. | A truncated turn can never produce a blame assignment. |
| **Verification separation** | INV-3 holds self-asserted repairs in WAITING_TO_VERIFY until an independent turn confirms. | Same, plus quorum requirements across independent observers. | An agent cannot mark its own work resolved. |
| **Model use** | Intent labelling on already-isolated subtrees only. With no API key, all 13 fixtures resolve byte-identically. | Model ensemble for intent classification, still downstream of graph construction. | Attribution stays reproducible under incident pressure. |

## What is NOT claimed

- **No reproduction of the Hugging Face incident.** traceturn has not been run against that corpus. Every precision and recall number is scoped to committed fixtures in `evidence/campaign-report.json`.
- **Independent-derivation counts are a lower bound.** An agent that verifies a premise privately, with no citation edge, is invisible to the lineage graph. Absence of a provenance edge is not proof of fabrication.
- **No detection of side-channel coordination.** Coordination that leaves no trace in the transcript cannot be found by any transcript analysis. The kickoff paper contrasts exactly this with its own transparent-channel setting.
- **No 100% accuracy claim.** 13/13 fixtures passing means the kernel matches its ground truth, not that it generalises. The fixture set is small and partly synthetic by design.
- **The transcripts in the fixtures are reconstructed**, drawn from the scenarios in arXiv:2609.04170v1 and the collusion.wiki shape. They are not verbatim exports of the AI Village dataset, which requires a separate access request.

## How to check the claims yourself

```bash
pnpm install
pnpm verify:system   # 5 system invariants + 13 evidence fixtures
pnpm test            # kernel semantics and sponsor integration tests
```

Both run fully offline with `DEMO_MODE=1` and no `DATABASE_URL`. The digest in
`evidence/verification.md` is a SHA-256 over the fixture inputs and kernel verdicts,
so a modified fixture or a patched kernel changes it.
