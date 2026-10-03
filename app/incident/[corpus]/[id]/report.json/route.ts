import { NextResponse } from "next/server";
import { incidentJson, loadIncident } from "@/lib/incident";

export async function GET(_req: Request, { params }: { params: Promise<{ corpus: string; id: string }> }) {
  const { corpus, id } = await params;
  const d = loadIncident(corpus, id);
  if (!d) return NextResponse.json({ error: "no such incident" }, { status: 404 });
  return new NextResponse(JSON.stringify(incidentJson(d), null, 2) + "\n", {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="traceturn-${corpus}-${id}.json"`,
    },
  });
}
