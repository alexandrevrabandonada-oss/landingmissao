import type { Metadata } from "next";
import Link from "next/link";
import { SupportPhotoTool } from "@/src/components/support/SupportPhotoTool";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { buildDonationUrl } from "@/src/content/siteLinks";

export const metadata: Metadata = {
  title: {
    absolute: `Foto de apoio | ${SITE_IDENTITY.fullLabel}`,
  },
  description:
    "Crie uma montagem de perfil com a mensagem Eu apoio Glauber Braga e Alexandre VR Abandonada.",
  alternates: { canonical: "/apoio" },
  openGraph: {
    title: `Foto de apoio | ${SITE_IDENTITY.fullLabel}`,
    description:
      "Crie sua imagem de apoio para redes sociais. A foto é processada no seu navegador.",
    type: "website",
    locale: "pt_BR",
    url: "/apoio",
    images: [
      {
        url: "/og-lancamento.svg",
        width: 1200,
        height: 630,
        alt: SITE_IDENTITY.fullLabel,
      },
    ],
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

  return (
    <>
      <section className="support-page">
        <div className="container support-page__inner">
          <div className="support-page__header">
            <Link href="/lancamento" className="support-page__back">
              ← Voltar para o lançamento
            </Link>
            <div>
              <p className="support-page__label">Concreto zen / estúdio de imagem</p>
              <h1>Foto de apoio com presença</h1>
              <p>
                Uma ferramenta simples para transformar sua foto em uma peça limpa,
                forte e pronta para perfil. O processamento acontece só no seu navegador.
              </p>
            </div>
            <div className="support-page__tags" aria-label="Características da ferramenta">
              <span>1080 × 1080</span>
              <span>perfil circular</span>
              <span>processamento local</span>
            </div>
            <a
              href={donationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="support-page__donation"
            >
              Contribuir com a vaquinha
            </a>
          </div>

          <SupportPhotoTool />
        </div>
      </section>

      <style>{`
        .support-page {
          min-height: 100vh;
          padding-block: 1.5rem 4rem;
          background:
            radial-gradient(circle at 18% 8%, rgba(255, 209, 0, 0.08), transparent 24rem),
            radial-gradient(circle at 92% 18%, rgba(192, 57, 43, 0.08), transparent 30rem),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 100%),
            linear-gradient(180deg, #181714 0%, #0b0b0e 58%, #070708 100%),
            var(--bg);
          background-size: auto, auto, 42px 100%, auto, auto;
        }

        .support-page__inner {
          display: grid;
          gap: 1.4rem;
        }

        .support-page__header {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 1.25rem;
          align-items: end;
          padding: 1.25rem 0 0.25rem;
        }

        .support-page__back {
          display: inline-flex;
          grid-column: 1 / -1;
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
        }

        .support-page__header h1 {
          max-width: 760px;
          font-size: clamp(2.6rem, 7vw, 5.5rem);
          letter-spacing: -0.055em;
          line-height: 0.9;
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
        }

        .support-page__donation {
          justify-self: end;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0.65rem 1rem;
          border: 1px solid rgba(255, 209, 0, 0.38);
          border-radius: 8px;
          background: rgba(255, 209, 0, 0.1);
          color: var(--yellow);
          font-weight: 800;
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
          .support-page {
            padding-block: 1rem 2.5rem;
          }

          .support-page__header {
            grid-template-columns: 1fr;
          }

          .support-page__header h1 {
            font-size: 3rem;
          }

          .support-page__tags {
            justify-content: flex-start;
          }

          .support-page__donation {
            justify-self: stretch;
          }
        }
      `}</style>
    </>
  );
}
