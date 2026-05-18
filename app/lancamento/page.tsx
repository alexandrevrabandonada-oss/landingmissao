import type { Metadata } from "next";
import Image from "next/image";
import { launchEvent as e } from "@/content/launchEvent";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import {
  buildAppBaseUrl,
  buildAppMissoesUrl,
  buildAppSignupUrl,
} from "@/src/content/siteLinks";
import { buildGamePath, buildLaunchUrl, buildRunnerGamePath } from "@/src/lib/shareLaunch";
import { LaunchActionStrip } from "@/src/components/launch/LaunchActionStrip";
import { ShareButtons } from "./ShareButtons";
import { ViralBlock } from "./ViralBlock";
import { CopyInfoBtn } from "./CopyInfoBtn";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const canonicalUrl = siteUrl ? `${siteUrl}/lancamento` : "/lancamento";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_IDENTITY.fullLabel} · ${SITE_IDENTITY.appName}`,
  },
  description: `${SITE_IDENTITY.fullLabel}. Evento público do ${SITE_IDENTITY.appFullLabel}.`,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: `${SITE_IDENTITY.fullLabel} · ${SITE_IDENTITY.appName}`,
    description: `${SITE_IDENTITY.fullLabel}. Evento público do ${SITE_IDENTITY.appFullLabel}.`,
    type: "website",
    locale: "pt_BR",
    url: canonicalUrl,
    images: [
      {
        url: "/og-lancamento.svg",
        width: 1200,
        height: 630,
        alt: SITE_IDENTITY.appFullLabel,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${SITE_IDENTITY.fullLabel} · ${SITE_IDENTITY.appName}`,
    description: `${SITE_IDENTITY.fullLabel}. Evento público do ${SITE_IDENTITY.appFullLabel}.`,
    images: ["/og-lancamento.svg"],
  },
};

const dataPending = e.dateLabel === "DATA_A_CONFIRMAR";
const timePending = e.timeLabel === "HORARIO_A_CONFIRMAR";
const localPending = e.locationLabel === "LOCAL_A_CONFIRMAR";
const addrPending = e.addressLabel === "ENDERECO_A_CONFIRMAR";
const hasAddress = !addrPending;
const praQuemCards = [
  "Nunca participei, mas quero entender",
  "Quero ajudar pelo celular",
  "Quero organizar meu bairro",
  "Quero chamar amigos, família e trabalho",
] as const;

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || "";
  }

  return value?.trim() || "";
}

