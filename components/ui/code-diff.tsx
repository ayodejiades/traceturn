"use client";

import { useState } from "react";

export function CodeDiff({
  title = "Payload Inspection & Sanitization Diff",
  beforeTitle = "Untrusted Client Input",
  afterTitle = "Verified AST Output",
  beforeCode = `// Incoming raw payload
{
  "user_id": "usr_99812",
  "intent": "withdraw",
  "amount_wei": "10000000000000000000",
  "recipient": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "bypass_auth": true // [INJECTION ATTEMPT]
}`,
  afterCode = `// Deterministic sanitized payload
{
  "user_id": "usr_99812",
  "intent": "withdraw",
  "amount_wei": "10000000000000000000",
  "recipient": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "auth_verified": true,
  "signature_r": "0x3f8a...e12a",
  "sanitized_at": 1727134200
}`,
}: {
  title?: string;
  beforeTitle?: string;
  afterTitle?: string;
  beforeCode?: string;
  afterCode?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(afterCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-xl font-mono text-xs">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-[var(--page-pad)] py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--warn)/80]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent-dim)/80]" />
          </div>
          <span className="ml-2 font-medium text-[var(--fg)]">{title}</span>
        </div>

        <button
          onClick={handleCopy}
          className="rounded border border-[var(--border)] bg-[var(--surface-raised)] px-2.5 py-1 text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
        >
          {copied ? "Copied" : "Copy Output"}
        </button>
      </div>

      {/* Split Code View */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
        {/* Left: Before */}
        <div className="flex flex-col bg-red-950/5 p-4">
          <div className="flex items-center justify-between text-[11px] text-red-400 font-semibold mb-2">
            <span>{beforeTitle}</span>
            <span className="rounded bg-red-900/30 px-1.5 py-0.5 border border-red-800/40 text-[10px]">
              RAW / UNCHECKED
            </span>
          </div>
          <pre className="overflow-x-auto text-[var(--fg-muted)] leading-relaxed">
            <code>{beforeCode}</code>
          </pre>
        </div>

        {/* Right: After */}
        <div className="flex flex-col bg-[color-mix(in srgb, var(--accent) 10%, transparent)/5] p-4">
          <div className="flex items-center justify-between text-[11px] text-[var(--accent)] font-semibold mb-2">
            <span>{afterTitle}</span>
            <span className="rounded bg-[color-mix(in srgb, var(--accent) 18%, transparent)/30] px-1.5 py-0.5 border border-[color-mix(in srgb, var(--accent) 30%, transparent)/40] text-[10px]">
              VERIFIED / SANITIZED
            </span>
          </div>
          <pre className="overflow-x-auto text-[var(--accent)/90] leading-relaxed">
            <code>{afterCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
