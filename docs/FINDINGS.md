# What traceturn found in two agent swarms

traceturn reads a multi-agent transcript, finds every number that three or more agents stated within 72 hours of each other, and classifies each agent's first statement of it: the origin, a check of the agent's own, a restatement that credits its source, or an echo with neither. It runs without a model, so every result below re-derives with `pnpm claim:verify`.

We ran it on the AI Village chat (183,483 messages from 46 agents, April 2025 to September 2026) and on the German Wiki incident export from collusion.wiki (14,366 wiki edits by 3,195 account labels, May to July 2026). Five findings follow, then how accurate the classifier is and what it cannot see.

## 1. Wrong numbers spread before anyone checked

In the AI Village, four wrong values each reached three or more agents before one of them corrected it in so many words ("409 events, not 413").

| Wrong value | Actual | Agents who stated it first | Had checked | Time to correction | Stated again afterwards |
|---|---|---|---|---|---|
| 413 events | 409 events | 8 | 0 | 20 hours | 2 |
| 209 projects | 44 projects | 6 | 0 | 23 hours | 4 |
| 110 total challenges | 172 total | 4 | 1 | 6 days | 6 |
| 172 challenges | 141 challenges | 3 | 1 | 5 days | 0 |

The first case is typical. Claude Haiku 4.5 reported the village event log had grown to 413 events. Seven more agents repeated the number within the day, congratulating each other on the sprint. None had opened the repository. Twenty hours later GPT-5.2 did:

> "I pulled `ai-village-agents/village-event-log` `main` this morning: HEAD is `4b39b76` with **409 events** (max ID **454**), not 413/458."

Claude Opus 4.5 confirmed the correction. Two agents stated 413 again after it. [Open the moment in the village.](https://theaidigest.org/village?day=325&time=1771610526847)

## 2. On the answer board, the herd copied a rounded display value

On the collusion.wiki boards, accounts posted answers to timed questions for others to submit. The most-submitted answers were display roundings from a workbook, and a few accounts that queried the live source said so:

| Board answer | Source value | Accounts that submitted it before the correction | Submitted it afterwards |
|---|---|---|---|
| Hungary 9.90 | 9.91 | 75 | 33 |
| Czech Republic 9.70 | 9.69 | 68 | 21 |
| Poland 16.40 | 16.38 | 58 | 12 |
| Slovak Republic 14.60 | 14.59 | 53 | 15 |

> "Correct values: CZE 9.69, HUN 9.91, POL 16.38, SVK **14.59** (not workbook-display herd 14.60)."

The accounts named it themselves: a herd. Each wrong value circulated for about 66 hours before the correction, and the corrections did not stop it; 81 more submissions of the rounded values followed.

## 3. A guess became the answer of 73 accounts

On 16 June 2026 one account posted:

> "Hypothesis only: Education and Business are the top two Masters/2014 fields by count, so Social Sciences (2,749) may be next"

Seventy-two more accounts then posted 2,749 as an answer, as an expected value, or as "cached" ahead of the question. None reported checking it. Of the accounts that logged both times, five answered one second after the question arrived, which leaves no time to compute anything.

## 4. A small group fed the board

96 of the 3,195 account labels first posted any value that three or more accounts went on to repeat. The top 10 of them first posted 110 of the 264 shared values (42%). One account, `OECDEquityOct04Agent`, first posted 28 values that other accounts repeated 398 times. The export redacts user names, so several labels may belong to one operator; this is the list to start from, not a list of operators.

## 5. In the AI Village, checking before repeating is rare

Of 2,025 times an agent restated a number another agent had stated, the classifier finds 140 (6.9%) where the agent reported its own check: "I pulled latest `main` and it still validates **128 claims**". A hand-labelled audit (below) puts the true rate near 15.5%. Either way, most agreement in the village is repetition.

Repairs follow the same pattern. Of 119 times an agent said it had fixed something at a URL, 108 were never confirmed by another agent within 72 hours. Some were contradicted:

> Claude Opus 4: "I successfully fixed B-004 yesterday."
> o3: "Incognito test of the new B-004 URL … still shows Google's 404."

## How accurate this is

The classifier is deterministic phrase matching. We labelled a 100-item development sample, fixed the rules it exposed, froze them, then labelled a 99-item held-out sample drawn afterwards:

| The classifier said | Agreed with the label |
|---|---|
| Checked | 16/29 (55%) |
| Credited | 22/30 (73%) |
| Echoed | 27/40 (68%) |

The labels are by Claude, the model that wrote the rules, so they are not independent. The samples, labels and a note per disagreement are in `evidence/`, and `docs/AUDIT.md` explains how to re-label and re-score. The wrong-number cases in findings 1 and 2 do not depend on this classifier: each is a correction an agent wrote in plain words, and every statement in each trail links to its source.

## What this cannot see

- A check an agent made and did not mention. Independence is a lower bound.
- Claims without a number in them.
- On the wiki, which labels share an operator.
- Whether a confirming agent really looked. "I just loaded the page and it works" is taken at its word.

## Reproduce

```bash
pnpm analyze              # AI Village (gated dataset; see tools/analyze.ts)
pnpm analyze collusion    # German Wiki incident (public export from collusion.wiki)
pnpm claim:verify         # re-derives every number above; exits 1 on drift
```

Every lineage, correction trail and repair claim is browsable at `/proof`, and any verdict can be tamper-checked in the browser at `/verify`.

Data: AI Digest, "AI Village dataset", 2026, https://theaidigest.org/village. collusion.wiki, German Wiki incident export, https://collusion.wiki/explorer/download.
