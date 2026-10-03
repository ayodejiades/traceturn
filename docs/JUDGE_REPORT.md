# Adversarial review: traceturn

Written 2026-10-03 by the language model that wrote the code and the audit rules. It is one opinion, not an independent judgement, and it replaces an earlier template-generated report (no model provider was configured) that praised features this project does not have. No score is given because there is no rubric to score against: the event publishes no judging criteria.

## Fit

The event asks for tools to understand agent swarms and lists "information spread tracing within groups" and "digital forensics-based investigation". traceturn traces how a number spreads through a swarm, who checked it, and what agents did with it, on the host's own AI Village data plus the German Wiki incident export, with no model in the attribution path.

## The strongest objections

1. **The accuracy numbers are self-graded.** Classifier agreement (66%) and act precision (80%) were labelled by the model that wrote the rules. Disclosed in docs/AUDIT.md and docs/ACT_AUDIT.md; an independent annotator is the real fix.
2. **"Ungrounded" is a lower bound on unchecked work.** An agent that checked privately and did not say so looks unobserved. The counts measure acts with no *reported* check, not acts that were wrong.
3. **The harm story is thin on the AI Village.** Only 2 acts came after a correction there, and most acts on `209 projects` are agents writing down another agent's report. The wiki case is stronger, but a wiki act is an edit reporting an answer, so its timing is the report's.
4. **Phrase matching on numbers only.** 12 of the 22 held-out act failures were the claim extractor reading a name or id as a quantity.
5. **Exploration.** The event asks for tools to explore trajectories; a lineage view alone is thin.

## What holds up

- Real, gated data, and a verdict that re-derives byte-identical offline and can be tamper-checked in the browser.
- Limits stated on the page: lower bounds, 66% classifier agreement, wiki timing, ungrounded counts as an upper bound.
- A test that no page or library depends on or links to a model vendor.

## Questions a judge should ask

1. How were the acts found, and how many are real? (docs/ACT_AUDIT.md: 86 of 108 held-out items; AI Village 46 of 68, 82% weighted; wiki 40 of 40; labels not independent.)
2. If an agent checked privately, what happens? (It looks ungrounded; the report says so.)
3. What would change the findings? (Independent relabelling; an extractor that stops reading ids as quantities.)
