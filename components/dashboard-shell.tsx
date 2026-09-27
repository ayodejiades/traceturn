"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    label: "Investigation",
    items: [
      { href: "/dashboard", label: "Case overview", badge: "LIVE" },
      { href: "/dashboard/create", label: "Lineage simulator", badge: "NEW" },
      { href: "/dashboard/items", label: "Recorded claims", badge: "07" },
    ],
  },
  {
    label: "Kernel",
    items: [
      { href: "/dashboard/operator", label: "Blame & authority", badge: "GATE" },
      { href: "/dashboard/sponsors", label: "Sponsor ablation", badge: "SEAMS" },
      { href: "/lab", label: "Invariant workbench", badge: "RULES" },
    ],
  },
  {
    label: "Evidence",
    items: [
      { href: "/proof", label: "Evidence ledger", badge: "PASS" },
      { href: "/verify", label: "Tamper verifier", badge: "SHA-256" },
      { href: "/demo", label: "Walkthrough", badge: "DEMO" },
    ],
  },
];

export function DashboardShell({
  project,
  children,
}: {
  project?: string;
  children: ReactNode;
}) {
  const pathname = usePathname() || "/dashboard";
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-elevated)] text-[var(--fg)] antialiased">
      {/* Top Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-[var(--page-pad)] py-2.5">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="relative inline-grid h-3.5 w-3.5 place-items-center" aria-hidden>
                <span className="absolute inset-0 rounded-full border border-[var(--info)]/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--info)]" />
              </span>
              <span className="text-[14px] font-semibold tracking-[-0.01em] text-[var(--bg)]">
                {project || "Operations Console"}
              </span>
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-2.5 py-0.5 font-mono text-[11px] font-medium text-[var(--accent)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
              Verifier PASS · Invariants Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[12px] font-medium text-[var(--fg-muted)] hover:bg-[var(--surface-raised)]"
            >
              <span>Quick jump</span>
              <kbd className="rounded border border-[var(--border-strong)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--fg-muted)]">
                ⌘K
              </kbd>
            </button>
            <Link
              href="/proof"
              className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[12px] font-medium text-[var(--fg)] hover:bg-[var(--bg-elevated)]"
            >
              Proof Ledger
            </Link>
            <Link
              href="/verify"
              className="rounded-[8px] bg-[var(--accent)] px-3 py-1 text-[12px] font-medium text-[var(--accent-contrast)] hover:bg-[var(--accent)]"
            >
              Verify Receipts
            </Link>
          </div>
        </div>
      </header>

      {/* Horizontal section nav — replaces the sidebar */}
      <nav
        aria-label="Sections"
        className="sticky top-[calc(3.5rem+1px)] z-30 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur"
      >
        <div className="mx-auto flex max-w-[var(--content-max)] items-center gap-1 overflow-x-auto px-[var(--page-pad)] py-2">
          {NAV_GROUPS.flatMap((group) => group.items).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-[var(--radius-sm)] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--accent)]"
                    : "text-[var(--fg-muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[var(--content-max)] px-[var(--page-pad)] py-8">
        {children}
      </main>

      {/* ⌘K Command Modal */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-[var(--accent)]/30 pt-20 px-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-3">
              <span className="text-[13px] font-semibold text-[var(--fg)]">
                Quick Jump Navigation
              </span>
              <button
                type="button"
                onClick={() => setCmdOpen(false)}
                className="font-mono text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg)]"
              >
                ESC
              </button>
            </div>
            <div className="grid gap-1 max-h-80 overflow-y-auto">
              {NAV_GROUPS.flatMap((g) => g.items).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setCmdOpen(false)}
                  className="flex items-center justify-between rounded-[8px] px-3 py-2 text-[13px] text-[var(--fg)] hover:bg-[var(--bg-elevated)]"
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-[11px] text-[var(--info)]">{item.href}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
