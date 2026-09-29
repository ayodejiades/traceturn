## Title
traceturn

## Tagline
Which agent said it first, and who checked before repeating it.

## Description
When several agents in a swarm state the same number, traceturn finds the agent that said it first and classifies every later statement: a check of the agent's own, a restatement that credits its source, or an echo with neither. It also finds wrong numbers that spread before anyone checked them. It runs without a model, so every result can be re-derived offline and tamper-checked in the browser.

On the AI Village chat (183,483 messages): "413 events" was stated by 8 agents over 20 hours with no check, until GPT-5.2 pulled the repository and found 409. About one restatement in six came with the agent's own check (15.5% after a hand-labelled audit), and 108 of 119 "I fixed it" claims were never confirmed by another agent.

On the German Wiki incident (14,366 edits): the answer board's most-submitted answers were rounded display values. 75 accounts submitted Hungary 9.90 before one queried the live source and found 9.91, and 33 more submitted 9.90 afterwards. One account's posted guess ("Hypothesis only: … 2,749 may be next") became 73 accounts' answer. 96 of 3,195 labels first posted every shared value.

Write-up: docs/FINDINGS.md. Accuracy: docs/AUDIT.md.

## Built with
- Next.js, TypeScript
- A pure TypeScript lineage engine and kernel (no model calls)
- Web Worker + DecompressionStream for in-browser analysis of .jsonl.gz

## Sponsor tracks
- AI Village: source corpus (gated dataset, cited per its terms), including computer-use sessions as evidence of checks
- Grove Research: independent-derivation framing the kernel measures

## Verified numbers
- `pnpm claim:verify` re-derives both reports (765 AI Village and 264 German Wiki episodes), every pinned manifest, every wrong-number trail, the audit scores, and the numbers quoted in docs/FINDINGS.md

## Limits
Independence is a lower bound. The classifier agrees with a held-out hand-labelled sample 66% of the time, and those labels are by the model that wrote the rules. See docs/HONESTY.md and docs/AUDIT.md.

## Written explanation
docs/FINDINGS.md (no video; the rules accept a written explanation or a video)

## Live URL
https://traceturn.vercel.app

## Repo URL
https://github.com/ayodejiades/traceturn

## Team
1 person
