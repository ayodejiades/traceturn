# traceturn

When several agents in a swarm state the same number, traceturn finds the agent that said it first and counts how many of the others checked it before repeating it.

**Live:** https://traceturn.vercel.app ([findings](https://traceturn.vercel.app/proof) · [verify a verdict](https://traceturn.vercel.app/verify) · [analyze a transcript](https://traceturn.vercel.app/dashboard))

> Built by Ayodeji Adesegun ([@ayodejiades](https://github.com/ayodejiades)) for the AI Swarm Dynamics Hackathon, hosted by AI Village and Grove Research.

## What it found

Run on the AI Village chat (183,483 messages, 46 agents) and the German Wiki incident export from collusion.wiki (14,366 edits, 3,195 account labels). Full write-up: [docs/FINDINGS.md](docs/FINDINGS.md).

- **Wrong numbers spread before anyone checked.** "413 events" was stated by 8 AI Village agents over 20 hours, none of whom had opened the repository, until GPT-5.2 pulled it and found 409. Two agents repeated 413 afterwards.
- **The answer board's herd copied a rounded value.** 75 accounts submitted Hungary 9.90 before one queried the live source and found 9.91; 33 more submitted 9.90 after the correction. The same happened for three other answers.
- **A guess became 73 accounts' answer.** One account posted "Hypothesis only: … Social Sciences (2,749) may be next"; 72 more posted 2,749, none after checking.
- **A small group fed the board.** 96 of 3,195 labels first posted every shared value; the top 10 first posted 42% of them.
- **Agents acted on numbers nobody had checked.** In the AI Village, 1,364 of 1,551 acts on shared numbers had no reported check behind them. Seven agents wrote "209 projects" into pages, summaries and notes before one of them checked and found 44.
- **Checking before repeating is rare.** About one AI Village restatement in six came with the agent's own check (15.5% after a hand-labelled audit; the classifier alone says 6.9%). 108 of 119 "I fixed it" claims were never confirmed by another agent.

Every number is re-derived from `evidence/*-report.json` by `pnpm claim:verify`, which also fails if the write-up quotes a number the reports no longer support. Classifier accuracy on a held-out sample is in [docs/AUDIT.md](docs/AUDIT.md); the limits are in [docs/HONESTY.md](docs/HONESTY.md).

## How it works

1. **Parse** (`lib/transcript.ts`). JSONL rows become ordered turns. It reads AI Village `chat_messages`, `events` and `computer_use_sessions` rows, collusion.wiki revisions (only the lines each edit inserted), or any log with an agent, content and timestamp field. Human messages are kept so a number a person introduced is never blamed on the first agent to repeat it. Tool calls and delegations are kept as actions, not dropped for having no prose.
2. **Extract claims** (`lib/lineage.ts`). A claim is a quantity and the word it counts: "237 files", "$542 raised". Labels ("Day 259", "PR #34"), years, HTTP codes and digits inside URLs are skipped.
3. **Group episodes.** Statements of one claim by three or more agents, split wherever the thread goes quiet for 72 hours.
4. **Classify each agent's first statement** as the origin, a check of its own ("I pulled latest main and it still validates 128 claims", or a computer session opened to check that claim), a credited restatement ("according to Delta…"), or an echo. An echo either copies an earlier agent's wording (an 8-word run) or states the number with no credit and no observation.
5. **Find corrections.** A value three or more agents stated that one later corrected in plain words ("409 events, not 413") becomes a trail: who stated it, whether any had checked, how long it lasted, who kept repeating it.
6. **Link acts to claims** (`lib/acts.ts`). An act is an agent submitting, posting, writing or handing off a shared number: in its own words ("answered 9.90%"), in a session goal, or in a logged tool call whose text writes it. Each act is graded grounded, ungrounded or after a correction, by whether any agent had reported checking the claim first, and ranked by blast radius. An act is admissible only if its claim traces to an observation.
7. **Decide** (`lib/kernel.ts`). Agents who stated it as known are compared with independent derivation paths, and the origin excerpt must appear verbatim in its source turn. Five invariants run on every verdict. Self-reported repairs stay open until a different agent reports the same URL working.

No model reads the transcript. The same file gives the same report on any machine, offline.

## Try it

| Where | What |
|---|---|
| `/` | The featured lineage and the headline numbers |
| `/proof` | Both corpora: the worst incident, pinned lineages, wrong-number trails, acts taken on unchecked numbers, repair claims, per-agent check rates and the board's seeders, each linked to its source |
| `/verify` | Recompute a verdict's SHA-256 and re-run the kernel in the browser, then tamper with it and watch it fail |
| `/dashboard` | Drop your own `.jsonl` or `.jsonl.gz` (including the AI Village files). It is analysed in a Web Worker; nothing is uploaded |

```bash
pnpm install
pnpm dev                 # http://localhost:3000
pnpm test                # engine, report and sponsor fixture tests
pnpm claim:verify        # re-derive every public number; exits 1 on drift
pnpm analyze log.jsonl   # write evidence/log-report.json for any transcript
pnpm analyze collusion   # German Wiki incident, from collusion.wiki's public export
```

### Re-running the AI Village analysis

The dataset is gated. With approved access and `HF_TOKEN` set:

```bash
hf download aidigestorg/ai-village agents.jsonl.gz chat_messages.jsonl.gz \
  computer_use_sessions.jsonl.gz summaries.jsonl.gz manifest.json \
  --repo-type dataset --local-dir data/aivillage
pnpm analyze
```

Add `computer_use_turns.jsonl.gz` (2.5 GB) to the download to include logged tool calls as acts; `pnpm analyze` streams it in a second pass and keeps only actions that state a tracked claim. Without it the acts come from chat and session goals alone.

`data/` is gitignored. The committed report quotes single sentences from agent messages and never quotes a human, as the dataset terms ask.

## Sources

- AI Village: AI Digest, "AI Village dataset", 2026. https://theaidigest.org/village
- German Wiki incident: collusion.wiki export, https://collusion.wiki/explorer/download (user names and half of every IP redacted by the publishers).
- Grove Research: the framing of independent derivation paths, as opposed to assertion counts, that the kernel measures.

No model provider is listed because nothing in this repository calls a model.
