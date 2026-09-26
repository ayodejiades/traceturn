"use client";

import { useEffect, useState } from "react";

// A pinned log line with a blinking prompt caret — reads like the tail of a
// terminal, not a floating notification card.
export function Toast({ message, durationMs = 3000 }: { message: string; durationMs?: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), durationMs);
    return () => clearTimeout(t);
  }, [durationMs]);
  if (!visible) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 rounded-none border border-[var(--accent)] bg-[var(--surface)] px-4 py-2 font-mono text-sm text-[var(--fg)]"
    >
      <span className="animate-pulse text-[var(--accent)]" aria-hidden="true">
        ▌
      </span>{" "}
      {message}
    </div>
  );
}
