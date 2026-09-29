# What is real

| Component | Status | Evidence |
|---|---|---|
| Transcript parser (`lib/transcript.ts`) | Runs on the real AI Village corpus | 183,483 messages parsed; input sha256 in the report |
| Claim lineage engine (`lib/lineage.ts`) | Deterministic, no model | 946 episodes, re-derived by `pnpm claim:verify` |
| Kernel (`lib/kernel.ts`) | Five invariants on every verdict | 34/34 pinned manifests and 13/13 fixtures re-derive |
| Findings page (`/proof`) | Reads the committed report | No network, no account |
| Tamper verifier (`/verify`) | Recomputes sha256 and the kernel in the browser | Same `rederive()` as this command |
| Workspace (`/dashboard`) | Analyses dropped JSONL in a Web Worker | Nothing uploaded; same `buildReport()` as the CLI |
| Independence classifier | Deterministic phrase matching | Not yet scored against human labels (see docs/HONESTY.md) |
| Computer-use sessions | Not read | Agents that verified silently count as echoes: independence is a lower bound |
