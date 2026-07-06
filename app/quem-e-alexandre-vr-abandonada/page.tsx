import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, publicAssetUrl, SEO_IMAGES } from "@/src/content/siteSeo";

const pageUrl = canonicalUrl("/quem-e-alexandre-vr-abandonada");
const pageTitle = `Quem é Alexandre VR Abandonada | Pré-campanha em Volta Redonda`;
const pageDescription =
  `Conheça Alexandre VR Abandonada, pré-candidato a deputado estadual em uma pré-campanha de organização popular, escuta territorial e participação de base em Volta Redonda.`;

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "profile",
    locale: "pt_BR",
    url: pageUrl,
    images: [
      {
        url: SEO_IMAGES.quemE,
        width: 1200,
        height: 630,
        alt: SITE_IDENTITY.fullLabel,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [SEO_IMAGES.quemE],
  },
};

export default function QuemEPage() {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE_IDENTITY.publicName,
    url: pageUrl,
    image: publicAssetUrl("/alexandre-retrato-hero.webp"),
    description: pageDescription,
    jobTitle: "Pré-candidato a deputado estadual",
    homeLocation: {
      "@type": "Place",
      name: "Volta Redonda, RJ",
    },
    knowsAbout: [
      "Volta Redonda",
      "organização popular",
      "escuta territorial",
      "pré-campanha de base",
      SITE_IDENTITY.appName,
    ],
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Pré-campanha",
        item: canonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Quem é Alexandre VR Abandonada",
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[personJsonLd, breadcrumbJsonLd]} />
      <section className="profile-page">
        <div className="container profile-page__inner">
          <Link href="/" className="profile-page__back">
            ← Voltar para a pré-campanha
          </Link>

          <header className="profile-page__hero">
            <p className="profile-page__eyebrow">quem é alexandre vr abandonada</p>
            <h1>Alexandre VR Abandonada e a pré-campanha em Volta Redonda.</h1>
            <p>
              Alexandre VR Abandonada se apresenta como pré-candidato a deputado estadual
              em uma construção pública baseada em escuta territorial, organização popular
              e participação de base.
            </p>
          </header>

          <div className="profile-page__grid">
            <article>
              <h2>Relação com Volta Redonda</h2>
              <p>
                A pré-campanha parte da vida concreta de Volta Redonda: bairros,
                trabalhadores, juventudes, cultura, saúde, escola, transporte e periferias.
                A proposta é escutar problemas reais, organizar relatos e transformar
                participação em ação coletiva.
              </p>
            </article>
            <article>
              <h2>O papel da pré-campanha</h2>
              <p>
                Antes de qualquer etapa eleitoral oficial, a pré-campanha funciona como
                espaço de apresentação pública, formação de rede, circulação de ideias
                e organização de voluntários. A linguagem é de pré-campanha, sem pedido
                de voto e sem número eleitoral.
              </p>
            </article>
            <article>
              <h2>Método de organização</h2>
              <p>
                O método é direto: escutar com responsabilidade, cuidar das pessoas e
                organizar próximos passos possíveis. O App Missão ÉLuta ajuda a reunir
                cadastro, missões, formação e acompanhamento de ações de base.
              </p>
            </article>
          </div>

          <div className="profile-page__actions" aria-label="Ações relacionadas">
            <Link href="/#acoes" className="profile-page__primary">
              Participar da pré-campanha
            </Link>
            <Link href="/metodo" className="profile-page__secondary">
              Conhecer o método
            </Link>
            <Link href="/apoio" className="profile-page__secondary">
              Criar foto de apoio
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .profile-page {
          min-height: 100svh;
          padding-block: 1.25rem 4rem;
          background:
            radial-gradient(circle at 14% 10%, rgba(255, 209, 0, 0.12), transparent 26rem),
            radial-gradient(circle at 86% 14%, rgba(192, 57, 43, 0.12), transparent 28rem),
            linear-gradient(180deg, #0b0b0e 0%, #111114 100%);
        }
        .profile-page__inner {
          display: grid;
          gap: 1.4rem;
          max-width: 1040px;
        }
        .profile-page__back {
          width: fit-content;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          color: var(--yellow);
          font-weight: 800;
        }
        .profile-page__hero {
          max-width: 820px;
        }
        .profile-page__eyebrow {
          margin: 0 0 0.75rem;
          color: var(--yellow);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .profile-page h1 {
          margin: 0;
          max-width: 12ch;
          font-size: clamp(2.7rem, 7vw, 5.6rem);
          line-height: 0.94;
          letter-spacing: -0.045em;
        }
        .profile-page__hero p {
          margin: 1rem 0 0;
          max-width: 62ch;
          color: var(--muted);
          font-size: 1.04rem;
          line-height: 1.72;
        }
        .profile-page__grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.9rem;
        }
        .profile-page__grid article {
          padding: 1.2rem;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          background:
            linear-gradient(145deg, rgba(255,209,0,0.07), rgba(255,255,255,0.018)),
            var(--surface);
        }
        .profile-page__grid h2 {
          margin: 0 0 0.65rem;
          font-size: 1.18rem;
          color: var(--yellow);
        }
        .profile-page__grid p {
          margin: 0;
          color: var(--muted);
          line-height: 1.68;
        }
        .profile-page__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.7rem;
        }
        .profile-page__primary,
        .profile-page__secondary {
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.72rem 1rem;
          border-radius: 999px;
          font-weight: 900;
        }
        .profile-page__primary {
          background: var(--yellow);
          color: var(--bg);
        }
        .profile-page__secondary {
          border: 1px solid rgba(255, 209, 0, 0.34);
          color: var(--yellow);
        }
        @media (max-width: 820px) {
          .profile-page__grid {
            grid-template-columns: 1fr;
          }
          .profile-page h1 {
            max-width: 11ch;
          }
          .profile-page__primary,
          .profile-page__secondary {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
