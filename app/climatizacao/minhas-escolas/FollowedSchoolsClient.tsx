"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./followed.module.css";

type School = {
  id: number;
  slug: string;
  name: string;
  category: string;
  network: string;
  report_count: number;
  support_count: number;
  activity_count: number;
  last_activity_at: string | null;
};

type FollowedSchool = {
  slug: string;
  name: string;
  network: string;
  baseline_activity_count: number;
  followed_at: string;
};

const KEY = "climatizacao_followed_schools_v1";

function readFollowed(): FollowedSchool[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function FollowedSchoolsClient() {
  const [saved, setSaved] = useState<FollowedSchool[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSaved(readFollowed());
    fetch("/api/climatizacao?action=snapshot", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setSchools(data.schools ?? []))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => saved.map((item) => {
    const current = schools.find((school) => school.slug === item.slug);
    const activity = Number(current?.activity_count ?? item.baseline_activity_count ?? 0);
    return {
      saved: item,
      current,
      newActivity: Math.max(0, activity - Number(item.baseline_activity_count ?? 0)),
    };
  }), [saved, schools]);

  function persist(next: FollowedSchool[]) {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next);
  }

  function markSeen(slug: string) {
    const school = schools.find((item) => item.slug === slug);
    if (!school) return;
    persist(saved.map((item) => item.slug === slug
      ? { ...item, baseline_activity_count: Number(school.activity_count ?? 0) }
      : item
    ));
  }

  function remove(slug: string) {
    persist(saved.filter((item) => item.slug !== slug));
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Link href="/climatizacao" className={styles.back}>← Painel geral</Link>
        <span>PERSONALIZAÇÃO LOCAL</span>
        <h1>Minhas escolas</h1>
        <p>
          A lista fica somente neste aparelho. O servidor não recebe quais escolas você acompanha.
        </p>
      </section>

      {loading ? (
        <div className={styles.empty}>Carregando atividade pública…</div>
      ) : rows.length === 0 ? (
        <div className={styles.empty}>
          Você ainda não segue nenhuma escola. Abra uma página escolar e toque em “Seguir esta escola”.
        </div>
      ) : (
        <section className={styles.grid}>
          {rows.map(({ saved: item, current, newActivity }) => (
            <article key={item.slug}>
              <div className={styles.cardTop}>
                <div>
                  <span>{current?.network ?? item.network}</span>
                  <h2>{current?.name ?? item.name}</h2>
                </div>
                {newActivity > 0 ? <b>+{newActivity} nova(s) atividade(s)</b> : <b className={styles.quiet}>sem novidade</b>}
              </div>

              <div className={styles.metrics}>
                <span><strong>{current?.report_count ?? 0}</strong> relatos</span>
                <span><strong>{current?.support_count ?? 0}</strong> apoios ligados à escola</span>
                <span><strong>{current?.activity_count ?? 0}</strong> atividades agregadas</span>
              </div>

              <p>
                Última atividade pública: {current?.last_activity_at
                  ? new Date(current.last_activity_at).toLocaleString("pt-BR")
                  : "ainda sem atividade registrada"}.
              </p>

              <div className={styles.actions}>
                <Link href={`/climatizacao/escola/${item.slug}`}>Abrir escola</Link>
                {newActivity > 0 ? <button type="button" onClick={() => markSeen(item.slug)}>Marcar como visto</button> : null}
                <button type="button" onClick={() => remove(item.slug)}>Deixar de seguir</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
