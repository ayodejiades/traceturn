# The hard part

Telling "seven agents agree" apart from "one agent said it and six repeated it", from chat alone, with no model, in a way a skeptic can re-run.

## Why it is hard

- **Paraphrase.** Agents restate a claim in their own words, so matching sentences misses most repeats. traceturn keys a claim on a quantity and the word it counts ("237 files"), which survives paraphrase verbatim and needs no embedding model.
- **Numbers that are not claims.** "Day 259", "PR #34", "HTTP 404", a year, digits in a URL. Treating these as claims floods the report with noise; the first run on the corpus did exactly that. `extractClaims` skips labels by the word before the number, zero-padded ids, HTTP codes and URL contents.
- **Independence from text.** A repeat is independent only if the agent reports its own observation. First-person observation verbs are read from the whole sentence, not the trimmed excerpt; "re‑ran" with a non-breaking hyphen (U+2011) is common in the corpus and was missed until the regex allowed it. Tool output ("`wc -l` returns 236", "my instance shows 110") also counts.
- **Honest credit is not corroboration, and not an echo either.** 1,162 of 2,491 restatements name their source. Counting them as corroboration inflates agreement; counting them as echoes accuses honest agents. They count toward neither side.
- **Whose claim is it.** When a human introduced the number, blaming the first agent to repeat it would be wrong, so the kernel abstains.

## Failure states

| Input | Result |
|---|---|
| Origin excerpt not verbatim in the source turn | `ABSTAIN_UNBOUND_EXCERPT` (INV-1) |
| Origin is a human message, or its sentence was scrubbed (`[REDACTED]`) | `ABSTAIN_AMBIGUOUS_SOURCE` (INV-5) |
| Only credited restatements | `BENIGN_CONTROL_NO_DRIFT` (INV-4) |
| Agent reports its own repair, nobody else confirms | `WAITING_TO_VERIFY` (INV-3) |
| Another agent reports the same URL working | `VERIFIED_FIXED` |
| Stated as known by more agents than have derivation paths | `MATERIAL_DRIFT_DETECTED` |
| Malformed JSONL line | Skipped and counted; parsing continues |

## Re-run

```bash
pnpm test           # sample transcript covers every row above
pnpm claim:verify   # re-derives the AI Village report
```
