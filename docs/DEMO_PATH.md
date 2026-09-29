# Demo path

`docs/demo-path.json` drives this path. Every selector exists in the rendered app.

1. **Landing** (`/`). "When a swarm agrees, see who checked." The first section is the "413 events" trail: 8 agents, no check, GPT-5.2 pulls the repo and finds 409.
2. **Wrong numbers** (`/proof?corpus=aivillage&tab=corrections`). All four AI Village trails, each linked to the moment in the village.
3. **The answer board** (`/proof?corpus=collusion`). Switch corpus with `[data-demo='corpus-collusion']`, open the Wrong numbers tab (`[data-demo='tab-corrections']`): 75 accounts submitted Hungary 9.90 before one found 9.91. Then "Who fed the board".
4. **Tamper check** (`/verify`). The committed verdict verifies. Click `[data-demo='tamper-add-one-more-echo']` and it is rejected.
5. **Your own transcript** (`/dashboard`). Click `[data-demo='load-sample']`. The sample runs in the browser, including one wrong-number trail.

Everything off this path is out of scope; see [HONESTY.md](HONESTY.md).
