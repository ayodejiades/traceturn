// lib/env.ts — zod-validated environment. Fails loudly at boot rather than at demo time.
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
  if (!parsed.data.DEMO_MODE && !parsed.data.DATABASE_URL) {
    throw new Error(
      "lib/env.ts: DATABASE_URL is required unless DEMO_MODE=1 — copy .env.example to .env and fill it in",
    );
  }
  return parsed.data;
}

export const env = loadEnv();
