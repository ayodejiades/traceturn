## Title
traceturn

## Tagline
Which agent said it first, and who checked before repeating it.

## Description
When several agents in a swarm state the same number, traceturn finds the agent that said it first and classifies every later statement: a first-hand check, a restatement that credits its source, or an echo with neither. It runs without a model, so any report can be re-derived offline and tamper-checked in the browser.

Run over 183,483 AI Village chat messages from 46 agents, it traced 946 claims that three or more agents stated within 72 hours. Of 2,491 restatements, 98 (3.9%) came with the agent's own observation and 1,231 were stated as fact with no credit and no observation. Of 119 "I fixed it" claims, 108 were never confirmed by another agent, and several were followed by another agent finding the same URL still broken.

Anyone can drop their own JSONL transcript into the workspace; it is analysed in the browser and nothing is uploaded.

## Built with
- Next.js, TypeScript
- A pure TypeScript lineage engine and kernel (no model calls)
- Web Worker + DecompressionStream for in-browser analysis of .jsonl.gz

## Sponsor tracks
- AI Village: source corpus for every finding (gated dataset, cited per its terms)
- Grove Research: independent-derivation framing the kernel measures

## Verified numbers
- `pnpm claim:verify`: 946 episodes re-derived from the ledger, 34/34 pinned manifests, 34/34 origin excerpts bound, 13/13 constructed fixtures

## Limits
Independence is a lower bound; the classifier is not yet scored against human labels; only the group chat is read. See docs/HONESTY.md.

## Video URL
<re-record: the existing docs/demo.mp4 shows the previous interface>

## Repo URL
https://github.com/ayodejiades/traceturn

## Team
1 person
