"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clearExternalJourney, readExternalJourney, type ExternalJourneyIntent } from "@/src/lib/externalJourneyStorage";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import styles from "./external-journey-return.module.css";

export function ExternalJourneyReturn() {
  const pathname = usePathname();
  const [intent, setIntent] = useState<ExternalJourneyIntent | null>(null);
  const announcedIntentRef = useRef<string | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/explorar") || pathname.startsWith("/jogo")) return;
    const checkReturn = () => {
      const stored = readExternalJourney();
      if (!stored || Date.now() - Date.parse(stored.openedAt) < 2500) return;
      setIntent(stored);
      if (announcedIntentRef.current !== stored.openedAt) {
        announcedIntentRef.current = stored.openedAt;
        trackEventIfAvailable("external_channel_returned", { channel: stored.channel });
      }
    };
    window.addEventListener("focus", checkReturn);
    document.addEventListener("visibilitychange", checkReturn);
    checkReturn();
    return () => {
      window.removeEventListener("focus", checkReturn);
      document.removeEventListener("visibilitychange", checkReturn);
    };
  }, [pathname]);

  if (!intent) return null;
  const dismiss = (status: "completed" | "later") => {
    trackEventIfAvailable("external_step_self_reported", { channel: intent.channel, status });
    clearExternalJourney();
    announcedIntentRef.current = null;
    setIntent(null);
  };

  return (
    <aside className={styles.returnCard} role="dialog" aria-labelledby="external-return-title">
      <p>De volta à jornada</p>
      <h2 id="external-return-title">Conseguiu avançar em “{intent.title}”?</h2>
      <span>O portal não verifica ações fora daqui. Conte apenas como deseja continuar.</span>
      <div>
        <button type="button" onClick={() => dismiss("completed")}>Sim, dei esse passo</button>
        <Link href={intent.returnHref || "/participar"} onClick={() => dismiss("later")}>Ainda não — ver alternativas</Link>
      </div>
      <button type="button" className={styles.close} onClick={() => dismiss("later")} aria-label="Fechar continuidade">×</button>
    </aside>
  );
}
