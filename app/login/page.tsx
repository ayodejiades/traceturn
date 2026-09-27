import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-shell";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--fg)]">
      <SiteHeader />
      <main id="main" className="flex flex-1 items-center justify-center px-[var(--page-pad)] py-20">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">
              No account needed
            </h1>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">
              The console runs locally against committed fixtures. Nothing to sign in to.
            </p>
          </div>

          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
            <Link
              href="/dashboard"
              data-demo="judge-login"
              className="flex w-full items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] px-[var(--page-pad)] py-3 text-sm font-medium text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-dim)]"
            >
              Open the console
            </Link>
            <div className="mt-4 space-y-2 text-center text-xs text-[var(--fg-subtle)]">
              <p>13 fixtures · no API key · no network</p>
              <p>
                <Link href="/proof" className="hover:text-[var(--accent)]">
                  Read the evidence
                </Link>
                {" · "}
                <Link href="/verify" className="hover:text-[var(--accent)]">
                  Run the verifier
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
