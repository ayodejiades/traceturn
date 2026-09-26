import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";

export async function GET() {
  return NextResponse.json({
    ok: true,
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev",
    demoMode: isDemoMode(),
  });
}
