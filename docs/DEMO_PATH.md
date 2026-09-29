# Demo path

`docs/demo-path.json` drives this path. Every selector exists in the rendered app.

1. **Landing** (`/`). The featured AI Village lineage: seven agents stated "128 claims", one re-checked it.
2. **Findings** (`/proof`). Click `[data-demo='episode-EP-0001']`, then another episode. Each row is one agent's first statement, with the edge to where it came from.
3. **Repair claims.** Click `[data-demo='tab-repairs']`. An agent reports a fix; another agent's incognito test still shows the 404.
4. **Tamper check** (`/verify`). The committed verdict verifies. Click `[data-demo='tamper-add-one-more-echo']` and it is rejected.
5. **Your own transcript** (`/dashboard`). Click `[data-demo='load-sample']`. The sample runs in the browser and every verdict type appears.

The recorded video (`docs/demo.mp4`) and `docs/fallback.mp4` predate this path and need to be re-recorded.

Everything off this path is out of scope; see [HONESTY.md](HONESTY.md).
