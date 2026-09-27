import Link from "next/link";

const NAV = [
  { href: "/proof", label: "Evidence" },
  { href: "/verify", label: "Verification" },
  { href: "/demo", label: "Live Demo" },
  { href: "/lab", label: "Invariant Lab" },
] as const;

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Evidence Ledger", href: "/proof" },
      { label: "Kernel Verifier", href: "/verify" },
      { label: "Incident Console", href: "/dashboard" },
      { label: "Invariant Lab", href: "/lab" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "How It Works", href: "/onboarding" },
      { label: "Live Demo", href: "/demo" },
      { label: "Try the console", href: "/dashboard" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: "https://github.com/ayodejiades/traceturn" },
      { label: "Hackathon Brief", href: "https://swarmchasing.com/" },
    ],
  },
] as const;

export function SiteHeader() {
  return (
    <header className="relative z-20 mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-10">
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight text-white transition-opacity hover:opacity-80"
      >
        traceturn
      </Link>

      <nav aria-label="Main" className="hidden md:flex items-center gap-8">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/demo"
          className="hidden sm:inline-block text-sm font-medium text-white/80 hover:text-white px-3 py-1.5 transition-colors"
        >
          Watch demo
        </Link>
        <Link
          href="/dashboard"
          data-demo="launch-demo"
          className="rounded-full bg-[var(--accent)] px-5 py-2 text-xs font-semibold text-[var(--accent-contrast)] transition-all hover:bg-[var(--accent-dim)] hover:shadow-[0_0_16px_rgba(16,185,129,0.3)]"
        >
          Schedule a demo
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#1c2c31] text-white">
      {/* Background painted landscape artwork */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <img
          src="/footer-landscape.jpg"
          alt="Panoramic classical painted landscape with mountains, fjord, and stone watchtower"
          className="h-full w-full object-cover object-bottom"
        />
        {/* Top subtle fade from dark canvas into the deep teal sky */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-[#1c2c31]/50 to-transparent h-48"
        />
        {/* Subtle bottom shadow along the grass to keep bottom text crystal clear */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 pt-20 pb-12 sm:pt-28 sm:pb-16 flex flex-col justify-between min-h-[580px] sm:min-h-[640px]">
        {/* 3 Columns Footer Links Grid */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 max-w-2xl mb-24">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold tracking-tight text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-white/80 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar with clean circular icons without text label */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-white/90">
          <div className="flex flex-wrap items-center gap-6">
            <span>© Traceturn 2026</span>
            <Link href="/onboarding" className="text-white/80 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/verify" className="text-white/80 hover:text-white transition-colors">
              Security
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://claude.ai/new?q=Summarize+what+traceturn+does+for+deterministic+multi-agent+swarm+forensics"
              target="_blank"
              rel="noopener noreferrer"
              title="Summarize with Claude"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)]/20 backdrop-blur-md text-white transition-all hover:bg-[var(--surface)]/40 hover:scale-105"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
              </svg>
            </a>
            <a
              href="https://chatgpt.com/?q=Summarize+what+traceturn+does+for+deterministic+multi-agent+swarm+forensics"
              target="_blank"
              rel="noopener noreferrer"
              title="Summarize with ChatGPT"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)]/20 backdrop-blur-md text-white transition-all hover:bg-[var(--surface)]/40 hover:scale-105"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M20.5 10.5a4.5 4.5 0 0 0-3.5-4.4V5a5 5 0 0 0-8.8-3.2A4.5 4.5 0 0 0 4.5 5.5v1.1A4.5 4.5 0 0 0 3 14a4.5 4.5 0 0 0 3.5 4.4V19a5 5 0 0 0 8.8 3.2A4.5 4.5 0 0 0 19.5 18.5v-1.1A4.5 4.5 0 0 0 21 10a4.5 4.5 0 0 0-.5-.5z" />
              </svg>
            </a>
            <a
              href="https://gemini.google.com/app?q=Please+summarize+what+traceturn+does%2C+what+it+offers%2C+and+how+engineers+can+use+it+for+deterministic+agent+swarm+forensics"
              target="_blank"
              rel="noopener noreferrer"
              title="Summarize with Gemini"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)]/20 backdrop-blur-md text-white transition-all hover:bg-[var(--surface)]/40 hover:scale-105"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
