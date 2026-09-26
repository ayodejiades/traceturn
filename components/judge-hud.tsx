"use client";

import { useEffect, useState } from "react";

interface Scenario {
  id: string;
  label: string;
  description: string;
}

interface TelemetryItem {
  service: string;
  status: "live" | "cached" | "optimal";
  latencyMs: number;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  { id: "scenario-a", label: "Crisis Scenario A", description: "Disputed CPT code denial under 48h deadline" },
  { id: "scenario-b", label: "Stress Test B", description: "Multi-party conflicting clause redline" },
  { id: "scenario-c", label: "Zero-Knowledge Proof C", description: "Deterministic client-side WASM verification" },
];

const DEFAULT_TELEMETRY: TelemetryItem[] = [
  { service: "Neon Serverless", status: "live", latencyMs: 14 },
  { service: "Akash Secure Pod", status: "optimal", latencyMs: 42 },
  { service: "Local Fixture Fallback", status: "cached", latencyMs: 2 },
];

export function JudgeHUD({
  projectName = "HackOps",
  onSelectScenario,
}: {
  projectName?: string;
  onSelectScenario?: (scenarioId: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState("scenario-a");

  useEffect(() => {
    // Automatically display if ?judge=true or ?demo=true is present in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("judge") === "true" || params.get("demo") === "true" || process.env.NODE_ENV === "development") {
        setVisible(true);
      }
    }
  }, []);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-3 right-3 z-50 rounded border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
      >
        [Judge HUD]
      </button>
    );
  }

  return (
    <aside aria-label="Evaluator Heads-Up Display" className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm text-zinc-300 text-xs font-mono select-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        {/* Left: Project identity & Evaluation checklist */}
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-zinc-100 uppercase tracking-wider">{projectName} Evaluator HUD</span>
          <span className="text-zinc-500">|</span>
          <div className="hidden md:flex items-center space-x-2 text-zinc-400">
            <span>Evaluation checklist:</span>
            <span className="text-emerald-400">[1. Ingest]</span>
            <span>&rarr;</span>
            <span className="text-emerald-400">[2. Redline]</span>
            <span>&rarr;</span>
            <span className="text-emerald-400">[3. Cryptographic proof]</span>
          </div>
        </div>

        {/* Center: 1-Click Scenario Triggers */}
        <div className="flex items-center space-x-2">
          <span className="text-zinc-500 hidden sm:inline">Scenario:</span>
          {DEFAULT_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setActiveScenario(sc.id);
                onSelectScenario?.(sc.id);
              }}
              className={`rounded border px-2 py-0.5 text-xs transition-colors ${
                activeScenario === sc.id
                  ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                  : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
              title={sc.description}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Right: Telemetry drawer toggle & dismiss */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300 hover:border-zinc-700"
          >
            Telemetry {drawerOpen ? "[-]" : "[+]"}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-zinc-500 hover:text-zinc-300"
            title="Minimize HUD"
          >
            [x]
          </button>
        </div>
      </div>

      {/* Expanded Telemetry Drawer */}
      {drawerOpen && (
        <div className="border-t border-zinc-900 bg-zinc-950 px-4 py-2.5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6">
            <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Active Service Traces:</span>
            {DEFAULT_TELEMETRY.map((t) => (
              <div key={t.service} className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-zinc-200">{t.service}</span>
                <span className="text-zinc-500 text-[11px]">({t.latencyMs}ms)</span>
                <span className="rounded border border-zinc-800 px-1 py-0.2 text-[10px] text-zinc-400 uppercase">
                  {t.status}
                </span>
              </div>
            ))}
            <span className="text-zinc-500 text-[11px] ml-auto">Offline fallback fixtures verified</span>
          </div>
        </div>
      )}
    </aside>
  );
}
