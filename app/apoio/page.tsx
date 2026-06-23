import type { Metadata } from "next";
import Link from "next/link";
import { SupportPhotoTool } from "@/src/components/support/SupportPhotoTool";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";

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

export default function ApoioPage() {
  return (
    <>
      <section className="support-page">
        <div className="container support-page__inner">
          <div className="support-page__header">
            <Link href="/lancamento" className="support-page__back">
              Voltar para o lançamento
            </Link>
            <p className="eyebrow">foto para perfil</p>
            <h1>Eu apoio Glauber Braga e Alexandre VR Abandonada</h1>
            <p>
              Envie uma foto, ajuste o enquadramento e baixe uma imagem quadrada para usar no perfil
              das redes sociais. O processamento acontece no seu navegador.
            </p>
            <div className="support-page__tags" aria-label="Características da ferramenta">
              <span>quadrado para perfil</span>
              <span>foto local</span>
              <span>sem cadastro</span>
            </div>
          </div>

          <SupportPhotoTool />
        </div>
      </section>

      <style>{`
        .support-page {
          min-height: 100vh;
          padding-block: 2rem 4rem;
          background:
            linear-gradient(180deg, rgba(192, 57, 43, 0.22), transparent 38%),
            linear-gradient(90deg, rgba(255, 209, 0, 0.06) 0 1px, transparent 1px 100%),
            var(--bg);
          background-size: auto, 34px 100%, auto;
        }

        .support-page__inner {
          display: grid;
          gap: 1.5rem;
        }

        .support-page__header {
          max-width: 820px;
        }

        .support-page__back {
          display: inline-flex;
          margin-bottom: 1.25rem;
          color: var(--yellow);
          font-size: 0.9rem;
          font-weight: 700;
        }

        .support-page__header h1 {
          max-width: 760px;
          font-size: 3.25rem;
          letter-spacing: 0;
        }

        .support-page__header p:not(.eyebrow) {
          max-width: 68ch;
          color: var(--muted);
          margin: 1rem 0 0;
        }

        .support-page__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-top: 1.1rem;
        }

        .support-page__tags span {
          display: inline-flex;
          border: 1px solid rgba(255, 209, 0, 0.28);
          border-radius: 999px;
          padding: 0.3rem 0.7rem;
          color: var(--yellow);
          background: rgba(255, 209, 0, 0.08);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        @media (max-width: 720px) {
          .support-page {
            padding-block: 1.25rem 2.5rem;
          }

          .support-page__header h1 {
            font-size: 2.25rem;
          }
        }
      `}</style>
    </>
  );
}
