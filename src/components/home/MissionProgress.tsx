"use client";

import { missionPhases } from "@/src/content/missions";
import { useMissionJourney } from "./MissionJourney";
import styles from "./mission-home.module.css";

interface MissionProgressProps {
  participateUrl: string;
}
export function MissionProgress({ participateUrl }: MissionProgressProps) {
  const { activePhaseId, visitedPhaseIds } = useMissionJourney();
  const activeIndex = missionPhases.findIndex((phase) => phase.id === activePhaseId);
  const activePhase = missionPhases[Math.max(activeIndex, 0)];

  return (
    <header className={styles.stickyHeader}>
      <div className={styles.headerRow}>
        <a href="#conhecer" className={styles.brand} aria-label="Voltar ao início">
          Alexandre VR Abandonada
        </a>
        <nav className={styles.desktopNav} aria-label="Navegação principal">
          <a href="#quem-e">Quem é</a>
          <a href="#metodo">Método</a>
          <a href="#como-funciona">App</a>
          <a href="#agir">Participar</a>
        </nav>
        <a
          href={participateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.headerCta}
        >
          Participar
        </a>
      </div>

      <nav className={styles.progressRail} aria-label="Progresso da jornada">
        <p className={styles.progressLabel} aria-live="polite">
          <strong>Etapa {activeIndex + 1} de {missionPhases.length}</strong>
          <span aria-hidden="true">·</span>
          <span>{activePhase.label}</span>
        </p>
        <ol className={styles.progressSteps}>
          {missionPhases.map((phase, index) => {
            const isActive = phase.id === activePhaseId;
            const isVisited = visitedPhaseIds.includes(phase.id);
            return (
              <li key={phase.id}>
                <a
                  href={phase.href}
                  className={`${styles.progressStep} ${isActive ? styles.progressStepActive : ""} ${isVisited ? styles.progressStepVisited : ""}`}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Etapa ${index + 1}: ${phase.label}${isVisited ? ", visitada" : ""}`}
                >
                  <span>{isVisited && !isActive ? <CheckIcon /> : index + 1}</span>
                  <i aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10.5 3.3 3.2L16 5.8" />
    </svg>
  );
}
