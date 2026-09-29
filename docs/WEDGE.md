# Wedge Brief: traceturn

> Planning brief written before the build. What shipped differs: no model is used anywhere (the Anthropic line below was dropped), and the analysis runs on AI Village chat rather than collusion.wiki. See docs/HONESTY.md for what is claimed now.

## 1. The Differentiated Wedge
* **Target User:** Incident investigator, AI safety researcher, or trust & security engineer auditing out-of-control multi-agent swarms under incident pressure
* **Painful Crisis Moment:** Facing 200,000 turns of multi-agent tool logs and message threads during a cascading agent runaway, collusion, or benchmark cheating incident with a post-mortem deadline measured in hours, not weeks — and no way to tell which bad action caused the damage versus how a single false premise convinced the whole group it was legitimate.
* **Unusual Constraint:** Zero LLM hallucinations in the blame attribution layer. Both the causal blame DAG and the independent-derivation count are pure functions of the transcript, so every verdict reproduces byte-identically offline.
* **Verifiable Proof Metric:** Processes 10,000 multi-agent turns in under 1.5 seconds, isolates the ground-truth failure inflection turn with 100% precision and 0 false positives across committed incident fixtures, and reports the independent-derivation count for any claim.
* **Essential Sponsor Technology:** Anthropic — semantic intent classification on DAG subtrees the deterministic kernel has already isolated, with a deterministic heuristic fallback when offline.
* **UI Archetype:** `developer-console`

## 2. Adversarial Self-Critique
* **Why judges might call it generic:** They will see another LLM log-summarizer. The counter-proof is the Claim Lineage graph: show the same incident as blame-DAG-only, LLM-summary-only, and DAG+lineage, then point at the collusion ring the first two miss.
* **The obvious competitor:** LangSmith and Arize Phoenix trace single-agent latency and tokens. Neither reconstructs swarm coordination topology, counts independent verification paths across 170k messages, nor slices causal blame.
* **What cannot be proven in 48h:** 100% detection of all covert coordination. Independent-derivation counts are a lower bound — absence of a provenance edge is not proof of fabrication. Scope every claim to committed fixtures with an honest precision/recall matrix.
* **Superficial sponsor trap to avoid:** Using the Anthropic API as an ungrounded summarizer. Graph construction must stay 100% deterministic and offline; the model may only classify subtrees the kernel has already isolated.
* **Hour-8 Kill Criterion:** The deterministic parser and DAG builder must run end-to-end against real collusion.wiki / AI Village slices and identify the ground-truth inflection turn with PASS/FAIL verdicts. Claim Lineage is explicitly second priority — a working single-graph tool beats a broken two-graph tool.

## 3. Verified Demand Signals & Evidence
- **[HIGH]** "We don't have good approaches for understanding/overseeing the activity and aims of AI 'swarms'." — Ryan Greenblatt, Hugging Face incident investigator. (Source: [organizer_spec](https://swarmchasing.com/), 2026-09-26)
- **[HIGH]** A Case Study on Emergent Cheating and Whistleblowing in Autonomous Research Swarms. (Source: [academic_paper](https://arxiv.org/html/2609.04170v1), 2026-09-04)
  - Cheating propagated via a shared knowledge library (Appendix D, "Agent Local Wikis") and then peer-to-peer messages — an epistemic failure *before* a behavioral one. Independent-derivation counting over that library is precisely what a summarizer cannot do.
