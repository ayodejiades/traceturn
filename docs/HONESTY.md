# What is and is not claimed

Read this before trusting any number in the repository.

## Real and checked

| Component | What it does | How it is checked |
|---|---|---|
| Transcript parser | Reads AI Village chat, events and computer-use sessions, collusion.wiki revisions, or any `{agent, content, timestamp}` JSONL | Run on 183,483 AI Village messages and 14,366 wiki edits; input sha256 recorded in each report |
| Wrong-number trails | Values 3+ agents stated that one corrected in plain words | Each trail's order and binding re-checked by `pnpm claim:verify` |
| Claim lineage | Finds quantities stated by 3+ agents within 72h and classifies each agent's first statement | `tests/lineage.test.mjs` on a constructed sample that covers every verdict |
| Kernel | Five invariants; the origin excerpt must be verbatim in its source turn | `pnpm claim:verify` re-derives all 34 pinned manifests and 13 fixtures |
| Acts on claims | Links each submit, post, write or handoff to the shared number it carries and grades it grounded, ungrounded or after a correction | Each listed act's excerpt is bound to its source record and re-derived by `pnpm claim:verify`; `tests/acts.test.mjs` and a logged-action fixture pin the rules |
| Repair tracking | Holds "I fixed it" claims until a different agent reports the URL working | Confirmations and disputes are quoted in the report |
| Report integrity | SHA-256 over the canonical report body | `/verify` in the browser and `pnpm claim:verify` offline |

## Not claimed

- **Independence is a lower bound.** An agent that checked privately and did not say so is counted as an echo. The error only runs one way: an echo is never promoted to a check.
- **Echoed numbers are not claimed to be false.** Most are probably true. The report measures how many agents checked a number before repeating it.
- **The classifier is right about two times in three.** On a held-out, hand-labelled sample it agrees with the label 66% of the time (checked 55%, credited 73%, echoed 68%; docs/AUDIT.md). The labels are by the model that wrote the rules, not an independent annotator. Headline check rates are reported both raw and audit-adjusted.
- **Acts are not audited.** They are found by phrase matching and no sample has been hand-labelled, so no precision is claimed. A number written through a variable or a later command is missed; a private check that was never reported makes an act look ungrounded. Ungrounded is not false: most such numbers are probably true.
- **Only quantities.** Agreement about things with no number in them is out of scope.
- **Sessions are read by their goal only.** A computer session counts as a check when its stated goal names the claim with a checking verb; what the agent then did inside the session is not read.
- **A confirmation is taken at the agent's word.** "I just loaded the page and it works" counts as an independent observation; the screenshot is not checked.
- **The 13 kernel fixtures are constructed.** They pin each rule. They are not drawn from the corpus and say nothing about accuracy on it.

## Check it yourself

```bash
pnpm install
pnpm verify:system   # tests, claim:verify, design-token check
```

All of it runs offline with no API key.
