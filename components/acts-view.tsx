import type { Incident, LineageReportJson, ReportAct } from "@/lib/report";
import type { Grounding } from "@/lib/acts";
import { fmtAt, fmtClaim, fmtInt, plain, type Tone, TONE_TEXT } from "@/lib/tones";

export const GROUNDING: Record<Grounding, { label: string; tone: Tone; help: string }> = {
  AFTER_CORRECTION: { label: "After the correction", tone: "danger", help: "Another agent had already corrected this value when the act was taken." },
  UNGROUNDED: { label: "Ungrounded", tone: "warn", help: "No agent had reported its own check of this claim when the act was taken." },
  GROUNDED: { label: "Grounded", tone: "accent", help: "At least one agent had reported checking the claim first." },
};

const KIND: Record<ReportAct["kind"], string> = {
  submit: "Submitted",
  publish: "Published",
  handoff: "Handed off",
  write: "Wrote",
  plan: "Set out to",
};

const EVIDENCE: Record<ReportAct["evidence"], string> = {
  logged: "tool call",
  reported: "own words",
  planned: "session goal",
};

/**
 * The consequence layer for one wrong or unchecked claim: the origin, the derivation
 * count, and the acts taken on the gap. Server-renderable.
 */
export function IncidentPanel({ incident }: { incident: Incident }) {
  const { acts, episode, correction } = incident;
  const plural = (n: number, w: string) => `${fmtInt(n)} ${w}${n === 1 ? "" : "s"}`;
  const origin = episode?.assertions?.[0];
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8" data-demo="incident">
      <p className="eyebrow">Worst incident in this corpus</p>
      <h3 className="tnum mt-2 text-3xl font-semibold text-[var(--fg)]">
        {`${plural(incident.agents, "agent")} acted on ${fmtClaim(incident.claim)} with no reported check behind it`}
      </h3>
      <p className="mt-2 text-sm text-[var(--fg-muted)]">
        {plural(acts.total, "act")} in all on this value: {fmtInt(acts.afterCorrection)} after the correction, {fmtInt(acts.ungrounded)} with no reported check, {fmtInt(acts.grounded)} grounded.
      </p>
      <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-3">
        <div>
          <dt className="eyebrow">Origin turn</dt>
          <dd className="mt-1 text-sm text-[var(--fg)]">
            {origin ? (
              <>
                {origin.agent} <span className="font-mono text-[11px] text-[var(--fg-subtle)]">{fmtAt(origin.at)}</span>
              </>
            ) : (
              "Not in the listed lineages"
            )}
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Derivation paths</dt>
          <dd className="tnum mt-1 text-sm text-[var(--fg)]">
            {incident.observed} observed of {incident.promised} promised
          </dd>
        </div>
        <div>
          <dt className="eyebrow">Correction</dt>
          <dd className="mt-1 text-sm text-[var(--fg)]">
            {correction
              ? `${correction.correctedBy}, ${correction.hoursToCorrection < 48 ? `${Math.round(correction.hoursToCorrection)} h` : `${Math.round(correction.hoursToCorrection / 24)} d`} after first appearing${
                  correction.hoursPersisted === null ? "" : `; still repeated ${correction.hoursPersisted < 48 ? `${Math.round(correction.hoursPersisted)} h` : `${Math.round(correction.hoursPersisted / 24)} d`} later`
                }`
              : "None found"}
          </dd>
        </div>
      </dl>
      <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {incident.top.slice(0, 4).map((a) => (
          <ActRow key={a.id} a={a} compact />
        ))}
      </ul>
    </div>
  );
}

function ActRow({ a, compact = false }: { a: ReportAct; compact?: boolean }) {
  const g = GROUNDING[a.grounding];
  return (
    <li className="py-3" data-demo={`act-${a.id}`}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 text-xs">
        <span className="font-medium text-[var(--fg)]">{a.agent}</span>
        <span className="text-[var(--fg-muted)]">
          {KIND[a.kind]} <span className="tnum font-medium text-[var(--fg)]">{fmtClaim(a.claim)}</span>
          {a.to ? ` for ${a.to}` : ""}
        </span>
        <span className={`font-mono text-[10px] uppercase ${TONE_TEXT[g.tone]}`} title={g.help}>
          {g.label}
        </span>
        <span className="ml-auto font-mono text-[10px] text-[var(--fg-subtle)]">
          {fmtAt(a.at)} · {EVIDENCE[a.evidence]}
        </span>
      </div>
      <p className="mt-1 text-[13px] leading-snug text-[var(--fg-muted)]">&ldquo;{plain(a.excerpt).replace(/<\/?[a-z][^>]*>/gi, "")}&rdquo;</p>
      {!compact && (
        <p className="mt-1 font-mono text-[10px] text-[var(--fg-subtle)]">
          {a.id} · {a.observers.length === 0 ? "0 observers" : `observed by ${a.observers.map((o) => o.agent).join(", ")}`} ·{" "}
          {a.reach > 0 ? `${a.reach} more agent${a.reach > 1 ? "s" : ""} stated it afterwards` : "no one stated it afterwards"}
          {a.correctedAt ? ` · corrected ${fmtAt(a.correctedAt)}` : ""}
        </p>
      )}
    </li>
  );
}

export function ActsView({ report, actors = "agents" }: { report: LineageReportJson; actors?: string }) {
  const t = report.totals;
  return (
    <div>
      <p className="mx-auto mb-6 max-w-[var(--measure)] text-center text-sm text-[var(--fg-muted)]">
        An act is something an agent or account did with a shared number: submitted it, posted it, wrote it down, handed it on. It is admissible
        only if some agent had reported checking that number first. Ranked by blast radius: acts after a correction, then ungrounded acts by how many more
        agents went on to state the value.
      </p>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { n: t.actsAfterCorrection, label: "After a correction", tone: "danger" as Tone },
          { n: t.actsUngrounded, label: "Ungrounded", tone: "warn" as Tone },
          { n: t.actsGrounded, label: "Grounded", tone: "accent" as Tone },
          { n: t.agentsActingUngrounded, label: `${actors} acting on the gap`, tone: "fg" as Tone },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
            <div className={`tnum text-2xl font-semibold ${TONE_TEXT[s.tone]}`}>{fmtInt(s.n)}</div>
            <div className="mt-1 text-xs text-[var(--fg-muted)]">{s.label}</div>
          </div>
        ))}
      </div>
      <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5">
        {report.acts.map((a) => (
          <ActRow key={a.id} a={a} />
        ))}
      </ul>
      <p className="mx-auto mt-4 max-w-[var(--measure)] text-center text-xs text-[var(--fg-subtle)]">
        Showing {fmtInt(report.acts.length)} of {fmtInt(t.acts)} acts; all {fmtInt(t.acts)} are in the report&rsquo;s ledger. Evidence: {fmtInt(t.actsByEvidence.logged)} from
        tool calls, {fmtInt(t.actsByEvidence.reported)} from the agent&rsquo;s own words, {fmtInt(t.actsByEvidence.planned)} from session goals. No observer means
        none was reported, a lower bound: an agent that checked privately and did not say so looks unobserved.
      </p>
    </div>
  );
}
