# Campaign Report

Computed from `evidence/campaign-report.json` and `lib/kernel.ts` by `tools/verify-evidence.ts`.

- Generated: 2026-09-27T06:07:38.323Z
- Mechanism: swarm-forgery-kernel-v1 · mode: NOT_RUN
- sha256: `2a244620844035b44f01a69cec7807e3c642fe5e3b1fddfb7c5e09062c6bbd45`

## Executed Fixture Matrix

| Case ID | Category | Expected State | Kernel Verdict | Delta (c) | Case Digest | Status |
|---|---|---|---|---|---|---|
| `SWARM-01` | SYNTHETIC_CONSENSUS | `MATERIAL_DRIFT_DETECTED` | `MATERIAL_DRIFT_DETECTED` | 13c | `0xdb7c44927fd592db12a77d534b13bccc` | PASS |
| `SWARM-02` | GENUINE_CORROBORATION | `ON_TRACK` | `ON_TRACK` | 0c | `0x30f2af74e0b0ea0bd2068546bb9285bf` | PASS |
| `SWARM-03` | BENIGN_RESTATEMENT | `BENIGN_CONTROL_NO_DRIFT` | `BENIGN_CONTROL_NO_DRIFT` | 0c | `0xd9d7c350f022827a39c4832b79dc4e51` | PASS |
| `SWARM-04` | CIRCULAR_VALIDATION | `MATERIAL_DRIFT_DETECTED` | `MATERIAL_DRIFT_DETECTED` | 8c | `0x332a86df005da2fc65d73ff034de5e48` | PASS |
| `SWARM-05` | UNVERIFIED_SELF_REPAIR | `WAITING_TO_VERIFY` | `WAITING_TO_VERIFY` | 5c | `0xe41ebc44cf317eab2f7ddd7492403e16` | PASS |
| `SWARM-06` | UNBOUND_EXCERPT | `ABSTAIN_UNBOUND_EXCERPT` | `ABSTAIN_UNBOUND_EXCERPT` | 0c | `0xb428cc54d806655e334de5af1a2db6ba` | PASS |
| `SWARM-07` | AMBIGUOUS_SOURCE | `ABSTAIN_AMBIGUOUS_SOURCE` | `ABSTAIN_AMBIGUOUS_SOURCE` | 7c | `0x596d09460c4e7e5cf9736bb98c8f444b` | PASS |
