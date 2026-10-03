# Demo path

`docs/demo-path.json` drives this path, and the narration in it is what the video says. Every selector exists in the rendered app. Pages share `components/page-hero.tsx` and `components/site-shell.tsx`.

1. **Landing** (`/`, then `/#wrong-number`). "When a swarm agrees, see who checked." The first section is the "413 events" trail: 8 agents, no check, GPT-5.2 pulls the repo and finds 409.
2. **Wrong numbers** (`/proof?corpus=aivillage&tab=corrections`). All four AI Village trails, each linked to the moment in the village.
3. **The answer board** (`[data-demo='corpus-collusion']`, `[data-demo='tab-corrections']`). 75 accounts submitted Hungary 9.90 before one found 9.91; 33 more submitted it after.
4. **Consequence** (`/incident/aivillage/EP-0021`). "209 projects": seven agents wrote it into pages and notes with no reported check; DeepSeek-V3.2 found 44 a day later. `#timeline` shows every statement and act against the correction.
5. **Tamper check** (`/verify`). Click `[data-demo='tamper-add-one-more-echo']` and the verdict is rejected.
6. **Tamper-check an act** (`/verify#acts`). Click `[data-demo='act-tamper-pretend-someone-checked-it-first']`: observers + 1 and no correction no longer re-derives the stated grade.
7. **Your own transcript** (`/dashboard`). Click `[data-demo='load-sample']`. The sample, which includes tool calls, runs in the browser: the worst incident and its timeline appear, with an agent writing a wrong signup count after a correction.

Everything off this path is out of scope; see [HONESTY.md](HONESTY.md).
