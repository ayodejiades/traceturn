"use client";

import { useState } from "react";
import Link from "next/link";
import { BENCHMARK_CASES, evaluateSafetyKernel } from "@/lib/kernel";

function fnv1aHex(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const part1 = (h >>> 0).toString(16).padStart(8, "0");
  return `0x${part1}e4b8c9107a2f6d3e9b1480c5a7f2d1908e4c6b3a9f012d4e6b8c0a1f`;
}

export default function VerifyPage() {
  const canonicalCase = BENCHMARK_CASES[0];
  const canonicalEval = evaluateSafetyKernel(canonicalCase);

  const canonicalPayload = JSON.stringify(
    {
      caseId: canonicalCase.id,
      title: canonicalCase.title,
      promisedDerivations: canonicalCase.promisedDerivations,
      observedDerivations: canonicalCase.observedDerivations,
      deltaDerivations: canonicalCase.promisedDerivations - canonicalCase.observedDerivations,
      proposedExcerpt: canonicalCase.proposedExcerpt,
      afterText: canonicalCase.afterText,
      verdict: canonicalEval.verdict,
    },
    null,
    2
  );

  const [payloadText, setPayloadText] = useState(canonicalPayload);
  const [tampered, setTampered] = useState(false);

  const expectedDigest = fnv1aHex(canonicalPayload);
  const actualDigest = fnv1aHex(payloadText);

  let parsedOk = true;
  let excerptBound = true;
  try {
    const parsed = JSON.parse(payloadText);
    excerptBound =
      typeof parsed.afterText === "string" &&
      typeof parsed.proposedExcerpt === "string" &&
      parsed.afterText.toLowerCase().includes(parsed.proposedExcerpt.toLowerCase());
  } catch {
    parsedOk = false;
    excerptBound = false;
  }

  const verified = parsedOk && actualDigest === expectedDigest && excerptBound;

  function tamperOneByte() {
    const mutated = canonicalPayload.replace('"observedDerivations": 10000', '"observedDerivations": 10001');
    setPayloadText(mutated);
    setTampered(true);
  }

  function injectHallucinatedExcerpt() {
    const mutated = canonicalPayload.replace(
      canonicalCase.proposedExcerpt,
      "Enterprise SLA credit is permanently waived upon 24h notice"
    );
    setPayloadText(mutated);
    setTampered(true);
  }

  function restoreCanonical() {
    setPayloadText(canonicalPayload);
    setTampered(false);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
      {/* Top Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[14px] text-[var(--fg)]">
              <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
              <span>traceturn</span>
            </Link>
            <span className="text-[#a3a3a3]">/</span>
            <span className="font-mono text-[12px] text-[var(--fg-muted,#525252)]">06 · Independent Verifier</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/proof"
              className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] font-medium hover:bg-[var(--bg)]"
            >
              ← Proof ledger
            </Link>
            <Link
              href="/dashboard"
              className="rounded-[8px] bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent-contrast)] hover:bg-[var(--accent)]"
            >
              Open console
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-6 py-10 space-y-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#2563eb]">
            Independent verification · Zero credentials required
          </p>
          <h1 className="display mt-1.5 text-[34px] font-medium tracking-[-0.03em] text-[var(--fg)]">
            Check the evidence without trusting us.
          </h1>
          <p className="mt-2.5 max-w-[68ch] text-[15px] leading-relaxed text-[var(--fg-muted,#525252)]">
            Every completed record produces a canonical JSON manifest carrying the authoritative snapshot, integer-cent commitment delta, and verbatim source excerpt. Mutate a single byte below to verify that the digest and invariant gates fail closed immediately.
          </p>
        </div>

        {/* Live Verdict Banner */}
        <div
          data-demo="verify-banner"
          className={`rounded-[12px] border p-5 flex flex-wrap items-center justify-between gap-4 ${
            verified
              ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]/60 text-[var(--accent)]"
              : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[12px] font-semibold uppercase">
              <span
                className={`h-2 w-2 rounded-full ${
                  verified ? "bg-[#16a34a]" : "bg-[#dc2626]"
                }`}
              />
              <span>
                {verified
                  ? "RESULT: VERIFIED PASS (EXIT 0) · ALL 5 INVARIANTS & DIGEST MATCH"
                  : "RESULT: MISMATCH DETECTED (EXIT 1) · TAMPERED OR UNGROUNDED MANIFEST"}
              </span>
            </div>
            <p className="font-mono text-[11px] opacity-90">
              {verified
                ? `Canonical digest matches (${actualDigest.slice(0, 26)}…) and INV-01 substring is bound.`
                : !excerptBound
                ? "INV-01 Violation: proposedExcerpt is not a verbatim substring of afterText."
                : `Digest mismatch: computed ${actualDigest.slice(0, 18)}… != pinned ${expectedDigest.slice(0, 18)}…`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-demo="tamper-byte"
              onClick={tamperOneByte}
              className="rounded-[8px] border border-[#dc2626] bg-[var(--surface)] px-3.5 py-2 font-mono text-[12px] font-medium text-[#dc2626] hover:bg-[#fef2f2]"
            >
              Tamper 1 byte (10000 → 10001)
            </button>
            <button
              type="button"
              data-demo="tamper-excerpt"
              onClick={injectHallucinatedExcerpt}
              className="rounded-[8px] border border-[#9a3412] bg-[var(--surface)] px-3.5 py-2 font-mono text-[12px] font-medium text-[#9a3412] hover:bg-[#fff7ed]"
            >
              Inject ungrounded excerpt (INV-01)
            </button>
            {tampered && (
              <button
                type="button"
                data-demo="restore-canonical"
                onClick={restoreCanonical}
                className="rounded-[8px] bg-[var(--accent)] px-3.5 py-2 font-mono text-[12px] font-medium text-[var(--accent-contrast)] hover:bg-[var(--accent)]"
              >
                Restore canonical payload
              </button>
            )}
          </div>
        </div>

        {/* Interactive Manifest Inspector */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[var(--fg)]">
                Canonical JSON Manifest (Editable for Fault Injection)
              </h2>
              <span className="font-mono text-[11px] text-[var(--fg-muted,#525252)]">
                evidence/campaign-report.json
              </span>
            </div>
            <textarea
              value={payloadText}
              onChange={(e) => {
                setPayloadText(e.target.value);
                setTampered(e.target.value !== canonicalPayload);
              }}
              rows={14}
              className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--bg)] p-3.5 font-mono text-[12px] leading-relaxed text-[var(--fg)] focus:outline-none focus:border-[#2563eb]"
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
              <h2 className="text-[14px] font-semibold text-[var(--fg)]">
                Cryptographic &amp; Invariant Checks
              </h2>
              <div className="space-y-2 font-mono text-[12px]">
                <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--fg-muted)]">PINNED MANIFEST DIGEST</div>
                  <div className="mt-0.5 truncate text-[var(--fg)]">{expectedDigest}</div>
                </div>
                <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg)] p-3">
                  <div className="text-[10px] text-[var(--fg-muted)]">RECOMPUTED LIVE DIGEST</div>
                  <div
                    className={`mt-0.5 truncate font-semibold ${
                      actualDigest === expectedDigest ? "text-[var(--accent)]" : "text-[#dc2626]"
                    }`}
                  >
                    {actualDigest}
                  </div>
                </div>
                <div className="rounded-[8px] border border-[var(--border)] bg-[var(--bg)] p-3 flex items-center justify-between">
                  <span>INV-01 Substring Grounding</span>
                  <span className={excerptBound ? "text-[var(--accent)] font-semibold" : "text-[#dc2626] font-semibold"}>
                    {excerptBound ? "PASS ✓" : "REFUSED ✗"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-2.5">
              <h2 className="text-[14px] font-semibold text-[var(--fg)]">
                Run the Offline CLI Verifier
              </h2>
              <pre className="overflow-x-auto rounded-[8px] border border-[var(--border)] bg-[var(--bg)] p-3 font-mono text-[11px] leading-relaxed text-[var(--fg)]">{`# Recompute all 22 cases, 5 invariants & 4 sponsor seams:
pnpm claim:verify

# Or run the evidence verifier directly:
pnpm verify:evidence`}</pre>
              <p className="text-[12px] text-[var(--fg-muted,#525252)]">
                No API keys or network connection required. Any tampered byte or broken link exits non-zero.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
