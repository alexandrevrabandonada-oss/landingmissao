import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SupportPhotoTool } from "@/src/components/support/SupportPhotoTool";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";
import { buildDonationUrl } from "@/src/content/siteLinks";

const pageUrl = canonicalUrl("/apoio");
const pageTitle = `Foto de apoio | ${SITE_IDENTITY.publicName}`;
const pageDescription =
  `Crie sua foto de apoio a ${SITE_IDENTITY.publicName}, pré-candidato a deputado estadual. Gere a imagem no navegador, sem cadastro e sem enviar sua foto para servidor.`;

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    images: [
      {
        url: SEO_IMAGES.apoio,
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
    images: [SEO_IMAGES.apoio],
  },
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || "";
  }

  return value?.trim() || "";
}

export default async function ApoioPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const ref = getSearchValue(resolvedSearchParams?.ref);
  const donationUrl = buildDonationUrl(ref);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Pré-campanha",
        item: canonicalUrl("/lancamento"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Foto de apoio",
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <section className="support-page">
        <div className="container support-page__inner">
          <div className="support-page__header">
            <Link href="/lancamento" className="support-page__back">
              ← Voltar para o lançamento
            </Link>
            <div>
              <p className="support-page__label">Estúdio de imagem · concreto zen</p>
              <h1>Crie sua foto de apoio.</h1>
              <p>
                Envie sua foto, ajuste o rosto e baixe uma peça pronta para redes sociais.
                Tudo acontece no seu navegador.
              </p>
            </div>
            <div className="support-page__tags" aria-label="Características da ferramenta">
              <span>1080 × 1080</span>
              <span>perfil circular</span>
              <span>processamento local</span>
            </div>
            <a href="#montar-foto" className="support-page__jump">
              Montar agora
            </a>
            <a
              href={donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="support-page__donation"
            >
              Apoiar a vaquinha
            </a>
          </div>

          <div id="montar-foto">
            <SupportPhotoTool />
          </div>
        </div>
      </section>

      <style>{`
        .support-page {
          min-height: 100vh;
          padding-block: 1.25rem 4rem;
          background:
            radial-gradient(circle at 15% 10%, rgba(255, 209, 0, 0.11), transparent 24rem),
            radial-gradient(circle at 86% 8%, rgba(192, 57, 43, 0.11), transparent 28rem),
            linear-gradient(90deg, rgba(255, 255, 255, 0.032) 0 1px, transparent 1px 100%),
            linear-gradient(180deg, #1b1914 0%, #0b0b0e 52%, #070708 100%),
            var(--bg);
          background-size: auto, auto, 42px 100%, auto, auto;
        }

        .support-page__inner {
          display: grid;
          gap: 1.4rem;
        }

        .support-page__header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(220px, auto);
          gap: 1.25rem;
          align-items: start;
          padding: 1.25rem 0 0.65rem;
          overflow: hidden;
        }

        .support-page__back {
          display: inline-flex;
          align-items: center;
          grid-column: 1 / -1;
          min-height: 44px;
          width: fit-content;
          color: var(--yellow);
          font-size: 0.9rem;
          font-weight: 700;
          opacity: 0.92;
        }

        .support-page__back:hover {
          opacity: 1;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .support-page__label {
          margin: 0 0 0.65rem;
          color: var(--yellow);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          overflow-wrap: anywhere;
        }

        .support-page__header h1 {
          max-width: 880px;
          font-size: clamp(3rem, 8vw, 6.2rem);
          letter-spacing: -0.06em;
          line-height: 0.86;
          text-wrap: balance;
          overflow-wrap: normal;
        }

        .support-page__header p:not(.support-page__label) {
          max-width: 61ch;
          color: var(--muted);
          margin: 1rem 0 0;
          font-size: 1.04rem;
          line-height: 1.7;
        }

        .support-page__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          justify-content: flex-end;
          max-width: 360px;
          justify-self: end;
        }

        .support-page__donation {
          justify-self: end;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0.72rem 1.05rem;
          border: 1px solid rgba(255, 209, 0, 0.38);
          border-radius: 999px;
          background: rgba(255, 209, 0, 0.1);
          color: var(--yellow);
          font-weight: 800;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
        }

        .support-page__jump {
          justify-self: end;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0.72rem 1.05rem;
          border-radius: 999px;
          background: var(--yellow);
          color: var(--bg);
          font-weight: 900;
          box-shadow: 0 18px 48px rgba(255, 209, 0, 0.16);
        }

        .support-page__jump:hover {
          transform: translateY(-1px);
        }

        .support-page__donation:hover {
          background: var(--yellow);
          color: var(--bg);
        }

        .support-page__tags span {
          display: inline-flex;
          border: 1px solid rgba(255, 209, 0, 0.28);
          border-radius: 999px;
          padding: 0.42rem 0.72rem;
          color: var(--yellow);
          background: rgba(20, 19, 16, 0.72);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        @media (max-width: 720px) {
          html {
            scroll-padding-top: 0.8rem;
          }

          .support-page {
            padding-block: 0.8rem 2.5rem;
          }

          .support-page__header {
            grid-template-columns: 1fr;
            gap: 0.7rem;
            padding-top: 0.7rem;
            overflow: visible;
          }

          .support-page__header h1 {
            max-width: 11ch;
            font-size: clamp(2.35rem, 11vw, 3rem);
            line-height: 0.9;
            letter-spacing: -0.045em;
            text-wrap: balance;
          }

          .support-page__label {
            max-width: 28ch;
            font-size: 0.68rem;
            letter-spacing: 0.13em;
            line-height: 1.45;
          }

          .support-page__header p:not(.support-page__label) {
            max-width: 31ch;
            margin-top: 0.7rem;
            font-size: 0.92rem;
            line-height: 1.55;
            overflow-wrap: break-word;
          }

          .support-page__tags {
            justify-content: flex-start;
            max-width: 100%;
          }

          .support-page__tags span {
            padding: 0.34rem 0.58rem;
            font-size: 0.68rem;
          }

          .support-page__jump,
          .support-page__donation {
            justify-self: stretch;
            min-height: 48px;
          }
        }
      `}</style>
    </>
  );
}
