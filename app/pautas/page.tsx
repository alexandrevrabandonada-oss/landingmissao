import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";

const pageUrl = canonicalUrl("/pautas");
const pageTitle = `Pautas da escuta territorial | ${SITE_IDENTITY.publicName}`;
const pageDescription =
  `Temas de escuta territorial da pré-campanha Alexandre VR Abandonada em Volta Redonda: saúde, transporte, juventude, cultura, trabalho, periferias e organização popular.`;

const pautas = [
  ["Saúde e cuidado", "Relatos sobre acesso, filas, atendimento, prevenção e cuidado cotidiano."],
  ["Transporte e circulação", "Escuta sobre deslocamento, custo, tempo, bairros e acesso a serviços."],
  ["Juventude, cultura e escola", "Demandas de formação, permanência, cultura, lazer, segurança e futuro."],
  ["Trabalho e renda", "Condições de trabalho, informalidade, proteção social e oportunidades."],
  ["Periferias e abandono urbano", "Problemas de infraestrutura, manutenção, iluminação, enchentes, praças e serviços."],
  ["Meio ambiente e cidade", "Debate público sobre qualidade de vida, poluição, território e responsabilidade coletiva."],
] as const;

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: { title: pageTitle, description: pageDescription, type: "website", locale: "pt_BR", url: pageUrl, images: [{ url: SEO_IMAGES.pautas, width: 1200, height: 630, alt: SITE_IDENTITY.fullLabel }] },
  twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription, images: [SEO_IMAGES.pautas] },
};

export default function PautasPage() {
  const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Pré-campanha", item: canonicalUrl("/") }, { "@type": "ListItem", position: 2, name: "Pautas", item: pageUrl }] };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <section className="pautas-page">
        <div className="container pautas-page__inner">
          <Link href="/" className="pautas-page__back">← Voltar para a pré-campanha</Link>
          <header>
            <p>pautas e escuta territorial</p>
            <h1>Temas públicos para ouvir Volta Redonda.</h1>
            <span>A pré-campanha não parte de promessa pronta. Ela organiza escuta, relatos e prioridades que aparecem na vida real da cidade.</span>
          </header>
          <div className="pautas-page__grid">
            {pautas.map(([title, text]) => (
              <article key={title}><h2>{title}</h2><p>{text}</p></article>
            ))}
          </div>
          <nav className="pautas-page__actions" aria-label="Links relacionados">
            <Link href="/participar" className="pautas-page__primary">Participar da escuta</Link>
            <Link href="/pre-campanha-volta-redonda" className="pautas-page__secondary">Pré-campanha em Volta Redonda</Link>
          </nav>
        </div>
      </section>
      <style>{css}</style>
    </>
  );
}

const css = `.pautas-page{min-height:100svh;padding-block:1.25rem 4rem;background:linear-gradient(180deg,#0b0b0e 0%,#111114 100%)}.pautas-page__inner{display:grid;gap:1.4rem;max-width:1080px}.pautas-page__back{width:fit-content;min-height:44px;display:inline-flex;align-items:center;color:var(--yellow);font-weight:800}.pautas-page header{max-width:840px}.pautas-page header p{margin:0 0 .75rem;color:var(--yellow);font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.pautas-page h1{margin:0;max-width:12ch;font-size:clamp(2.7rem,7vw,5.6rem);line-height:.94;letter-spacing:-.045em}.pautas-page header span{display:block;margin-top:1rem;max-width:64ch;color:var(--muted);font-size:1.04rem;line-height:1.72}.pautas-page__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.9rem}.pautas-page__grid article{padding:1.2rem;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:linear-gradient(145deg,rgba(255,209,0,.07),rgba(255,255,255,.018)),var(--surface)}.pautas-page__grid h2{margin:0 0 .65rem;font-size:1.18rem;color:var(--yellow)}.pautas-page__grid p{margin:0;color:var(--muted);line-height:1.68}.pautas-page__actions{display:flex;flex-wrap:wrap;gap:.7rem}.pautas-page__primary,.pautas-page__secondary{min-height:46px;display:inline-flex;align-items:center;justify-content:center;padding:.72rem 1rem;border-radius:999px;font-weight:900}.pautas-page__primary{background:var(--yellow);color:var(--bg)}.pautas-page__secondary{border:1px solid rgba(255,209,0,.34);color:var(--yellow)}@media(max-width:820px){.pautas-page__grid{grid-template-columns:1fr}.pautas-page__primary,.pautas-page__secondary{width:100%}}`;
