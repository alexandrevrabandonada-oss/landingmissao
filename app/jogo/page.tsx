import type { Metadata } from "next";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { canonicalUrl, SEO_IMAGES } from "@/src/content/siteSeo";
import {
  buildGameAppBaseUrl,
  buildGameAppMissoesUrl,
  buildGameAppSignupUrl,
} from "@/src/content/siteLinks";
import { buildGamePath, buildTrackedPath } from "@/src/lib/shareLaunch";
import { GameEntry } from "./GameEntry";

const pageUrl = canonicalUrl("/jogo");
const pageTitle = `Missão ÉLuta: Corre da Burocracia`;
const pageDescription =
  `${SITE_IDENTITY.fullLabel}. Missão relâmpago autoral para reunir relatos, memória, provas e apoio popular.`;

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: { canonical: pageUrl },
  robots: { index: false, follow: true },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    locale: "pt_BR",
    url: pageUrl,
    images: [
      {
        url: SEO_IMAGES.jogo,
        width: 1200,
        height: 630,
        alt: SITE_IDENTITY.appFullLabel,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [SEO_IMAGES.jogo],
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

export default async function JogoPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const ref = getSearchValue(resolvedSearchParams?.ref);

  const shareUrl = buildGamePath(ref, "game", "share");
  const appUrl = buildGameAppBaseUrl(ref);
  const signupUrl = buildGameAppSignupUrl(ref);
  const missionUrl = buildGameAppMissoesUrl(ref);
  const exitUrl = buildTrackedPath({
    basePath: "/",
    ref,
    utmSource: "game",
    utmMedium: "exit",
  });
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
        name: "Corre da Burocracia",
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <section className="game-page">
        <div className="container game-page__inner">
          <div className="game-page__intro">
            <p className="game-page__eyebrow">Missão relâmpago</p>
            <h1 className="game-page__title">Missão ÉLuta: Corre da Burocracia</h1>
            <p className="game-page__lead">
              Corra por uma cidade travada, reúna relatos, provas, memória e apoio popular.
              No fim, a cidade responde melhor porque a escuta virou organização.
            </p>
          </div>

          <GameEntry
            refId={ref}
            shareUrl={shareUrl}
            appUrl={appUrl}
            signupUrl={signupUrl}
            missionUrl={missionUrl}
            exitUrl={exitUrl}
          />
        </div>
      </section>

      <style>{css}</style>
    </>
  );
}

const css = `
.game-page {
  position: relative;
  overflow: hidden;
  min-height: 100svh;
  padding: 3rem 0 4rem;
  background:
    radial-gradient(circle at 14% 18%, rgba(255,209,0,0.16), transparent 28%),
    radial-gradient(circle at 82% 22%, rgba(192,57,43,0.18), transparent 26%),
    linear-gradient(180deg, #0b0b0e 0%, #121217 100%);
}
.game-page__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  min-width: 0;
}
.game-page__intro {
  max-width: 760px;
  min-width: 0;
}
.game-page__eyebrow,
.game-loading__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--yellow);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.game-page__title,
.game-loading__title {
  margin: 0 0 0.85rem;
  font-family: var(--font-head);
  font-size: clamp(2.1rem, 6vw, 4.6rem);
  line-height: 1;
  text-wrap: balance;
  max-width: 11ch;
}
.game-page__lead,
.game-loading__text {
  margin: 0;
  max-width: min(62ch, 100%);
  color: var(--muted);
  font-size: 1rem;
  overflow-wrap: anywhere;
}
.game-loading {
  width: min(100%, 720px);
  max-width: 720px;
  min-width: 0;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-sizing: border-box;
}
@media (max-width: 640px) {
  .game-page {
    padding-top: 2rem;
    padding-bottom: 2.5rem;
  }
  .game-page__title,
  .game-loading__title {
    max-width: 12ch;
  }
  .game-loading {
    padding: 1.2rem;
  }
}
`;
