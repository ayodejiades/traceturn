# The One Hard Thing: traceturn: Deterministic Constraint & State Reconciliation

Hackathons are won by demonstrating at least one non-trivial engineering feat. This document details the technical core of `traceturn`, its algorithmic architecture, failure boundary handling, and test verification.

---

## 1. The Core Engineering Challenge
Horizontal LLMs and naive API scripts cannot solve this problem because:
1. **Unbounded Latency & Cost:** Unstructured multi-pass queries exceed time and budget limits.
2. **Hallucination Risk:** Missing or invented citations invalidate real-world domain compliance.
3. **Network Boundary Partitions:** Venue and cloud rate-limits break naive execution loops.

Our solution implements: **AST parsing with sub-second constraint resolution and cryptographic state hashing.**

---

## 2. Architecture & State Machine

```
   [ Raw Domain Input (PDF / Event Stream) ]
                     │
                     ▼
       ┌───────────────────────────────┐
       │   Deterministic AST Parser    │ ───► Syntax / Structural Validation
       └───────────────────────────────┘
                     │
                     ▼
       ┌───────────────────────────────┐
       │ Constraint Verification Core  │ ───► Local Rule Engine & Invariants
       └───────────────────────────────┘
                     │
                     ▼
       ┌───────────────────────────────┐
       │   Sponsor Telemetry & Audit   │ ───► Cryptographic Receipt (SHA-256)
       └───────────────────────────────┘
```

---

## 3. Handled Edge & Boundary Cases

| Failure Scenario | Naive System Result | Our Hardened System Result |
|---|---|---|
| **API Timeout (>3000ms)** | Frozen UI / White screen crash | Transparent fallback to signed fixture with audit flag |
| **Malformed Input Structure** | Uncaught JSON exception | Graceful fallback parser with line-specific recovery |
| **Contradictory Policy Rules** | Silent hallucination / bias | Highlighted side-by-side discrepancy diff |
| **Offline / Airplane Mode** | Total failure | Full local execution using cached domain invariants |

---

## 4. Automated Verification Command
Run the dedicated test suite validating these invariants:

```bash
pnpm test
```
