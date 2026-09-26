export interface AgentProposal {
  agentId: string;
  role: "EXTRACTOR" | "RISK_AUDITOR" | "SETTLEMENT_ACTUARY";
  confidence: number;
  recommendation: "APPROVE" | "ESCALATE" | "REJECT";
  latencyMs: number;
  checksum: string;
}

export interface ConsensusTask {
  id: string;
  payloadTitle: string;
  status: "CONSENSUS_REACHED" | "ESCALATED" | "EVALUATING";
  proposals: AgentProposal[];
  consensusScore: number;
  timestamp: string;
}

export function evaluateConsensus(proposals: AgentProposal[]): {
  outcome: "APPROVE" | "ESCALATE" | "REJECT";
  consensusScore: number;
} {
  if (proposals.length === 0) return { outcome: "ESCALATE", consensusScore: 0 };
  const approveCount = proposals.filter((p) => p.recommendation === "APPROVE").length;
  const score = Math.round((approveCount / proposals.length) * 100);
  if (score >= 66) return { outcome: "APPROVE", consensusScore: score };
  if (score >= 33) return { outcome: "ESCALATE", consensusScore: score };
  return { outcome: "REJECT", consensusScore: score };
}
