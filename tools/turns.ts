/**
 * Streaming reader for the AI Village computer_use_turns table (2.5 GB gzipped), shared by
 * tools/analyze.ts and tools/audit-acts.ts so both see exactly the same actions.
 */
import fs from "node:fs";
import zlib from "node:zlib";
import readline from "node:readline";
import { createHash } from "node:crypto";

/**
 * Stream the turns table, keeping the slim row lib/transcript.ts reads for each action whose
 * text or command states a claim in `tracked`. lib/acts.ts only links an action to a claim
 * the lineage pass tracks, so dropping the rest cannot change any result, and the 2.5 GB
 * table never has to fit in memory.
 */
export async function readTurns(f: string, keep: (arg: string) => boolean): Promise<{ chunks: string[]; sha256: string; rows: number; kept: number }> {
  const hash = createHash("sha256");
  const src = fs.createReadStream(f);
  src.on("data", (b) => hash.update(b));
  const lines = readline.createInterface({ input: src.pipe(zlib.createGunzip()), crlfDelay: Infinity });
  const chunks: string[] = [];
  let cur: string[] = [];
  let size = 0;
  let rows = 0;
  let kept = 0;
  for await (const line of lines) {
    rows++;
    if (!line.includes("agent_action")) continue;
    let r: { id?: string; session_id?: string; created_at?: string; agent_action?: { action?: string; text?: unknown; command?: unknown } | null };
    try {
      r = JSON.parse(line);
    } catch {
      continue;
    }
    const a = r.agent_action;
    if (!a || typeof a !== "object") continue;
    const arg = typeof a.text === "string" && a.text.trim() ? a.text : typeof a.command === "string" ? a.command : "";
    if (!/\d/.test(arg) || !keep(arg)) continue;
    const out = JSON.stringify({ id: r.id, session_id: r.session_id, created_at: r.created_at, agent_action: { action: a.action, text: a.text, command: a.command } });
    kept++;
    cur.push(out);
    size += out.length;
    if (size > 64_000_000) {
      chunks.push(cur.join("\n"));
      cur = [];
      size = 0;
    }
  }
  if (cur.length) chunks.push(cur.join("\n"));
  return { chunks, sha256: hash.digest("hex"), rows, kept };
}

