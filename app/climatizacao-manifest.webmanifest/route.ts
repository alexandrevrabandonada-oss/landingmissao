export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    name: "Climatização nas Escolas de Volta Redonda",
    short_name: "Climatização VR",
    description: "Relatos, apoios, escolas acompanhadas e cobrança pública sobre climatização.",
    start_url: "/climatizacao",
    scope: "/climatizacao",
    display: "standalone",
    background_color: "#0b0b0b",
    theme_color: "#ffe600",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  }, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
