import type { Metadata } from "next";
import Link from "next/link";
import styles from "./api.module.css";

const SITE = "https://www.alexandrevrabandonada.online";

export const metadata: Metadata = {
  title: "API pública — Climatização das escolas",
  description:
    "Endpoints públicos, OpenAPI 3.1 e regras de uso da plataforma de climatização.",
  alternates: { canonical: SITE + "/climatizacao/api" },
};

const readEndpoints = [
  ["Snapshot", "/api/climatizacao?action=snapshot", "101 escolas, contadores, protocolos e contatos públicos."],
  ["Casos", "/api/climatizacao?action=case_overview", "Ciclo municipal de resolução por escola e problema."],
  ["Telemetria agregada", "/api/climatizacao?action=metrics&school=colegio-prof-themis-de-almeida-vieira&days=30", "Contagens por escola/dia, sem perfil individual."],
  ["Ledger", "/api/climatizacao?action=ledger&limit=100", "Eventos append-only e payloads canônicos para verificação."],
  ["Evidências", "/api/climatizacao?action=evidence&limit=100", "Catálogo público de proveniência."],
  ["Âncora externa", "/api/climatizacao/anchor", "Comparação do head do ledger com a âncora GitHub."],
  ["Dados abertos", "/api/climatizacao/dados?format=json", "Dataset aberto schema 1.1."],
  ["Health", "/api/climatizacao/health", "Estado público dos componentes críticos e não críticos."],
] as const;

export default function ApiDocsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link href="/climatizacao" className={styles.back}>
          ← Painel de climatização
        </Link>
        <span>OPENAPI 3.1 · DADOS ABERTOS</span>
        <h1>Uma plataforma que também conversa com máquinas.</h1>
        <p>
          As leituras públicas podem ser reutilizadas por imprensa, pesquisa,
          conselhos e projetos cívicos. Os endpoints de escrita continuam
          voltados a ações humanas validadas, com rate limit e deduplicação.
        </p>
        <div className={styles.heroActions}>
          <a href="/api/climatizacao/openapi.json">Abrir OpenAPI JSON</a>
          <a href="/api/climatizacao/dados?format=json">Abrir dataset JSON</a>
        </div>
      </section>

      <section className={styles.endpoints}>
        <div className={styles.head}>
          <span>LEITURA PÚBLICA</span>
          <h2>Endpoints principais</h2>
        </div>
        <div className={styles.grid}>
          {readEndpoints.map(([name, path, description]) => (
            <article key={path}>
              <strong>{name}</strong>
              <code>{path}</code>
              <p>{description}</p>
              <a href={path}>Abrir →</a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.rules}>
        <h2>Regras de uso</h2>
        <div>
          <article>
            <strong>Leituras abertas</strong>
            <p>
              Os datasets e recursos públicos não exigem API key e não incluem
              dados pessoais de participantes.
            </p>
          </article>
          <article>
            <strong>Escritas não são automação de massa</strong>
            <p>
              POSTs representam ações dos formulários públicos e estão sujeitos
              a validação, deduplicação e limites de frequência.
            </p>
          </article>
          <article>
            <strong>Relato continua sendo relato</strong>
            <p>
              Consumir a API não muda a natureza da evidência: relato comunitário
              não equivale a vistoria ou confirmação oficial.
            </p>
          </article>
          <article>
            <strong>Integridade verificável</strong>
            <p>
              Ledger e âncora externa permitem conferir a sequência pública sem
              precisar confiar apenas na interface visual.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.links}>
        <Link href="/climatizacao/dados">Metodologia dos dados</Link>
        <Link href="/climatizacao/ledger">Ledger verificável</Link>
        <Link href="/climatizacao/ancora">Âncora externa</Link>
        <Link href="/climatizacao/status">Status da plataforma</Link>
      </section>
    </main>
  );
}
