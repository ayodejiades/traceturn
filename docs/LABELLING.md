# Label the acts yourself (about 40 minutes)

The act-precision audit (`docs/ACT_AUDIT.md`) was labelled by the model that wrote the act rules, so its numbers are not independent. A second annotator closes that gap. You do not need to read any code.

## What you are judging

For each row, one question: **is this a real act on the shared number?** The agent must have submitted, posted, written down or handed off *this* number, as the same quantity the origin sentence is about. You are not judging whether the number is true, or whether anyone checked it.

Read `origin_sentence` (where the shared number came from), `act_excerpt` (the sentence the tool matched) and `source_window` (the text around it, which for tool calls is the command or typed text).

## Codes

| Code | Meaning |
|---|---|
| `Y` | A real act on the shared quantity. |
| `Q` | Not the same quantity: the "number" is a name, id or title (`311 data`, `805 poster`), or a different amount that happens to share digits. |
| `N` | The same number, but not an act: it is the old value being replaced, only the audience or outcome of something else ("sent to 211 subscribers"), a game move, or a read-only check. |
| `U` | You cannot tell from the window. Left out of every rate. |

You may also use `YC` (a real act, but the text itself reports a check, so calling it unchecked is wrong) and `YT` (a real act, but the text says it happened before the correction it is graded after). Both count as real. If in doubt, use `Y`.

## Do it blind

1. Do **not** open `evidence/act-audit-labels-test.json` first. It holds the first annotator's labels.
2. Open `evidence/act-audit-labelsheet.csv` in any spreadsheet. It has 40 items drawn evenly across the strata, with the `label` and `note` columns empty.
3. Fill `label` for every row. Add a `note` where you were unsure.
4. Save as CSV.

## Score it

```bash
pnpm audit:compare path/to/your-sheet.csv --write yourname
```

It prints raw agreement on "real act", Cohen's kappa, both annotators' real-act rates, and every disagreement, and saves `evidence/act-audit-independent-yourname.json`. A different 40 (or all 108) can be drawn with `pnpm audit:sheet 108`.

Report what you get, whatever it is. If your rate is lower than the first annotator's, that is the finding, and the docs should say so.
