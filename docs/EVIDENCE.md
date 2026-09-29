# Evidence by judging criterion

| Criterion | Where to look | Re-run |
|---|---|---|
| Works on real swarm data | `/proof`; `evidence/aivillage-report.json` (183,483 AI Village messages) | `pnpm analyze` with dataset access |
| Deterministic, no model in attribution | `lib/lineage.ts`, `lib/kernel.ts`; the test that greps them for model calls | `pnpm test` |
| Verifiable by a skeptic | `/verify` recomputes SHA-256 and the kernel in the browser | `pnpm claim:verify` |
| Usable on other transcripts | `/dashboard` workspace; `pnpm analyze path/to/log.jsonl` | Load `fixtures/transcripts/sample-swarm.jsonl` |
| Honest about limits | `docs/HONESTY.md`; the "What is not claimed" panel on `/proof` | n/a |
| The hard part | `docs/HARD_THING.md` | `pnpm test` |

## Specific lines

- Claim extraction and label filtering: `lib/lineage.ts` `extractClaims`
- Role classification: `lib/lineage.ts` `buildEpisode`
- Repair confirmation and dispute: `lib/lineage.ts` `findRepairs`
- Verdict rules and invariants: `lib/kernel.ts` `evaluateDeterministicKernel`
- Manifest re-derivation used by `/verify` and the CLI: `lib/report.ts` `rederive`
- Report digest: `lib/sha256.ts`, checked against `node:crypto` in `tests/lineage.test.mjs`

The demo video in `docs/demo.mp4` was recorded before this rewrite and shows the old interface. It needs to be re-recorded against the current demo path.
