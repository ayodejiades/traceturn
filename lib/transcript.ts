/**
 * Transcript ingestion: raw JSONL rows -> ordered Turn[].
 *
 * Understands three shapes, detected per row (see data/aivillage/SCHEMA.md for the first two):
 *  - AI Village `chat_messages` rows: { id, speaker_type, agent_speaker_id, content, room_id, created_at }
 *  - AI Village `events` rows with data.actionType === "AGENT_TALK": { event_index, data: { speakerId, content, roomId } }
 *  - collusion.wiki `revisions` rows: { rev_id, label, page_id, time, body, hunks }. Only the lines
 *    a revision inserted count as its text: a wiki save carries the whole page, and an editor
 *    who left someone else's line in place did not assert it.
 *  - Generic multi-agent logs: { agent|speaker|author|name|role, content|text|message, timestamp|ts|time|created_at, room|channel }
 * Human messages are kept (flagged `human`) so a claim a person introduced is attributed to them.
 * AI Village `agents` rows ({ id, name, model_string }) are collected as a name table instead of turns,
 * and `computer_use_sessions` rows ({ agent_id, session_goal }) as sessions: evidence that an agent
 * set out to check something, which lib/lineage.ts can credit as an independent path.
 *
 * Pure and isomorphic: the browser drop zone and the CLI share this file.
 */

export interface Turn {
  /** Stable id from the source row (message id, event index, or line number). */
  id: string;
  agent: string;
  room: string;
  /** Milliseconds since epoch, UTC. */
  ts: number;
  text: string;
  /** 1-based line in the source file, for "open the source row" links. */
  line: number;
  /** A human message. Kept so a claim a person introduced is not blamed on the first agent to repeat it. */
  human?: boolean;
}

/** A computer-use session an agent opened, with the goal it stated for it. */
export interface Session {
  id: string;
  agent: string;
  ts: number;
  goal: string;
}

export interface ParseResult {
  turns: Turn[];
  sessions: Session[];
  /** agent id -> display name, from any `agents` rows seen. */
  agentNames: Record<string, string>;
  format: "aivillage-chat" | "aivillage-events" | "collusion-wiki" | "generic" | "mixed" | "empty";
  skipped: { malformed: number; empty: number; nonTalk: number };
}

/** AI Village timestamps are "2025-12-29 18:49:21.291984" in UTC with no zone suffix. */
export function parseTimestamp(raw: unknown): number {
  if (typeof raw === "number") return raw < 1e12 ? raw * 1000 : raw;
  if (typeof raw !== "string" || !raw) return NaN;
  let s = raw.trim().replace(" ", "T");
  if (!/[zZ]|[+-]\d\d:?\d\d$/.test(s)) s += "Z";
  // Date.parse accepts at most millisecond precision.
  s = s.replace(/(\.\d{3})\d+/, "$1");
  return Date.parse(s);
}

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

type Row = Record<string, unknown>;

