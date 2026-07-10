"use client";

import type { MissionOption } from "@/src/content/missions";
import { MissionCard } from "./MissionCard";
import { useMissionJourney } from "./MissionJourney";
import styles from "./mission-home.module.css";

export function MissionSelector({ missions }: { missions: MissionOption[] }) {
  const {
    selectedMissionId,
    selectMission,
    resetJourney,
    trackMissionCta,
  } = useMissionJourney();
  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) ?? null;

  return (
    <section
      className={`${styles.section} ${styles.selectorSection}`}
      id="escolher-missao"
      data-journey-phase="escolher"
      aria-labelledby="mission-selector-title"
    >
      <div className={styles.narrowContainer}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionIndex}>02 · Escolher missão</p>
          <h2 id="mission-selector-title">Escolha sua missão</h2>
          <p>Encontre um primeiro passo seguro, possível e útil para você.</p>
        </div>

        <div className={styles.missionList} role="group" aria-label="Formas de participar">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              selected={mission.id === selectedMissionId}
              onSelect={selectMission}
            />
          ))}
        </div>

        <div className={styles.selectorAction}>
          {selectedMission ? (
            <>
              <a
                href={selectedMission.href}
                target={selectedMission.external ? "_blank" : undefined}
                rel={selectedMission.external ? "noopener noreferrer" : undefined}
                className={styles.primaryButton}
                onClick={() => trackMissionCta(selectedMission)}
              >
                <span>{selectedMission.cta}</span>
                <ArrowIcon />
              </a>
              <div className={styles.missionFeedback} role="status" aria-live="polite">
                <CheckBadge />
                <p>
                  <strong>Missão selecionada: {selectedMission.title}</strong>
                  <span>Próximo passo: {selectedMission.nextStep}</span>
                </p>
              </div>
              <button type="button" className={styles.resetButton} onClick={resetJourney}>
                Recomeçar jornada
              </button>
            </>
          ) : (
            <p className={styles.selectorHint} role="status" aria-live="polite">
              Selecione uma opção para receber seu próximo passo.
            </p>
          )}
        </div>

        <noscript>
          <div className={styles.noScriptFallback}>
            <p>Você também pode seguir diretamente por um destes caminhos:</p>
            <ul>
              {missions.map((mission) => (
                <li key={mission.id}>
                  <a href={mission.href}>{mission.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </noscript>
      </div>
    </section>
  );
}
function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckBadge() {
  return (
    <span className={styles.checkBadge} aria-hidden="true">
      <svg viewBox="0 0 20 20">
        <path d="m4 10.5 3.3 3.2L16 5.8" />
      </svg>
    </span>
  );
}
