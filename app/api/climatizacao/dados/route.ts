import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type School = {
  id: number;
  slug: string;
  name: string;
  category: string;
  network: string;
  report_count: number;
  sem_ar_count: number;
  nao_funciona_count: number;
  parcial_count: number;
  rede_eletrica_count: number;
  manutencao_count: number;
  student_support_count: number;
  signature_count: number;
  support_count: number;
  activity_count: number;
  last_activity_at: string | null;
};

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const source = new URL("/api/climatizacao?action=snapshot", request.nextUrl.origin);
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) {
    return Response.json({ error: "snapshot_unavailable" }, { status: 502 });
  }

  const snapshot = await response.json();
  const schools: School[] = snapshot.schools ?? [];
  const format = request.nextUrl.searchParams.get("format")?.toLowerCase() ?? "json";

  if (format === "csv") {
    const columns: Array<keyof School> = [
      "id","slug","name","category","network",
      "report_count","sem_ar_count","nao_funciona_count","parcial_count",
      "rede_eletrica_count","manutencao_count","student_support_count",
      "signature_count","support_count","activity_count","last_activity_at",
    ];

    const csv = [
      columns.join(","),
      ...schools.map((school) => columns.map((column) => csvCell(school[column])).join(",")),
    ].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="climatizacao-escolas-volta-redonda.csv"',
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  }

  const payload = {
    schema_version: "1.0",
    generated_at: snapshot.generated_at,
    methodology_url: "https://www.alexandrevrabandonada.online/climatizacao/dados",
    summary: snapshot.summary,
    schools,
    protocols: snapshot.protocols ?? [],
    notes: [
      "Relatos da comunidade não equivalem a vistoria técnica.",
      "Apoios estudantis e assinaturas nominais são contados separadamente.",
      "Nenhum dado pessoal de participante é incluído nesta exportação.",
    ],
  };

  return Response.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
