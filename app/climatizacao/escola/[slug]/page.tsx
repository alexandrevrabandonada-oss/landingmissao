import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FollowSchoolButton from "./FollowSchoolButton";
import SchoolAlerts from "./SchoolAlerts";
import styles from "./school.module.css";

const SITE = "https://www.alexandrevrabandonada.online";

type School = {
  id: number;
  slug: string;
  name: string;
  category: string;
  network: "SME" | "FEVRE";
  report_count: number;
  student_support_count: number;
  signature_count: number;
  support_count: number;
  activity_count: number;
  last_activity_at: string | null;
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
    description: `Página pública da climatização de ${school.name}: apoiar, relatar problemas, acompanhar atividade e acessar os canais oficiais.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Climatização — ${school.name}`,
      description: "Apoios, relatos, atividade pública e encaminhamento aos canais oficiais de Volta Redonda.",
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
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.topLinks}>
          <Link href="/climatizacao" className={styles.back}>← Painel geral</Link>
          <Link href="/climatizacao/minhas-escolas" className={styles.mySchools}>Minhas escolas</Link>
        </div>
        <span className={styles.kicker}>{school.network} · {school.category}</span>
        <h1>{school.name}</h1>
        <p>
          Entrada direta da campanha de climatização. Esta página carrega a escola correta para
          apoiar, registrar a situação, acompanhar o pulso público e abrir os canais oficiais.
        </p>

        <div className={styles.actions}>
          <Link href={`${base}#assinar`} className={styles.primary}>Apoiar esta escola</Link>
          <Link href={`${base}#relatar`} className={styles.secondary}>Relatar problema</Link>
          <Link href={`${base}#mobilizar`} className={styles.secondary}>Enviar aos responsáveis</Link>
        </div>
        <p className={styles.shortLink}>Link curto: <a href={`/c/${school.id}`}>alexandrevrabandonada.online/c/{school.id}</a></p>

        <FollowSchoolButton
          slug={school.slug}
          name={school.name}
          network={school.network}
          activityCount={Number(school.activity_count ?? 0)}
        />

        <SchoolAlerts
          schoolId={school.id}
          slug={school.slug}
          name={school.name}
        />
      </section>

      <section className={styles.pulse} aria-label="Pulso público da escola">
        <div className={styles.pulseHead}>
          <span>PULSO PÚBLICO</span>
          <h2>O que já entrou no sistema</h2>
          <p>Contagem agregada, sem revelar identidade de participantes.</p>
        </div>
        <div className={styles.stats}>
          <article>
            <strong>{school.report_count ?? 0}</strong>
            <span>relatos desta escola</span>
          </article>
          <article>
            <strong>{school.support_count ?? 0}</strong>
            <span>apoios ligados à escola</span>
          </article>
          <article>
            <strong>{school.activity_count ?? 0}</strong>
            <span>atividades agregadas</span>
          </article>
          <article>
            <strong className={styles.timeValue}>
              {school.last_activity_at
                ? new Date(school.last_activity_at).toLocaleDateString("pt-BR")
                : "—"}
            </strong>
            <span>última atividade pública</span>
          </article>
        </div>
        <p className={styles.pulseNote}>
          Apoios sem escola informada aparecem apenas no total geral da campanha. Um relato continua sendo
          identificado como relato comunitário, não como vistoria técnica.
        </p>
      </section>

      <section className={styles.qr}>
        <div>
          <span>QR DESTA ESCOLA</span>
          <h2>Um cartaz. Um endereço. A escola certa.</h2>
          <p>
            O QR abre diretamente a página de {school.name}. Use em mural, panfleto, assembleia,
            reunião ou grupo da comunidade escolar.
          </p>
          <div className={styles.qrActions}>
            <a href={qr} target="_blank" rel="noreferrer">Abrir QR em SVG</a>
            <a href={qr} download={`climatizacao-${school.slug}.svg`}>Baixar QR</a>
          </div>
        </div>
        <img src={qr} alt={`QR code da campanha de climatização para ${school.name}`} />
      </section>

      <section className={styles.criteria}>
        <h2>Transparência por desenho</h2>
        <p>
          Relatos da comunidade, apoios estudantis, assinaturas nominais e respostas oficiais
          são apresentados em categorias separadas. A sua lista de escolas seguidas fica no seu navegador,
          e não é enviada ao servidor.
        </p>
        <div className={styles.criteriaLinks}>
          <Link href={`${base}#painel`}>Ver o painel público completo →</Link>
          <Link href="/climatizacao/minhas-escolas">Abrir minhas escolas →</Link>
        </div>
      </section>
    </div>
  );
}
