import Link from "next/link";

const STAGES = [
  { n: "01", label: "Overview", href: "/" },
  { n: "02", label: "Onboarding", href: "/onboarding" },
  { n: "03", label: "Guided Demo", href: "/demo" },
  { n: "04", label: "Console", href: "/dashboard" },
  { n: "05", label: "Proof", href: "/proof" },
  { n: "06", label: "Verify", href: "/verify" },
] as const;

/**
 * The six-step progress strip shared by /onboarding and /demo.
 *
 * Six labels plus separators cannot fit a 390px viewport, so the strip scrolls
 * horizontally inside its own box. Without `overflow-x-auto` the page itself
 * scrolls sideways, which breaks the layout everywhere on mobile.
 */
export function StageStrip({ current }: { current: string }) {
  return (
    <nav
      aria-label="Progress"
      // min-w-0 is required: a flex item defaults to min-width:auto, so without
      // it the strip refuses to shrink below its content width and pushes the
      // whole page sideways instead of scrolling inside its own box.
      className="flex min-w-0 items-center gap-3 overflow-x-auto text-[var(--fg-muted)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {STAGES.map((stage, i) => (
        <span key={stage.n} className="flex shrink-0 items-center gap-3">
          {i > 0 && (
            <span aria-hidden className="shrink-0">
              &rarr;
            </span>
          )}
          <Link
            href={stage.href}
            aria-current={stage.n === current ? "page" : undefined}
            className={
              stage.n === current
                ? "shrink-0 font-semibold text-[var(--info)]"
                : "shrink-0 transition-colors hover:text-[var(--fg)]"
            }
          >
            {stage.n} {stage.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
