import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-shell";

/**
 * The painted hero every page opens with. The landing page uses the tall variant;
 * inner pages use the short one, so a visitor moving from / to /proof keeps the same
 * header, the same painting and the same type, only less of it.
 *
 * Both scrims are the warm canvas colour (see DESIGN.md "Why the canvas is warm"):
 * the vertical one dissolves the painting into the page, the horizontal one keeps the
 * nav legible against a bright sky.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  size = "short",
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  size?: "tall" | "short";
}) {
  const tall = size === "tall";
  return (
    <div className="relative">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${
          tall ? "h-[640px] sm:h-[780px] md:h-[860px]" : "h-[420px] sm:h-[460px]"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative, above the fold, sized by CSS */}
        <img src="/hero-landscape.jpg" alt="" className="h-full w-full object-cover object-top" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: tall
              ? "linear-gradient(to bottom, rgba(16,13,10,0) 0%, rgba(16,13,10,0.06) 30%, rgba(16,13,10,0.34) 52%, rgba(16,13,10,0.72) 74%, rgba(16,13,10,0.94) 90%, var(--bg) 100%)"
              : "linear-gradient(to bottom, rgba(16,13,10,0.25) 0%, rgba(16,13,10,0.55) 45%, rgba(16,13,10,0.9) 80%, var(--bg) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(16,13,10,0.58) 0%, rgba(16,13,10,0.14) 20%, rgba(16,13,10,0) 40%, rgba(16,13,10,0.10) 66%, rgba(16,13,10,0.45) 100%)",
          }}
        />
      </div>

      <SiteHeader />

      <section
        className={`relative z-10 px-[var(--page-pad)] text-center ${
          tall ? "pb-10 pt-28 sm:pb-14 sm:pt-32 md:pt-36" : "pb-12 pt-14 sm:pb-16 sm:pt-20"
        }`}
      >
        <div className="mx-auto max-w-[var(--measure)]">
          {eyebrow && (
            <div className="eyebrow mb-4 text-white/80 [text-shadow:0_1px_10px_rgba(16,13,10,0.9)]">{eyebrow}</div>
          )}
          <h1
            className={`h-display font-semibold tracking-tight text-white text-balance ${
              tall ? "text-4xl leading-[1.08] sm:text-6xl md:text-[4.25rem]" : "text-3xl leading-[1.1] sm:text-5xl"
            }`}
          >
            {title}
          </h1>
          {lede && (
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white text-pretty [text-shadow:0_1px_12px_rgba(16,13,10,0.9)] sm:text-lg">
              {lede}
            </p>
          )}
          {children}
        </div>
      </section>
    </div>
  );
}

/** Section heading in the landing page's shape: eyebrow, heading, one line of prose. */
export function SectionHead({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto mb-10 max-w-[var(--measure)] text-center">
      <div className="eyebrow mb-2">{eyebrow}</div>
      <h2 className="h-section text-3xl font-semibold tracking-tight text-[var(--fg)] sm:text-4xl">{title}</h2>
      {lede && <p className="mt-3 text-sm leading-relaxed text-[var(--fg-muted)] sm:text-base">{lede}</p>}
      {children}
    </div>
  );
}

/** Page section. `band` is the elevated full-bleed strip the landing page alternates with. */
export function Section({
  id,
  band = false,
  children,
}: {
  id?: string;
  band?: boolean;
  children: ReactNode;
}) {
  const inner = <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-pad)] py-14 sm:py-16">{children}</div>;
  return band ? (
    <section id={id} className="scroll-mt-6 border-y border-[var(--border)] bg-[var(--bg-elevated)]">
      {inner}
    </section>
  ) : (
    <section id={id} className="scroll-mt-6">
      {inner}
    </section>
  );
}

/** The two button styles the landing page uses, so every page's calls to action match. */
export const BTN_PRIMARY =
  "inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-dim)]";
export const BTN_SECONDARY =
  "inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--fg)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-raised)]";
export const BTN_GHOST_ON_ART =
  "inline-flex items-center justify-center rounded-full border border-white/25 bg-[var(--bg)]/50 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:border-white/45 hover:bg-[var(--bg)]/70";
