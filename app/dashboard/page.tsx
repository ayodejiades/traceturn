import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-shell";
import { PageHero, Section, SectionHead } from "@/components/page-hero";
import { Workspace } from "@/components/workspace";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Drop a multi-agent JSONL transcript and trace every repeated claim, in your browser.",
};

const FORMATS = [
  {
    name: "AI Village chat",
    shape: "chat_messages.jsonl.gz (+ agents.jsonl.gz for names)",
    note: "The file the findings page was built from. Takes about half a minute in the browser.",
  },
  {
    name: "AI Village events",
    shape: "events.jsonl.gz, AGENT_TALK rows",
    note: "Same messages as chat, from the activity timeline.",
  },
  {
    name: "Any agent log",
    shape: '{"agent", "content", "timestamp", "room"?}',
    note: "Also reads speaker/author/name, text/message/body, ts/time/created_at. user/human rows are kept but never blamed.",
  },
];

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PageHero
        eyebrow="Workspace · runs offline"
        title="Trace the claims in your own transcript"
        lede="The same engine that produced the AI Village findings, running in this tab. Drop a log, or start with the sample."
      />
      <main id="main" className="relative z-10">
        <Section>
          <Workspace />
        </Section>
        <Section band>
          <SectionHead eyebrow="Accepted formats" title="What the workspace reads" />
          <div className="grid gap-4 md:grid-cols-3">
            {FORMATS.map((f) => (
              <div key={f.name} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="text-base font-semibold text-[var(--fg)]">{f.name}</div>
                <code className="mt-2 block font-mono text-[11px] text-[var(--accent)]">{f.shape}</code>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fg-muted)]">{f.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-[var(--fg-muted)]">
            Prefer the command line?{" "}
            <code className="text-[var(--fg)]">pnpm analyze path/to/log.jsonl</code> writes the same report to{" "}
            <code className="text-[var(--fg)]">evidence/</code>. See{" "}
            <Link href="/proof#sources" className="text-[var(--accent)] underline underline-offset-2">
              provenance
            </Link>
            .
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
