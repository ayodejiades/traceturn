// lib/demo-mode.ts — DEMO_MODE=1 replaces every external dependency (database, model API,
// third-party API) with on-disk fixtures, so the demo path completes with the Wi-Fi off.
import { env } from "./env";

export function isDemoMode(): boolean {
  return env.DEMO_MODE;
}
