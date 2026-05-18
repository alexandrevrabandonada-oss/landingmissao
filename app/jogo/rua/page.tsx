import type { Metadata } from "next";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import {
  buildGameAppBaseUrl,
  buildGameAppMissoesUrl,
  buildGameAppSignupUrl,
} from "@/src/content/siteLinks";
import { buildRunnerGamePath, buildTrackedPath } from "@/src/lib/shareLaunch";
import { GameRuaEntry } from "./GameRuaEntry";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const canonicalUrl = siteUrl ? `${siteUrl}/jogo/rua` : "/jogo/rua";

export const metadata: Metadata = {
  title: {
    absolute: `Jogo Runner | ${SITE_IDENTITY.fullLabel} · ${SITE_IDENTITY.appName}`,
  },
  description:
    `${SITE_IDENTITY.fullLabel}. Missão relâmpago mobile-first para coletar relatos, provas, memória e apoio popular em uma rua urbana de Volta Redonda.`,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "Missão ÉLuta: Rua em Movimento",
    description:
      `${SITE_IDENTITY.fullLabel}. Runner autoral mobile-first para transformar escuta em organização popular.`,
    type: "website",
    locale: "pt_BR",
    url: canonicalUrl,
    images: [
      {
        url: "/game-runner/lancamento-preview.svg",
        width: 1200,
        height: 630,
        alt: "Preview de Rua em Movimento",
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

export default async function JogoRuaPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const ref = getSearchValue(resolvedSearchParams?.ref);
  const debug = getSearchValue(resolvedSearchParams?.debug) === "1";
  const playtest = getSearchValue(resolvedSearchParams?.playtest) === "1";

  const shareUrl = buildRunnerGamePath(ref, "game", "share");
  const appUrl = buildGameAppBaseUrl(ref);
  const signupUrl = buildGameAppSignupUrl(ref);
  const missionUrl = buildGameAppMissoesUrl(ref);
  const exitUrl = buildTrackedPath({
    basePath: "/lancamento",
    ref,
    utmSource: "game",
    utmMedium: "exit_runner",
    utmContent: "runner_rua",
  });

  return (
    <>
      <section className="runner-page">
        <div className="container runner-page__inner">
          <div className="runner-page__intro">
            <p className="runner-page__eyebrow">Missão relâmpago mobile-first</p>
            <h1 className="runner-page__title">Missão ÉLuta: Rua em Movimento</h1>
            <p className="runner-page__lead">
              Corra por uma rua urbana, troque de faixa, pule, abaixe e organize uma cidade
              melhor coletando relatos, provas, memória e apoio popular.
            </p>
          </div>

          <GameRuaEntry
            refId={ref}
            debug={debug}
            playtest={playtest}
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
.runner-page {
  position: relative;
  overflow: hidden;
  min-height: 100svh;
  padding: 2.5rem 0 4rem;
  background:
    radial-gradient(circle at 14% 18%, rgba(255,209,0,0.14), transparent 28%),
    radial-gradient(circle at 82% 22%, rgba(192,57,43,0.18), transparent 26%),
    linear-gradient(180deg, #0b0b0e 0%, #131116 100%);
}
.runner-page__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}
.runner-page__intro {
  max-width: 760px;
}
.runner-page__eyebrow,
.runner-loading__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--yellow);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.runner-page__title,
.runner-loading__title {
  margin: 0 0 0.85rem;
  font-family: var(--font-head);
  font-size: clamp(2rem, 6vw, 4.2rem);
  line-height: 0.96;
  max-width: 12ch;
}
.runner-page__lead,
.runner-loading__text {
  margin: 0;
  max-width: min(64ch, 100%);
  color: var(--muted);
  font-size: 1rem;
}
.runner-loading {
  width: min(100%, 560px);
  max-width: 560px;
  padding: 1.35rem;
  border-radius: var(--radius-lg);
  box-sizing: border-box;
}
@media (max-width: 640px) {
  .runner-page {
    padding-top: 1.9rem;
    padding-bottom: 2.4rem;
  }
  .runner-loading {
    width: 100%;
    padding: 1.1rem;
  }
}
`;
