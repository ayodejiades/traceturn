import Link from "next/link";

const NAV = [
  { href: "/proof", label: "Evidence" },
  { href: "/verify", label: "Verify" },
  { href: "/demo", label: "Demo" },
  { href: "/lab", label: "Lab" },
] as const;

const FOOTER_GROUPS = [
  {
    label: "Product",
    links: [
      { href: "/proof", label: "Evidence" },
      { href: "/verify", label: "Verify" },
      { href: "/dashboard", label: "Workspace" },
      { href: "/lab", label: "Lab" },
    ],
  },
  {
    label: "Learn",
    links: [
      { href: "/onboarding", label: "How it works" },
      { href: "/demo", label: "Demo" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "https://github.com/ayodejiades/traceturn", label: "GitHub" },
      { href: "https://swarmchasing.com/", label: "Hackathon" },
    ],
  },
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
      <div className="mx-auto grid max-w-[var(--content-max)] gap-10 px-[var(--page-pad)] py-14 sm:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            traceturn
          </div>
          <p className="mt-3 max-w-[24ch] text-sm text-[var(--fg-muted)]">
            Deterministic forensics for AI agent swarms.
          </p>
        </div>

        {FOOTER_GROUPS.map((g) => (
          <div key={g.label}>
            <div className="eyebrow mb-3">{g.label}</div>
            <ul className="space-y-2">
              {g.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-wrap items-center justify-between gap-3 px-[var(--page-pad)] py-5 text-[13px] text-[var(--fg-subtle)]">
          <span>© 2026 traceturn</span>
          <span>MIT licensed</span>
        </div>
      </div>
    </footer>
  );
}
