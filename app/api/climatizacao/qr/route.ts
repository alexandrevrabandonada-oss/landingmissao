import { NextRequest } from "next/server";

const SITE = "https://www.alexandrevrabandonada.online";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeSlug(value: string | null) {
  const slug = String(value ?? "").trim();
  return /^[a-z0-9-]{2,140}$/.test(slug) ? slug : null;
}

export async function GET(request: NextRequest) {
  const slug = safeSlug(request.nextUrl.searchParams.get("escola"));
  if (!slug) {
    return Response.json({ error: "invalid_school_slug" }, { status: 400 });
  }

  const target = `${SITE}/climatizacao/escola/${encodeURIComponent(slug)}`;
  const upstream = new URL("https://quickchart.io/qr");
  upstream.searchParams.set("text", target);
  upstream.searchParams.set("format", "svg");
  upstream.searchParams.set("size", "900");
  upstream.searchParams.set("margin", "4");
  upstream.searchParams.set("ecLevel", "M");
  upstream.searchParams.set("dark", "000000");
  upstream.searchParams.set("light", "ffffff");

  const response = await fetch(upstream, {
    cache: "no-store",
    headers: { "User-Agent": "AlexandreVRAbandonada-Climatizacao/1.0" },
  });

  if (!response.ok) {
    return Response.json({ error: "qr_generation_failed" }, { status: 502 });
  }

  const svg = await response.text();
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `inline; filename="climatizacao-${slug}.svg"`,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
