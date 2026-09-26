# Judge Evidence Matrix: traceturn

This document provides direct, verifiable links for every judging rubric criterion. All claims are backed by source files, test suites, and deterministic demo paths.

---

## 1. Rubric Verification Matrix

| Judging Criterion | Direct Proof Artifact | Demo Timestamp | Source Code / Test Reference |
|---|---|---|---|
| **Innovation & Problem Fit** | Acute user crisis addressed with specialized wedge. | `[00:00 - 00:20]` | [README.md](file://README.md#problem) · `docs/ART_DIRECTION.md` |
| **Sponsor Integration Depth** | Deep SDK invocation with live RPC telemetry & local fixture fallback. | `[00:20 - 00:55]` | `fixtures/sponsors/` · `lib/network-resilience.ts` |
| **Technical Execution & Moat** | Passing end-to-end test suite + "The One Hard Thing" algorithm. | `[00:55 - 01:30]` | `docs/HARD_THING.md` · `tests/` |
| **Design, Usability & a11y** | Zero-slop bespoke UI, responsive mobile layout, WCAG AA contrast. | `[01:30 - 01:50]` | `app/page.tsx` · `docs/evidence/` |
| **Verification & Honesty** | Transparent ablation benchmark & explicit list of non-built items. | `[01:50 - 02:00]` | `SUBMISSION.md` · `components/ablation-benchmark.tsx` |

---

## 2. Technical Moat: "The One Hard Thing"
* **Specification:** See [`docs/HARD_THING.md`](file://docs/HARD_THING.md) for architectural state machine and algorithmic complexity bounds.
* **Reproduction Command:**
  ```bash
  pnpm test
  ```

---

## 3. Sponsor Integration Contract (Core Platform)
* **Verified Call Trace:** Telemetry visible in real-time via the Judge HUD (`?judge=true`).
* **Fixture Fallback:** In the event of venue Wi-Fi drops, deterministic offline fixtures in `fixtures/sponsors/` guarantee stage reliability without silent mocks.

---

## 4. Known Limitations & Non-Goals
Everything outside the primary demo path is deliberately stubbed, hardcoded, or scoped out for hackathon focus. This is disciplined prioritization under a 48-hour deadline, not technical debt.
