/**
 * What each hackathon host contributes, stated as narrowly as the code supports.
 * tools/verify-evidence.ts renders this into docs/SPONSOR_INTEGRATIONS.md and
 * docs/SPONSOR_FINDINGS.md; tests/sponsors.test.mjs checks each fixture.
 *
 * No model provider is listed: nothing in this repository calls a model.
 */
import village from "@/evidence/aivillage-report.json";

export interface SponsorIntegration {
  id: string;
  name: string;
  role: string;
  codePath: string;
  fixture: string;
  proven: string;
  notClaimed: string;
  withoutIt: string;
  finding: { title: string; observed: string; handledBy: string };
}

const t = village.totals;
const v = village.verdicts;

export const SPONSORS: SponsorIntegration[] = [
  {
    id: "aivillage-dataset",
    name: "AI Village",
    role: `Source corpus. ${t.turns.toLocaleString("en-US")} chat messages from ${t.agents} agents, ${t.from.slice(0, 10)} to ${t.to.slice(0, 10)}, read by lib/transcript.ts.`,
    codePath: "lib/transcript.ts, tools/analyze.ts",
    fixture: "fixtures/sponsors/ai_village_response.json",
    proven: `${t.episodes} claim episodes traced; ${v.MATERIAL_DRIFT_DETECTED} end in manufactured agreement; ${t.independent} of ${t.restatements} restatements carry the agent's own observation; ${v.WAITING_TO_VERIFY} of ${t.repairs} self-reported repairs were never confirmed by another agent.`,
    notClaimed: "The classifier has not been scored against human labels. Computer-use sessions, where agents may have verified silently, are not read.",
    withoutIt: "The engine still runs on any JSONL log, but every number on the findings page disappears: there is no real swarm to measure.",
    finding: {
      title: "Agents reported repairs that other agents then found still broken",
      observed: `${village.repairs.filter((r) => r.disputedBy).length} of the repair claims in the committed report were followed by another agent reporting the same URL still failing.`,
      handledBy: "INV-3 keeps every self-reported repair in WAITING_TO_VERIFY until a different agent reports its own observation of the URL working (lib/lineage.ts findRepairs).",
    },
  },
  {
    id: "grove-lineage",
    name: "Grove Research",
    role: "Framing for the lineage model: count independent derivation paths, not assertions, to tell agreement that was checked from agreement that was repeated.",
    codePath: "lib/lineage.ts buildEpisode, lib/kernel.ts evaluateDeterministicKernel",
    fixture: "fixtures/sponsors/grove_research_response.json",
    proven: "On the constructed sample, four agents state 412 signups with one derivation path (MATERIAL_DRIFT_DETECTED), while three agents who each report their own count of 1,240 visitors resolve ON_TRACK.",
    notClaimed: "A missing derivation edge is a lower bound, not proof of fabrication. Coordination outside the transcript is out of scope.",
    withoutIt: "Counting assertions alone would score every echoed number as corroborated.",
    finding: {
      title: "Most repeats in the corpus credit their source",
      observed: `${t.cited} of ${t.restatements} restatements name where the number came from; counting them as corroboration would inflate agreement, counting them as echoes would accuse honest agents.`,
      handledBy: "CITED restatements count toward neither side; an episode with only credited repeats resolves BENIGN_CONTROL_NO_DRIFT (INV-4).",
    },
  },
];
