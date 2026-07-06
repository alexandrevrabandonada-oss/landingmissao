import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";
import { buildDonationUrl, buildVolunteerGroupUrl, siteLinks } from "@/src/content/siteLinks";

const pageUrl = canonicalUrl("/participar");
const pageTitle = `Como participar da pré-campanha | ${SITE_IDENTITY.publicName}`;
const pageDescription =
  `Veja formas seguras de participar da pré-campanha Alexandre VR Abandonada: voluntariado, App Missão ÉLuta, foto de apoio, vaquinha e compartilhamento.`;

export const metadata: Metadata = {
  title: { absolute: pageTitle },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: { title: pageTitle, description: pageDescription, type: "website", locale: "pt_BR", url: pageUrl, images: [{ url: SEO_IMAGES.participar, width: 1200, height: 630, alt: SITE_IDENTITY.fullLabel }] },
  twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription, images: [SEO_IMAGES.participar] },
};

export default function ParticiparPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Pré-campanha", item: canonicalUrl("/") }, { "@type": "ListItem", position: 2, name: "Participar", item: pageUrl }] };
  const volunteerUrl = buildVolunteerGroupUrl();
  const donationUrl = buildDonationUrl();
  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="participar-page">
        <div className="container participar-page__inner">
          <Link href="/" className="participar-page__back">← Voltar para a pré-campanha</Link>
          <header><p>como participar</p><h1>Escolha uma ação possível agora.</h1><span>Participar da pré-campanha pode começar pequeno: entrar no grupo, acessar o app, criar uma foto de apoio, contribuir ou compartilhar com responsabilidade.</span></header>
          <div className="participar-page__grid">
            <a href={volunteerUrl} target="_blank" rel="noopener noreferrer"><strong>Grupo de voluntários</strong><span>Receba orientação e combine próximos passos.</span></a>
            <a href={siteLinks.appAuthUrl} target="_blank" rel="noopener noreferrer"><strong>App Missão ÉLuta</strong><span>Cadastre-se para missões e formação.</span></a>
            <Link href="/apoio"><strong>Foto de apoio</strong><span>Crie uma peça para redes sociais no navegador.</span></Link>
            <a href={donationUrl} target="_blank" rel="noopener noreferrer"><strong>Vaquinha</strong><span>Ajude comunicação, materiais e mobilização.</span></a>
            <Link href="/perguntas-frequentes"><strong>Tirar dúvidas</strong><span>Entenda o funcionamento da pré-campanha.</span></Link>
            <Link href="/pautas"><strong>Pautas</strong><span>Conheça temas de escuta territorial.</span></Link>
          </div>
        </div>
      </section>
      <style>{css}</style>
    </>
  );
}

const css = `.participar-page{min-height:100svh;padding-block:1.25rem 4rem;background:linear-gradient(180deg,#0b0b0e 0%,#111114 100%)}.participar-page__inner{display:grid;gap:1.4rem;max-width:1040px}.participar-page__back{width:fit-content;min-height:44px;display:inline-flex;align-items:center;color:var(--yellow);font-weight:800}.participar-page header{max-width:840px}.participar-page header p{margin:0 0 .75rem;color:var(--yellow);font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.participar-page h1{margin:0;max-width:11ch;font-size:clamp(2.7rem,7vw,5.6rem);line-height:.94;letter-spacing:-.045em}.participar-page header span{display:block;margin-top:1rem;max-width:64ch;color:var(--muted);font-size:1.04rem;line-height:1.72}.participar-page__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.9rem}.participar-page__grid a{min-height:160px;padding:1.2rem;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:linear-gradient(145deg,rgba(255,209,0,.07),rgba(255,255,255,.018)),var(--surface);display:flex;flex-direction:column;justify-content:space-between}.participar-page__grid strong{color:var(--yellow);font-size:1.18rem}.participar-page__grid span{color:var(--muted);line-height:1.6}@media(max-width:820px){.participar-page__grid{grid-template-columns:1fr}}`;
