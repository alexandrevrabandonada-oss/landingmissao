"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./school.module.css";

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

export default function FollowSchoolButton({
  slug,
  name,
  network,
  activityCount,
}: {
  slug: string;
  name: string;
  network: string;
  activityCount: number;
}) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(readFollowed().some((item) => item.slug === slug));
  }, [slug]);

  function toggle() {
    const current = readFollowed();
    if (current.some((item) => item.slug === slug)) {
      const next = current.filter((item) => item.slug !== slug);
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setFollowing(false);
      return;
    }

    const next: FollowedSchool[] = [
      ...current,
      {
        slug,
        name,
        network,
        baseline_activity_count: activityCount,
        followed_at: new Date().toISOString(),
      },
    ];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setFollowing(true);
  }

  return (
    <div className={styles.followBlock}>
      <button type="button" onClick={toggle} className={following ? styles.following : styles.followButton}>
        {following ? "✓ Seguindo esta escola neste aparelho" : "+ Seguir esta escola neste aparelho"}
      </button>
      <p>
        Sem conta e sem enviar sua lista ao servidor. A preferência fica somente neste navegador.
      </p>
      {following ? <Link href="/climatizacao/minhas-escolas">Ver minhas escolas →</Link> : null}
    </div>
  );
}
