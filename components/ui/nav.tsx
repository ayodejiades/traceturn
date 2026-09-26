import Link from "next/link";

// A shell-prompt bar: `project@studio:~$`, not a logotype + menu.
export function Nav({ project }: { project: string }) {
  return (
    <nav className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3 font-mono text-sm">
      <Link href="/" className="text-[var(--fg)]">
        <span className="text-[var(--accent)]">{project}</span>
        <span className="text-[var(--fg-muted)]">@studio:~$</span>
      </Link>
      <div className="flex items-center gap-4 text-[var(--fg-muted)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          ./dashboard
        </Link>
      </div>
    </nav>
  );
}
