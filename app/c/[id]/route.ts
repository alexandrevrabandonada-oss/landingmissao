import { NextRequest, NextResponse } from "next/server";

const SITE = "https://www.alexandrevrabandonada.online";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Snapshot = {
  schools?: Array<{ id:number; slug:string }>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d{1,6}$/.test(id)) {
    return NextResponse.redirect(new URL("/climatizacao", request.url), 307);
  }

  try {
    const response = await fetch(SITE + "/api/climatizacao?action=snapshot", { cache: "no-store" });
    if (!response.ok) throw new Error("snapshot");
    const snapshot: Snapshot = await response.json();
    const school = (snapshot.schools ?? []).find((item) => item.id === Number(id));
    if (!school) return NextResponse.redirect(new URL("/climatizacao", request.url), 307);
    return NextResponse.redirect(
      new URL("/climatizacao/escola/" + encodeURIComponent(school.slug), request.url),
      307,
    );
  } catch {
    return NextResponse.redirect(new URL("/climatizacao", request.url), 307);
  }
}
