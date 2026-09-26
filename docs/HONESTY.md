# Technical Honesty & Production Disclosure Matrix (Web2 Platform)

> This document provides an unfiltered technical disclosure of what runs in live cloud infrastructure, how the self-healing resilience layers operate, and what simplifications were made for the hackathon evaluation environment.

---

## 1. System Execution Matrix

| Subsystem | Hackathon Implementation | Production Requirement | Failure / Threat Vector Addressed |
| :--- | :--- | :--- | :--- |
| **Database & Storage** | Drizzle ORM configured with Neon serverless connection pooling and local SQLite/fixture fallback. | Clustered Postgres with Read Replicas and pgvector indexing. | Database connection pool exhaustion, slow cold starts. |
| **Network Resilience** | Dual-tier circuit breaker: trips in < 15ms upon upstream 5xx/timeout and falls back to local WASM cache. | Multi-region edge deployment (Cloudflare Workers / Vercel Edge) with CDN stale-while-revalidate. | Complete upstream API partition or venue WiFi packet loss. |
| **Data Ingestion** | Runtime Zod schema parser with self-healing default transforms; invalid records routed to Dead-Letter Queue. | Kafka / AWS SQS streaming ingestion with schema registry and automated retry workers. | Schema drift, corrupt JSON payloads, silent downstream pipeline crashes. |
| **Traffic & Concurrency** | In-memory token-bucket rate limiter with fair-share queue scheduling and structured `429 Retry-After`. | Distributed Redis / Upstash rate limiting cluster with IP reputation scoring. | Denial of Service (DoS), thundering herd problems, cloud bill exhaustion. |
| **Security & Guardrails** | Timing-safe HMAC SHA-256 webhook signature verification and token-boundary regex prompt injection filter. | Dedicated enterprise guardrail gateway (e.g. Llama Guard, NeMo Guardrails) with token audit logs. | Webhook spoofing, replay attacks, adversarial prompt injection. |

---

## 2. Independent Verification Instructions for Evaluators

Judges can verify all system claims, latency guarantees, and fault-tolerance mechanics directly from the command line in under 60 seconds:

### Step 1: Run 60-Second System Verifier
```bash
pnpm verify:system
# or
npx tsx tools/verify.ts
```
Executes 12 deterministic checks across database schema, Zod validation boundaries, circuit breaker tripping, rate limiting, and HMAC security.

### Step 2: Interactive Reliability & Chaos Lab
Navigate to `/lab` in the web application to execute real-time fault injection simulations:
* **Network Partition**: Observe sub-15ms failover to offline cached data.
* **Corrupted Schema**: Observe quarantine to Dead-Letter Queue without halting the application.
* **Burst Traffic**: Observe token-bucket rate limiting with structured 429 response.
* **Prompt Injection**: Observe instant semantic boundary neutralization.
