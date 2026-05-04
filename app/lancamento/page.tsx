import type { Metadata } from "next";
import { launchEvent as e } from "@/content/launchEvent";
import { buildLaunchUrl, buildSignupUrl } from "@/src/lib/shareLaunch";
import { ShareButtons } from "./ShareButtons";
import { ViralBlock } from "./ViralBlock";
import { CopyInfoBtn } from "./CopyInfoBtn";

export const metadata: Metadata = {
  title: {
    absolute: "Lançamento Missão ÉLuta | Pré-campanha Alexandre VR Abandonada",
  },
  description:
    "Evento de lançamento da pré-campanha e do app Missão ÉLuta — Escutar, Cuidar e Organizar.",
  alternates: { canonical: "/lancamento" },
  openGraph: {
    title: "Lançamento Missão ÉLuta | Pré-campanha Alexandre VR Abandonada",
    description:
      "Evento de lançamento da pré-campanha e do app Missão ÉLuta — Escutar, Cuidar e Organizar.",
    type: "website",
    locale: "pt_BR",
    url: "/lancamento",
  },
  twitter: {
    card: "summary",
    title: "Lançamento Missão ÉLuta | Pré-campanha Alexandre VR Abandonada",
    description:
      "Evento de lançamento da pré-campanha e do app Missão ÉLuta — Escutar, Cuidar e Organizar.",
  },
};

const dataPending = e.dateLabel === "DATA_A_CONFIRMAR";
const timePending = e.timeLabel === "HORARIO_A_CONFIRMAR";
const localPending = e.locationLabel === "LOCAL_A_CONFIRMAR";
const addrPending = e.addressLabel === "ENDERECO_A_CONFIRMAR";
const hasAddress = !addrPending;

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

  const signupUrl = buildSignupUrl({ ref });

  const cleanParams = new URLSearchParams();
  if (utmSource) cleanParams.set("utm_source", utmSource);
  if (utmMedium) cleanParams.set("utm_medium", utmMedium);
  if (utmCampaign) cleanParams.set("utm_campaign", utmCampaign);

  const cleanBasePath = cleanParams.size
    ? `/lancamento?${cleanParams.toString()}`
    : "/lancamento";
  const sharePath = buildLaunchUrl(cleanBasePath, ref);
  const whatsAppSharePath = buildLaunchUrl(
    "/lancamento?utm_source=whatsapp&utm_medium=share&utm_campaign=lancamento_app",
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

          <p className="lp-hero__sig">
            <span className="lp-hero__sig-line" aria-hidden="true" />
            {e.signature}
          </p>

          <ShareButtons
            signupUrl={signupUrl}
            whatsappNumber={e.whatsappNumber}
          />

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
          3. BLOCO DO EVENTO
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
                info={`Missão ÉLuta — Lançamento\nData: ${e.dateLabel}\nHorário: ${e.timeLabel}\nLocal: ${e.locationLabel}${!addrPending ? `\nEndereço: ${e.addressLabel}` : ""}`}
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
              📣 Dados em definição. Cadastre-se no app para receber aviso quando confirmados.
            </p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. POR QUE ISSO É DIFERENTE
      ═══════════════════════════════════════════════════════ */}
      <section className="lp-section lp-section--accent" aria-labelledby="sec-diferente">
        <div className="container lp-why-wrap">
          <p className="lp-eyebrow">por que isso é diferente</p>
          <h2 className="lp-why__title" id="sec-diferente">
            Não é comício.<br />
            <span className="lp-why__hl">É ferramenta.</span>
          </h2>
          <blockquote className="lp-why__quote">
            <p>{e.whyDifferent}</p>
          </blockquote>
          <a href={signupUrl} className="btn btn-primary btn-lg">
            Quero fazer parte
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          5. COMO O APP FUNCIONA
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
            <a href={signupUrl} className="btn btn-primary btn-lg">
              Entrar no app
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          6. BLOCO VIRAL
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
            signature={e.signature}
            dateLabel={e.dateLabel}
            locationLabel={e.locationLabel}
            sharePath={sharePath}
            whatsAppSharePath={whatsAppSharePath}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          7. FAQ
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
          8. RODAPÉ
      ═══════════════════════════════════════════════════════ */}
      <footer className="lp-footer" role="contentinfo">
        <div className="container lp-footer__inner">
          <div className="lp-footer__brand">
            <p className="lp-footer__name">MISSÃO ÉLUTA</p>
            <p className="lp-footer__sig">{e.signature}</p>
            <p className="lp-footer__sub">Pré-campanha · Alexandre VR Abandonada</p>
          </div>
          <a href={signupUrl} className="btn btn-primary" aria-label="Entrar no app Missão ÉLuta">
            Entrar no app
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
  return (
    <div className={`lp-ticket__field${pending ? " lp-ticket__field--pending" : ""}`}>
      <span className="lp-ticket__field-icon" aria-hidden="true">{icon}</span>
      <div>
        <dt className="lp-ticket__field-label">{label}</dt>
        <dd className="lp-ticket__field-value">{pending ? "A confirmar" : value}</dd>
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
  min-height: 92svh;
  display: flex;
  align-items: center;
  padding-block: 5.5rem 4rem;
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
  position: relative; z-index: 1; max-width: 840px;
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
  max-width: 58ch; line-height: 1.68; margin: 0 0 1.6rem;
}
.lp-hero__sig {
  display: flex; align-items: center; gap: 0.65rem;
  font-family: var(--font-head); font-size: 1rem; letter-spacing: 0.12em;
  color: var(--yellow); margin: 0 0 2.75rem; text-transform: uppercase;
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
  padding-block: 5rem; position: relative; z-index: 1;
  border-bottom: 1px solid var(--border);
}
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
.lp-sec-header { margin-bottom: 3rem; max-width: 640px; }
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
  margin: 1rem 0 0;
  max-width: 28ch;
  font-size: clamp(0.8rem, 2.3vw, 1rem);
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.45;
}
.launch-share-card__name {
  margin: 1rem 0 0;
  font-family: var(--font-head);
  font-size: clamp(1.1rem, 4vw, 1.7rem);
  color: var(--yellow);
  letter-spacing: 0.04em;
}
.launch-share-card__event {
  margin-top: auto;
  border-top: 1px dashed rgba(255, 209, 0, 0.36);
  border-bottom: 1px dashed rgba(255, 209, 0, 0.18);
  background: rgba(0, 0, 0, 0.27);
  padding: 0.8rem 0.92rem;
}
.launch-share-card__event p {
  margin: 0;
  font-size: 0.79rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.45;
}
.launch-share-card__footer {
  margin: 0.84rem 0 0;
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
  .lp-cards-grid { grid-template-columns: 1fr; }
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
  .lp-hero { min-height: auto; padding-block: 4rem 3rem; }
  .hero-ctas { flex-direction: column; align-items: stretch; }
  .hero-ctas .btn { justify-content: center; }
  .lp-section { padding-block: 3.5rem; }
  .lp-ticket__actions { flex-direction: column; }
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
