import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";

const pageUrl = canonicalUrl("/missao-eluta");
const pageTitle = `App Missão ÉLuta | Pré-campanha Alexandre VR Abandonada`;
const pageDescription =
  `Conheça o App Missão ÉLuta: ferramenta de cadastro, missões, formação e organização de base da pré-campanha Alexandre VR Abandonada.`;

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
    images: [{ url: SEO_IMAGES.missaoEluta, width: 1200, height: 630, alt: SITE_IDENTITY.appFullLabel }],
  },
  twitter: { card: "summary_large_image", title: pageTitle, description: pageDescription, images: [SEO_IMAGES.missaoEluta] },
};

export default function MissaoElutaPage() {
  const jsonLd = breadcrumb("App Missão ÉLuta", pageUrl);
  return (
    <SimpleSeoPage
      jsonLd={jsonLd}
      eyebrow="app missão éluta"
      title="O app transforma interesse em missão de base."
      lead="Missão ÉLuta é a ferramenta da pré-campanha para aproximar pessoas, organizar tarefas possíveis e acompanhar ações no território."
      cards={[
        ["Cadastro", "A pessoa entra, informa seu bairro e passa a receber orientação para participar com segurança."],
        ["Missões", "As tarefas são simples e graduais: conversar, registrar demanda, compartilhar material, chamar mais gente e participar de formação."],
        ["Formação", "O app conecta participação prática com conteúdo sobre campanha de base, escuta territorial e organização popular."],
      ]}
      actions={[["Participar", "/participar"], ["Ver pautas", "/pautas"], ["Voltar para home", "/"]]}
    />
  );
}

function breadcrumb(name: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Pré-campanha", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  };
}

function SimpleSeoPage({ jsonLd, eyebrow, title, lead, cards, actions }: { jsonLd: Record<string, unknown>; eyebrow: string; title: string; lead: string; cards: Array<[string, string]>; actions: Array<[string, string]> }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="simple-seo">
        <div className="container simple-seo__inner">
          <Link href="/" className="simple-seo__back">← Voltar para a pré-campanha</Link>
          <header className="simple-seo__hero"><p>{eyebrow}</p><h1>{title}</h1><span>{lead}</span></header>
          <div className="simple-seo__grid">{cards.map(([h, text]) => <article key={h}><h2>{h}</h2><p>{text}</p></article>)}</div>
          <nav className="simple-seo__actions" aria-label="Links relacionados">{actions.map(([label, href], i) => <Link key={href} href={href} className={i === 0 ? "simple-seo__primary" : "simple-seo__secondary"}>{label}</Link>)}</nav>
        </div>
      </section>
      <style>{css}</style>
    </>
  );
}

const css = `.simple-seo{min-height:100svh;padding-block:1.25rem 4rem;background:radial-gradient(circle at 14% 10%,rgba(255,209,0,.12),transparent 26rem),radial-gradient(circle at 86% 14%,rgba(192,57,43,.12),transparent 28rem),linear-gradient(180deg,#0b0b0e 0%,#111114 100%)}.simple-seo__inner{display:grid;gap:1.4rem;max-width:1040px}.simple-seo__back{width:fit-content;min-height:44px;display:inline-flex;align-items:center;color:var(--yellow);font-weight:800}.simple-seo__hero{max-width:840px}.simple-seo__hero p{margin:0 0 .75rem;color:var(--yellow);font-size:.72rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.simple-seo__hero h1{margin:0;max-width:12ch;font-size:clamp(2.7rem,7vw,5.6rem);line-height:.94;letter-spacing:-.045em}.simple-seo__hero span{display:block;margin-top:1rem;max-width:64ch;color:var(--muted);font-size:1.04rem;line-height:1.72}.simple-seo__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.9rem}.simple-seo__grid article{padding:1.2rem;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:linear-gradient(145deg,rgba(255,209,0,.07),rgba(255,255,255,.018)),var(--surface)}.simple-seo__grid h2{margin:0 0 .65rem;font-size:1.18rem;color:var(--yellow)}.simple-seo__grid p{margin:0;color:var(--muted);line-height:1.68}.simple-seo__actions{display:flex;flex-wrap:wrap;gap:.7rem}.simple-seo__primary,.simple-seo__secondary{min-height:46px;display:inline-flex;align-items:center;justify-content:center;padding:.72rem 1rem;border-radius:999px;font-weight:900}.simple-seo__primary{background:var(--yellow);color:var(--bg)}.simple-seo__secondary{border:1px solid rgba(255,209,0,.34);color:var(--yellow)}@media(max-width:820px){.simple-seo__grid{grid-template-columns:1fr}.simple-seo__hero h1{max-width:11ch}.simple-seo__primary,.simple-seo__secondary{width:100%}}`;
