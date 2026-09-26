# Sponsor Integration Field Findings

Concrete engineering findings observed while wiring each sponsor seam and how they are guarded in `lib/kernel.ts`.

## OpenAI-Compatible Structured Extraction (`EXTRACTION`)
- **Finding**: Model paraphrases numeric terms when promotional copy uses prose
- **Environment**: Structured Outputs API (strict JSON schema), Campaign A/C evaluation run
- **Observed**: On promotional offers written in prose ('eighteen seventy-five monthly credit'), the model occasionally synthesized '$18.75/mo' in the excerpt field instead of copying the literal prose substring.
- **Deterministic Fix (`lib/kernel.ts#evaluateSafetyKernel`)**: INV-1 in lib/kernel.ts enforces whitespace-normalized literal substring containment against the raw T0 text and rejects paraphrased excerpts with EXCERPT_NOT_FOUND_IN_T0.
- **Boundary Honesty (Not Claimed)**: The model never directly mutates database state or marks a dispute resolved; all state transitions are gated by lib/kernel.ts.

## Firecrawl / Immutable Snapshot Capture (`CAPTURE`)
- **Finding**: Dynamic cookie banners and rotating session footers alter raw page hashes
- **Environment**: Public offer page captures (T0 vs Tn re-crawl)
- **Observed**: Two captures of an identical offer page 10 minutes apart produced different raw SHA-256 hashes due to rotating CSRF tokens and cookie consent DOM nodes.
- **Deterministic Fix (`lib/kernel.ts#computeEvidenceDigest`)**: INV-4 in lib/kernel.ts compares canonicalized integer-cent fact tuples (rateCents, promoCreditCents, durationMonths) rather than raw DOM hashes, achieving 8/8 benign rewrite immunity.
- **Boundary Honesty (Not Claimed)**: Authenticated behind-login carrier portals are not scraped automatically; users forward or upload those statements directly.

## Drizzle ORM + PostgreSQL / Convex State Kernel (`KERNEL_DB`)
- **Finding**: Serverless cold-start connection spikes under parallel eval harness runs
- **Environment**: PostgreSQL serverless pool during 52-call evaluation campaign
- **Observed**: Running 52 concurrent evaluation workers exhausted default connection slots when each worker instantiated a fresh client.
- **Deterministic Fix (`db/schema.ts & db/index.ts`)**: db/index.ts bounds max connections and provides an automatic deterministic fixture store when DATABASE_URL is absent or DEMO_MODE=1.
- **Boundary Honesty (Not Claimed)**: Multi-region active-active write replication is not enabled in the hackathon deployment.

## AgentMail / Signed Webhook Dispatch Bus (`DISPATCH`)
- **Finding**: Provider auto-responders ('We resolved your ticket!') arrive before billing cycle closes
- **Environment**: Inbound support webhook processing
- **Observed**: Support systems immediately emit a templated 'Your issue is resolved' email upon ticket closure, weeks before the next billing statement is generated.
- **Deterministic Fix (`app/api/items/route.ts & lib/kernel.ts`)**: INV-3 in lib/kernel.ts locks the item in WAITING_TO_VERIFY upon receiving a provider claim and requires a subsequent billing statement with missingCreditCents === 0 before transitioning to VERIFIED_FIXED.
- **Boundary Honesty (Not Claimed)**: Autonomous outbound emailing without human click-to-approve is intentionally prohibited by security policy.
