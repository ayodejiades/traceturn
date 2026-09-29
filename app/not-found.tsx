import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-shell";

export const metadata = {
  title: "Not found",
  description: "That page does not exist.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-[var(--content-max)] px-6 py-24">
          <p className="tnum mb-4 text-sm text-[var(--fg-subtle)]">404</p>
          <h1 className="h-display mb-4 max-w-2xl text-4xl sm:text-5xl">
            No turn at that address.
          </h1>
          <p className="prose-measure mb-9 text-base">
            The page you asked for is not part of the investigation. The evidence ledger and the
            verification suite are both one click away.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-[var(--radius-sm)] bg-[var(--accent-fill)] px-5 py-2.5 text-sm font-medium text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-dim)]"
            >
              Back to overview
            </Link>
            <Link
              href="/proof"
              className="rounded-[var(--radius-sm)] border border-[var(--border-strong)] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--fg-subtle)] hover:bg-[var(--surface)]"
            >
              Evidence ledger
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}