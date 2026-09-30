const SITE = "https://www.alexandrevrabandonada.online";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LedgerEvent = {
  id:number;
  event_type:string;
  public_ref:string|null;
  metadata:Record<string,unknown>;
  entry_hash:string;
  created_at:string;
  school:{slug:string;name:string;network:string}|null;
};

function xml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function label(event: LedgerEvent) {
  if (event.event_type === "evidence.added") return String(event.metadata?.title || "Nova evidência publicada");
  if (event.event_type === "participation.report") return "Novo relato registrado";
  if (event.event_type === "participation.student_support") return "Novo apoio estudantil registrado";
  if (event.event_type === "participation.signature") return "Nova assinatura registrada";
  if (event.event_type.startsWith("protocol.")) return "Atualização de protocolo: " + event.event_type.replace("protocol.", "");
  if (event.event_type === "platform.ledger_started") return "Ledger público iniciado";
  return event.event_type;
}

function description(event: LedgerEvent) {
  const school = event.school ? ` · ${event.school.name}` : "";
  const note = typeof event.metadata?.public_note === "string" ? ` · ${event.metadata.public_note}` : "";
  return `${label(event)}${school}${note}`;
}

export async function GET() {
  const response = await fetch(SITE + "/api/climatizacao?action=ledger&limit=100&direction=desc", { cache: "no-store" });
  if (!response.ok) {
    return new Response("Feed indisponível", { status: 502 });
  }

  const payload = await response.json();
  const events: LedgerEvent[] = payload.ledger?.events || [];

  const items = events.map((event) => {
    const link = event.school
      ? SITE + "/climatizacao/escola/" + event.school.slug
      : SITE + "/climatizacao/ledger";

    return `<item>
<title>${xml(label(event))}</title>
<link>${xml(link)}</link>
<guid isPermaLink="false">${xml(event.entry_hash)}</guid>
<pubDate>${new Date(event.created_at).toUTCString()}</pubDate>
<description>${xml(description(event))}</description>
</item>`;
  }).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Climatização nas escolas de Volta Redonda — atualizações</title>
<link>${SITE}/climatizacao</link>
<description>Eventos públicos do ledger de climatização: evidências, participação e protocolos.</description>
<language>pt-BR</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
