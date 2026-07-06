const siteUrl = (process.env.SEO_AUDIT_SITE_URL || "https://www.alexandrevrabandonada.online").replace(/\/$/, "");

const expectedSitemapPaths = [
  "/",
  "/apoio",
  "/quem-e-alexandre-vr-abandonada",
  "/pre-campanha-volta-redonda",
  "/missao-eluta",
  "/participar",
  "/pautas",
  "/perguntas-frequentes",
  "/metodo",
  "/formacao/campanhas-de-base",
];

const strategicPagePaths = [
  "/",
  "/quem-e-alexandre-vr-abandonada",
  "/pre-campanha-volta-redonda",
  "/missao-eluta",
  "/participar",
  "/pautas",
  "/perguntas-frequentes",
];

const redirectsToHome = ["/lancamento", "/pre-campanha"];
const noindexPaths = ["/jogo", "/jogo/rua"];

function absolute(path) {
  return `${siteUrl}${path}`;
}

function textBetween(html, pattern) {
  return html.match(pattern)?.[1] || "";
}

async function fetchText(url, init) {
  const response = await fetch(url, init);
  const body = await response.text();
  return { response, body };
}

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

for (const path of strategicPagePaths) {
  const { response } = await fetchText(absolute(path));
  expect(response.status === 200, `${path} deveria responder 200, respondeu ${response.status}`);
}

for (const path of redirectsToHome) {
  const { response } = await fetchText(absolute(path), { redirect: "manual" });
  const location = response.headers.get("location") || "";
  expect([301, 308].includes(response.status), `${path} deveria redirecionar permanentemente, respondeu ${response.status}`);
  expect(location === "/" || location === absolute("/"), `${path} deveria redirecionar para /, redirecionou para ${location || "(vazio)"}`);
}

const { body: robots } = await fetchText(absolute("/robots.txt"));
expect(/User-Agent:\s*\*/i.test(robots), "robots.txt precisa declarar User-Agent: *");
expect(/Allow:\s*\//i.test(robots), "robots.txt precisa permitir /");
expect(robots.includes(`${siteUrl}/sitemap.xml`), "robots.txt precisa apontar para o sitemap canonico");

const { body: sitemapXml } = await fetchText(absolute("/sitemap.xml"));
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
const expectedSitemapUrls = expectedSitemapPaths.map(absolute).sort();
expect(
  JSON.stringify(sitemapUrls) === JSON.stringify(expectedSitemapUrls),
  `sitemap.xml divergente.\nEsperado: ${expectedSitemapUrls.join(", ")}\nRecebido: ${sitemapUrls.join(", ")}`,
);

const { body: homeHtml } = await fetchText(absolute("/"));
const title = textBetween(homeHtml, /<title>([^<]+)<\/title>/i);
const description = textBetween(homeHtml, /<meta name="description" content="([^"]+)"/i);
const canonical = textBetween(homeHtml, /<link rel="canonical" href="([^"]+)"/i);
const ogImage = textBetween(homeHtml, /<meta property="og:image" content="([^"]+)"/i);
const h1Count = [...homeHtml.matchAll(/<h1\b/gi)].length;

expect(title.includes("Alexandre VR Abandonada"), "title da home precisa citar Alexandre VR Abandonada");
expect(/pré-candidato|pre-candidato/i.test(title), "title da home precisa manter contexto de pre-candidato");
expect(title.includes("Volta Redonda"), "title da home precisa citar Volta Redonda");
expect(description.includes("Pré-campanha Alexandre VR Abandonada"), "description da home precisa citar a pre-campanha");
expect(description.includes("Volta Redonda"), "description da home precisa citar Volta Redonda");
expect(canonical === siteUrl || canonical === absolute("/"), `canonical da home inesperado: ${canonical || "(vazio)"}`);
expect(ogImage === absolute("/og-pre-campanha.png"), `og:image da home inesperado: ${ogImage || "(vazio)"}`);
expect(h1Count === 1, `home precisa ter exatamente 1 h1, encontrou ${h1Count}`);
expect(!/"@type"\s*:\s*"Event"/i.test(homeHtml), "home nao pode publicar schema Event");
expect(!/lançamento|lancamento/i.test(homeHtml), "home nao deve conter referencia publica a lancamento");
expect(!/vote em|número eleitoral|numero eleitoral/i.test(homeHtml), "home nao deve conter pedido de voto ou numero eleitoral");

for (const path of noindexPaths) {
  const { response, body } = await fetchText(absolute(path));
  expect(response.status === 200, `${path} deveria responder 200 para ser auditavel, respondeu ${response.status}`);
  expect(/<meta name="robots" content="noindex,\s*follow"/i.test(body), `${path} deveria ter robots noindex, follow`);
}

if (failures.length > 0) {
  console.error("SEO publico com falhas:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEO publico OK");
console.log(`Site auditado: ${siteUrl}`);
console.log(`Paginas estrategicas: ${strategicPagePaths.length}`);
console.log(`URLs no sitemap: ${sitemapUrls.length}`);
