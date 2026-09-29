import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-shell";
import { PageHero, Section } from "@/components/page-hero";
import { Verifier, type PinnedManifest } from "@/components/verifier";
import { CORPORA, type CorpusId } from "@/lib/evidence";
import { episodeManifest } from "@/lib/report";
import { canonicalJson, sha256Hex } from "@/lib/sha256";

export const metadata: Metadata = {
  title: "Verify a verdict",
  description: "Re-derive an AI Village verdict from its manifest in your browser, then change one field and watch it fail.",
};

// Pinned on the server from the committed reports; the client recomputes independently.
const PINNED: PinnedManifest[] = (Object.keys(CORPORA) as CorpusId[]).flatMap((c) =>
  CORPORA[c].report.episodes.map((e) => {
    const manifest = episodeManifest(e);
    return { key: `${c}:${e.id}`, corpus: CORPORA[c].name, file: `evidence/${c}-report.json`, manifest, digest: sha256Hex(canonicalJson(manifest)) };
  }),
);

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ ep?: string; corpus?: string }> }) {
  const { ep, corpus } = await searchParams;
  const initialKey = `${corpus === "collusion" ? "collusion" : "aivillage"}:${ep ?? "EP-0001"}`;
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PageHero
        eyebrow="Verify · no account, no network"
        title="Check a verdict without trusting us"
        lede="Each verdict ships with a manifest: the origin sentence, its source, the counts and the verdict. Your browser recomputes the digest and re-runs the kernel. Change one field and it fails."
      />
      <main id="main" className="relative z-10">
        <Section>
          <Verifier pinned={PINNED} initialKey={initialKey} />
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
