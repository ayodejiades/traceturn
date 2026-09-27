import Link from "next/link";

const NAV = [
  { href: "/proof", label: "Evidence" },
  { href: "/verify", label: "Verify" },
  { href: "/demo", label: "Demo" },
  { href: "/lab", label: "Lab" },
] as const;

const FOOTER = [
  { href: "/proof", label: "Evidence ledger" },
  { href: "/verify", label: "Tamper verifier" },
  { href: "/dashboard", label: "Workspace" },
  { href: "/onboarding", label: "How it works" },
  { href: "https://github.com/ayodejiades/traceturn", label: "GitHub" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[var(--content-max)] items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
          />
          traceturn
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius-sm)] px-3 py-1.5 text-sm text-[var(--fg-muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--fg)]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            data-demo="launch-demo"
            className="ml-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-3.5 py-1.5 text-sm font-medium text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-dim)]"
          >
            Open console
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--fg-subtle)]">
          <span className="font-medium text-[var(--fg-muted)]">traceturn</span>
          <span aria-hidden>·</span>
          <span>Deterministic forensics for AI agent swarms</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {FOOTER.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
