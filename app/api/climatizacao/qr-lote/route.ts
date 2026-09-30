import { NextRequest } from "next/server";

const SITE = "https://www.alexandrevrabandonada.online";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Snapshot = {
  schools?: Array<{ slug: string; name: string }>;
};

export async function GET(_request: NextRequest) {
  try {
    const snapshotResponse = await fetch(`${SITE}/api/climatizacao?action=snapshot`, {
      cache: "no-store",
    });
    if (!snapshotResponse.ok) {
      return Response.json({ error: "school_list_unavailable" }, { status: 502 });
    }

    const snapshot: Snapshot = await snapshotResponse.json();
    const schools = snapshot.schools ?? [];
    if (!schools.length) {
      return Response.json({ error: "school_list_empty" }, { status: 502 });
    }

    const qrCodes = schools.map((school) => ({
      text: `${SITE}/climatizacao/escola/${school.slug}`,
      filename: `climatizacao-${school.slug}`,
      format: "svg",
      size: 900,
      margin: 4,
      ecLevel: "M",
      dark: "000000",
      light: "ffffff",
    }));

    const response = await fetch("https://quickchart.io/qr/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AlexandreVRAbandonada-Climatizacao/1.0",
      },
      body: JSON.stringify({
        zipFilename: "climatizacao-101-escolas-volta-redonda.zip",
        qrCodes,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error("qr batch failed", response.status, details.slice(0, 500));
      return Response.json({ error: "qr_batch_failed" }, { status: 502 });
    }

    const zip = await response.arrayBuffer();
    return new Response(zip, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="climatizacao-101-escolas-volta-redonda.zip"',
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("qr batch error", error instanceof Error ? error.message : String(error));
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
