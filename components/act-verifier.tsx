"use client";

import { useMemo, useState } from "react";
import { CodeDiff } from "@/components/ui/code-diff";
import { rederiveAct, type ActManifest } from "@/lib/report";
import { canonicalJson, sha256Hex } from "@/lib/sha256";
import { fmtClaim } from "@/lib/tones";

export interface PinnedAct {
  /** Corpus-qualified id: act ids repeat across reports. */
  key: string;
  corpus: string;
  file: string;
  manifest: ActManifest;
  digest: string;
}

const pretty = (m: unknown) => JSON.stringify(JSON.parse(canonicalJson(m)), null, 2);

const GROUNDING_LABEL: Record<string, string> = {
  AFTER_CORRECTION: "after the correction",
  UNGROUNDED: "no reported check",
  GROUNDED: "grounded",
};

interface Check {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
}

function evaluate(text: string, pinned: PinnedAct): { checks: Check[]; ok: boolean } {
  let m: ActManifest;
  try {
    m = JSON.parse(text);
  } catch (e) {
    return { ok: false, checks: [{ id: "parse", label: "Manifest parses", pass: false, detail: (e as Error).message }] };
  }
  const digest = sha256Hex(canonicalJson(m));
  const d = rederiveAct(m);
  const checks: Check[] = [
    {
      id: "digest",
      label: "Digest matches the pinned one",
      pass: digest === pinned.digest,
      detail: `sha256 ${digest.slice(0, 16)}… vs pinned ${pinned.digest.slice(0, 16)}…`,
    },
    {
      id: "inv1",
      label: "Excerpt appears verbatim in the source record (INV-1)",
      pass: d.decision.excerptBound,
      detail: d.decision.excerptBound ? "bound" : "not found in source: kernel fails closed",
    },
    {
      id: "grounding",
      label: "Grounding re-derives from observers and correction time",
      pass: d.grounding === m.grounding,
      detail: `stated ${m.grounding} · derived ${d.grounding}`,
    },
    {
      id: "verdict",
      label: "Kernel re-derives the stated verdict",
      pass: d.decision.state === m.verdict,
      detail: `stated ${m.verdict} · derived ${d.decision.state}`,
    },
  ];
  return { checks, ok: checks.every((c) => c.pass) };
}

export function ActVerifier({ pinned, initialKey }: { pinned: PinnedAct[]; initialKey?: string }) {
  const [id, setId] = useState(pinned.find((p) => p.key === initialKey)?.key ?? pinned[0].key);
  const current = pinned.find((p) => p.key === id)!;
  const original = useMemo(() => pretty(current.manifest), [current]);
  const [text, setText] = useState(original);
  const [lastTamper, setLastTamper] = useState<string | null>(null);

  const select = (next: string) => {
    const p = pinned.find((x) => x.key === next)!;
    setId(next);
    setText(pretty(p.manifest));
    setLastTamper(null);
  };

  const mutate = (label: string, fn: (m: ActManifest) => void) => {
    const m = JSON.parse(original) as ActManifest;
    fn(m);
    setText(pretty(m));
    setLastTamper(label);
  };

  const { checks, ok } = evaluate(text, current);

  const TAMPERS = [
    {
      label: "Pretend someone checked it first",
      help: "observers + 1, drop the correction",
      run: () =>
        mutate("Pretend someone checked it first", (m) => {
          m.observers += 1;
          m.correctedAt = null;
        }),
    },
    {
      label: "Move the correction later",
      help: "correctedAt after the act",
      run: () =>
        mutate("Move the correction later", (m) => {
          m.correctedAt = new Date(Date.parse(m.at) + 3600_000).toISOString();
        }),
    },
    {
      label: "Edit the excerpt",
      help: "change one word",
      run: () =>
        mutate("Edit the excerpt", (m) => {
          const words = m.excerpt.split(" ");
          m.excerpt = words.length > 3 ? [words[1], words[0], ...words.slice(2)].join(" ") : `${m.excerpt} (edited)`;
        }),
    },
  ];

  return (
    <div className="flex flex-col gap-6" data-demo="act-verifier">
      <div
        role="status"
        aria-live="polite"
        data-demo="act-verify-result"
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${
          ok
            ? "border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]"
            : "border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[var(--danger-surface)]"
        }`}
      >
        <div>
          <div className={`text-base font-semibold ${ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
            {ok ? "Verified: this act matches the committed report" : "Rejected: this act was changed"}
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {ok
              ? "Digest, source binding, grounding and verdict all re-derive. `pnpm claim:verify` exits 0."
              : `${lastTamper ? `“${lastTamper}” ` : "Your edit "}broke ${checks.filter((c) => !c.pass).length} of ${checks.length} checks. \`pnpm claim:verify\` would exit 1.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => select(id)}
          disabled={text === original}
          className="rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--accent)] disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-7">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Act</span>
            <select
              value={id}
              onChange={(e) => select(e.target.value)}
              data-demo="act-select"
              className="w-full min-w-0 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)]"
            >
              {[...new Set(pinned.map((p) => p.corpus))].map((corpus) => (
                <optgroup key={corpus} label={corpus}>
                  {pinned
                    .filter((p) => p.corpus === corpus)
                    .map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.manifest.id} · {p.manifest.agent} · “{fmtClaim(p.manifest.claim)}” · {GROUNDING_LABEL[p.manifest.grounding]}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Manifest (editable)</span>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setLastTamper(null);
              }}
              spellCheck={false}
              rows={14}
              data-demo="act-manifest"
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4 font-mono text-[12px] leading-relaxed text-[var(--fg)]"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {TAMPERS.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={t.run}
                data-demo={`act-tamper-${t.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:border-[var(--danger)]"
              >
                {t.label} <span className="font-mono text-[11px] text-[var(--fg-subtle)]">{t.help}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="eyebrow mb-1">Committed grade</div>
            <div className="text-lg font-semibold text-[var(--fg)]">{GROUNDING_LABEL[current.manifest.grounding]}</div>
            <div className="font-mono text-[11px] text-[var(--fg-subtle)]">
              {current.manifest.grounding} · {current.manifest.observers} observer{current.manifest.observers === 1 ? "" : "s"}
              {current.manifest.correctedAt ? " · corrected before or after" : ""}
            </div>
            <ul className="mt-4 divide-y divide-[var(--border)] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)]">
              {checks.map((c) => (
                <li key={c.id} className="px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[var(--fg)]">{c.label}</span>
                    <span className={`font-mono text-[11px] ${c.pass ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>{c.pass ? "PASS" : "FAIL"}</span>
                  </div>
                  <div className="mt-0.5 break-all font-mono text-[10px] text-[var(--fg-subtle)]">{c.detail}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="eyebrow mb-2">What is re-derived</div>
            <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
              An act is grounded only if an agent had reported checking the claim by then. A correction earlier than the act overrides that. Both come from the
              manifest itself, so a changed observer count or correction time no longer matches the stated grade.
            </p>
          </div>
        </div>
      </div>

      <CodeDiff beforeTitle={`Pinned in ${current.file}`} afterTitle="What you are verifying" beforeCode={original} afterCode={text} />
    </div>
  );
}
