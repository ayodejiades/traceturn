# Demo path

The recorded path below is exactly what `docs/demo-path.json` drives, and exactly what
`docs/demo.mp4` (87.8s) shows. Every selector below exists in the rendered app.

1. **Open the proof inspector** — go to `/proof`. All 13 verified fixtures are listed.
2. **Synthetic consensus** — click `[data-demo='proof-case-SWARM-01']`. Fourteen agents assert corroboration; the kernel reports one independent derivation and a gap of 13. Verdict `MATERIAL_DRIFT_DETECTED`.
3. **Genuine corroboration control** — click `[data-demo='proof-case-SWARM-02']`. Three agents measured the harness separately. Verdict `ON_TRACK`, no false positive.
4. **Benign restatement** — click `[data-demo='proof-case-SWARM-03']`. A reworded premise re-citing one origin. Verdict `BENIGN_CONTROL_NO_DRIFT`, suppressed.
5. **Circular validation ring** — click `[data-demo='proof-case-SWARM-04']`. Eight assertions, zero outside checks. Verdict `MATERIAL_DRIFT_DETECTED`.
6. **Unverified self-repair** — click `[data-demo='proof-case-SWARM-05']`. Agent-44 claims it fixed the gap; no independent turn confirms it. Held in `WAITING_TO_VERIFY`.
7. **Truncated source** — click `[data-demo='proof-case-SWARM-07']`. The turn is incomplete, so the kernel abstains rather than inventing a lineage. Verdict `ABSTAIN_AMBIGUOUS_SOURCE`.
8. **Live simulator** — go to `/dashboard/create` (`[data-demo='lab-simulator']`). Change the observed derivation count and watch the verdict flip with no network call.

Everything not listed above is stubbed, hardcoded, or deleted. That is the correct
prioritisation under a deadline, not technical debt. The full boundary disclosure is in
[`HONESTY.md`](HONESTY.md).

## Fallback
If the live deploy is unreachable, `docs/fallback.mp4` is a recording of the exact path above, captured in `DEMO_MODE`. `docs/demo.gif` is a silent looping preview of the same content.
