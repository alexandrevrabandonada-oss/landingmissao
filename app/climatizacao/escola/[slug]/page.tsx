import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./school.module.css";

const SITE = "https://www.alexandrevrabandonada.online";

type School = {
  id: number;
  slug: string;
  name: string;
  category: string;
  network: "SME" | "FEVRE";
  report_count: number;
  last_report_at: string | null;
};

type Snapshot = {
  schools: School[];
  summary: {
    total_support_count: number;
    total_reports: number;
  };
};

async function getSnapshot(): Promise<Snapshot | null> {
  try {
    const response = await fetch(`${SITE}/api/climatizacao?action=snapshot`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function getSchool(slug: string) {
  const snapshot = await getSnapshot();
  const school = snapshot?.schools.find((item) => item.slug === slug) ?? null;
  return { snapshot, school };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { school } = await getSchool(slug);

  if (!school) {
    return {
      title: "Climatização nas escolas de Volta Redonda",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE}/climatizacao/escola/${school.slug}`;
  return {
    title: `Climatização — ${school.name}`,
    description: `Página pública da climatização de ${school.name}: apoiar, relatar problemas e acessar os canais oficiais.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Climatização — ${school.name}`,
      description: "Apoios, relatos e encaminhamento aos canais oficiais de Volta Redonda.",
      url,
      type: "website",
      locale: "pt_BR",
    },
  };
}

export default async function SchoolClimatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { snapshot, school } = await getSchool(slug);
  if (!school) notFound();

  const base = `/climatizacao?escola=${encodeURIComponent(school.slug)}`;
  const qr = `/api/climatizacao/qr?escola=${encodeURIComponent(school.slug)}`;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link href="/climatizacao" className={styles.back}>← Painel geral</Link>
        <span className={styles.kicker}>{school.network} · {school.category}</span>
        <h1>{school.name}</h1>
        <p>
          Entrada direta da campanha de climatização. Esta página já carrega a escola correta
          para apoiar, registrar a situação e abrir os canais oficiais.
        </p>

        <div className={styles.actions}>
          <Link href={`${base}#assinar`} className={styles.primary}>Apoiar esta escola</Link>
          <Link href={`${base}#relatar`} className={styles.secondary}>Relatar problema</Link>
          <Link href={`${base}#mobilizar`} className={styles.secondary}>Enviar aos responsáveis</Link>
        </div>
      </section>

      <section className={styles.stats}>
        <article>
          <strong>{school.report_count ?? 0}</strong>
          <span>relatos desta escola</span>
        </article>
        <article>
          <strong>{snapshot?.summary.total_support_count ?? 0}</strong>
          <span>apoios na campanha</span>
        </article>
        <article>
          <strong>101</strong>
          <span>unidades acompanhadas</span>
        </article>
      </section>

      <section className={styles.qr}>
        <div>
          <span>QR DESTA ESCOLA</span>
          <h2>Um cartaz. Um endereço. A escola certa.</h2>
          <p>
            O QR abre diretamente o fluxo de climatização com {school.name} já identificada.
            Use em mural, panfleto, assembleia, reunião ou grupo da comunidade escolar.
          </p>
          <div className={styles.qrActions}>
            <a href={qr} target="_blank" rel="noreferrer">Abrir QR em SVG</a>
            <a href={qr} download={`climatizacao-${school.slug}.svg`}>Baixar QR</a>
          </div>
        </div>
        <img src={qr} alt={`QR code da campanha de climatização para ${school.name}`} />
      </section>

      <section className={styles.criteria}>
        <h2>Como os dados aparecem</h2>
        <p>
          Relatos da comunidade, apoios estudantis, assinaturas nominais e respostas oficiais
          são apresentados em categorias separadas. Um relato não é tratado como vistoria técnica.
        </p>
        <Link href={`${base}#painel`}>Ver o painel público completo →</Link>
      </section>
    </main>
  );
}
