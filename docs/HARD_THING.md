# The hard part

Telling "seven agents agree" apart from "one agent said it and six repeated it", from chat alone, with no model, in a way a skeptic can re-run.

## Why it is hard

- **Paraphrase.** Agents restate a claim in their own words, so matching sentences misses most repeats. traceturn keys a claim on a quantity and the word it counts ("237 files"), which survives paraphrase verbatim and needs no embedding model.
- **Numbers that are not claims.** "Day 259", "PR #34", "HTTP 404", a year, digits in a URL. Treating these as claims floods the report with noise; the first run on the corpus did exactly that. `extractClaims` skips labels by the word before the number, zero-padded ids, HTTP codes and URL contents.
- **Independence from text.** A repeat is independent only if the agent reports its own observation. First-person observation verbs are read from the whole sentence, not the trimmed excerpt; "re‑ran" with a non-breaking hyphen (U+2011) is common in the corpus and was missed until the regex allowed it. Tool output ("`wc -l` returns 236", "my instance shows 110") also counts.
- **Credit is its own category.** 403 of 2,022 AI Village restatements name their source. Counting them as corroboration would inflate agreement, and counting them as echoes would accuse honest agents, so they count toward neither side.
- **Each corpus has its own jargon.** On the answer board, "R3 confirmed" reports that a round's question arrived, so sentence-initial "Confirmed" counts as a check only in chat. The held-out audit missed this because it never sampled wiki checks; a second held-out sample does (docs/AUDIT.md).
- **A wiki save carries the whole page.** Crediting an editor with every line would blame them for text they only left in place, so each revision contributes only the lines its diff inserted.
- **Corrections name the wrong value in passing.** "388 signups, not 412" mentions 412 to reject it. The lineage skips such mentions, and the correction detector reads them: "N unit, not M", "(previously reported M)", and on answer boards "not workbook-display M".
- **Whose claim is it.** When a human introduced the number, blaming the first agent to repeat it would be wrong, so the kernel abstains.

## Failure states

| Input | Result |
|---|---|
| Origin excerpt not verbatim in the source turn | `ABSTAIN_UNBOUND_EXCERPT` (INV-1) |
| Origin is a human message, or its sentence was scrubbed (`[REDACTED]`) | `ABSTAIN_AMBIGUOUS_SOURCE` (INV-5) |
| Only credited restatements | `BENIGN_CONTROL_NO_DRIFT` (INV-4) |
| A question or doubt mentions the value first | Skipped; the first assertion is the origin |
| Agent reports its own repair, nobody else confirms | `WAITING_TO_VERIFY` (INV-3) |
| Another agent reports the same URL working | `VERIFIED_FIXED` |
| Stated as known by more agents than have derivation paths | `MATERIAL_DRIFT_DETECTED` |
| Malformed JSONL line | Skipped and counted; parsing continues |

## Re-run

```bash
pnpm test           # sample transcript covers every row above
pnpm claim:verify   # re-derives the AI Village report
```
