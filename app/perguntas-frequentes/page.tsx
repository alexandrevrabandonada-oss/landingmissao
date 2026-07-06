import type { Metadata } from "next";
import Link from "next/link";
import { launchEvent as e } from "@/content/launchEvent";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";

const pageUrl = canonicalUrl("/perguntas-frequentes");
const pageTitle = `Perguntas frequentes | Pré-campanha Alexandre VR Abandonada`;
const pageDescription =
  `Dúvidas comuns sobre a pré-campanha Alexandre VR Abandonada, participação, App Missão ÉLuta, voluntariado e organização popular.`;

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: { title: pageTitle, description: pageDescription, type: "website", locale: "pt_BR", url: pageUrl, images: [{ url: SEO_IMAGES.perguntasFrequentes, width: 1200, height: 630, alt: SITE_IDENTITY.fullLabel }] },
  twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription, images: [SEO_IMAGES.perguntasFrequentes] },
};

export default function PerguntasFrequentesPage() {
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: e.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) };
  const breadcrumbJsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Pré-campanha", item: canonicalUrl("/") }, { "@type": "ListItem", position: 2, name: "Perguntas frequentes", item: pageUrl }] };

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, faqJsonLd]} />
      <section className="faq-page">
        <div className="container faq-page__inner">
          <Link href="/" className="faq-page__back">← Voltar para a pré-campanha</Link>
          <header><p>perguntas frequentes</p><h1>Dúvidas comuns sobre a pré-campanha.</h1><span>Respostas rápidas para quem quer conhecer, participar ou compartilhar a organização da pré-campanha com segurança.</span></header>
          <dl className="faq-page__list">
            {e.faqs.map((faq) => (
              <div key={faq.question}><dt>{faq.question}</dt><dd>{faq.answer}</dd></div>
            ))}
          </dl>
          <nav className="faq-page__actions" aria-label="Links relacionados">
            <Link href="/participar" className="faq-page__primary">Participar</Link>
            <Link href="/missao-eluta" className="faq-page__secondary">Conhecer o app</Link>
          </nav>
        </div>
      </section>
      <style>{css}</style>
    </>
  );
}

const css = `.faq-page{min-height:100svh;padding-block:1.25rem 4rem;background:linear-gradient(180deg,#0b0b0e 0%,#111114 100%)}.faq-page__inner{display:grid;gap:1.4rem;max-width:900px}.faq-page__back{width:fit-content;min-height:44px;display:inline-flex;align-items:center;color:var(--yellow);font-weight:800}.faq-page header p{margin:0 0 .75rem;color:var(--yellow);font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.faq-page h1{margin:0;max-width:12ch;font-size:clamp(2.7rem,7vw,5.6rem);line-height:.94;letter-spacing:-.045em}.faq-page header span{display:block;margin-top:1rem;max-width:64ch;color:var(--muted);font-size:1.04rem;line-height:1.72}.faq-page__list{display:grid;gap:.75rem}.faq-page__list div{padding:1.15rem;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:var(--surface)}.faq-page__list dt{color:var(--yellow);font-weight:900;margin-bottom:.45rem}.faq-page__list dd{margin:0;color:var(--muted);line-height:1.68}.faq-page__actions{display:flex;flex-wrap:wrap;gap:.7rem}.faq-page__primary,.faq-page__secondary{min-height:46px;display:inline-flex;align-items:center;justify-content:center;padding:.72rem 1rem;border-radius:999px;font-weight:900}.faq-page__primary{background:var(--yellow);color:var(--bg)}.faq-page__secondary{border:1px solid rgba(255,209,0,.34);color:var(--yellow)}@media(max-width:820px){.faq-page__primary,.faq-page__secondary{width:100%}}`;
