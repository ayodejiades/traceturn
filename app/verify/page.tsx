import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-shell";
import { PageHero, Section, SectionHead } from "@/components/page-hero";
import { Verifier, type PinnedManifest } from "@/components/verifier";
import { ActVerifier, type PinnedAct } from "@/components/act-verifier";
import { CORPORA, type CorpusId } from "@/lib/evidence";
import { actManifest, episodeManifest } from "@/lib/report";
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

const PINNED_ACTS: PinnedAct[] = (Object.keys(CORPORA) as CorpusId[]).flatMap((c) =>
  CORPORA[c].report.acts.map((a) => {
    const manifest = actManifest(a);
    return { key: `${c}:${a.id}`, corpus: CORPORA[c].name, file: `evidence/${c}-report.json`, manifest, digest: sha256Hex(canonicalJson(manifest)) };
  }),
);

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ ep?: string; act?: string; corpus?: string }> }) {
  const { ep, act, corpus } = await searchParams;
  const c = corpus === "collusion" ? "collusion" : "aivillage";
  const initialKey = `${c}:${ep ?? "EP-0001"}`;
  // Default to an act taken after a correction: moving the correction later visibly breaks it.
  const defaultAct = PINNED_ACTS.find((p) => p.key.startsWith(`${c}:`) && p.manifest.grounding === "AFTER_CORRECTION") ?? PINNED_ACTS[0];
  const initialActKey = act ? `${c}:${act}` : defaultAct.key;
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PageHero
        eyebrow="Verify · no account, no network"
        title="Check a verdict without trusting us"
        lede="Each verdict ships with a manifest: the origin sentence, its source, the counts and the verdict. Your browser recomputes the digest and re-runs the kernel. Change one field and it fails."
      />
      <main id="main" className="relative z-10">
        <Section id="episode">
          <Verifier pinned={PINNED} initialKey={initialKey} />
        </Section>
        <Section id="acts" band>
          <SectionHead
            eyebrow="Consequence"
            title="Check an act the same way"
            lede="An act is something an agent did with a shared number. Its manifest pins the excerpt, its source record, how many agents had reported checking the claim, and when it was corrected. Change one and the grade no longer re-derives."
          />
          <ActVerifier pinned={PINNED_ACTS} initialKey={initialActKey} />
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
