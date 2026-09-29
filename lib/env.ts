// lib/env.ts — zod-validated environment. The site itself needs no external service: every
// page reads the committed reports in evidence/. Only db/ needs DATABASE_URL, and it asks
// for it when it opens a connection, so a deploy without a database builds and runs.
import { z } from "zod";

const schema = z.object({
  DEMO_MODE: z
    .string()
    .optional()
    .default("0")
    .transform((v) => v === "1" || v.toLowerCase() === "true"),
  DATABASE_URL: z.string().optional(),
  DEPLOY_URL: z.string().optional().default("http://localhost:3000"),
});

function loadEnv() {
  const parsed = schema.safeParse({
    DEMO_MODE: process.env.DEMO_MODE,
    DATABASE_URL: process.env.DATABASE_URL,
    DEPLOY_URL: process.env.DEPLOY_URL,
  });
  if (!parsed.success) {
    console.error("lib/env.ts: invalid environment", parsed.error.flatten().fieldErrors);
    throw new Error("invalid environment — see lib/env.ts");
  }
  return parsed.data;
}

export const env = loadEnv();

/** For db/ only: the connection string, or a clear error naming the fix. */
export function requireDatabaseUrl(): string {
  if (!env.DATABASE_URL) {
    throw new Error("lib/env.ts: DATABASE_URL is required to use db/ outside DEMO_MODE; copy .env.example to .env and fill it in");
  }
  return env.DATABASE_URL;
}
