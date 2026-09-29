# What is real

| Component | Status | Evidence |
|---|---|---|
| Transcript parser (`lib/transcript.ts`) | Runs on the real AI Village corpus | 183,483 messages parsed; input sha256 in the report |
| Claim lineage engine (`lib/lineage.ts`) | Deterministic, no model | 765 episodes, re-derived by `pnpm claim:verify` |
| Kernel (`lib/kernel.ts`) | Five invariants on every verdict | 58/58 pinned manifests and 13/13 fixtures re-derive |
| German Wiki adapter | Reads collusion.wiki revisions, inserted lines only | 14,366 edits; 264 episodes re-derived |
| Findings page (`/proof`) | Reads the committed report | No network, no account |
| Tamper verifier (`/verify`) | Recomputes sha256 and the kernel in the browser | Same `rederive()` as this command |
| Workspace (`/dashboard`) | Analyses dropped JSONL in a Web Worker | Nothing uploaded; same `buildReport()` as the CLI |
| Independence classifier | Deterministic phrase matching | Not yet scored against human labels (see docs/HONESTY.md) |
| Computer-use sessions | Read as evidence of a check | 12 of 140 AI Village checks rest on a session goal naming the claim; independence is still a lower bound |
