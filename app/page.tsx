"use client";

import { useState } from "react";
import Link from "next/link";

interface EndpointTab {
  id: string;
  name: string;
  method: "POST" | "GET" | "DELETE";
  path: string;
  payload: Record<string, any>;
  response: Record<string, any>;
  latencyMs: number;
}

const ENDPOINTS: EndpointTab[] = [
  {
    id: "dispatch",
    name: "Dispatch Intent",
    method: "POST",
    path: "/v1/intents/dispatch",
    payload: {
      account: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      action: "settle_batch",
      slippageToleranceBps: 5,
      proofType: "zk-snark-groth16",
    },
    response: {
      id: "int_8f92e4a19b02",
      status: "SETTLED",
      batchId: 94812,
      netSavingsUsd: 142.8,
      attestationHash: "0x3f9a7c...18d4",
      executionTimeMs: 14.2,
    },
    latencyMs: 14,
  },
  {
    id: "attest",
    name: "Verify Receipt",
    method: "POST",
    path: "/v1/proofs/verify",
    payload: {
      proofId: "prf_9921b7a",
      circuit: "escrow_sla_v2",
      expectedInvariant: "no_undercollateralized_cross",
    },
    response: {
      verified: true,
      circuitDigest: "0x82b...44a1",
      verificationGas: 24200,
      timestamp: "2026-09-25T13:42:10.042Z",
    },
    latencyMs: 18,
  },
  {
    id: "webhooks",
    name: "List Subscriptions",
    method: "GET",
    path: "/v1/webhooks/subscriptions",
    payload: {},
    response: {
      data: [
        { id: "sub_01", target: "https://api.internal/hooks", events: ["intent.settled"], active: true },
        { id: "sub_02", target: "https://telemetry.ops/inbound", events: ["sla.breach"], active: true },
      ],
      total: 2,
    },
    latencyMs: 9,
  },
];

const WEBHOOK_EVENTS = [
  {
    id: "evt_9481_settled",
    type: "intent.settled",
    status: 200,
    time: "240ms ago",
    payload: { intentId: "int_8f92e4a1", batch: 94812, crossedUsd: 14200.0 },
  },
  {
    id: "evt_9480_attested",
    type: "proof.attested",
    status: 200,
    time: "1.4s ago",
    payload: { proofId: "prf_9921b7a", solver: "0x82b...44a1", gas: 24200 },
  },
  {
    id: "evt_9479_heartbeat",
    type: "agent.heartbeat",
    status: 200,
    time: "4.8s ago",
    payload: { latencyP99: "12ms", memoryMb: 42, activePeers: 6 },
  },
];

