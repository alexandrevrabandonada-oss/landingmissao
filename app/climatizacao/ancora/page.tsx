import type { Metadata } from "next";
import Link from "next/link";
import styles from "./anchor.module.css";

const SITE = "https://www.alexandrevrabandonada.online";

type Payload = {
  healthy: boolean;
  comparison:
    | "synchronized"
    | "ledger_ahead"
    | "anchor_ahead"
    | "hash_mismatch";
  lag_events: number;
  current_head: {
    id: number;
    entry_hash: string;
    created_at: string;
  };
  external_anchor: {
    anchored_at: string;
    algorithm: string;
    ledger_head: {
      id: number;
      entry_hash: string;
      created_at: string;
    };
  };
  github: {
    latest_file: string;
    anchor_history: string;
  };
  generated_at: string;
};

const labels: Record<Payload["comparison"], string> = {
  synchronized: "Sincronizado",
  ledger_ahead: "Ledger à frente da última âncora",
  anchor_ahead: "Âncora à frente do ledger",
  hash_mismatch: "Inconsistência de hash",
};

const descriptions: Record<Payload["comparison"], string> = {
  synchronized:
    "O head atual do ledger coincide exatamente com a última âncora registrada no GitHub.",
  ledger_ahead:
    "O ledger recebeu novos eventos depois da última execução do workflow de ancoragem. Isso é esperado entre as execuções automáticas.",
  anchor_ahead:
    "A âncora externa aponta para um id maior que o ledger servido atualmente. Esse estado exige investigação.",
  hash_mismatch:
    "O mesmo id aparece com hashes diferentes no ledger e na âncora externa. Esse estado exige investigação imediata.",
};

async function loadAnchor(): Promise<Payload | null> {
  try {
    const response = await fetch(`${SITE}/api/climatizacao/anchor`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Âncora externa do ledger — Climatização",
  description:
    "Compare o head atual do ledger com a última âncora versionada no GitHub.",
  alternates: { canonical: `${SITE}/climatizacao/ancora` },
};

export default async function AnchorPage() {
  const data = await loadAnchor();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link href="/climatizacao/ledger" className={styles.back}>
          ← Ledger público
        </Link>
        <span>ÂNCORA EXTERNA · GITHUB</span>
        <h1>O banco não é a única testemunha.</h1>
        <p>
          A cada seis horas, um workflow lê o head público do ledger e grava
          uma âncora versionada numa branch separada do GitHub. Se o head não
          mudou, nenhum commit é criado.
        </p>
      </section>

      {!data ? (
        <section className={styles.unavailable}>
          Não foi possível comparar a âncora agora. O ledger principal continua
          disponível para verificação independente.
        </section>
      ) : (
        <>
          <section
            className={
              data.healthy ? styles.statusHealthy : styles.statusProblem
            }
          >
            <div>
              <span>ESTADO DA COMPARAÇÃO</span>
              <h2>{labels[data.comparison]}</h2>
              <p>{descriptions[data.comparison]}</p>
            </div>
            <strong>{data.lag_events}</strong>
            <small>evento(s) desde a última âncora</small>
          </section>

          <section className={styles.compare}>
            <article>
              <span>LEDGER ATUAL</span>
              <strong>#{data.current_head.id}</strong>
              <code>{data.current_head.entry_hash}</code>
              <small>
                Evento criado em{" "}
                {new Date(data.current_head.created_at).toLocaleString("pt-BR")}
              </small>
            </article>

            <article>
              <span>ÚLTIMA ÂNCORA GITHUB</span>
              <strong>#{data.external_anchor.ledger_head.id}</strong>
              <code>{data.external_anchor.ledger_head.entry_hash}</code>
              <small>
                Ancorado em{" "}
                {new Date(data.external_anchor.anchored_at).toLocaleString(
                  "pt-BR",
                )}
              </small>
            </article>
          </section>

          <section className={styles.actions}>
            <a
              href={data.github.latest_file}
              target="_blank"
              rel="noreferrer"
            >
              Abrir âncora no GitHub
            </a>
            <a
              href={data.github.anchor_history}
              target="_blank"
              rel="noreferrer"
            >
              Ver histórico de commits
            </a>
            <Link href="/climatizacao/ledger">
              Recalcular a cadeia no navegador
            </Link>
            <a href="/api/climatizacao/anchor">Abrir comparação em JSON</a>
          </section>
        </>
      )}

      <section className={styles.method}>
        <h2>O que esta âncora acrescenta</h2>
        <p>
          O ledger já é encadeado por SHA-256 dentro da plataforma. A âncora
          adiciona um registro versionado fora do banco de dados, com timestamp
          e histórico de commits do GitHub.
        </p>
        <p>
          A âncora não substitui o ledger, nem transforma o GitHub em autoridade
          sobre os fatos relatados. Ela apenas oferece uma referência externa
          adicional para comparar a evolução da cadeia.
        </p>
      </section>
    </main>
  );
}
