import Link from "next/link";
import styles from "./schools.module.css";

const SITE = "https://www.alexandrevrabandonada.online";

type School = {
  id: number;
  slug: string;
  name: string;
  category: string;
  network: "SME" | "FEVRE";
  report_count: number;
};

type Snapshot = {
  schools?: School[];
};

export const dynamic = "force-dynamic";

async function getSchools(): Promise<School[]> {
  try {
    const response = await fetch(`${SITE}/api/climatizacao?action=snapshot`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const snapshot: Snapshot = await response.json();
    return snapshot.schools ?? [];
  } catch {
    return [];
  }
}

export default async function ClimateSchoolDirectory() {
  const schools = await getSchools();

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link href="/climatizacao" className={styles.back}>← Painel de climatização</Link>
        <span>101 ENTRADAS DIRETAS</span>
        <h1>Uma página para cada escola.</h1>
        <p>
          Abra a página certa, copie o link ou use o QR individual. Para impressão em massa,
          baixe o pacote completo com todos os QRs em SVG.
        </p>
        <div className={styles.heroActions}>
          <a href="/api/climatizacao/qr-lote">Baixar 101 QRs em ZIP</a>
          <Link href="/climatizacao#assinar">Abrir abaixo-assinado geral</Link>
        </div>
      </section>

      <section className={styles.summary}>
        <strong>{schools.length || 101}</strong>
        <span>unidades com URL e QR próprios</span>
      </section>

      <section className={styles.grid}>
        {schools.map((school) => (
          <article key={school.id}>
            <div>
              <span>{school.network} · {school.category}</span>
              <h2>{school.name}</h2>
              <p>{school.report_count ?? 0} relato(s) registrado(s) no painel.</p>
            </div>
            <div className={styles.actions}>
              <Link href={`/climatizacao/escola/${school.slug}`}>Abrir página</Link>
              <a href={`/api/climatizacao/qr?escola=${school.slug}`} target="_blank" rel="noreferrer">Abrir QR</a>
              <Link href={`/climatizacao/escola/${school.slug}/cartaz`}>Cartaz A4</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
