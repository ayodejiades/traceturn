/// <reference lib="webworker" />
/**
 * Runs the whole analysis off the main thread, so a 50 MB corpus does not freeze the
 * page. Receives raw file bytes, gunzips .gz with the platform DecompressionStream,
 * and returns the same report shape the CLI writes. Nothing leaves the browser.
 */
import { buildReport, type LineageReportJson } from "./report";
import { parseJsonl } from "./transcript";

export type WorkerRequest = { files: { name: string; bytes: ArrayBuffer }[] };
export type WorkerResponse =
  | { type: "progress"; stage: string }
  | { type: "done"; report: LineageReportJson; ms: number }
  | { type: "error"; message: string };

const post = (m: WorkerResponse) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m);

async function fileDigest(bytes: ArrayBuffer): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function toText(name: string, bytes: ArrayBuffer): Promise<string> {
  if (!name.endsWith(".gz")) return new TextDecoder().decode(bytes);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const t0 = performance.now();
  try {
    const { files } = ev.data;
    post({ type: "progress", stage: `Reading ${files.length} file${files.length > 1 ? "s" : ""}` });
    const texts: string[] = [];
    const inputs: { file: string; sha256: string }[] = [];
    for (const f of files) {
      post({ type: "progress", stage: f.name.endsWith(".gz") ? `Decompressing ${f.name}` : `Reading ${f.name}` });
      texts.push(await toText(f.name, f.bytes));
      inputs.push({ file: f.name, sha256: await fileDigest(f.bytes) });
    }
    post({ type: "progress", stage: "Parsing turns" });
    const parsed = parseJsonl(...texts);
    if (parsed.turns.length === 0) {
      post({
        type: "error",
        message:
          "No agent turns found. Each line must be a JSON object with an agent (or speaker/author) and content (or text/message) field, or an AI Village chat_messages / events row.",
      });
      return;
    }
    post({ type: "progress", stage: `Tracing claims across ${parsed.turns.length.toLocaleString("en-US")} turns` });
    const report = buildReport(parsed, {
      generatedBy: "traceturn workspace (in browser)",
      source: { name: files.map((f) => f.name).join(" + "), citation: null, dataset: null, exportedAt: null },
      inputs,
      full: true,
    });
    post({ type: "done", report, ms: Math.round(performance.now() - t0) });
  } catch (e) {
    post({ type: "error", message: (e as Error).message });
  }
};
