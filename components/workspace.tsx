"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReportView } from "@/components/report-view";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/components/page-hero";
import { IncidentPanel } from "@/components/acts-view";
import { SwarmTimeline } from "@/components/swarm-timeline";
import { topIncident, type LineageReportJson } from "@/lib/report";
import type { WorkerRequest, WorkerResponse } from "@/lib/analyze.worker";
import { fmtInt, pct } from "@/lib/tones";

type Status =
  | { kind: "idle" }
  | { kind: "running"; stage: string; started: number }
  | { kind: "done"; report: LineageReportJson; ms: number }
  | { kind: "error"; message: string };

const SAMPLE = "/samples/sample-swarm.jsonl";

export function Workspace() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => workerRef.current?.terminate(), []);

  const run = useCallback((files: { name: string; bytes: ArrayBuffer }[]) => {
    workerRef.current?.terminate();
    const worker = new Worker(new URL("../lib/analyze.worker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;
    setStatus({ kind: "running", stage: "Starting", started: Date.now() });
    worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const m = ev.data;
      if (m.type === "progress") setStatus((s) => ({ kind: "running", stage: m.stage, started: s.kind === "running" ? s.started : Date.now() }));
      else if (m.type === "done") {
        setStatus({ kind: "done", report: m.report, ms: m.ms });
        worker.terminate();
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      } else {
        setStatus({ kind: "error", message: m.message });
        worker.terminate();
      }
    };
    worker.onerror = (e) => setStatus({ kind: "error", message: e.message || "The analysis worker failed to start." });
    const req: WorkerRequest = { files };
    worker.postMessage(req, files.map((f) => f.bytes));
  }, []);

  const runFiles = async (list: FileList | File[]) => {
    const files = await Promise.all(Array.from(list).map(async (f) => ({ name: f.name, bytes: await f.arrayBuffer() })));
    if (files.length) run(files);
  };

  const runSample = async () => {
    const res = await fetch(SAMPLE);
    run([{ name: "sample-swarm.jsonl", bytes: await res.arrayBuffer() }]);
  };

  const runPasted = () => {
    if (!pasted.trim()) return;
    run([{ name: "pasted.jsonl", bytes: new TextEncoder().encode(pasted).buffer as ArrayBuffer }]);
  };

  const download = (r: LineageReportJson) => {
    const blob = new Blob([JSON.stringify(r, null, 2) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `traceturn-report-${r.reportSha256.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const running = status.kind === "running";

  return (
    <div className="flex flex-col gap-10">
      <div
        data-demo="workspace-drop"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void runFiles(e.dataTransfer.files);
        }}
        className={`mx-auto w-full max-w-[56rem] rounded-2xl border border-dashed p-8 text-center transition-colors sm:p-10 ${
          dragging ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_6%,transparent)]" : "border-[var(--border-strong)] bg-[var(--surface)]"
        }`}
      >
        <h2 className="h-section text-2xl font-semibold text-[var(--fg)]">Drop a transcript here</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--fg-muted)]">
          <code className="text-[var(--fg)]">.jsonl</code> or <code className="text-[var(--fg)]">.jsonl.gz</code>, one message per line. Add{" "}
          <code className="text-[var(--fg)]">agents.jsonl.gz</code> alongside AI Village{" "}
          <code className="text-[var(--fg)]">chat_messages.jsonl.gz</code> to see names instead of ids.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button type="button" disabled={running} onClick={() => inputRef.current?.click()} className={`${BTN_PRIMARY} disabled:opacity-50`}>
            Choose files
          </button>
          <button type="button" disabled={running} onClick={runSample} data-demo="load-sample" className={`${BTN_SECONDARY} disabled:opacity-50`}>
            Try the sample transcript
          </button>
          <button
            type="button"
            disabled={running}
            onClick={() => setPasting((v) => !v)}
            aria-expanded={pasting}
            className="rounded-full px-4 py-3 text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] disabled:opacity-50"
          >
            {pasting ? "Hide paste box" : "Paste JSONL"}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            aria-label="Choose transcript files"
            tabIndex={-1}
            accept=".jsonl,.gz,.json,.ndjson,application/json,application/gzip"
            className="sr-only"
            onChange={(e) => e.target.files && void runFiles(e.target.files)}
          />
        </div>
        {pasting && (
          <div className="mt-6 text-left">
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={6}
              spellCheck={false}
              placeholder='{"agent":"Atlas","timestamp":"2026-09-01T09:00:00Z","content":"The form shows 412 signups."}'
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-xs text-[var(--fg)]"
            />
            <button type="button" onClick={runPasted} disabled={running || !pasted.trim()} className={`${BTN_SECONDARY} mt-3 disabled:opacity-50`}>
              Analyze pasted lines
            </button>
          </div>
        )}
        <p className="mt-6 font-mono text-[11px] text-[var(--fg-subtle)]">Analysed in your browser. Nothing is uploaded.</p>
      </div>

      <div aria-live="polite">
        {running && (
          <div className="mx-auto flex max-w-[56rem] items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--fg-muted)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
            {status.stage}…
          </div>
        )}
        {status.kind === "error" && (
          <div className="mx-auto max-w-[56rem] rounded-2xl border border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[var(--danger-surface)] p-5 text-sm text-[var(--fg)]">
            <div className="font-medium text-[var(--danger)]">Could not analyse that file</div>
            <p className="mt-1 text-[var(--fg-muted)]">{status.message}</p>
          </div>
        )}
      </div>

      {status.kind === "done" && (
        <div ref={resultRef} className="scroll-mt-6">
          <Summary report={status.report} ms={status.ms} onDownload={() => download(status.report)} />
          <WorkspaceIncident report={status.report} />
          <div className="mt-8">
            <ReportView report={status.report} />
          </div>
        </div>
      )}
    </div>
  );
}

/** The worst incident in the dropped transcript: who acted on an unchecked number, and when. */
function WorkspaceIncident({ report }: { report: LineageReportJson }) {
  const incident = topIncident(report);
  if (!incident) return null;
  return (
    <div className="mt-8 flex flex-col gap-6" data-demo="workspace-incident">
      <IncidentPanel incident={incident} />
      {incident.episode && incident.top.length > 0 && <SwarmTimeline episode={incident.episode} acts={incident.top} correction={incident.correction} maxRows={20} />}
    </div>
  );
}

function Summary({ report, ms, onDownload }: { report: LineageReportJson; ms: number; onDownload: () => void }) {
  const t = report.totals;
  const cells = [
    ["Turns", fmtInt(t.turns)],
    ["Agents", fmtInt(t.agents)],
    ["Claims by 3+ agents", fmtInt(t.episodes)],
    ["Repeats checked", t.restatements ? pct(t.independent, t.restatements) : "–"],
    ["Repairs unconfirmed", `${report.verdicts.WAITING_TO_VERIFY}/${t.repairs}`],
  ];
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-t-2xl bg-[var(--border)] sm:grid-cols-5">
        {cells.map(([label, value]) => (
          <div key={label} className="bg-[var(--bg-elevated)] p-4 text-center">
            <div className="tnum text-2xl font-semibold text-[var(--fg)]">{value}</div>
            <div className="mt-1 text-xs text-[var(--fg-muted)]">{label}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-3 font-mono text-[11px] text-[var(--fg-subtle)]">
        <span className="min-w-0 truncate">
          {report.source.name} · {ms.toLocaleString("en-US")} ms · report sha256 {report.reportSha256.slice(0, 16)}…
        </span>
        <button type="button" onClick={onDownload} data-demo="download-report" className="text-[var(--accent)] hover:underline">
          Download report JSON
        </button>
      </div>
    </div>
  );
}
