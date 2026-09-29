/**
 * One vocabulary for verdicts and roles, used by every page.
 *
 * Colour carries meaning and never flips between pages:
 *   accent (green)  evidence of its own: independent path, confirmed repair
 *   danger (red)    manufactured agreement, uncredited echo
 *   warn (amber)    open: unconfirmed repair, abstention
 *   muted           neutral: credited restatement
 */
import type { KernelState } from "./kernel";
import type { Role } from "./lineage";

export type Tone = "accent" | "danger" | "warn" | "muted" | "fg";

export const TONE_TEXT: Record<Tone, string> = {
  accent: "text-[var(--accent)]",
  danger: "text-[var(--danger)]",
  warn: "text-[var(--warn)]",
  muted: "text-[var(--fg-muted)]",
  fg: "text-[var(--fg)]",
};

export const TONE_VAR: Record<Tone, string> = {
  accent: "var(--accent)",
  danger: "var(--danger)",
  warn: "var(--warn)",
  muted: "var(--fg-muted)",
  fg: "var(--fg)",
};

export const STATE: Record<KernelState, { label: string; tone: Tone }> = {
  MATERIAL_DRIFT_DETECTED: { label: "Manufactured agreement", tone: "danger" },
  ON_TRACK: { label: "Independently corroborated", tone: "accent" },
  BENIGN_CONTROL_NO_DRIFT: { label: "Credited restatement", tone: "muted" },
  WAITING_TO_VERIFY: { label: "Unconfirmed repair", tone: "warn" },
  VERIFIED_FIXED: { label: "Confirmed repair", tone: "accent" },
  ABSTAIN_UNBOUND_EXCERPT: { label: "Abstained: unbound excerpt", tone: "warn" },
  ABSTAIN_AMBIGUOUS_SOURCE: { label: "Abstained: unclear origin", tone: "warn" },
};

export const ROLE: Record<Role, { label: string; tone: Tone; help: string }> = {
  ORIGIN: { label: "Origin", tone: "fg", help: "First statement of the claim in this episode." },
  INDEPENDENT: { label: "Checked", tone: "accent", help: "Reports its own observation; a separate derivation path." },
  CITED: { label: "Credited", tone: "muted", help: "Repeats it and names where it came from." },
  ECHO: { label: "Echoed", tone: "danger", help: "States it as fact with no credit and no observation of its own." },
};

/**
 * Chat excerpts are Markdown. For reading, drop emphasis and code markers; the
 * source-binding panel keeps the verbatim bytes the kernel matched.
 */
export const plain = (s: string) => s.replace(/\*\*|__|`/g, "").replace(/^\s*[-*]\s+/, "");

/** Claim keys store bare digits ("34770", "$19291176969.27"); show them grouped. */
export const fmtClaim = (claim: string) =>
  claim.replace(/^([$£€]?)(\d+)/, (_, cur: string, int: string) => cur + int.replace(/\B(?=(\d{3})+(?!\d))/g, ","));

export const fmtInt = (n: number) => n.toLocaleString("en-US");

export const pct = (part: number, whole: number, digits = 1) =>
  whole === 0 ? "0%" : `${((part / whole) * 100).toFixed(digits)}%`;

/** "2026-03-04 21:45 UTC" — stable across server and client (no locale, no local zone). */
export const fmtAt = (iso: string) => `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC`;

/** Minutes/hours/days after the origin, for lineage rows. */
export function fmtOffset(fromIso: string, toIso: string): string {
  const m = Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 60000);
  if (m <= 0) return "+0m";
  if (m < 60) return `+${m}m`;
  if (m < 48 * 60) return `+${Math.round(m / 60)}h`;
  return `+${Math.round(m / 1440)}d`;
}
