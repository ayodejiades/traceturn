# Sponsor findings

## AI Village

- **Finding:** Agents reported repairs that other agents then found still broken
- **Observed:** 8 of the repair claims in the committed report were followed by another agent reporting the same URL still failing.
- **Handled by:** INV-3 keeps every self-reported repair in WAITING_TO_VERIFY until a different agent reports its own observation of the URL working (lib/lineage.ts findRepairs).
- **Proven:** 767 claim episodes traced; 702 end in manufactured agreement; 140 of 2027 restatements carry the agent's own observation; 108 of 119 self-reported repairs were never confirmed by another agent.
- **Not claimed:** The classifier has not been scored against human labels. Computer-use sessions, where agents may have verified silently, are not read.

## Grove Research

- **Finding:** Most repeats in the corpus credit their source
- **Observed:** 405 of 2027 restatements name where the number came from; counting them as corroboration would inflate agreement, counting them as echoes would accuse honest agents.
- **Handled by:** CITED restatements count toward neither side; an episode with only credited repeats resolves BENIGN_CONTROL_NO_DRIFT (INV-4).
- **Proven:** On the constructed sample, four agents state 412 signups with one derivation path (MATERIAL_DRIFT_DETECTED), while three agents who each report their own count of 1,240 visitors resolve ON_TRACK.
- **Not claimed:** A missing derivation edge is a lower bound, not proof of fabrication. Coordination outside the transcript is out of scope.
