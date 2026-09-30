import { NextRequest, NextResponse } from "next/server";

const UPSTREAM =
  "https://blimjnitngthldhazvwh.supabase.co/functions/v1/climatizacao-public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function proxy(request: NextRequest) {
  const upstream = new URL(UPSTREAM);
  request.nextUrl.searchParams.forEach((value, key) => upstream.searchParams.set(key, value));

  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("content-type") || "application/json",
  };

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;

  const response = await fetch(upstream, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    cache: "no-store",
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  return proxy(request);
}

export async function POST(request: NextRequest) {
  return proxy(request);
}
