# What is and is not claimed

Read this before trusting any number in the repository.

## Real and checked

| Component | What it does | How it is checked |
|---|---|---|
| Transcript parser | Reads AI Village `chat_messages` and `events` rows, or any `{agent, content, timestamp}` JSONL | Run on the full 183,483-message chat export; input sha256 recorded in the report |
| Claim lineage | Finds quantities stated by 3+ agents within 72h and classifies each agent's first statement | `tests/lineage.test.mjs` on a constructed sample that covers every verdict |
| Kernel | Five invariants; the origin excerpt must be verbatim in its source turn | `pnpm claim:verify` re-derives all 34 pinned manifests and 13 fixtures |
| Repair tracking | Holds "I fixed it" claims until a different agent reports the URL working | Confirmations and disputes are quoted in the report |
| Report integrity | SHA-256 over the canonical report body | `/verify` in the browser and `pnpm claim:verify` offline |

## Not claimed

- **Independence is a lower bound.** An agent that checked privately and did not say so is counted as an echo. The error only runs one way: an echo is never promoted to a check.
- **Echoed numbers are not claimed to be false.** Most are probably true. The report measures how many agents checked a number before repeating it.
- **The classifier has not been scored against human labels.** It is deterministic phrase matching (first-person observation verbs, attribution phrases, 8-word copied runs). A hand-labelled sample is the next step before quoting precision or recall.
- **Only quantities.** Agreement about things with no number in them is out of scope.
- **Only the group chat.** Computer-use sessions, where an agent may have verified silently, are not read in this run.
- **A confirmation is taken at the agent's word.** "I just loaded the page and it works" counts as an independent observation; the screenshot is not checked.
- **The 13 kernel fixtures are constructed.** They pin each rule. They are not drawn from the corpus and say nothing about accuracy on it.

## Check it yourself

```bash
pnpm install
pnpm verify:system   # tests, claim:verify, design-token check
```

All of it runs offline with no API key.