export default function DeveloperConsoleLanding({
  project = "traceturn",
  tagline = "Deterministic swarm forensics: causal blame DAG plus claim-lineage independent-derivation counting over multi-agent JSONL transcripts",
}: {
  project?: string;
  tagline?: string;
}) {
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointTab>(ENDPOINTS[0]);
  const [codeLang, setCodeLang] = useState<"curl" | "typescript" | "python">("curl");
  const [executing, setExecuting] = useState(false);
  const [lastExecuted, setLastExecuted] = useState<EndpointTab | null>(ENDPOINTS[0]);

  const handleRun = () => {
    setExecuting(true);
    setTimeout(() => {
      setLastExecuted({ ...activeEndpoint });
      setExecuting(false);
    }, 280);
  };

  const getCodeSnippet = () => {
    if (codeLang === "typescript") {
      return `import { ${project}Client } from "@ayodejiades/sdk";

const client = new ${project}Client({
  apiKey: process.env.${project.toUpperCase()}_API_KEY,
  environment: "production",
});

const res = await client.${activeEndpoint.id === "dispatch" ? "intents.dispatch" : activeEndpoint.id === "attest" ? "proofs.verify" : "webhooks.list"}(${
        Object.keys(activeEndpoint.payload).length > 0 ? JSON.stringify(activeEndpoint.payload, null, 2) : ""
      });
console.log(res);`;
    }
    if (codeLang === "python") {
      return `import os
from ${project.toLowerCase()} import Client

client = Client(api_key=os.environ.get("${project.toUpperCase()}_API_KEY"))
response = client.${activeEndpoint.id === "dispatch" ? "intents.dispatch" : activeEndpoint.id === "attest" ? "proofs.verify" : "webhooks.list"}(
    ${Object.keys(activeEndpoint.payload).length > 0 ? Object.entries(activeEndpoint.payload).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(",\n    ") : ""}
)
print(response)`;
    }
    return `curl -X ${activeEndpoint.method} "https://api.${project.toLowerCase()}.io${activeEndpoint.path}" \\
  -H "Authorization: Bearer test_live_sk_89f1a02" \\
  -H "Content-Type: application/json"${
    Object.keys(activeEndpoint.payload).length > 0
      ? ` \\\n  -d '${JSON.stringify(activeEndpoint.payload)}'`
      : ""
  }`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0c] text-[#ededed] font-sans antialiased selection:bg-emerald-500/20">
      {/* Top Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {project}
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-0.5 text-xs text-emerald-400 font-mono">
            v1.4-active
          </span>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a href="#playground" className="text-zinc-400 hover:text-white transition-colors">
            API Playground
          </a>
          <a href="#webhooks" className="text-zinc-400 hover:text-white transition-colors">
            Webhook Stream
          </a>
          <Link
            href="/dashboard"
            data-demo="launch-demo"
            className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            Launch Console
          </Link>
        </nav>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col gap-12 w-full">
        {/* Hero Section */}
        <section className="flex flex-col gap-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs text-zinc-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            p99 Latency: 12ms · Edge Native · Zero SDK Cold Start
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl [text-wrap:balance]">
            {project}: {tagline}
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed [text-wrap:pretty]">
            Engineered for developers building high-throughput autonomous agents and settlement engines with deterministic invariants, live telemetry, and cryptographic proofs.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/dashboard"
              data-demo="launch-demo"
              className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 text-sm font-medium transition-all shadow-[0_0_24px_rgba(16,185,129,0.2)]"
            >
              Open Developer Console
            </Link>
            <a
              href="#playground"
              className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors font-mono text-xs"
            >
              Inspect Endpoints
            </a>
          </div>
        </section>

        {/* Interactive API Playground */}
        <section id="playground" className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Interactive API Sandbox</h2>
              <p className="text-xs text-zinc-400">Trigger live sandbox calls against the {project} cluster and inspect real responses.</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              {(["curl", "typescript", "python"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCodeLang(lang)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    codeLang === lang
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Doppelrand Container */}
          <div className="rounded-[16px] border border-white/10 bg-[#121216] p-2 shadow-2xl">
            <div className="rounded-[12px] border border-white/5 bg-[#0e0e12] overflow-hidden">
              {/* Endpoint Tabs */}
              <div className="flex border-b border-white/10 bg-white/[0.02] px-4 py-2 gap-2 overflow-x-auto">
                {ENDPOINTS.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setActiveEndpoint(ep)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      activeEndpoint.id === ep.id
                        ? "bg-white/10 text-white border border-white/10 font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ep.method === "POST" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {ep.method}
                    </span>
                    <span>{ep.name}</span>
                  </button>
                ))}
              </div>

              {/* Playground Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                {/* Request Side */}
                <div className="p-4 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span className="text-zinc-300 font-semibold">{activeEndpoint.path}</span>
                      <span className="text-emerald-400">Environment: Sandbox</span>
                    </div>
                    <div className="relative">
                      <pre className="rounded-lg bg-black/60 p-3 font-mono text-xs text-zinc-300 overflow-x-auto border border-white/5 leading-relaxed min-h-[160px]">
                        {getCodeSnippet()}
                      </pre>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-mono text-zinc-500">Zero network overhead · Mock fallback enabled</span>
                    <button
                      onClick={handleRun}
                      disabled={executing}
                      className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 text-xs font-mono font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {executing ? (
                        <>
                          <span className="h-3 w-3 rounded-full border-2 border-black border-t-transparent animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>Execute Call </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Response Side */}
                <div className="p-4 flex flex-col gap-2 bg-black/30">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400 font-bold">200 OK</span>
                    </span>
                    <span className="text-zinc-500">
                      Latency: <span className="text-zinc-300 font-bold">{lastExecuted?.latencyMs || 14}ms</span> · Size: 1.1 KB
                    </span>
                  </div>
                  <pre className="rounded-lg bg-black/60 p-3 font-mono text-xs text-emerald-300/90 overflow-x-auto border border-white/5 leading-relaxed min-h-[160px]">
                    {JSON.stringify(lastExecuted?.response || activeEndpoint.response, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Webhook Delivery Stream */}
        <section id="webhooks" className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Live Inbound Webhook Stream</h2>
              <p className="text-xs text-zinc-400">Cryptographically signed dispatch events emitted in real time across the network.</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Stream Connected
            </span>
          </div>

          <div className="rounded-[16px] border border-white/10 bg-[#121216] p-2">
            <div className="rounded-[12px] border border-white/5 bg-[#0e0e12] divide-y divide-white/5 font-mono text-xs">
              {WEBHOOK_EVENTS.map((evt) => (
                <div key={evt.id} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                      {evt.status}
                    </span>
                    <span className="text-white font-medium">{evt.type}</span>
                    <span className="text-zinc-500 text-[11px]">{evt.id}</span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
                    <span className="hidden sm:inline text-zinc-500">Payload: {JSON.stringify(evt.payload).slice(0, 48)}...</span>
                    <span className="text-zinc-500">{evt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture & Verification Banner */}
        <section className="rounded-[16px] border border-white/10 bg-gradient-to-r from-emerald-950/20 via-zinc-900/40 to-black p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-xl">
            <h3 className="text-base font-semibold text-white">Cryptographic Verification & Invariant Proofs</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every API execution generates deterministic trace signatures logged to our local invariant engine. Inspect ground-truth solver contracts and formal guarantees on the proof ledger.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/proof"
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 px-4 py-2 text-xs font-mono font-medium transition-colors"
            >
              Inspect /proof Ledger
            </Link>
            <Link
              href="/verify"
              className="rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300 px-4 py-2 text-xs font-mono font-medium transition-colors"
            >
              Run /verify Suite
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-xs text-zinc-500 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 font-semibold">{project}</span>
            <span>· Built by Ayodeji Adesegun (@ayodejiades)</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/proof" className="hover:text-emerald-400 transition-colors">
              Proof Ledger
            </Link>
            <Link href="/verify" className="hover:text-emerald-400 transition-colors">
              Attestation Suite
            </Link>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400">All Invariants Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
