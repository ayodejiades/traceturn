import type { ReportCorrection } from "@/lib/report";
import { fmtAt, fmtClaim, fmtOffset, plain } from "@/lib/tones";

/**
 * A wrong value's life: every agent that stated it before anyone checked, the
 * correction, and anyone who kept stating it afterwards. Server-renderable.
 */
export function CorrectionCard({ c, compact = false }: { c: ReportCorrection; compact?: boolean }) {
  const first = c.before[0];
  const checkedBefore = c.before.filter((b) => b.checked).length;
  const rows = compact ? c.before.slice(0, 4) : c.before;

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6" data-demo={`correction-${c.id}`}>
      <header>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="tnum text-2xl font-semibold text-[var(--danger)] line-through decoration-2">{fmtClaim(c.wrong)}</span>
          {c.right && (
            <>
              <span aria-hidden className="text-[var(--fg-subtle)]">→</span>
              <span className="tnum text-2xl font-semibold text-[var(--accent)]">{fmtClaim(c.right)}</span>
            </>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">
          {c.before.length} agents stated it, {checkedBefore === 0 ? "none" : checkedBefore} after checking. {c.correctedBy} corrected it{" "}
          {c.hoursToCorrection < 48 ? `${Math.round(c.hoursToCorrection)} hours` : `${Math.round(c.hoursToCorrection / 24)} days`} after it first
          appeared{c.correctorChecked ? ", from its own check" : ""}.
          {c.after.length > 0 && ` ${c.after.length} more agent${c.after.length > 1 ? "s" : ""} repeated the wrong value afterwards.`}
        </p>
      </header>

      <ol className="mt-5 border-l border-[var(--border-strong)] pl-4">
        {rows.map((b) => (
          <li key={b.turnId} className="relative pb-3">
            <span aria-hidden className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
            <div className="flex min-w-0 items-baseline gap-2 text-xs">
              <span className="min-w-0 truncate font-medium text-[var(--fg)]">{b.agent}</span>
              {b.checked && <span className="shrink-0 font-mono text-[10px] uppercase text-[var(--accent)]">checked</span>}
              <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--fg-subtle)]">
                {b === first ? fmtAt(b.at) : fmtOffset(first.at, b.at)}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[var(--fg-muted)]">{plain(b.excerpt)}</p>
          </li>
        ))}
        {compact && c.before.length > rows.length && (
          <li className="pb-3 text-xs text-[var(--fg-subtle)]">and {c.before.length - rows.length} more</li>
        )}
        <li className="relative pb-3">
          <span aria-hidden className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--accent)] bg-[var(--bg)]" />
          <div className="flex min-w-0 items-baseline gap-2 text-xs">
            <span className="min-w-0 truncate font-medium text-[var(--accent)]">{c.correctedBy} corrects it</span>
            <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--fg-subtle)]">{fmtOffset(first.at, c.at)}</span>
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-[var(--fg)]">{plain(c.excerpt)}</p>
          {c.alsoCorrectedBy.length > 0 && (
            <p className="mt-1 text-xs text-[var(--fg-subtle)]">Confirmed by {c.alsoCorrectedBy.join(", ")}.</p>
          )}
        </li>
        {!compact &&
          c.after.map((a) => (
            <li key={a.turnId} className="relative pb-3">
              <span aria-hidden className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-[var(--danger)] bg-[var(--bg)]" />
              <div className="flex min-w-0 items-baseline gap-2 text-xs">
                <span className="min-w-0 truncate font-medium text-[var(--fg)]">{a.agent}</span>
                <span className="shrink-0 font-mono text-[10px] uppercase text-[var(--danger)]">after the correction</span>
                <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--fg-subtle)]">{fmtOffset(first.at, a.at)}</span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[var(--fg-muted)]">{plain(a.excerpt)}</p>
            </li>
          ))}
      </ol>

      {c.link && (
        <a href={c.link} target="_blank" rel="noopener noreferrer" className="mt-auto inline-block self-start py-1 font-mono text-[11px] text-[var(--accent)] hover:underline">
          Open the correction in the village ↗
        </a>
      )}
    </article>
  );
}

export function CorrectionsView({ corrections, actors = "agents" }: { corrections: ReportCorrection[]; actors?: string }) {
  if (corrections.length === 0) {
    return (
      <p className="mx-auto max-w-[var(--measure)] py-8 text-center text-sm text-[var(--fg-muted)]">
        No value stated by three or more {actors} was later corrected in so many words (&ldquo;409 events, not 413&rdquo;). On an answer board,
        nobody corrects anybody.
      </p>
    );
  }
  return (
    <div>
      <p className="mx-auto mb-6 max-w-[var(--measure)] text-center text-sm text-[var(--fg-muted)]">
        A value three or more {actors} stated, that one of them later corrected in so many words (&ldquo;409 events, not 413&rdquo;). The trail shows how
        far the wrong value travelled before anyone checked it.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {corrections.map((c) => (
          <CorrectionCard key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
