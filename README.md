# traceturn

When several agents in a swarm state the same number, traceturn finds the agent that said it first and counts how many of the others checked it before repeating it.

> Built by Ayodeji Adesegun ([@ayodejiades](https://github.com/ayodejiades)) for the AI Swarm Dynamics Hackathon, hosted by AI Village and Grove Research.

## What it found in the AI Village

Run over 183,483 chat messages from 46 agents in the [AI Village](https://theaidigest.org/village) (2 April 2025 to 18 September 2026):

| | |
|---|---|
| Claims stated by three or more agents within 72 hours | 946 |
| Times an agent restated one of those claims | 2,491 |
| Restatements where the agent reported its own observation | 98 (3.9%) |
| Restatements that credited their source | 1,162 |
| Restatements stated as fact with no credit and no observation | 1,231 |
| Episodes where uncredited echoes outnumber independent checks | 727 |
| "I fixed it" claims no other agent confirmed within 72 hours | 108 of 119 |

Every number above is re-derived from `evidence/aivillage-report.json` by `pnpm claim:verify`, which exits 1 if any of them drifts. The limits of these numbers are in [docs/HONESTY.md](docs/HONESTY.md); the most important one is that independence is a lower bound.

## How it works

1. **Parse** (`lib/transcript.ts`). JSONL rows become ordered turns. It reads AI Village `chat_messages` and `events` rows, or any log with an agent, content and timestamp field. Human messages are kept so a number a person introduced is never blamed on the first agent to repeat it.
2. **Extract claims** (`lib/lineage.ts`). A claim is a quantity and the word it counts: "237 files", "$542 raised". Labels ("Day 259", "PR #34"), years, HTTP codes and digits inside URLs are skipped.
3. **Group episodes.** Statements of one claim by three or more agents, split wherever the thread goes quiet for 72 hours.
4. **Classify each agent's first statement** as the origin, a first-hand check ("I pulled latest main and it still validates 128 claims"), a credited restatement ("according to Delta…"), or an echo. An echo either copies an earlier agent's wording (an 8-word run) or states the number with no credit and no observation.
5. **Decide** (`lib/kernel.ts`). Agents who stated it as known are compared with independent derivation paths, and the origin excerpt must appear verbatim in its source turn. Five invariants run on every verdict. Self-reported repairs stay open until a different agent reports the same URL working.

No model reads the transcript. The same file gives the same report on any machine, offline.

## Try it

| Where | What |
|---|---|
| `/` | The featured lineage and the headline numbers |
| `/proof` | All 34 pinned lineages, 27 repair claims and per-agent check rates, each linked to the moment in the live village |
| `/verify` | Recompute a verdict's SHA-256 and re-run the kernel in the browser, then tamper with it and watch it fail |
| `/dashboard` | Drop your own `.jsonl` or `.jsonl.gz` (including the AI Village files). It is analysed in a Web Worker; nothing is uploaded |

```bash
pnpm install
pnpm dev                 # http://localhost:3000
pnpm test                # engine, report and sponsor fixture tests
pnpm claim:verify        # re-derive every public number; exits 1 on drift
pnpm analyze log.jsonl   # write evidence/log-report.json for any transcript
```

### Re-running the AI Village analysis

The dataset is gated. With approved access and `HF_TOKEN` set:

```bash
hf download aidigestorg/ai-village agents.jsonl.gz chat_messages.jsonl.gz \
  summaries.jsonl.gz manifest.json --repo-type dataset --local-dir data/aivillage
pnpm analyze
```

`data/` is gitignored. The committed report quotes single sentences from agent messages and never quotes a human, as the dataset terms ask.

## Sources

- AI Village: AI Digest, "AI Village dataset", 2026. https://theaidigest.org/village
- Grove Research: the framing of independent derivation paths, as opposed to assertion counts, that the kernel measures.

No model provider is listed because nothing in this repository calls a model.
