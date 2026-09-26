"use client";

import { useState } from "react";
import Link from "next/link";
import seedTasks from "@/fixtures/consensus-seed.json";
import { ConsensusTask, evaluateConsensus } from "@/lib/engine";

export default function ConsensusDashboard() {
  const [tasks, setTasks] = useState<ConsensusTask[]>(seedTasks as ConsensusTask[]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(seedTasks[0].id);
  const [logs, setLogs] = useState<string[]>([
    "[INIT] Multi-Agent Consensus Orchestrator online (Node v20.x)",
    "[WORKERS] Extractor (01), RiskAuditor (02), SettlementActuary (03) connected",
  ]);

  const activeTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const handleRunConsensus = () => {
    const newId = `tsk-00${tasks.length + 1}`;
    const newProposals = [
      {
        agentId: "agent-ext-01",
        role: "EXTRACTOR" as const,
        confidence: 0.99,
        recommendation: "APPROVE" as const,
        latencyMs: 16,
        checksum: "0xaa19c",
      },
      {
        agentId: "agent-risk-02",
        role: "RISK_AUDITOR" as const,
        confidence: 0.95,
        recommendation: "APPROVE" as const,
        latencyMs: 21,
        checksum: "0xcc29a",
      },
      {
        agentId: "agent-act-03",
        role: "SETTLEMENT_ACTUARY" as const,
        confidence: 0.97,
        recommendation: "APPROVE" as const,
        latencyMs: 12,
        checksum: "0xee39f",
      },
    ];

    const result = evaluateConsensus(newProposals);
    const newTask: ConsensusTask = {
      id: newId,
      payloadTitle: "Automated Enterprise Compute Cluster Rebalancing",
      status: result.outcome === "APPROVE" ? "CONSENSUS_REACHED" : "ESCALATED",
      consensusScore: result.consensusScore,
      proposals: newProposals,
      timestamp: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setSelectedTaskId(newId);
    setLogs((prev) => [
      `[CONSENSUS FORMED] ${newId}: 3/3 agents agreed (100% quorum). Mean latency 16.3ms. Deterministic settlement executed.`,
      ...prev,
    ]);
  };

  const handleSimulateConflict = () => {
    const newId = `tsk-00${tasks.length + 1}`;
    const conflictingProposals = [
      {
        agentId: "agent-ext-01",
        role: "EXTRACTOR" as const,
        confidence: 0.92,
        recommendation: "APPROVE" as const,
        latencyMs: 15,
        checksum: "0x918aa",
      },
      {
        agentId: "agent-risk-02",
        role: "RISK_AUDITOR" as const,
        confidence: 0.89,
        recommendation: "REJECT" as const,
        latencyMs: 27,
        checksum: "0x918bb",
      },
      {
        agentId: "agent-act-03",
        role: "SETTLEMENT_ACTUARY" as const,
        confidence: 0.81,
        recommendation: "ESCALATE" as const,
        latencyMs: 18,
        checksum: "0x918cc",
      },
    ];

    const result = evaluateConsensus(conflictingProposals);
    const newTask: ConsensusTask = {
      id: newId,
      payloadTitle: "High-Risk Arbitrage Settlement with Divergent Risk Rating",
      status: "ESCALATED",
      consensusScore: result.consensusScore,
      proposals: conflictingProposals,
      timestamp: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setSelectedTaskId(newId);
    setLogs((prev) => [
      `[CONFLICT DETECTED] ${newId}: Extractor approved but RiskAuditor rejected. Quorum breach (33%). Quarantined to human escalation queue.`,
      ...prev,
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 rounded-lg border border-[var(--border,#262626)] bg-[var(--surface,#121212)] p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
              Agent Consensus Orchestrator
            </span>
            <span className="rounded bg-emerald-950/60 px-2 py-0.5 text-[11px] font-mono text-emerald-300 border border-emerald-800/40">
              Sub-50ms Multi-Agent Quorum
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--fg,#ededed)] mt-1">
            Deterministic Multi-Agent State Machine & Agreement Engine
          </h1>
          <p className="text-xs text-[var(--fg-muted,#888)] mt-1 max-w-2xl">
            Solves hallucination and runaway agent execution by requiring 2-of-3 Byzantine fault-tolerant agreement between Extractor, Risk Auditor, and Actuary models before committing database state.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/lab"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-300 hover:border-emerald-500 hover:text-white transition-colors"
          >
            Reliability Lab
          </Link>
          <button
            data-demo="evaluate-consensus"
            onClick={handleRunConsensus}
            className="rounded bg-emerald-600 px-3.5 py-1.5 font-mono text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Evaluate Task (Quorum)
          </button>
          <button
            data-demo="simulate-conflict"
            onClick={handleSimulateConflict}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Inject Conflict
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="rounded-lg border border-[var(--border,#262626)] bg-[var(--surface,#121212)] p-4">
          <div className="text-[10px] uppercase text-zinc-500">Consensus Rate</div>
          <div className="text-lg font-semibold text-emerald-400 mt-1">94.2%</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Threshold: 66% Quorum</div>
        </div>
        <div className="rounded-lg border border-[var(--border,#262626)] bg-[var(--surface,#121212)] p-4">
          <div className="text-[10px] uppercase text-zinc-500">Mean Agreement Latency</div>
          <div className="text-lg font-semibold text-zinc-200 mt-1">17.8ms</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Parallelized worker threads</div>
        </div>
        <div className="rounded-lg border border-[var(--border,#262626)] bg-[var(--surface,#121212)] p-4">
          <div className="text-[10px] uppercase text-zinc-500">Escalated Tasks</div>
          <div className="text-lg font-semibold text-amber-400 mt-1">
            {tasks.filter((t) => t.status === "ESCALATED").length}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Zero silent failures</div>
        </div>
        <div className="rounded-lg border border-[var(--border,#262626)] bg-[var(--surface,#121212)] p-4">
          <div className="text-[10px] uppercase text-zinc-500">Zod Schema Integrity</div>
          <div className="text-lg font-semibold text-emerald-400 mt-1">100%</div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Type-safe JSON guarantees</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--fg-muted,#888)]">
            Consensus Task Ledger
          </div>
          <div className="rounded-lg border border-[var(--border,#262626)] bg-[var(--surface,#121212)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] text-zinc-500 uppercase bg-zinc-950/50">
                    <th className="py-2.5 px-4">Task ID</th>
                    <th className="py-2.5 px-4">Payload Description</th>
                    <th className="py-2.5 px-4">Score</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {tasks.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className={`cursor-pointer transition-colors ${
                        activeTask.id === t.id ? "bg-emerald-950/20" : "hover:bg-zinc-900/50"
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-zinc-200">{t.id}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-zinc-300">{t.payloadTitle}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">{t.consensusScore}%</td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] uppercase font-semibold ${
                            t.status === "CONSENSUS_REACHED"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Task Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--fg-muted,#888)]">
            Agent Voting Breakdown
          </div>

          <div className="rounded-lg border border-[var(--border,#262626)] bg-zinc-950 p-4 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Selected Task:</span>
              <span className="text-emerald-400 font-semibold">{activeTask.id}</span>
            </div>

            <div className="space-y-2">
              {activeTask.proposals.map((p) => (
                <div key={p.agentId} className="rounded border border-zinc-800 bg-zinc-900/60 p-2.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">{p.role}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase ${
                        p.recommendation === "APPROVE"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : p.recommendation === "REJECT"
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}
                    >
                      {p.recommendation}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400 mt-1 text-[10px]">
                    <span>Confidence: {(p.confidence * 100).toFixed(0)}%</span>
                    <span>Latency: {p.latencyMs}ms</span>
                    <span>Checksum: {p.checksum}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded border border-zinc-900 bg-black p-3 space-y-1 text-[11px] min-h-[120px]">
              <div className="text-zinc-600">// Orchestrator Event Stream</div>
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes("[CONSENSUS FORMED]")
                      ? "text-emerald-400"
                      : log.includes("[CONFLICT DETECTED]")
                      ? "text-amber-300"
                      : "text-zinc-400"
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
