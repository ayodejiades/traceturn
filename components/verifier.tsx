"use client";

import { useMemo, useState } from "react";
import { CodeDiff } from "@/components/ui/code-diff";
import { rederive, type EpisodeManifest } from "@/lib/report";
import { canonicalJson, sha256Hex } from "@/lib/sha256";
import { STATE, TONE_TEXT, fmtClaim } from "@/lib/tones";

export interface PinnedManifest {
  /** Corpus-qualified id: episode ids repeat across reports. */
  key: string;
  corpus: string;
  file: string;
  manifest: EpisodeManifest;
  digest: string;
}

const pretty = (m: unknown) => JSON.stringify(JSON.parse(canonicalJson(m)), null, 2);

interface Check {
  id: string;
  label: string;
  pass: boolean;
  detail: string;
}

function evaluate(text: string, pinned: PinnedManifest): { checks: Check[]; ok: boolean } {
  let m: EpisodeManifest;
  try {
    m = JSON.parse(text);
  } catch (e) {
    return {
      ok: false,
      checks: [{ id: "parse", label: "Manifest parses", pass: false, detail: (e as Error).message }],
    };
  }
  const digest = sha256Hex(canonicalJson(m));
  const d = rederive(m);
  const checks: Check[] = [
    {
      id: "digest",
      label: "Digest matches the pinned one",
      pass: digest === pinned.digest,
      detail: `sha256 ${digest.slice(0, 16)}… vs pinned ${pinned.digest.slice(0, 16)}…`,
    },
    {
      id: "inv1",
      label: "Excerpt appears verbatim in the source (INV-1)",
      pass: d.excerptBound || m.source === null,
      detail: d.excerptBound ? "bound" : m.source === null ? "human origin: kernel abstains" : "not found in source: kernel fails closed",
    },
    {
      id: "rederive",
      label: "Kernel re-derives the stated verdict",
      pass: d.state === m.verdict,
      detail: `stated ${m.verdict} · derived ${d.state}`,
    },
  ];
  return { checks, ok: checks.every((c) => c.pass) };
}

export function Verifier({ pinned, initialKey }: { pinned: PinnedManifest[]; initialKey?: string }) {
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

  const mutate = (label: string, fn: (m: EpisodeManifest) => void) => {
    const m = JSON.parse(original) as EpisodeManifest;
    fn(m);
    setText(pretty(m));
    setLastTamper(label);
  };

  const { checks, ok } = evaluate(text, current);
  const state = STATE[current.manifest.verdict];

  const TAMPERS = [
    {
      label: "Add one more echo",
      help: "promisedDerivations + 1",
      run: () => mutate("Add one more echo", (m) => (m.promisedDerivations += 1)),
    },
    {
      label: "Rewrite who checked",
      help: "observed ↔ promised",
      run: () =>
        mutate("Rewrite who checked", (m) => {
          m.observedDerivations = m.observedDerivations === m.promisedDerivations ? 1 : m.promisedDerivations;
        }),
    },
    {
      label: "Paraphrase the excerpt",
      help: "same meaning, different words",
      run: () =>
        mutate("Paraphrase the excerpt", (m) => {
          const words = (m.excerpt ?? "").split(" ");
          m.excerpt = words.length > 3 ? [words[1], words[0], ...words.slice(2)].join(" ") : `${m.excerpt} (paraphrased)`;
        }),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div
        role="status"
        aria-live="polite"
        data-demo="verify-result"
        className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${
          ok
            ? "border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent)_8%,transparent)]"
            : "border-[color-mix(in_oklab,var(--danger)_40%,transparent)] bg-[var(--danger-surface)]"
        }`}
      >
        <div>
          <div className={`text-base font-semibold ${ok ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
            {ok ? "Verified: matches the committed report" : "Rejected: this manifest was changed"}
          </div>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            {ok
              ? "Digest, source binding and verdict all re-derive. `pnpm claim:verify` exits 0."
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
            <span className="eyebrow">Episode</span>
            <select
              value={id}
              onChange={(e) => select(e.target.value)}
              className="w-full min-w-0 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--fg)]"
            >
              {[...new Set(pinned.map((p) => p.corpus))].map((corpus) => (
                <optgroup key={corpus} label={corpus}>
                  {pinned
                    .filter((p) => p.corpus === corpus)
                    .map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.manifest.id} · “{fmtClaim(p.manifest.claim)}” · {STATE[p.manifest.verdict].label}
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
              data-demo="verify-manifest"
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-4 font-mono text-[12px] leading-relaxed text-[var(--fg)]"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {TAMPERS.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={t.run}
                data-demo={`tamper-${t.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-left text-sm text-[var(--fg)] transition-colors hover:border-[var(--danger)]"
              >
                {t.label} <span className="font-mono text-[11px] text-[var(--fg-subtle)]">{t.help}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:col-span-5">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="eyebrow mb-1">Committed verdict</div>
            <div className={`text-lg font-semibold ${TONE_TEXT[state.tone]}`}>{state.label}</div>
            <div className="font-mono text-[11px] text-[var(--fg-subtle)]">{current.manifest.verdict}</div>
            <ul className="mt-4 divide-y divide-[var(--border)] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)]">
              {checks.map((c) => (
                <li key={c.id} className="px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[var(--fg)]">{c.label}</span>
                    <span className={`font-mono text-[11px] ${c.pass ? "text-[var(--accent)]" : "text-[var(--danger)]"}`}>
                      {c.pass ? "PASS" : "FAIL"}
                    </span>
                  </div>
                  <div className="mt-0.5 break-all font-mono text-[10px] text-[var(--fg-subtle)]">{c.detail}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="eyebrow mb-2">Same checks, offline</div>
            <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-[var(--fg-muted)]">
{`pnpm claim:verify
# re-derives every AI Village total from the ledger,
# re-runs every pinned manifest, runs all fixtures;
# exits 1 on any drift`}
            </pre>
          </div>
        </div>
      </div>

      <CodeDiff beforeTitle={`Pinned in ${current.file}`} afterTitle="What you are verifying" beforeCode={original} afterCode={text} />
    </div>
  );
}
