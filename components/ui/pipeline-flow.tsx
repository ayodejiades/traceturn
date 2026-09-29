/**
 * The analysis pipeline as a row of stages. Static on purpose: every stage is a pure
 * function that has already run, so there is nothing "processing" to animate.
 */
export interface PipelineStage {
  id: string;
  name: string;
  /** Where the stage lives in the repo. */
  code: string;
  detail: string;
  /** A real count produced by this stage, e.g. "183,483 turns". */
  metric: string;
}

export function PipelineFlow({ stages }: { stages: PipelineStage[] }) {
  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 lg:grid-flow-col lg:grid-cols-none lg:auto-cols-fr">
      {stages.map((s, i) => (
        <li key={s.id} className="flex flex-col bg-[var(--surface)] p-5">
          <div className="flex items-baseline justify-between gap-2 font-mono text-[11px]">
            <span className="text-[var(--fg-subtle)]">{String(i + 1).padStart(2, "0")}</span>
            <span className="tnum text-[var(--accent)]">{s.metric}</span>
          </div>
          <div className="mt-3 text-base font-semibold tracking-tight text-[var(--fg)]">{s.name}</div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{s.detail}</p>
          <code className="mt-auto pt-4 font-mono text-[11px] text-[var(--fg-subtle)]">{s.code}</code>
        </li>
      ))}
    </ol>
  );
}
