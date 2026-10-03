## Title
traceturn

## Tagline
Which agent said it first, who checked before repeating it, and what the swarm did with the number.

## Description
When several agents in a swarm state the same number, traceturn finds the agent that said it first, classifies every later statement (a check of the agent's own, a restatement that credits its source, or an echo with neither), and then follows the number into action: every act an agent took on it (submitted, posted, wrote, handed off) is linked back to whether anyone had reported checking it. No model reads the transcript, so every result re-derives offline, and a judge can tamper-check a verdict or an act in the browser.

On the AI Village (183,483 messages, plus 2.5 million computer-use turns), "413 events" was stated by 8 agents over 20 hours with no check until GPT-5.2 pulled the repository and found 409. "209 projects" was written into pages, notes and summaries by 7 different agents before DeepSeek-V3.2 found 44. Across the village, 1,349 of 1,532 acts on shared numbers had no reported check behind them, by 40 of the 46 agents. About one restatement in six came with the agent's own check (15.5% after a hand-labelled audit).

On the German Wiki incident (14,366 edits), the answer board's most-submitted answers were rounded display values: 75 accounts submitted Hungary 9.90 before one queried the live source and found 9.91, and 33 more submitted 9.90 afterwards. One account's posted guess became 73 accounts' answer.

Each incident has its own page: origin turn, derivation count, a timeline of statements and acts, correction latency, and a downloadable report of pinned manifests. The workspace runs the same engine on a dropped transcript, in the browser, with nothing uploaded.

Write-up: docs/FINDINGS.md. Accuracy: docs/AUDIT.md and docs/ACT_AUDIT.md.

## Built with
- Next.js, TypeScript
- A pure TypeScript lineage engine, act linker and kernel (no model calls, no vendor links; a test enforces it)
- Web Worker + DecompressionStream for in-browser analysis of .jsonl.gz

## Sponsor tracks
- AI Village: source corpus (gated dataset, cited per its terms), including computer-use sessions and turns as evidence of checks and acts
- Grove Research: independent-derivation framing the kernel measures

## Verified numbers
- `pnpm claim:verify` re-derives both reports (765 AI Village and 264 German Wiki episodes), every pinned manifest, every act manifest, every wrong-number trail, both audit scores, and the numbers quoted in docs/FINDINGS.md

## Limits
Independence is a lower bound: an agent that checked privately and did not say so looks unobserved, so "no reported check" is an upper bound on unchecked work, not proof anything was wrong. The classifier agrees with a held-out hand-labelled sample 66% of the time; 86 of 108 held-out acts (80%; 82% weighted for the AI Village) were real acts on the number. Both sets of labels are by the model that wrote the rules, so they are not independent; docs/LABELLING.md is a blind sheet and a scorer for a second annotator. A wiki act is an edit reporting an answer, so its after-correction timing is the report's. See docs/HONESTY.md.

## Written explanation
docs/FINDINGS.md, plus the demo video

## Live URL
https://traceturn.vercel.app

## Repo URL
https://github.com/ayodejiades/traceturn

## Team
1 person
