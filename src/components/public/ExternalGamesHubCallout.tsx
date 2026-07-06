import { buildAppBaseUrl, buildGamesHubUrl } from "@/src/content/siteLinks";

interface ExternalGamesHubCalloutProps {
  refId?: string;
  variant?: "home" | "metodo" | "formacao";
}

const copyByVariant = {
  home: {
    title: "As missões relâmpago agora moram em outro projeto",
    description:
      "A Landing Missão segue como vitrine pública. Os jogos agora ficam centralizados no Abandonada Games.",
    primaryCta: "Acessar Abandonada Games",
    secondaryCta: "Depois entrar no app",
    bullets: [
      "Você joga no hub externo, sem pesar a landing.",
      "O link leva seu ref junto para manter o fluxo de origem.",
      "Depois você volta para o App Missão ÉLuta e recebe a próxima missão.",
    ],
    note: "Jogos no hub. Organização no app. A landing segue como vitrine pública.",
  },
  metodo: {
    title: "Quer experimentar a linguagem pública em ação?",
    description:
      "As experiências jogáveis agora ficam no Abandonada Games. O método segue aqui como apresentação pública. A organização continua no App Missão ÉLuta.",
    primaryCta: "Ir para Abandonada Games",
    secondaryCta: "Entrar no app Missão ÉLuta",
    bullets: [],
    note: "",
  },
  formacao: {
    title: "Quer ativar a formação com uma experiência mais leve?",
    description:
      "Os jogos e experiências interativas ficam no Abandonada Games. A trilha de formação continua aqui e a próxima ação prática segue no App Missão ÉLuta.",
    primaryCta: "Ver experiências no Abandonada Games",
    secondaryCta: "Continuar no app Missão ÉLuta",
    bullets: [],
    note: "",
  },
} as const;

export function ExternalGamesHubCallout({
  refId,
  variant = "metodo",
}: ExternalGamesHubCalloutProps) {
  const gamesHubUrl = buildGamesHubUrl(refId);
  const appUrl = buildAppBaseUrl(refId);
  const copy = copyByVariant[variant];

  return (
    <section
      aria-label="Integração com jogos externos"
      style={{
        borderBottom: "1px solid var(--border)",
        background:
          "radial-gradient(circle at top right, rgba(255,209,0,0.1), transparent 30%), var(--bg-elevated)",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: "1060px",
          paddingTop: "1.2rem",
          paddingBottom: "1.2rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: "1 1 340px", minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.74rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--yellow)",
              fontWeight: 700,
            }}
          >
            Jogos autorais
          </p>
          <h2
            style={{
              margin: "0.35rem 0 0",
              fontSize: "clamp(1.35rem, 3vw, 2rem)",
              lineHeight: 1.05,
              color: "var(--text)",
            }}
          >
            {copy.title}
          </h2>
          <p
            style={{
              margin: "0.65rem 0 0",
              color: "var(--muted)",
              lineHeight: 1.6,
              maxWidth: "58ch",
            }}
          >
            {copy.description}
          </p>
          {copy.bullets.length > 0 ? (
            <ul
              aria-label="Fluxo entre a landing, os jogos e o app"
              style={{
                margin: "0.95rem 0 0",
                padding: "0 0 0 1.1rem",
                color: "var(--text)",
                display: "grid",
                gap: "0.45rem",
                fontSize: "0.92rem",
                lineHeight: 1.55,
              }}
            >
              {copy.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {copy.note ? (
            <p
              style={{
                margin: "0.95rem 0 0",
                color: "var(--yellow)",
                fontSize: "0.88rem",
                letterSpacing: "0.03em",
              }}
            >
              {copy.note}
            </p>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.7rem",
            flex: "0 1 320px",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          <a href={gamesHubUrl} className="btn btn-primary btn-lg" target="_blank" rel="noreferrer">
            {copy.primaryCta}
          </a>
          <a href={appUrl} className="btn btn-secondary btn-lg">
            {copy.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
