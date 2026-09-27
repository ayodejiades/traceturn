# traceturn — project brief & agent build rules

## The idea
Deterministic swarm forensics: causal blame DAG plus claim-lineage independent-derivation counting over multi-agent JSONL transcripts

## Chosen bounties
- **Primary Hackathon Track** — End-to-end deterministic kernel and `/proof` verification

## The demo path
1. Welcome to the overview
2. Launch the live demo workspace
3. Create a new record
4. Submit and verify real-time state

Only the demo path and `/proof` verification surface are built. Everything else is stubbed, hardcoded, or deleted.

## Core Product & Verification Invariants (@winsznx Standard)
- **Agents propose; deterministic code decides.** Never let an LLM or untrusted client directly decide money equality/deltas, schedules, hash equality, evidence-excerpt binding, policy rules, or settlement outcomes. In `web2`, use `lib/kernel.ts` (`verifyExcerptBinding` + integer-cent arithmetic + `WAITING_TO_VERIFY` separation). In `web3`, use `lib/solver.ts` (15-rule deterministic policy engine + complementary cycle solver + canonical EIP-712 digest).
- **Literal Evidence-Excerpt / Digest Binding:** Every decisive AI-extracted fact in `web2` requires a verbatim substring in the immutable T0 source capture; unbound excerpts fail closed (`ABSTAIN_UNBOUND_EXCERPT`). Every settlement in `web3` binds to a canonical EIP-712 digest and nullifier.
- **Zero-Friction `/proof` Surface:** Keep `app/proof/page.tsx` (`PROOF_RUNS.json` in `web3`, `evidence/campaign-report.json` in `web2`) tailored to this project's domain so judges can inspect happy-path, benign-control, and refusal cases with zero wallet or signup.
- **Falsifiable Claim Ledger:** Always run `pnpm claim:verify` (and `pnpm seam:check` on `web3`) after modifying code so `CLAIM_LEDGER.md` and `WHAT_IS_REAL.md` match the repository state.

## Theme and components
Theme: **terminal**. Components available: Button, Card, Input, Select, Table, Stat, Badge, EmptyState, Nav, Sidebar, Toast, Skeleton, Illustration.

## DEMO_MODE
`DEMO_MODE=1` replaces every external dependency with on-disk fixtures under `fixtures/`. The health endpoint reports `demoMode`. The demo path must complete with the Wi-Fi off.

## Anti-AI Slop & Design Standards
Strict design manifesto: 4-sided hairline borders, characterful typography, WCAG AA contrast. Never write gradients, badge clusters, 1-sided border stripes, or fake div screenshots. All copy must be concrete; zero AI superlatives ('supercharge', 'seamless', 'next-gen', 'revolutionary'). Preflight Check 13 enforces this.
Always use the production-grade `<PipelineFlow />`, `<TelemetryTile />`, and `<CodeDiff />` components.
Crucially, utilize the non-slop agent skills located in `/Users/mac/hackops/skills/mblode-agent-skills/skills` (e.g., `ui-verification`, `dx-audit`, `ax-audit`) to validate architecture and UX.

## Sponsor Verification Contract
Every chosen sponsor must satisfy the 4-part verification contract (Preflight Check 9): (1) functional code import/call, (2) deterministic fixture under fixtures/sponsors/<slug>.json, (3) test assertion covering the fixture, (4) interactive step on docs/demo-path.json.

## Evidence & Technical Moat
Maintain docs/EVIDENCE.md (linking rubrics to line-level code and demo timestamps), docs/HARD_THING.md (documenting the technical moat and failure state machine), CLAIM_LEDGER.md, and WHAT_IS_REAL.md. Preflight Check 12 enforces these.

## Working rules
Rules for anyone (human or agent) working in this repo: commit after every working state; never break the demo path; hard feature freeze at 75% of the event window (see `docs/HOURS.md`) — after that, only video, README, submission.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
