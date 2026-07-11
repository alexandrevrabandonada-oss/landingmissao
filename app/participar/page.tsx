import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { ParticipationLadder } from "@/src/components/civic/ParticipationLadder";
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
          <ParticipationLadder paths={[
            { id: "conhecer", level: "baixo compromisso", title: "Conhecer uma pauta", description: "Escolha o tema que mais mobiliza você.", disclosure: "Você seguirá dentro do portal para conhecer as pautas estaduais e selecionar uma prioridade. Nenhum cadastro será solicitado.", cta: "Conhecer as pautas", href: "/pautas" },
            { id: "compartilhar", level: "ampliar", title: "Criar um sinal de apoio", description: "Produza uma peça sem enviar sua foto ao servidor.", disclosure: "A ferramenta abrirá dentro do portal. A imagem é processada no seu navegador e você decide se deseja salvá-la ou compartilhá-la.", cta: "Criar foto de apoio", href: "/apoio" },
            { id: "organizar", level: "participar", title: "Conversar com a organização", description: "Encontre uma ação possível no seu território.", disclosure: "Uma nova aba abrirá o grupo de voluntários no WhatsApp. Você poderá ler a apresentação antes de decidir enviar qualquer mensagem.", cta: "Abrir grupo de voluntários", href: volunteerUrl, external: true },
            { id: "agir", level: "ação recorrente", title: "Entrar no App Missão ÉLuta", description: "Receba missões e conteúdos de formação.", disclosure: "Uma nova aba abrirá o aplicativo. O cadastro só acontece lá e você poderá conhecer o fluxo antes de confirmar seus dados.", cta: "Conhecer o aplicativo", href: siteLinks.appAuthUrl, external: true },
            { id: "sustentar", level: "contribuir", title: "Fortalecer a mobilização", description: "Ajude comunicação, materiais e organização de base.", disclosure: "Uma nova aba abrirá a página segura da vaquinha. Você verá valores e condições antes de concluir qualquer contribuição.", cta: "Conhecer a vaquinha", href: donationUrl, external: true },
          ]} />
          <div className="participar-page__grid">
            <a href={volunteerUrl} target="_blank" rel="noopener noreferrer"><strong>Grupo de voluntários</strong><span>Receba orientação e combine próximos passos.</span></a>
            <a href={siteLinks.appAuthUrl} target="_blank" rel="noopener noreferrer"><strong>App Missão ÉLuta</strong><span>Cadastre-se para missões e formação.</span></a>
            <Link href="/apoio"><strong>Foto de apoio</strong><span>Crie uma peça para redes sociais no navegador.</span></Link>
            <a href={donationUrl} target="_blank" rel="noopener noreferrer"><strong>Vaquinha</strong><span>Ajude comunicação, materiais e mobilização.</span></a>
            <Link href="/perguntas-frequentes"><strong>Tirar dúvidas</strong><span>Entenda o funcionamento da pré-campanha.</span></Link>
            <Link href="/pautas"><strong>Pautas estaduais</strong><span>Escolha uma prioridade em escuta no Rio de Janeiro.</span></Link>
          </div>
        </div>
      </section>
      <style>{css}</style>
    </>
  );
}

const css = `.participar-page{min-height:100svh;padding-block:1.25rem 4rem;background:linear-gradient(180deg,#0b0b0e 0%,#111114 100%)}.participar-page__inner{display:grid;gap:1.4rem;max-width:1040px}.participar-page__back{width:fit-content;min-height:44px;display:inline-flex;align-items:center;color:var(--yellow);font-weight:800}.participar-page header{max-width:840px}.participar-page header p,.participar-ladder__heading p{margin:0 0 .75rem;color:var(--yellow);font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.participar-page h1{margin:0;max-width:11ch;font-size:clamp(2.7rem,7vw,5.6rem);line-height:.94;letter-spacing:-.045em}.participar-page header span{display:block;margin-top:1rem;max-width:64ch;color:var(--muted);font-size:1.04rem;line-height:1.72}.participar-ladder{margin-block:1.2rem 2rem;padding:clamp(1rem,3vw,2rem);border:1px solid rgba(255,209,0,.2);border-radius:24px;background:radial-gradient(circle at 85% 0,rgba(255,209,0,.1),transparent 36%),#111114}.participar-ladder__heading{max-width:680px}.participar-ladder__heading h2{margin:0;font-size:clamp(1.9rem,4vw,3.2rem);line-height:1}.participar-ladder__heading>span{display:block;margin-top:.7rem;color:var(--muted);line-height:1.6}.participar-ladder__layout{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:1rem;margin-top:1.4rem}.participar-ladder__choices{display:grid;gap:.55rem}.participar-ladder__choices button{min-height:92px;padding:.85rem 1rem;text-align:left;border:1px solid rgba(255,255,255,.09);border-radius:15px;background:#17171b;color:#fff;display:grid;gap:.22rem;cursor:pointer}.participar-ladder__choices button[aria-pressed=true]{border-color:var(--yellow);background:linear-gradient(90deg,rgba(255,209,0,.12),#17171b)}.participar-ladder__choices small{color:var(--yellow);font-size:.65rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.participar-ladder__choices strong{font-size:1.05rem}.participar-ladder__choices span{color:var(--muted);line-height:1.4}.participar-ladder__next{position:sticky;top:1rem;align-self:start;min-height:300px;padding:1.25rem;border-radius:18px;background:var(--yellow);color:#0b0b0e;display:flex;flex-direction:column}.participar-ladder__next p{margin:0;font-size:.68rem;font-weight:900;letter-spacing:.13em;text-transform:uppercase}.participar-ladder__next h3{margin:.7rem 0;font-size:1.55rem;line-height:1.05}.participar-ladder__next>span{line-height:1.55}.participar-ladder__next a{min-height:50px;margin-top:auto;padding:.75rem 1rem;border-radius:12px;background:#0b0b0e;color:#fff;display:flex;align-items:center;justify-content:space-between;font-weight:900}.participar-ladder__next small{margin-top:.7rem;line-height:1.4;opacity:.72}.participar-page__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.9rem}.participar-page__grid a{min-height:160px;padding:1.2rem;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:linear-gradient(145deg,rgba(255,209,0,.07),rgba(255,255,255,.018)),var(--surface);display:flex;flex-direction:column;justify-content:space-between}.participar-page__grid strong{color:var(--yellow);font-size:1.18rem}.participar-page__grid span{color:var(--muted);line-height:1.6}@media(max-width:820px){.participar-ladder__layout{grid-template-columns:1fr}.participar-ladder__next{position:static;min-height:260px}.participar-page__grid{grid-template-columns:1fr}}@media(max-width:480px){.participar-ladder{margin-inline:-.35rem;padding:.9rem;border-radius:18px}.participar-ladder__choices button{min-height:86px}.participar-ladder__next{min-height:250px}}`;
