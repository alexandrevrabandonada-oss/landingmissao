import { campanhasDeBaseContent as c } from "@/src/content/campanhasDeBase";
import {
  buildAppBaseUrl,
  buildAppConviteUrl,
  buildAppFormacaoUrl,
  buildAppMissoesUrl,
} from "@/src/content/siteLinks";

interface CampanhasDeBaseModuleProps {
  context: "publico" | "interno";
  refId?: string;
}

export function CampanhasDeBaseModule({
  context,
  refId,
}: CampanhasDeBaseModuleProps) {
  const heading =
    context === "publico"
      ? "Método de organização popular para pré-campanha"
      : "Formação interna: campanhas de base";

  const subheading =
    context === "publico"
      ? "Transformando referência internacional em prática de missão, território e participação no App Missão ÉLuta."
      : "Guia aplicado para equipe, voluntariado e núcleos territoriais no App Missão ÉLuta.";

  const appBaseUrl = buildAppBaseUrl(refId);
  const appFormacaoUrl = buildAppFormacaoUrl(refId);
  const appMissoesUrl = buildAppMissoesUrl(refId);
  const appConviteUrl = buildAppConviteUrl(refId);

  return (
    <>
      <section className="cb-hero" aria-labelledby="cb-hero-title">
        <div className="container cb-container">
          <p className="cb-eyebrow">App Missão ÉLuta</p>
          <h1 id="cb-hero-title" className="cb-title">{heading}</h1>
          <p className="cb-lead">{subheading}</p>
          <p className="cb-legal" role="note">{c.avisoLegal}</p>
        </div>
      </section>

      <section className="cb-section" aria-labelledby="cb-ref-title">
        <div className="container cb-container">
          <h2 id="cb-ref-title" className="cb-h2">Referências para aplicar no app</h2>
          <p className="cb-muted">Cada card compara acertos, riscos e adaptação prática para o App Missão ÉLuta.</p>

          <ul className="cb-grid" role="list" aria-label="Cards comparativos de campanhas de base">
            {c.referencias.map((item) => (
              <li key={item.nome} className="cb-card">
                <h3 className="cb-h3">{item.nome}</h3>
                <p className="cb-chip">{item.pais}</p>
                <dl className="cb-dl">
                  <div>
                    <dt>Afinidade ideológica</dt>
                    <dd>{item.afinidadeIdeologica}</dd>
                  </div>
                  <div>
                    <dt>O que deu certo</dt>
                    <dd>{item.oQueDeuCerto}</dd>
                  </div>
                  <div>
                    <dt>Risco/limite</dt>
                    <dd>{item.riscoOuLimite}</dd>
                  </div>
                  <div>
                    <dt>Adaptação para Missão ÉLuta</dt>
                    <dd>{item.adaptacaoMissaoEluta}</dd>
                  </div>
                  <div>
                    <dt>Cuidado jurídico no Brasil</dt>
                    <dd>{item.cuidadoJuridicoBrasil}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cb-section cb-section-alt" aria-labelledby="cb-matriz-title">
        <div className="container cb-container">
          <h2 id="cb-matriz-title" className="cb-h2">O que copiar / O que evitar / Como implementar</h2>
          <div className="cb-table-wrap" role="region" aria-label="Tabela de aplicação prática">
            <table className="cb-table">
              <thead>
                <tr>
                  <th>Eixo</th>
                  <th>O que copiar</th>
                  <th>O que evitar</th>
                  <th>Como implementar</th>
                </tr>
              </thead>
              <tbody>
                {c.matriz.map((row) => (
                  <tr key={row.eixo}>
                    <td>{row.eixo}</td>
                    <td>{row.copiar}</td>
                    <td>{row.evitar}</td>
                    <td>{row.implementar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="cb-section" aria-labelledby="cb-cta-title">
        <div className="container cb-container">
          <h2 id="cb-cta-title" className="cb-h2">Aplicar agora no ciclo de pré-campanha</h2>
          <p className="cb-muted">Entrar no app, puxar missão, participar de debate e ampliar convites com método.</p>
          <div className="cb-cta-row" role="group" aria-label="Acoes principais">
            <a href={context === "publico" ? appBaseUrl : appFormacaoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" aria-label="Entrar no app para iniciar formação">
              {context === "publico" ? "Entrar no app e conhecer o método" : "Começar a formação no app"}
            </a>
            <a href={context === "publico" ? appFormacaoUrl : appMissoesUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" aria-label={context === "publico" ? "Ver formação no app principal" : "Ver missões de escuta no app principal"}>
              {context === "publico" ? "Ver formação no app" : "Ver missões de escuta"}
            </a>
            <a href={appConviteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" aria-label={context === "publico" ? "Compartilhar o método" : "Chamar alguém para estudar junto"}>
              {context === "publico" ? "Compartilhar o método" : "Chamar alguém para estudar junto"}
            </a>
          </div>
        </div>
      </section>

      <style>{css}</style>
    </>
  );
}

const css = `
.cb-hero {
  padding-block: 4.2rem 2.5rem;
  border-bottom: 1px solid var(--border);
  background:
    radial-gradient(ellipse 70% 65% at 0% 0%, rgba(255,209,0,0.12), transparent 60%),
    radial-gradient(ellipse 65% 55% at 100% 100%, rgba(192,57,43,0.12), transparent 60%),
    var(--bg);
}
.cb-container { max-width: 1060px; }
.cb-eyebrow {
  margin: 0 0 0.7rem;
  color: var(--yellow);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 700;
}
.cb-title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(2rem, 5vw, 3.4rem);
  line-height: 1.08;
  color: var(--text);
}
.cb-lead {
  margin: 0.9rem 0 0;
  max-width: 62ch;
  color: var(--muted);
}
.cb-legal {
  margin: 1rem 0 0;
  padding: 0.65rem 0.8rem;
  border-left: 3px solid var(--yellow);
  background: rgba(255,255,255,0.03);
  font-size: 0.85rem;
}
.cb-section {
  padding-block: 2.8rem;
  border-bottom: 1px solid var(--border);
}
.cb-section-alt { background: var(--bg-elevated); }
.cb-h2 {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(1.5rem, 3.4vw, 2.2rem);
}
.cb-h3 {
  margin: 0;
  font-family: var(--font-head);
  font-size: 1.18rem;
  color: var(--yellow);
}
.cb-muted { margin: 0.55rem 0 0; color: var(--muted); }
.cb-grid {
  list-style: none;
  margin: 1.35rem 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.cb-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  padding: 1rem;
}
.cb-chip {
  margin: 0.4rem 0 0.8rem;
  display: inline-flex;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.7rem;
  border: 1px solid rgba(255,209,0,0.28);
  color: var(--yellow);
}
.cb-dl { margin: 0; display: grid; gap: 0.7rem; }
.cb-dl dt {
  margin: 0;
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.cb-dl dd {
  margin: 0.25rem 0 0;
  color: var(--text);
  font-size: 0.88rem;
  line-height: 1.55;
}
.cb-table-wrap {
  margin-top: 1.2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: auto;
}
.cb-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}
.cb-table th,
.cb-table td {
  padding: 0.7rem;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--border);
}
.cb-table th {
  font-size: 0.72rem;
  color: var(--yellow);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(255,209,0,0.06);
}
.cb-table td {
  font-size: 0.88rem;
  line-height: 1.5;
}
.cb-cta-row {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

@media (max-width: 860px) {
  .cb-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .cb-hero { padding-block: 3.4rem 2.1rem; }
  .cb-section { padding-block: 2.3rem; }
  .cb-cta-row { flex-direction: column; }
  .cb-cta-row .btn { justify-content: center; }
}
`;
