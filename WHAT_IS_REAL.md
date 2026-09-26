# WHAT_IS_REAL.md — Production Maturity & Boundaries

| Component | Verification Level | Evidence |
|---|---|---|
| **Deterministic Safety Kernel (`lib/kernel.ts`)** | **PROVEN_LOCAL_EXECUTION** | 13/13 fixtures verified across `INV-1`..`INV-5` (`pnpm verify:evidence`) |
| **Literal Evidence-Excerpt Binding (`INV-1`)** | **PROVEN_LOCAL_EXECUTION** | Unbound or paraphrased excerpts fail closed to `ABSTAIN_UNBOUND_EXCERPT` |
| **Zero-Signup `/proof`, `/demo`, & `/verify` Surfaces** | **LIVE_IN_BROWSER** | Inspectable in browser with 1-byte tamper detection |
| **Offline `DEMO_MODE` Fixture Store (`db/index.ts`)** | **LIVE_FALLBACK** | Automatic in-memory fixture store when `DATABASE_URL` is unset |

## Adversarial Defense & Negative Invariant Proof

- **Synthetic Negative Probe**: Rejected (`ABSTAIN_UNBOUND_EXCERPT`)
- **Negative Invariant**: Kernel/solver strictly rejects tampered, forged, or unbound inputs (verdict !== "ON_TRACK")
- **Defense Mechanism**: Claim lacks a verbatim substring in the source turn; failed closed.
- **Proof Status**: PASS (Deterministic fail-closed rejection verified)