export default async function LancamentoPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const ref = getSearchValue(resolvedSearchParams?.ref);
  const utmSource = getSearchValue(resolvedSearchParams?.utm_source);
  const utmMedium = getSearchValue(resolvedSearchParams?.utm_medium);
  const utmCampaign = getSearchValue(resolvedSearchParams?.utm_campaign);
  const inviteReceived = Boolean(ref);

  const participateUrl = buildAppSignupUrl(ref);
  const appUrl = buildAppBaseUrl(ref);
  const missionUrl = buildAppMissoesUrl(ref);
  const gameUrl = buildGamePath(ref, "landing", "game_teaser");
  const runnerGameUrl = buildRunnerGamePath(ref, "landing", "game_teaser");
  const gamePreviewSrc = "/game/lancamento-preview.svg";
  const runnerPreviewSrc = "/game-runner/lancamento-preview.svg";

  const cleanParams = new URLSearchParams();
  if (utmSource) cleanParams.set("utm_source", utmSource);
  if (utmMedium) cleanParams.set("utm_medium", utmMedium);
  if (utmCampaign) cleanParams.set("utm_campaign", utmCampaign);

  const cleanBasePath = cleanParams.size
    ? `/lancamento?${cleanParams.toString()}`
    : "/lancamento";
  const sharePath = buildLaunchUrl(cleanBasePath, ref);
  const whatsAppSharePath = buildLaunchUrl(
    "/lancamento?utm_source=landing&utm_medium=share&utm_campaign=pre_campanha_alexandre_vr_abandonada",
    ref,
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="lp-hero" aria-label="Lançamento da pré-campanha">
        <div className="lp-hero__glow" aria-hidden="true" />
        <div className="lp-hero__grid-lines" aria-hidden="true" />

        <div className="container lp-hero__inner">
          <div className="lp-hero__content">
            <div className="lp-hero__copy">
              <div className="lp-hero__badge" aria-label="Iniciativa de">
                <span className="lp-hero__badge-dot" aria-hidden="true" />
                {e.badge}
              </div>
              {inviteReceived && (
                <p className="lp-hero__invite" aria-label="Chegou por convite">
                  Convite recebido
                </p>
              )}

              <p className="lp-eyebrow">{e.eyebrow}</p>
              <h1 className="lp-hero__title">{e.title}</h1>
              <p className="lp-hero__subtitle">{e.subtitle}</p>

              <div className="lp-hero__event-inline" role="status" aria-label="Resumo rápido de data, horário e local">
                <span><strong>Data:</strong> {dataPending ? "Em breve" : e.dateLabel}</span>
                <span><strong>Horário:</strong> {timePending ? "Em breve" : e.timeLabel}</span>
                <span><strong>Local:</strong> {localPending ? "Volta Redonda" : e.locationLabel}</span>
              </div>
              <p className="lp-hero__event-note">
                Entre para receber o aviso assim que a data e o local forem confirmados.
              </p>

              <p className="lp-hero__sig">
                <span className="lp-hero__sig-line" aria-hidden="true" />
                {e.signature}
              </p>

              <ShareButtons
                participateUrl={participateUrl}
                appUrl={appUrl}
                missionUrl={missionUrl}
                viralHref="#sec-viral"
                whatsappNumber={e.whatsappNumber}
              />
            </div>

            <div className="lp-hero__visual" aria-label="Retrato do candidato">
              <div className="lp-hero__portrait-shell">
                <div className="lp-hero__portrait-glow" aria-hidden="true" />
                <div className="lp-hero__portrait-frame">
                  <Image
                    src="/alexandre-retrato.png"
                    alt="Retrato de Alexandre VR Abandonada em composição editorial"
                    width={1024}
                    height={1024}
                    priority
                    className="lp-hero__portrait"
                  />
                </div>
                <div className="lp-hero__portrait-note">
                  <p className="lp-hero__portrait-name">{SITE_IDENTITY.publicName}</p>
                  <p className="lp-hero__portrait-role">Rosto público da pré-campanha no App Missão ÉLuta.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lp-hero__scroll" aria-hidden="true">↓</div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. O QUE VAI ACONTECER
      ═══════════════════════════════════════════════════════ */}
      <section className="lp-section lp-section--dark" aria-labelledby="sec-acontecer">
        <div className="container">
          <header className="lp-sec-header">
            <p className="lp-eyebrow">o que vai acontecer</p>
            <h2 className="lp-sec-title" id="sec-acontecer">
              Quatro momentos do evento
            </h2>
            <p className="lp-sec-lead">
              Do lançamento público ao cadastro no app — tudo acontece no mesmo dia.
            </p>
          </header>

          <ul className="lp-cards-grid" role="list" aria-label="Momentos do evento">
            {e.whatWillHappen.map((item) => (
              <li key={item.title} className="lp-card lp-card--glow">
                <span className="lp-card__icon" aria-hidden="true">{item.icon}</span>
                <h3 className="lp-card__title">{item.title}</h3>
                <p className="lp-card__desc">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. PRA QUEM E
      ═══════════════════════════════════════════════════════ */}
      <section className="lp-section" aria-labelledby="sec-pra-quem">
        <div className="container">
          <header className="lp-sec-header lp-sec-header--tight">
            <h2 className="lp-sec-title" id="sec-pra-quem">
              Você pode chegar de vários jeitos.
            </h2>
            <p className="lp-sec-lead">
              Não precisa chegar pronto. A ideia é entrar, entender e receber um próximo passo possível.
            </p>
          </header>

          <ul className="lp-cards-grid lp-cards-grid--compact" role="list" aria-label="Perfis de chegada">
            {praQuemCards.map((title) => (
              <li key={title} className="lp-card lp-card--soft">
                <h3 className="lp-card__title lp-card__title--light">{title}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. BLOCO DO EVENTO
      ═══════════════════════════════════════════════════════ */}
      <section className="lp-section" aria-labelledby="sec-evento" id="evento">
        <div className="container lp-event-wrap">
          <header className="lp-sec-header">
            <p className="lp-eyebrow">quando e onde</p>
            <h2 className="lp-sec-title" id="sec-evento">
              Informações do evento
            </h2>
          </header>

          <div className="lp-ticket">
            <div className="lp-ticket__glow" aria-hidden="true" />
            <div className="lp-ticket__head">
              <span className="lp-ticket__label">MISSÃO ÉLUTA</span>
              <span className="lp-ticket__sublabel">Lançamento · Pré-Campanha</span>
            </div>
            <div className="lp-ticket__dots" aria-hidden="true">
              <div className="lp-ticket__dot lp-ticket__dot--left" />
              <div className="lp-ticket__dash" />
              <div className="lp-ticket__dot lp-ticket__dot--right" />
            </div>
            <dl className="lp-ticket__fields">
              <EventField icon="📅" label="Data" value={e.dateLabel} pending={dataPending} />
              <EventField icon="🕐" label="Horário" value={e.timeLabel} pending={timePending} />
              <EventField icon="📍" label="Local" value={e.locationLabel} pending={localPending} />
              {!addrPending && (
                <EventField icon="🗺️" label="Endereço" value={e.addressLabel} pending={false} />
              )}
            </dl>
            <div className="lp-ticket__actions">
              <CopyInfoBtn
                info={`${SITE_IDENTITY.fullLabel}\n${SITE_IDENTITY.appFullLabel}\nData: ${e.dateLabel}\nHorário: ${e.timeLabel}\nLocal: ${e.locationLabel}${!addrPending ? `\nEndereço: ${e.addressLabel}` : ""}`}
              />
              {hasAddress && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.addressLabel)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  aria-label={`Abrir ${e.addressLabel} no Google Maps`}
                >
                  <MapIcon /> Abrir no mapa
                </a>
              )}
            </div>
          </div>

          {(dataPending || timePending || localPending) && (
            <p className="lp-pending-notice" role="status">
              📣 Data e horário em breve. Em Volta Redonda, entre para receber o aviso assim que confirmar.
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. POR QUE ISSO E DIFERENTE
      ═══════════════════════════════════════════════════════ */}
      <section className="lp-section lp-section--accent" aria-labelledby="sec-diferente">
        <div className="container lp-why-wrap">
          <p className="lp-eyebrow">por que isso é diferente</p>
          <h2 className="lp-why__title" id="sec-diferente">
            Não é evento de palco.<br />
            <span className="lp-why__hl">É ferramenta de organização.</span>
          </h2>
          <blockquote className="lp-why__quote">
            <p>{e.whyDifferent}</p>
          </blockquote>
          <a href={participateUrl} className="btn btn-primary btn-lg">
            Participar da pré-campanha
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. COMO O APP FUNCIONA
      ═══════════════════════════════════════════════════════ */}
      <section
        className="lp-section lp-section--dark"
        aria-labelledby="sec-app"
        id="como-funciona"
      >
        <div className="container">
          <header className="lp-sec-header">
            <p className="lp-eyebrow">como o app funciona</p>
            <h2 className="lp-sec-title" id="sec-app">
              4 passos, do celular à ação
            </h2>
            <p className="lp-sec-lead">
              Simples o suficiente para funcionar na primeira visita.
            </p>
          </header>

          <ol className="lp-steps" aria-label="Passos do app Missão ÉLuta">
            {e.appSteps.map((step, i) => (
              <li key={step.number} className="lp-step">
                <div className="lp-step__num" aria-label={`Passo ${step.number}`}>
                  {step.number}
                </div>
                {i < e.appSteps.length - 1 && (
                  <div className="lp-step__connector" aria-hidden="true" />
                )}
                <div className="lp-step__body">
                  <h3 className="lp-step__title">{step.title}</h3>
                  <p className="lp-step__desc">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="lp-steps__cta">
            <a href={appUrl} className="btn btn-primary btn-lg">
              Entrar no app Missão ÉLuta
            </a>
          </div>

          <div className="lp-action-strip-wrap">
            <LaunchActionStrip
              participateUrl={participateUrl}
              appUrl={appUrl}
              missionUrl={missionUrl}
              viralHref="#sec-viral"
            />
          </div>
        </div>
      </section>

      <section className="lp-section" aria-labelledby="sec-depois-app">
        <div className="container">
          <header className="lp-sec-header">
            <p className="lp-eyebrow">depois que você entra no app</p>
            <h2 className="lp-sec-title" id="sec-depois-app">
              Depois que você entra no app
            </h2>
          </header>

          <ul className="lp-cards-grid lp-cards-grid--compact" role="list" aria-label="Passos depois da entrada no app">
            {[
              "Você cria seu cadastro",
              "A coordenação aprova",
              "Você recebe uma missão simples",
              "Você registra sua ação",
              "Você compartilha e chama mais gente",
            ].map((step, index) => (
              <li key={step} className="lp-card lp-card--soft">
                <h3 className="lp-card__title lp-card__title--light">
                  {index + 1}. {step}
                </h3>
              </li>
            ))}
          </ul>

          <p className="lp-sec-lead" style={{ marginTop: "1rem" }}>
            A landing chama. O app organiza. A missão transforma escuta em ação.
          </p>
        </div>
      </section>

      <section className="lp-section lp-section--dark" aria-labelledby="sec-jogo-relampago">
        <div className="container">
          <div className="lp-game-mission-grid">
            <div className="lp-sec-header lp-sec-header--tight">
              <p className="lp-eyebrow">escolha sua missão relâmpago</p>
              <h2 className="lp-sec-title" id="sec-jogo-relampago">
                Duas formas de puxar a rua para a organização
              </h2>
              <p className="lp-sec-lead">
                Corra da burocracia, colete relatos e desbloqueie uma cidade mais organizada.
              </p>
            </div>

            <div className="lp-game-callout lp-game-callout--stack">
              <div className="lp-game-mission-card">
                <div className="lp-game-callout__preview" aria-hidden="true">
                  <Image
                    src={gamePreviewSrc}
                    alt=""
                    width={960}
                    height={540}
                    className="lp-game-callout__thumb"
                  />
                </div>
                <div className="lp-game-callout__copy">
                  <p className="lp-eyebrow">plataforma</p>
                  <h3 className="lp-game-card__title">Corre da Burocracia</h3>
                  <p className="lp-game-card__text">
                    Modo Retrô — plataforma 2D autoral.
                  </p>
                </div>
                <div className="lp-game-callout__actions">
                  <a href={gameUrl} className="btn btn-secondary btn-lg">
                    Jogar agora
                  </a>
                </div>
              </div>

              <div className="lp-game-mission-card lp-game-mission-card--highlight">
                <div className="lp-game-callout__preview" aria-hidden="true">
                  <Image
                    src={runnerPreviewSrc}
                    alt=""
                    width={960}
                    height={540}
                    className="lp-game-callout__thumb"
                  />
                </div>
                <div className="lp-game-callout__copy">
                  <p className="lp-game-card__badge">Melhor no celular</p>
                  <p className="lp-eyebrow">runner mobile</p>
                  <h3 className="lp-game-card__title">Rua em Movimento</h3>
                  <p className="lp-game-card__text">
                    Modo Rua — rápido, vertical e feito para jogar com uma mão.
                  </p>
                </div>
                <div className="lp-game-callout__actions">
                  <a href={runnerGameUrl} className="btn btn-primary btn-lg">
                    Jogar no celular
                  </a>
                  <a href={appUrl} className="btn btn-secondary btn-lg">
                    Depois entrar no app
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          7. BLOCO VIRAL
      ═══════════════════════════════════════════════════════ */}
      <section className="lp-section lp-section--viral" aria-labelledby="sec-viral">
        <div className="container lp-viral-container">
          <header className="lp-sec-header">
            <p className="lp-eyebrow">mobilize sua rede</p>
            <h2 className="lp-sec-title" id="sec-viral">
              Cada pessoa que você chamar<br />
              <span className="lp-hl-yellow">é mais base organizada.</span>
            </h2>
            <p className="lp-sec-lead">
              Compartilhe o convite e leve o movimento para a rua.
            </p>
          </header>

          <ViralBlock
            dateLabel={e.dateLabel}
            locationLabel={e.locationLabel}
            publicUrlLabel={e.publicUrlLabel}
            siteOrigin={siteUrl}
            sharePath={sharePath}
            whatsAppSharePath={whatsAppSharePath}
          />
        </div>
      </section>

      <section className="lp-section lp-section--tight" aria-labelledby="sec-acao-final">
        <div className="container">
          <h2 className="lp-sec-title sr-only" id="sec-acao-final">Ação rápida</h2>
          <LaunchActionStrip
            participateUrl={participateUrl}
            appUrl={appUrl}
            missionUrl={missionUrl}
            viralHref="#sec-viral"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          8. FAQ
      ═══════════════════════════════════════════════════════ */}
      <section className="lp-section" aria-labelledby="sec-faq">
        <div className="container lp-faq-wrap">
          <header className="lp-sec-header">
            <p className="lp-eyebrow">perguntas frequentes</p>
            <h2 className="lp-sec-title" id="sec-faq">Dúvidas comuns</h2>
          </header>

          <dl className="lp-faq">
            {e.faqs.map((faq, i) => (
              <details key={i} className="lp-faq__item">
                <summary className="lp-faq__q">
                  <dt>{faq.question}</dt>
                  <ChevronIcon />
                </summary>
                <dd className="lp-faq__a">{faq.answer}</dd>
              </details>
            ))}
          </dl>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          9. RODAPE
      ═══════════════════════════════════════════════════════ */}
      <footer className="lp-footer" role="contentinfo">
        <div className="container lp-footer__inner">
          <div className="lp-footer__brand">
            <p className="lp-footer__name">{SITE_IDENTITY.appName}</p>
            <p className="lp-footer__sig">{SITE_IDENTITY.signature}</p>
            <p className="lp-footer__sub">{SITE_IDENTITY.fullLabel}</p>
          </div>
          <a href={participateUrl} className="btn btn-primary" aria-label="Participar da pré-campanha">
            Participar da pré-campanha
          </a>
          <p className="lp-footer__legal">
            Esta página é de organização de pré-campanha. Não constitui pedido de voto
            nem publicidade eleitoral nos termos da legislação vigente.
          </p>
        </div>
      </footer>

      <style>{css}</style>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTES (server-safe)
════════════════════════════════════════════════════════════ */

function EventField({
  icon, label, value, pending,
}: {
  icon: string; label: string; value: string; pending: boolean;
}) {
  const pendingLabel = label === "Local" ? "Volta Redonda" : "Em breve";

  return (
    <div className={`lp-ticket__field${pending ? " lp-ticket__field--pending" : ""}`}>
      <span className="lp-ticket__field-icon" aria-hidden="true">{icon}</span>
      <div>
        <dt className="lp-ticket__field-label">{label}</dt>
        <dd className="lp-ticket__field-value">{pending ? pendingLabel : value}</dd>
      </div>
    </div>
  );
}

function MapIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="lp-faq__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   CSS DA PÁGINA
════════════════════════════════════════════════════════════ */
const css = `
@keyframes lp-pulse-glow {
  0%, 100% { opacity: 0.75; }
  50%       { opacity: 1; }
}
@keyframes lp-scroll-bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(7px); }
}
@keyframes lp-badge-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,209,0,0.55); }
  60%       { box-shadow: 0 0 0 6px rgba(255,209,0,0); }
}

/* ── HERO ───────────────────────────────────────────────── */
.lp-hero {
  position: relative;
  overflow: hidden;
  min-height: 88svh;
  display: flex;
  align-items: center;
  padding-block: 4.6rem 3.2rem;
  border-bottom: 1px solid var(--border);
}
.lp-hero__glow {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 60% at 12% 25%, rgba(255,209,0,0.16), transparent 52%),
    radial-gradient(ellipse 55% 45% at 90% 75%, rgba(192,57,43,0.14), transparent 52%);
  animation: lp-pulse-glow 7s ease-in-out infinite;
}
.lp-hero__grid-lines {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 100% 38px, 38px 100%;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 78%);
}
.lp-hero__inner {
  position: relative; z-index: 1; max-width: 1180px;
}
.lp-hero__content {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 2rem;
  align-items: center;
}
.lp-hero__copy {
  min-width: 0;
}
.lp-hero__visual {
  display: flex;
  justify-content: flex-end;
}
.lp-hero__portrait-shell {
  position: relative;
  width: min(100%, 430px);
}
.lp-hero__portrait-glow {
  position: absolute;
  inset: 7% -4% -7% 18%;
  background:
    radial-gradient(circle at 35% 42%, rgba(255,209,0,0.2), transparent 46%),
    radial-gradient(circle at 72% 28%, rgba(192,57,43,0.18), transparent 42%);
  filter: blur(18px);
  pointer-events: none;
}
.lp-hero__portrait-frame {
  position: relative;
  overflow: hidden;
  border-radius: 28px 28px 120px 28px;
  border: 1px solid rgba(255, 209, 0, 0.28);
  background:
    linear-gradient(180deg, rgba(255,209,0,0.08), rgba(255,255,255,0.01)),
    rgba(10, 10, 12, 0.92);
  box-shadow:
    0 22px 48px rgba(0, 0, 0, 0.42),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  aspect-ratio: 0.9 / 0.94;
}
.lp-hero__portrait-frame::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 46%;
  background: linear-gradient(180deg, rgba(11,11,14,0), rgba(11,11,14,0.72) 28%, rgba(11,11,14,0.95) 62%, rgba(11,11,14,1));
  pointer-events: none;
}
.lp-hero__portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 9%;
  transform: scale(1.34);
  filter: saturate(0.92) contrast(1.04) brightness(0.96);
}
.lp-hero__portrait-note {
  position: absolute;
  left: 1.15rem;
  right: 1.15rem;
  bottom: 1.15rem;
  z-index: 1;
  padding: 0.85rem 0.95rem;
  border: 1px solid rgba(255, 209, 0, 0.16);
  border-radius: 14px;
  background: rgba(11, 11, 14, 0.72);
  backdrop-filter: blur(10px);
}
.lp-hero__portrait-name {
  margin: 0;
  font-family: var(--font-head);
  font-size: 1.15rem;
  letter-spacing: 0.02em;
  color: var(--yellow);
}
.lp-hero__portrait-role {
  margin: 0.25rem 0 0;
  font-size: 0.83rem;
  line-height: 1.45;
  color: rgba(242, 242, 242, 0.72);
}
.lp-hero__badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.3rem 0.9rem 0.3rem 0.6rem;
  border: 1px solid var(--border-accent);
  border-radius: 999px;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.07em;
  color: var(--yellow);
  background: rgba(255,209,0,0.06);
  margin-bottom: 1.25rem;
}
.lp-hero__badge-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--yellow);
  flex-shrink: 0; animation: lp-badge-dot 2.2s ease-in-out infinite;
}
.lp-hero__invite {
  display: inline-flex;
  align-items: center;
  margin: -0.55rem 0 1rem;
  padding: 0.22rem 0.62rem;
  border: 1px solid rgba(255, 209, 0, 0.35);
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--yellow);
  background: rgba(255, 209, 0, 0.08);
}
.lp-eyebrow {
  display: inline-flex; align-items: center; gap: 0.45rem;
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--yellow); margin-bottom: 1.1rem;
}
.lp-eyebrow::before {
  content: ""; display: inline-block; width: 22px; height: 2px;
  background: var(--yellow); flex-shrink: 0;
}
.lp-hero__title {
  font-family: var(--font-head);
  font-size: clamp(2.5rem, 7.5vw, 5.8rem);
  font-weight: 700; line-height: 1.05; letter-spacing: -0.025em;
  color: var(--text); margin: 0 0 1.25rem;
}
.lp-hero__subtitle {
  font-size: clamp(1rem, 2.2vw, 1.2rem); color: var(--muted);
  max-width: 58ch; line-height: 1.65; margin: 0 0 1rem;
}
.lp-hero__event-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 0 0 0.65rem;
}
.lp-hero__event-inline span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.32rem 0.58rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  color: var(--text);
  background: rgba(255,255,255,0.03);
}
.lp-hero__event-inline strong {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--yellow);
}
.lp-hero__event-note {
  margin: 0 0 1.4rem;
  max-width: 62ch;
  font-size: 0.86rem;
  color: var(--muted);
}
.lp-hero__sig {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: var(--font-head); font-size: 1rem; letter-spacing: 0.12em;
  color: var(--yellow); margin: 0 0 1.8rem; text-transform: uppercase;
}
.lp-hero__sig-line {
  display: inline-block; width: 30px; height: 2px;
  background: var(--yellow); flex-shrink: 0;
}
.hero-ctas {
  display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;
}
.hero-cta-main {
  box-shadow: 0 0 28px rgba(255,209,0,0.22), 0 4px 14px rgba(255,209,0,0.12);
  transition: box-shadow 0.2s, opacity 0.15s, transform 0.15s;
}
.hero-cta-main:hover {
  box-shadow: 0 0 48px rgba(255,209,0,0.38), 0 6px 22px rgba(255,209,0,0.18);
}
.lp-hero__scroll {
  margin-top: 3.5rem; font-size: 1.3rem; color: var(--muted);
  animation: lp-scroll-bounce 2.8s ease-in-out infinite; width: fit-content;
}

/* ── SEÇÕES GERAIS ──────────────────────────────────────── */
.lp-section {
  padding-block: 4.2rem; position: relative; z-index: 1;
  border-bottom: 1px solid var(--border);
}
.lp-section--tight { padding-block: 2.6rem; }
.lp-section--dark  { background: var(--bg-elevated); }
.lp-section--accent {
  background:
    radial-gradient(ellipse 90% 70% at 50% 50%, rgba(255,209,0,0.07), transparent 65%),
    var(--bg);
}
.lp-section--viral {
  background:
    radial-gradient(ellipse 80% 60% at 20% 40%, rgba(192,57,43,0.08), transparent 55%),
    radial-gradient(ellipse 60% 50% at 80% 60%, rgba(255,209,0,0.06), transparent 55%),
    var(--bg-elevated);
}
.lp-sec-header { margin-bottom: 2.2rem; max-width: 640px; }
.lp-sec-header--tight { margin-bottom: 1.5rem; }
.lp-sec-title {
  font-family: var(--font-head);
  font-size: clamp(1.7rem, 4vw, 2.7rem);
  font-weight: 700; line-height: 1.14; letter-spacing: -0.01em;
  margin: 0 0 0.65rem; color: var(--text);
}
.lp-sec-lead { color: var(--muted); font-size: 1.05rem; max-width: 55ch; margin: 0; }

/* ── CARDS ──────────────────────────────────────────────── */
.lp-cards-grid {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;
}
.lp-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 1.75rem 1.5rem;
  display: flex; flex-direction: column; gap: 0.65rem;
  transition: border-color 0.2s, transform 0.22s, box-shadow 0.22s;
}
.lp-card--glow:hover {
  border-color: rgba(255,209,0,0.5);
  transform: translateY(-5px);
  box-shadow: 0 10px 36px rgba(255,209,0,0.09);
}
.lp-card__icon { font-size: 2.4rem; line-height: 1; }
.lp-card__title {
  font-family: var(--font-head); font-size: 1.15rem; font-weight: 600;
  color: var(--yellow); margin: 0; line-height: 1.25;
}
.lp-card__desc { color: var(--muted); font-size: 0.92rem; margin: 0; line-height: 1.6; }
.lp-cards-grid--compact { gap: 0.9rem; }
.lp-card--soft {
  padding: 1.2rem 1.1rem;
  background: linear-gradient(160deg, rgba(255,209,0,0.08), rgba(255,255,255,0.02));
}
.lp-card__title--light {
  color: var(--text);
  font-size: 1.03rem;
  line-height: 1.35;
}

/* ── TICKET ─────────────────────────────────────────────── */
.lp-event-wrap { max-width: 620px; }
.lp-ticket {
  position: relative; background: var(--surface);
  border: 1px solid var(--border-accent); border-radius: var(--radius-lg); overflow: hidden;
}
.lp-ticket__glow {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,209,0,0.08), transparent 60%);
}
.lp-ticket__head {
  background: linear-gradient(90deg, rgba(255,209,0,0.12), rgba(255,209,0,0.03));
  border-bottom: 1px solid var(--border-accent);
  padding: 1rem 1.5rem;
  display: flex; align-items: baseline; gap: 0.75rem;
}
.lp-ticket__label {
  font-family: var(--font-head); font-size: 1.1rem; font-weight: 700;
  color: var(--yellow); letter-spacing: 0.04em;
}
.lp-ticket__sublabel {
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--muted);
}
.lp-ticket__dots {
  display: flex; align-items: center; height: 0; position: relative; padding: 0;
}
.lp-ticket__dot {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--bg); border: 1px solid var(--border-accent);
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 1;
}
.lp-ticket__dot--left  { left: -10px; }
.lp-ticket__dot--right { right: -10px; }
.lp-ticket__dash {
  flex: 1; height: 0; border-top: 2px dashed rgba(255,209,0,0.22); margin: 12px 14px 0;
}
.lp-ticket__fields {
  padding: 1.5rem; display: flex; flex-direction: column; gap: 1.1rem;
}
.lp-ticket__field {
  display: flex; align-items: flex-start; gap: 0.75rem;
}
.lp-ticket__field--pending .lp-ticket__field-value { color: rgba(230,140,120,0.9); }
.lp-ticket__field-icon { font-size: 1.15rem; line-height: 1; padding-top: 0.15rem; flex-shrink: 0; }
.lp-ticket__field-label {
  display: block; font-size: 0.62rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 0.22rem;
}
.lp-ticket__field-value { font-size: 0.98rem; font-weight: 600; color: var(--text); margin: 0; }
.lp-ticket__actions {
  display: flex; flex-wrap: wrap; gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
}
.lp-pending-notice {
  display: flex; align-items: flex-start; gap: 0.5rem;
  margin-top: 1.25rem; padding: 0.75rem 1rem;
  background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.22);
  border-radius: var(--radius-sm); font-size: 0.88rem;
  color: rgba(230,140,120,0.9); line-height: 1.5;
}

/* ── POR QUE É DIFERENTE ────────────────────────────────── */
.lp-why-wrap { max-width: 780px; }
.lp-why__title {
  font-family: var(--font-head);
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700; line-height: 1.1; letter-spacing: -0.022em;
  color: var(--text); margin: 0 0 1.75rem;
}
.lp-why__hl { color: var(--yellow); }
.lp-why__quote {
  margin: 0 0 2.5rem; padding: 0 0 0 1.5rem;
  border-left: 4px solid var(--yellow);
}
.lp-why__quote p {
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  color: var(--muted); line-height: 1.72; margin: 0;
}

/* ── TIMELINE APP ───────────────────────────────────────── */
.lp-steps {
  list-style: none; padding: 0; margin: 0 0 2.5rem;
  display: grid; grid-template-columns: repeat(4, 1fr);
  position: relative;
}
.lp-steps::before {
  content: ""; position: absolute;
  top: 27px;
  left: calc(12.5% + 28px);
  right: calc(12.5% + 28px);
  height: 2px;
  background: linear-gradient(90deg, var(--yellow), rgba(255,209,0,0.15));
  pointer-events: none;
}
.lp-step {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 0 1rem; position: relative;
}
.lp-step__connector { display: none; }
.lp-step__num {
  width: 56px; height: 56px; border-radius: 50%;
  background: var(--surface); border: 2px solid var(--yellow);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-head); font-size: 1rem; font-weight: 700;
  color: var(--yellow); margin-bottom: 1.25rem; position: relative; z-index: 1;
  box-shadow: 0 0 18px rgba(255,209,0,0.2); flex-shrink: 0;
}
.lp-step__body { flex: 1; }
.lp-step__title {
  font-family: var(--font-head); font-size: 1.05rem; font-weight: 600;
  color: var(--text); margin: 0 0 0.4rem;
}
.lp-step__desc { font-size: 0.87rem; color: var(--muted); margin: 0; line-height: 1.55; }
.lp-steps__cta { text-align: center; }
.lp-action-strip-wrap { margin-top: 1.8rem; }
.lp-game-callout {
  display: grid;
  grid-template-columns: minmax(220px, 0.92fr) minmax(0, 1.08fr) minmax(220px, 0.72fr);
  gap: 1rem;
  align-items: center;
  padding: 1.1rem;
  border-radius: 20px;
  border: 1px solid rgba(255,209,0,0.22);
  background:
    radial-gradient(circle at 84% 22%, rgba(255,209,0,0.12), transparent 28%),
    linear-gradient(145deg, rgba(255,209,0,0.06), rgba(255,255,255,0.02));
  box-shadow:
    0 24px 56px rgba(0,0,0,0.28),
    inset 0 0 0 1px rgba(255,255,255,0.03);
  overflow: hidden;
}
.lp-game-callout--stack {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
}
.lp-game-mission-grid {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.lp-game-mission-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}
.lp-game-mission-card--highlight {
  border-left: 1px solid rgba(255,209,0,0.16);
  padding-left: 1rem;
}
.lp-game-card__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(1.4rem, 3vw, 2.1rem);
  line-height: 1.02;
  color: var(--text);
}
.lp-game-card__badge {
  width: fit-content;
  margin: 0 0 0.45rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(255,209,0,0.26);
  background: rgba(255,209,0,0.12);
  color: var(--yellow);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.lp-game-card__text {
  margin: 0.55rem 0 0;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
}
.lp-game-callout__preview {
  min-height: 100%;
  border-radius: 16px;
  border: 1px solid rgba(255,209,0,0.16);
  background:
    linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.36)),
    rgba(8,9,12,0.96);
  overflow: hidden;
}
.lp-game-callout__thumb {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.lp-game-callout__note {
  margin: 1rem 0 0;
  font-size: 0.88rem;
  color: var(--yellow);
  letter-spacing: 0.03em;
}
.lp-game-callout__copy {
  min-width: 0;
}
.lp-game-callout__actions {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  min-width: 0;
}
.lp-game-callout__actions .btn {
  justify-content: center;
}

.launch-action-strip {
  border: 1px solid var(--border-accent);
  background: linear-gradient(135deg, rgba(255,209,0,0.08), rgba(255,255,255,0.02));
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  gap: 0.9rem;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.launch-action-strip__text {
  margin: 0;
  font-family: var(--font-head);
  letter-spacing: 0.04em;
  color: var(--yellow);
  font-size: 1rem;
}
.launch-action-strip__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

/* ── VIRAL ──────────────────────────────────────────────── */
.lp-viral-container { max-width: 760px; overflow-x: clip; }
.viral-wrap { display: flex; flex-direction: column; gap: 1.25rem; }
.launch-share-card-shell {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  width: 100%;
}
.launch-share-card {
  position: relative;
  overflow: hidden;
  width: min(100%, 380px);
  aspect-ratio: 9 / 16;
  max-height: min(80svh, 680px);
  border-radius: 26px;
  border: 2px solid rgba(255, 209, 0, 0.52);
  background:
    linear-gradient(148deg, #101012 0%, #161617 55%, #0f0f10 100%);
  box-shadow:
    0 0 0 1px rgba(255, 209, 0, 0.14),
    0 24px 56px rgba(0, 0, 0, 0.45),
    0 7px 30px rgba(192, 57, 43, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.035);
}
.launch-share-card__noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.22;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23f)' opacity='0.35'/%3E%3C/svg%3E");
}
.launch-share-card__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(0.2px);
}
.launch-share-card__orb--yellow {
  width: 260px;
  height: 260px;
  top: -58px;
  right: -88px;
  border: 1px solid rgba(255, 209, 0, 0.34);
  background: radial-gradient(circle at 36% 38%, rgba(255, 209, 0, 0.34), rgba(255, 209, 0, 0.07) 63%, rgba(255, 209, 0, 0.02) 100%);
  transform: rotate(-11deg) scaleX(1.12);
}
.launch-share-card__orb--rust {
  width: 175px;
  height: 175px;
  top: 108px;
  left: -76px;
  border: 1px solid rgba(192, 57, 43, 0.35);
  background: radial-gradient(circle at 55% 45%, rgba(192, 57, 43, 0.35), rgba(192, 57, 43, 0.08) 66%, rgba(192, 57, 43, 0.02) 100%);
  transform: rotate(14deg) scaleX(0.86);
}
.launch-share-card__content {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: clamp(1rem, 2vw, 1.55rem);
  display: flex;
  flex-direction: column;
}
.launch-share-card__eyebrow {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.17em;
  color: rgba(255, 255, 255, 0.74);
  font-weight: 700;
}
.launch-share-card__title {
  margin: 0.8rem 0 0;
  font-family: var(--font-head);
  font-size: clamp(2rem, 7.8vw, 3.4rem);
  line-height: 0.9;
  letter-spacing: 0.01em;
  color: var(--yellow);
  text-shadow: 0 0 40px rgba(255, 209, 0, 0.34);
}
.launch-share-card__title span {
  display: block;
  margin-top: 0.34rem;
  color: var(--text);
  font-size: clamp(1rem, 3.5vw, 1.45rem);
  letter-spacing: 0.02em;
}
.launch-share-card__subtitle {
  margin: 0.85rem 0 0;
  max-width: 28ch;
  font-size: clamp(0.8rem, 2.3vw, 1rem);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.45;
}
.launch-share-card__name {
  margin: 0.65rem 0 0;
  font-family: var(--font-head);
  font-size: clamp(1.1rem, 4vw, 1.7rem);
  color: var(--yellow);
  letter-spacing: 0.04em;
}
.launch-share-card__signature {
  margin: 0.25rem 0 0;
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.84);
}
.launch-share-card__event {
  margin-top: 0.7rem;
  border-top: 1px dashed rgba(255, 209, 0, 0.36);
  border-bottom: 1px dashed rgba(255, 209, 0, 0.18);
  background: rgba(0, 0, 0, 0.27);
  padding: 0.65rem 0.88rem;
}
.launch-share-card__event-label {
  margin: 0 0 0.3rem;
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--yellow);
}
.launch-share-card__event p:not(.launch-share-card__event-label) {
  margin: 0;
  font-size: 0.79rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.45;
}
.launch-share-card__invite {
  margin: 0.7rem 0 0;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text);
}
.launch-share-card__short-link {
  margin: 0.45rem 0 0;
  padding: 0.24rem 0.5rem;
  border: 1px solid rgba(255, 209, 0, 0.22);
  border-radius: 6px;
  width: fit-content;
  max-width: 100%;
  font-size: 0.66rem;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.78);
  overflow-wrap: anywhere;
}
.launch-share-card__footer {
  margin: auto 0 0;
  font-family: var(--font-head);
  font-size: 0.87rem;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  color: var(--yellow);
}
.launch-share-card__actions {
  width: min(100%, 380px);
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.62rem;
}
.launch-share-card__actions .btn {
  justify-content: center;
  min-width: 0;
  white-space: normal;
  text-wrap: balance;
  overflow-wrap: anywhere;
}
.launch-share-card__story-btn {
  display: none;
  grid-column: 1 / -1;
}
.launch-share-modal {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 1rem;
}
.launch-share-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  padding: 0;
  background: rgba(4, 4, 5, 0.82);
}
.launch-share-modal__content {
  position: relative;
  z-index: 1;
  width: min(100%, 460px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}
.launch-share-modal__close { align-self: flex-end; }
.launch-share-card--fullscreen {
  width: min(100%, 420px);
  max-height: min(86svh, 760px);
}
.viral-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
.viral-actions .btn,
.viral-actions button {
  white-space: normal;
  text-wrap: balance;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ── FAQ ────────────────────────────────────────────────── */
.lp-faq-wrap { max-width: 720px; }
.lp-faq { display: flex; flex-direction: column; gap: 0.6rem; }
.lp-faq__item {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); overflow: hidden; transition: border-color 0.2s;
}
.lp-faq__item[open] { border-color: rgba(255,209,0,0.35); }
.lp-faq__q {
  list-style: none; display: flex; justify-content: space-between;
  align-items: center; gap: 1rem; padding: 1.1rem 1.25rem;
  cursor: pointer; user-select: none; transition: background 0.15s;
}
.lp-faq__q::-webkit-details-marker { display: none; }
.lp-faq__q:hover { background: var(--surface-2); }
.lp-faq__q dt { font-weight: 600; font-size: 0.95rem; margin: 0; flex: 1; color: var(--text); }
.lp-faq__chevron { flex-shrink: 0; color: var(--yellow); transition: transform 0.22s; }
details[open] .lp-faq__chevron { transform: rotate(180deg); }
.lp-faq__a {
  padding: 0.9rem 1.25rem 1.1rem; margin: 0;
  color: var(--muted); font-size: 0.93rem; line-height: 1.65;
  border-top: 1px solid var(--border);
}

/* ── RODAPÉ ─────────────────────────────────────────────── */
.lp-footer { border-top: 1px solid var(--border); padding-block: 3rem; }
.lp-footer__inner {
  display: flex; flex-direction: column; align-items: center;
  gap: 1.5rem; text-align: center;
}
.lp-footer__brand { display: flex; flex-direction: column; align-items: center; }
.lp-footer__name {
  font-family: var(--font-head); font-size: 1.3rem; font-weight: 700;
  letter-spacing: 0.06em; color: var(--text); margin: 0;
}
.lp-footer__sig { font-size: 0.83rem; letter-spacing: 0.08em; color: var(--yellow); margin: 0.15rem 0 0; }
.lp-footer__sub { font-size: 0.73rem; color: var(--muted); margin: 0.1rem 0 0; }
.lp-footer__legal {
  font-size: 0.7rem; color: var(--muted); max-width: 52ch;
  line-height: 1.65; margin: 0; opacity: 0.68;
}
.lp-hl-yellow { color: var(--yellow); }

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 860px) {
  .lp-hero__content {
    grid-template-columns: 1fr;
  }
  .lp-hero__visual {
    justify-content: flex-start;
  }
  .lp-hero__portrait-shell {
    width: min(100%, 460px);
  }
  .lp-cards-grid { grid-template-columns: 1fr; }
  .launch-action-strip { flex-direction: column; align-items: flex-start; }
  .launch-action-strip__actions { width: 100%; }
  .launch-action-strip__actions .btn { flex: 1 1 48%; justify-content: center; }
  .lp-game-callout {
    grid-template-columns: 1fr;
  }
  .lp-game-callout--stack {
    grid-template-columns: 1fr;
  }
  .lp-game-mission-card--highlight {
    border-left: 0;
    padding-left: 0;
    border-top: 1px solid rgba(255,209,0,0.16);
    padding-top: 1rem;
  }
  .lp-game-callout__preview {
    min-height: 180px;
  }
  .lp-steps { grid-template-columns: 1fr; gap: 0; }
  .lp-steps::before { display: none; }
  .lp-step {
    flex-direction: row; text-align: left; align-items: flex-start;
    gap: 1.25rem; padding: 0 0 2rem; position: relative;
  }
  .lp-step:not(:last-child)::after {
    content: ""; position: absolute; left: 27px; top: 56px; bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, var(--yellow), rgba(255,209,0,0.08));
  }
  .lp-step__num { margin-bottom: 0; }
}

@media (max-width: 600px) {
  .lp-hero { min-height: auto; padding-block: 3.7rem 2.6rem; }
  .lp-hero__content {
    gap: 1.35rem;
  }
  .lp-hero__portrait-frame {
    border-radius: 22px 22px 84px 22px;
    aspect-ratio: 1 / 0.92;
  }
  .lp-hero__portrait {
    object-position: center 8%;
    transform: scale(1.18);
  }
  .lp-hero__portrait-note {
    left: 0.85rem;
    right: 0.85rem;
    bottom: 0.85rem;
    padding: 0.72rem 0.8rem;
  }
  .lp-hero__portrait-name {
    font-size: 1rem;
  }
  .lp-hero__portrait-role {
    font-size: 0.78rem;
  }
  .lp-hero__event-inline { gap: 0.45rem; }
  .lp-hero__event-inline span { width: 100%; justify-content: space-between; }
  .hero-ctas { flex-direction: column; align-items: stretch; }
  .hero-ctas .btn { justify-content: center; }
  .lp-section { padding-block: 3.15rem; }
  .lp-ticket__actions { flex-direction: column; }
  .launch-action-strip__actions { flex-direction: column; }
  .launch-action-strip__actions .btn { width: 100%; }
  .launch-share-card__actions { grid-template-columns: 1fr; }
  .launch-share-card__story-btn { display: inline-flex; }
  .launch-share-card,
  .launch-share-card__actions { width: min(100%, 340px); }
  .viral-actions { flex-direction: column; }
  .viral-actions .btn, .viral-actions button { justify-content: center; width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;
