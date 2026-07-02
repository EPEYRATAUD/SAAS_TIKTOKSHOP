import { NextRequest, NextResponse } from "next/server";

// Dev-only — debug Higgsfield credentials et jobs récents
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }

  const key = process.env.HIGGSFIELD_API_KEY;
  const secret = process.env.HIGGSFIELD_API_SECRET;

  if (!key) {
    return NextResponse.json({ ok: false, error: "HIGGSFIELD_API_KEY not set" }, { status: 400 });
  }

  const authHeader = secret ? `Key ${key}:${secret}` : `Key ${key}`;
  const BASE = "https://platform.higgsfield.ai";

  // Si ?request_id=xxx → poll statut direct
  const requestId = req.nextUrl.searchParams.get("request_id");
  if (requestId) {
    const res = await fetch(`${BASE}/requests/${requestId}/status`, {
      headers: { Authorization: authHeader },
    });
    const body = await res.text();
    return NextResponse.json({ request_id: requestId, http_status: res.status, raw: body });
  }

  // Sinon → essaie de lister les jobs récents
  const endpoints = [
    "/v1/requests",
    "/requests",
    "/v1/jobs",
    "/v1/image2video/requests",
  ];

  const results: Record<string, unknown> = {};
  for (const ep of endpoints) {
    const res = await fetch(`${BASE}${ep}`, {
      headers: { Authorization: authHeader },
    });
    results[ep] = { status: res.status, body: await res.text() };
  }

  return NextResponse.json({ auth_header_used: authHeader.slice(0, 20) + "...", results });
}
