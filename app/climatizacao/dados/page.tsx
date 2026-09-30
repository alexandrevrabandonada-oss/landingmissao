import type { Metadata } from "next";
import Link from "next/link";
import styles from "./data.module.css";

const SITE = "https://www.alexandrevrabandonada.online";

export const metadata: Metadata = {
  title: "Dados abertos — Climatização das escolas de Volta Redonda",
  description: "Exportação pública e metodologia dos dados agregados da plataforma de climatização.",
  alternates: { canonical: `${SITE}/climatizacao/dados` },
};

export default function OpenDataPage() {
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Climatização das escolas de Volta Redonda — dados agregados",
    description: "Relatos, apoios e atividade agregada por unidade escolar, sem dados pessoais de participantes.",
    url: `${SITE}/climatizacao/dados`,
    creator: {
      "@type": "Organization",
      name: "VR Abandonada",
    },
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${SITE}/api/climatizacao/dados?format=json`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: `${SITE}/api/climatizacao/dados?format=csv`,
      },
    ],
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dataset) }} />
      <section className={styles.hero}>
        <Link href="/climatizacao" className={styles.back}>← Painel de climatização</Link>
        <span>DADOS ABERTOS · SCHEMA 1.0</span>
        <h1>Audite. Baixe. Reutilize.</h1>
        <p>
          A plataforma disponibiliza os dados agregados das 101 unidades em formatos legíveis por pessoas
          e por máquinas, sem publicar dados pessoais de participantes.
        </p>
        <div className={styles.downloads}>
          <a href="/api/climatizacao/dados?format=json">Abrir JSON</a>
          <a href="/api/climatizacao/dados?format=csv">Baixar CSV</a>
        </div>
      </section>

      <section className={styles.block}>
        <h2>O que está no conjunto</h2>
        <div className={styles.grid}>
          <article><strong>101</strong><span>unidades escolares</span></article>
          <article><strong>Relatos</strong><span>total e categorias por escola</span></article>
          <article><strong>Apoios</strong><span>estudantis e assinaturas ligadas à escola</span></article>
          <article><strong>Pulso</strong><span>atividade agregada e última movimentação</span></article>
        </div>
      </section>

      <section className={styles.method}>
        <h2>Metodologia e limites</h2>
        <p>
          Um relato é uma informação enviada pela comunidade e não é tratado como confirmação técnica.
          Apoios anônimos de estudantes e assinaturas nominais de adultos permanecem categorias distintas.
          A exportação pública contém somente contagens, identificação das unidades e informações institucionais
          já publicadas no painel.
        </p>
        <p>
          Os dados podem mudar à medida que novos registros entram ou respostas oficiais são incorporadas.
          O campo <code>generated_at</code> indica a hora de geração do snapshot JSON.
        </p>
      </section>

      <section className={styles.schema}>
        <h2>Campos por escola</h2>
        <code>
          id · slug · name · category · network · report_count · sem_ar_count · nao_funciona_count ·
          parcial_count · rede_eletrica_count · manutencao_count · student_support_count ·
          signature_count · support_count · activity_count · last_activity_at
        </code>
      </section>

      <section className={styles.links}>
        <Link href="/climatizacao/escolas">Ver as 101 páginas escolares</Link>
        <Link href="/climatizacao/minhas-escolas">Minhas escolas neste aparelho</Link>
      </section>
    </main>
  );
}
