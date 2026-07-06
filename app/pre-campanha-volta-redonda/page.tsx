import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";

const pageUrl = canonicalUrl("/pre-campanha-volta-redonda");
const pageTitle = `Pré-campanha em Volta Redonda | ${SITE_IDENTITY.publicName}`;
const pageDescription =
  `Entenda a pré-campanha Alexandre VR Abandonada em Volta Redonda: escuta territorial, organização popular, participação de base e App Missão ÉLuta.`;

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    images: [{ url: SEO_IMAGES.preCampanhaVoltaRedonda, width: 1200, height: 630, alt: SITE_IDENTITY.fullLabel }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [SEO_IMAGES.preCampanhaVoltaRedonda],
  },
};

export default function PreCampanhaVoltaRedondaPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pré-campanha", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Volta Redonda", item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <section className="seo-page">
        <div className="container seo-page__inner">
          <Link href="/" className="seo-page__back">← Voltar para a pré-campanha</Link>
          <header className="seo-page__hero">
            <p>pré-campanha em volta redonda</p>
            <h1>Escuta territorial para organizar Volta Redonda.</h1>
            <span>
              A pré-campanha Alexandre VR Abandonada conecta comunicação pública,
              participação popular e tarefas de base para transformar relatos da cidade
              em organização.
            </span>
          </header>
          <div className="seo-page__grid">
            <article>
              <h2>Território</h2>
              <p>A construção parte de bairros, rotinas, serviços públicos, trabalho, juventude, cultura, saúde, transporte e periferias.</p>
            </article>
            <article>
              <h2>Método</h2>
              <p>Escutar, cuidar e organizar: receber relatos com responsabilidade, proteger pessoas de exposição indevida e converter interesse em missão.</p>
            </article>
            <article>
              <h2>Participação</h2>
              <p>Quem quer ajudar pode entrar pelo grupo de voluntários, pelo App Missão ÉLuta, pela foto de apoio, pela vaquinha ou pelo compartilhamento.</p>
            </article>
          </div>
          <nav className="seo-page__actions" aria-label="Próximas páginas">
            <Link href="/participar" className="seo-page__primary">Participar agora</Link>
            <Link href="/metodo" className="seo-page__secondary">Conhecer o método</Link>
            <Link href="/quem-e-alexandre-vr-abandonada" className="seo-page__secondary">Quem é Alexandre</Link>
          </nav>
        </div>
      </section>
      <style>{css}</style>
    </>
  );
}

const css = `
.seo-page { min-height: 100svh; padding-block: 1.25rem 4rem; background: radial-gradient(circle at 14% 10%, rgba(255,209,0,0.12), transparent 26rem), radial-gradient(circle at 86% 14%, rgba(192,57,43,0.12), transparent 28rem), linear-gradient(180deg, #0b0b0e 0%, #111114 100%); }
.seo-page__inner { display: grid; gap: 1.4rem; max-width: 1040px; }
.seo-page__back { width: fit-content; min-height: 44px; display: inline-flex; align-items: center; color: var(--yellow); font-weight: 800; }
.seo-page__hero { max-width: 840px; }
.seo-page__hero p { margin: 0 0 0.75rem; color: var(--yellow); font-size: 0.72rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
.seo-page__hero h1 { margin: 0; max-width: 12ch; font-size: clamp(2.7rem, 7vw, 5.6rem); line-height: 0.94; letter-spacing: -0.045em; }
.seo-page__hero span { display: block; margin-top: 1rem; max-width: 64ch; color: var(--muted); font-size: 1.04rem; line-height: 1.72; }
.seo-page__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.9rem; }
.seo-page__grid article { padding: 1.2rem; border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; background: linear-gradient(145deg, rgba(255,209,0,0.07), rgba(255,255,255,0.018)), var(--surface); }
.seo-page__grid h2 { margin: 0 0 0.65rem; font-size: 1.18rem; color: var(--yellow); }
.seo-page__grid p { margin: 0; color: var(--muted); line-height: 1.68; }
.seo-page__actions { display: flex; flex-wrap: wrap; gap: 0.7rem; }
.seo-page__primary, .seo-page__secondary { min-height: 46px; display: inline-flex; align-items: center; justify-content: center; padding: 0.72rem 1rem; border-radius: 999px; font-weight: 900; }
.seo-page__primary { background: var(--yellow); color: var(--bg); }
.seo-page__secondary { border: 1px solid rgba(255,209,0,0.34); color: var(--yellow); }
@media (max-width: 820px) { .seo-page__grid { grid-template-columns: 1fr; } .seo-page__hero h1 { max-width: 11ch; } .seo-page__primary, .seo-page__secondary { width: 100%; } }
`;
