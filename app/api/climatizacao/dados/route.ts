import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CaseOverview = {
  id: string;
  issue: string;
  status: string;
  report_count: number;
  opened_at: string;
  last_report_at: string | null;
  updated_at: string;
  resolved_at: string | null;
  public_note: string | null;
  open_days: number;
  school: {
    id: number;
    slug: string;
    name: string;
    category: string;
    network: string;
  } | null;
};

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
  const snapshotSource = new URL("/api/climatizacao?action=snapshot", request.nextUrl.origin);
  const casesSource = new URL("/api/climatizacao?action=case_overview", request.nextUrl.origin);
  const [snapshotResponse, casesResponse] = await Promise.all([
    fetch(snapshotSource, { cache: "no-store" }),
    fetch(casesSource, { cache: "no-store" }),
  ]);
  if (!snapshotResponse.ok || !casesResponse.ok) {
    return Response.json({ error: "dataset_unavailable" }, { status: 502 });
  }

  const [snapshot, caseOverview] = await Promise.all([
    snapshotResponse.json(),
    casesResponse.json(),
  ]);
  const schools: School[] = snapshot.schools ?? [];
  const cases: CaseOverview[] = caseOverview.cases ?? [];
  const format = request.nextUrl.searchParams.get("format")?.toLowerCase() ?? "json";
  const dataset = request.nextUrl.searchParams.get("dataset")?.toLowerCase() ?? "schools";

  if (format === "csv") {
    if (dataset === "cases") {
      const columns = [
        "id","school_id","school_slug","school_name","network","category",
        "issue","status","report_count","open_days","opened_at","last_report_at",
        "updated_at","resolved_at","public_note",
      ];

      const rows = cases.map((item) => [
        item.id,
        item.school?.id ?? "",
        item.school?.slug ?? "",
        item.school?.name ?? "",
        item.school?.network ?? "",
        item.school?.category ?? "",
        item.issue,
        item.status,
        item.report_count,
        item.open_days,
        item.opened_at,
        item.last_report_at ?? "",
        item.updated_at,
        item.resolved_at ?? "",
        item.public_note ?? "",
      ]);

      const csv = [columns.join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="climatizacao-casos-volta-redonda.csv"',
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      });
    }

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
    schema_version: "1.1",
    generated_at: snapshot.generated_at,
    methodology_url: "https://www.alexandrevrabandonada.online/climatizacao/dados",
    summary: snapshot.summary,
    schools,
    case_summary: caseOverview.summary ?? {},
    cases,
    protocols: snapshot.protocols ?? [],
    notes: [
      "Relatos da comunidade não equivalem a vistoria técnica.",
      "Apoios estudantis e assinaturas nominais são contados separadamente.",
      "Nenhum dado pessoal de participante é incluído nesta exportação.",
      "Casos de resolução são estados operacionais da plataforma e não rankings de autoridades.",
    ],
  };

  return Response.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
