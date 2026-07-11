import type { Metadata } from "next";
import Link from "next/link";
import { StateAgendaSelector } from "@/src/components/agendas/StateAgendaSelector";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";
import { stateAgendas } from "@/src/content/stateAgendas";

const pageUrl = canonicalUrl("/pautas");
const pageTitle = `Pautas para o estado do Rio de Janeiro | ${SITE_IDENTITY.publicName}`;
const pageDescription =
  `Pautas estaduais em escuta na pré-campanha Alexandre VR Abandonada: saúde, mobilidade, trabalho, educação, cultura, moradia, clima, direitos e organização popular em todo o Rio de Janeiro.`;

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: { title: pageTitle, description: pageDescription, type: "website", locale: "pt_BR", url: pageUrl, images: [{ url: SEO_IMAGES.pautas, width: 1200, height: 630, alt: SITE_IDENTITY.fullLabel }] },
  twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription, images: [SEO_IMAGES.pautas] },
};

export default function PautasPage() {
  const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Pré-campanha", item: canonicalUrl("/") }, { "@type": "ListItem", position: 2, name: "Pautas", item: pageUrl }] };
  const agendaJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Pautas estaduais em escuta",
    itemListElement: stateAgendas.map((agenda, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: agenda.title,
      description: agenda.description,
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, agendaJsonLd]} />
      <section className="pautas-page">
        <div className="container pautas-page__inner">
          <Link href="/" className="pautas-page__back">← Voltar para a pré-campanha</Link>
          <header>
            <p>pautas estaduais · escuta territorial</p>
            <h1>Ouvir e organizar o Rio de Janeiro inteiro.</h1>
            <span>
              A pré-campanha nasce em Volta Redonda e se abre para as lutas da Região Metropolitana,
              Baixada, interior, litoral, serras, Norte, Noroeste e Sul Fluminense. Sem promessa pronta:
              primeiro escuta, prioridade pública e organização.
            </span>
          </header>
          <StateAgendaSelector />
          <nav className="pautas-page__actions" aria-label="Links relacionados">
            <Link href="/participar" className="pautas-page__primary">Participar da organização estadual</Link>
            <Link href="/pre-campanha-volta-redonda" className="pautas-page__secondary">Conhecer nossa origem em Volta Redonda</Link>
          </nav>
        </div>
      </section>
      <style>{css}</style>
    </>
  );
}

const css = `.pautas-page{min-height:100svh;padding-block:1.25rem 4rem;background:radial-gradient(circle at 92% 0%,rgba(101,185,207,.1),transparent 26rem),linear-gradient(180deg,#0b0b0e 0%,#111114 100%)}.pautas-page__inner{display:grid;gap:1.2rem;max-width:1080px}.pautas-page__back{width:fit-content;min-height:44px;display:inline-flex;align-items:center;color:var(--yellow);font-weight:800}.pautas-page header{max-width:920px;padding-block:clamp(.75rem,2.5vw,1.8rem)}.pautas-page header p{margin:0 0 .75rem;color:var(--yellow);font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.pautas-page h1{margin:0;max-width:16ch;font-size:clamp(2.7rem,7vw,5.2rem);line-height:.94;letter-spacing:-.045em}.pautas-page header span{display:block;margin-top:1rem;max-width:72ch;color:var(--muted);font-size:1.04rem;line-height:1.65}.pautas-page__actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1rem}.pautas-page__primary,.pautas-page__secondary{min-height:46px;display:inline-flex;align-items:center;justify-content:center;padding:.72rem 1rem;border-radius:999px;font-size:.82rem;font-weight:900}.pautas-page__primary{background:var(--yellow);color:var(--bg)}.pautas-page__secondary{border:1px solid rgba(255,209,0,.34);color:var(--yellow)}@media(max-width:820px){.pautas-page__primary,.pautas-page__secondary{width:100%}}`;
