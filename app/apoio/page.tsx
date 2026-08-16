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
  `Crie sua arte “Eu voto ${SITE_IDENTITY.publicName} 50800”. Gere a imagem no navegador, sem cadastro e sem enviar sua foto para servidor.`;

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
        item: canonicalUrl("/"),
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
          <nav className="support-page__nav" aria-label="Navegação da ferramenta">
            <Link href="/" className="support-page__back">
              ← Voltar para a pré-campanha
            </Link>
            <a
              href={donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="support-page__donation"
            >
              Apoiar a vaquinha ↗
            </a>
          </nav>

          <div id="montar-foto">
            <SupportPhotoTool />
          </div>
        </div>
      </section>

      <style>{`
        .support-page {
          min-height: 100vh;
          padding-block: 0.75rem 3rem;
          background:
            linear-gradient(90deg, #0e6473 0 10px, #f2efe5 10px 12px, transparent 12px),
            linear-gradient(90deg, rgba(242, 239, 229, 0.026) 0 1px, transparent 1px 100%),
            #101214;
          background-size: auto, 48px 100%, auto;
        }

        .support-page__inner {
          width: min(100%, 1480px);
          max-width: 1480px;
          display: grid;
          gap: 0.35rem;
        }

        .support-page__nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          min-height: 46px;
          border-bottom: 1px solid rgba(242, 239, 229, 0.09);
        }

        .support-page__back {
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          width: fit-content;
          color: #f2c230;
          font-size: 0.9rem;
          font-weight: 700;
          opacity: 0.92;
        }

        .support-page__back:hover {
          opacity: 1;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .support-page__donation {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          padding: 0.45rem 0;
          border: 0;
          background: none;
          color: #58aebb;
          font-weight: 800;
        }

        .support-page__donation:hover {
          color: #f2c230;
        }

        @media (max-width: 720px) {
          html {
            scroll-padding-top: 0.8rem;
          }

          .support-page {
            padding-block: 0.8rem 2.5rem;
          }

          .support-page__nav {
            align-items: center;
          }

          .support-page__back,
          .support-page__donation {
            font-size: 0.76rem;
          }
        }
      `}</style>
    </>
  );
}
