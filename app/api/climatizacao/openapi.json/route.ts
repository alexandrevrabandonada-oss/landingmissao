export const dynamic = "force-static";

const SITE = "https://www.alexandrevrabandonada.online";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Climatização nas Escolas de Volta Redonda — API Pública",
      version: "1.0.0",
      description:
        "API pública da plataforma de climatização. Leituras são abertas; escritas representam ações humanas validadas e sujeitas a rate limit. Dados pessoais não fazem parte dos datasets públicos.",
    },
    servers: [{ url: SITE }],
    externalDocs: {
      description: "Documentação humana da API",
      url: SITE + "/climatizacao/api",
    },
    tags: [
      { name: "Public data" },
      { name: "Integrity" },
      { name: "Participation" },
      { name: "Utility" },
    ],
    paths: {
      "/api/climatizacao": {
        get: {
          tags: ["Public data"],
          summary: "Ler snapshots e recursos públicos",
          parameters: [
            {
              name: "action",
              in: "query",
              required: true,
              schema: {
                type: "string",
                enum: [
                  "snapshot",
                  "receipt",
                  "ledger",
                  "evidence",
                  "push_key",
                  "cases",
                  "case_overview",
                  "metrics",
                ],
              },
            },
            {
              name: "school",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Slug da escola quando a action exigir contexto escolar.",
            },
            {
              name: "code",
              in: "query",
              required: false,
              schema: { type: "string" },
              description: "Código público de recibo quando action=receipt.",
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 250 },
            },
            {
              name: "after_id",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 0 },
              description: "Paginação crescente do ledger.",
            },
            {
              name: "direction",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["asc", "desc"] },
            },
            {
              name: "days",
              in: "query",
              required: false,
              schema: { type: "integer", minimum: 1, maximum: 90 },
              description: "Janela da telemetria agregada.",
            },
          ],
          responses: {
            "200": {
              description: "Recurso público retornado com sucesso.",
              content: {
                "application/json": {
                  schema: { type: "object", additionalProperties: true },
                },
              },
            },
            "400": { description: "Parâmetros inválidos." },
            "404": { description: "Recurso não encontrado." },
          },
        },
        post: {
          tags: ["Participation"],
          summary: "Registrar uma ação humana validada",
          description:
            "Usado pelos formulários públicos. Não é um endpoint de disparo em massa. Possui validação, deduplicação e rate limits.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["kind"],
                  properties: {
                    kind: {
                      type: "string",
                      enum: [
                        "report",
                        "student_support",
                        "signature",
                        "evidence_submission",
                        "push_subscribe",
                        "push_unsubscribe",
                      ],
                    },
                  },
                  additionalProperties: true,
                },
              },
            },
          },
          responses: {
            "200": { description: "Ação atualizada/removida com sucesso." },
            "201": { description: "Ação registrada com sucesso." },
            "400": { description: "Payload inválido." },
            "409": { description: "Ação duplicada ou já existente." },
            "429": { description: "Rate limit atingido." },
          },
        },
      },
      "/api/climatizacao/anchor": {
        get: {
          tags: ["Integrity"],
          summary: "Comparar o head atual com a âncora externa no GitHub",
          responses: {
            "200": {
              description: "Comparação retornada.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AnchorComparison" },
                },
              },
            },
            "502": { description: "Uma das fontes da comparação está indisponível." },
          },
        },
      },
      "/api/climatizacao/dados": {
        get: {
          tags: ["Public data"],
          summary: "Exportar datasets agregados",
          parameters: [
            {
              name: "format",
              in: "query",
              schema: { type: "string", enum: ["json", "csv"], default: "json" },
            },
            {
              name: "dataset",
              in: "query",
              schema: { type: "string", enum: ["schools", "cases"], default: "schools" },
            },
          ],
          responses: {
            "200": {
              description: "JSON agregado ou download CSV.",
            },
          },
        },
      },
      "/api/climatizacao/health": {
        get: {
          tags: ["Integrity"],
          summary: "Status público dos componentes da plataforma",
          responses: {
            "200": { description: "Componentes críticos operacionais." },
            "503": { description: "Falha em um componente crítico." },
          },
        },
      },
      "/api/climatizacao/qr": {
        get: {
          tags: ["Utility"],
          summary: "Gerar QR SVG de uma escola",
          parameters: [
            {
              name: "escola",
              in: "query",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "QR em SVG.",
              content: { "image/svg+xml": { schema: { type: "string" } } },
            },
            "404": { description: "Escola não encontrada." },
          },
        },
      },
      "/api/climatizacao/qr-lote": {
        get: {
          tags: ["Utility"],
          summary: "Baixar os QRs das 101 escolas em ZIP",
          responses: {
            "200": {
              description: "Arquivo ZIP com QRs SVG.",
              content: {
                "application/zip": {
                  schema: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        LedgerHead: {
          type: "object",
          required: ["id", "entry_hash", "created_at"],
          properties: {
            id: { type: "integer" },
            entry_hash: {
              type: "string",
              pattern: "^[a-f0-9]{64}$",
            },
            created_at: { type: "string", format: "date-time" },
          },
        },
        AnchorComparison: {
          type: "object",
          required: [
            "healthy",
            "comparison",
            "lag_events",
            "current_head",
            "external_anchor",
          ],
          properties: {
            healthy: { type: "boolean" },
            comparison: {
              type: "string",
              enum: [
                "synchronized",
                "ledger_ahead",
                "anchor_ahead",
                "hash_mismatch",
              ],
            },
            lag_events: { type: "integer", minimum: 0 },
            current_head: { $ref: "#/components/schemas/LedgerHead" },
            external_anchor: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: {
      "Content-Type": "application/vnd.oai.openapi+json;version=3.1",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