function asTurn(row: Row, line: number): { turn?: Turn; skip?: keyof ParseResult["skipped"]; kind?: ParseResult["format"] } {
  // AI Village chat_messages
  if ("speaker_type" in row && "content" in row) {
    const text = str(row.content);
    if (!text.trim()) return { skip: "empty" };
    const human = row.speaker_type !== "agent" || !row.agent_speaker_id;
    return {
      kind: "aivillage-chat",
      turn: {
        id: str(row.id) || `L${line}`,
        agent: human ? "human" : str(row.agent_speaker_id),
        human,
        room: str(row.room_id) || "main",
        ts: parseTimestamp(row.created_at),
        text,
        line,
      },
    };
  }
  // AI Village events
  if ("event_index" in row && row.data && typeof row.data === "object") {
    const d = row.data as Row;
    if (d.actionType !== "AGENT_TALK") return { skip: "nonTalk" };
    const text = str(d.content);
    if (!text.trim()) return { skip: "empty" };
    return {
      kind: "aivillage-events",
      turn: {
        id: str(d.messageId) || `E${str(row.event_index)}`,
        agent: str(d.speakerId),
        room: str(d.roomId) || "main",
        ts: parseTimestamp(row.created_at),
        text,
        line,
      },
    };
  }
  // collusion.wiki revisions: the inserted lines of each save.
  if ("rev_id" in row && "body" in row && Array.isArray(row.hunks)) {
    const lines = str(row.body).split("\n");
    const added: string[] = [];
    for (const h of row.hunks as Row[]) {
      if (h.op === "insert" || h.op === "replace") added.push(...lines.slice(Number(h.b0) || 0, Number(h.b1) || 0));
    }
    const text = added.join("\n");
    if (!text.trim()) return { skip: "empty" };
    return {
      kind: "collusion-wiki",
      turn: {
        id: str(row.rev_id) || `L${line}`,
        // Unlabelled edits are grouped by redacted IP prefix, the finest identity the export keeps.
        agent: str(row.label) || `unlabelled@${str(row.ip16) || "?"}`,
        room: str(row.page_id) || "wiki",
        ts: parseTimestamp(row.time),
        text,
        line,
      },
    };
  }
  // Generic
  const agent = str(row.agent ?? row.speaker ?? row.author ?? row.name ?? row.from ?? row.role);
  const text = str(row.content ?? row.text ?? row.message ?? row.body);
  if (!agent || !text.trim()) return { skip: text.trim() ? "malformed" : "empty" };
  if (/^system$/i.test(agent)) return { skip: "nonTalk" };
  const human = /^(user|human)$/i.test(agent);
  return {
    kind: "generic",
    turn: {
      id: str(row.id ?? row.turn ?? row.turnId) || `L${line}`,
      agent: human ? "human" : agent,
      human,
      room: str(row.room ?? row.channel ?? row.thread) || "main",
      ts: parseTimestamp(row.timestamp ?? row.ts ?? row.time ?? row.created_at) || line,
      text,
      line,
    },
  };
}

/** Parse one or more JSONL texts (e.g. agents.jsonl + chat_messages.jsonl) into ordered turns. */
export function parseJsonl(...sources: string[]): ParseResult {
  const names: Record<string, string> = {};
  const turns: Turn[] = [];
  const sessions: Session[] = [];
  const kinds = new Set<ParseResult["format"]>();
  const skipped = { malformed: 0, empty: 0, nonTalk: 0 };

  for (const source of sources) {
    let line = 0;
    let start = 0;
    while (start <= source.length) {
      let end = source.indexOf("\n", start);
      if (end === -1) end = source.length;
      line++;
      const raw = source.slice(start, end).trim();
      start = end + 1;
      if (!raw) continue;
      let row: Row;
      try {
        row = JSON.parse(raw);
      } catch {
        skipped.malformed++;
        continue;
      }
      if (!row || typeof row !== "object") {
        skipped.malformed++;
        continue;
      }
      if ("model_string" in row && "name" in row && "id" in row) {
        names[str(row.id)] = str(row.name);
        continue;
      }
      if ("session_goal" in row && "agent_id" in row) {
        sessions.push({ id: str(row.id), agent: str(row.agent_id), ts: parseTimestamp(row.created_at), goal: str(row.session_goal) });
        continue;
      }
      const r = asTurn(row, line);
      if (r.turn) {
        turns.push(r.turn);
        if (r.kind) kinds.add(r.kind);
      } else if (r.skip) skipped[r.skip]++;
    }
  }

  // Resolve ids to display names where an agents table was supplied.
  for (const t of turns) t.agent = names[t.agent] ?? t.agent;
  for (const s of sessions) s.agent = names[s.agent] ?? s.agent;
  sessions.sort((a, b) => a.ts - b.ts);
  // Canonical order: time, then source id as a stable tiebreak.
  turns.sort((a, b) => a.ts - b.ts || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const format = kinds.size === 0 ? "empty" : kinds.size === 1 ? [...kinds][0] : "mixed";
  return { turns, sessions, agentNames: names, format, skipped };
}
