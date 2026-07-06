import fs from "node:fs";

const siteUrl = "https://www.alexandrevrabandonada.online";
const campaign = "pre_campanha_alexandre_vr_abandonada";

const expectedSubmit = [
  "/",
  "/quem-e-alexandre-vr-abandonada",
  "/pre-campanha-volta-redonda",
  "/missao-eluta",
  "/participar",
  "/pautas",
  "/perguntas-frequentes",
  "/apoio",
  "/metodo",
  "/formacao/campanhas-de-base",
].map((path) => `${siteUrl}${path}`);

const expectedDoNotSubmit = [
  "/lancamento",
  "/pre-campanha",
  "/jogo",
  "/jogo/rua",
].map((path) => `${siteUrl}${path}`);

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const character = line[i];
    const next = line[i + 1];

    if (character === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current);
  return values;
}

function parseCsv(filePath) {
  const rows = fs.readFileSync(filePath, "utf8").trim().split(/\r?\n/);
  const headers = parseCsvLine(rows[0]);

  return rows.slice(1).map((row, index) => {
    const values = parseCsvLine(row);
    if (values.length !== headers.length) {
      throw new Error(`${filePath}:${index + 2} tem ${values.length} colunas; esperado ${headers.length}`);
    }
    return Object.fromEntries(headers.map((header, columnIndex) => [header, values[columnIndex]]));
  });
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function sameMembers(actual, expected) {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

function hasRequiredUtm(rawUrl) {
  const parsedUrl = new URL(rawUrl);
  return (
    parsedUrl.searchParams.has("utm_source") &&
    parsedUrl.searchParams.has("utm_medium") &&
    parsedUrl.searchParams.get("utm_campaign") === campaign
  );
}

const failures = [];

const distribution = JSON.parse(fs.readFileSync("docs/seo-distribuicao-links.json", "utf8"));
assert(distribution.site === siteUrl, "site canonico do JSON de distribuicao esta incorreto");
assert(distribution.sitemap === `${siteUrl}/sitemap.xml`, "sitemap do JSON de distribuicao esta incorreto");
assert(distribution.campaign === campaign, "campanha UTM do JSON de distribuicao esta incorreta");
assert(sameMembers(distribution.searchConsoleSubmit, expectedSubmit), "URLs de envio ao Search Console divergem da lista esperada");
assert(sameMembers(distribution.doNotSubmit, expectedDoNotSubmit), "URLs de nao envio ao Search Console divergem da lista esperada");

for (const [key, link] of Object.entries(distribution.distributionLinks)) {
  if (key === "home") {
    assert(link === `${siteUrl}/`, "link home deve ficar sem UTM");
  } else {
    assert(hasRequiredUtm(link), `link ${key} precisa ter utm_source, utm_medium e utm_campaign`);
  }
}

const indexRows = parseCsv("docs/controle-indexacao-search-console.csv");
const indexSubmit = indexRows
  .filter((row) => !/nao enviar/i.test(row.status))
  .map((row) => row.url);
const indexDoNotSubmit = indexRows
  .filter((row) => /nao enviar/i.test(row.status))
  .map((row) => row.url);

assert(sameMembers(indexSubmit, expectedSubmit), "CSV de indexacao deve conter exatamente as URLs que podem ser enviadas");
assert(sameMembers(indexDoNotSubmit, expectedDoNotSubmit), "CSV de indexacao deve conter exatamente as URLs que nao devem ser enviadas");

const backlinkRows = parseCsv("docs/controle-links-legitimos.csv");
for (const row of backlinkRows) {
  assert(row.alvo.trim(), "CSV de links legitimos tem alvo vazio");
  assert(row.categoria.trim(), `CSV de links legitimos tem categoria vazia para ${row.alvo}`);
  assert(hasRequiredUtm(row.link_recomendado), `link recomendado para ${row.alvo} precisa de UTMs completas`);
  assert(/pendente|contatado|publicado|recusado|pausado/i.test(row.status), `status invalido em ${row.alvo}: ${row.status}`);
}

if (failures.length > 0) {
  console.error("Artefatos operacionais de SEO com falhas:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Artefatos operacionais de SEO OK");
console.log(`URLs para Search Console: ${distribution.searchConsoleSubmit.length}`);
console.log(`Links de distribuicao: ${Object.keys(distribution.distributionLinks).length}`);
console.log(`Controles de links legitimos: ${backlinkRows.length}`);
