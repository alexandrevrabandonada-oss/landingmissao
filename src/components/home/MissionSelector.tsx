"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MissionShareCardLazy } from "@/src/components/civic/MissionShareCardLazy";
import type { MissionOption } from "@/src/content/missions";
import { getStateAgenda, type StateAgenda } from "@/src/content/stateAgendas";
import { readStateAgenda } from "@/src/lib/stateAgendaStorage";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import { recordExternalJourney } from "@/src/lib/externalJourneyStorage";
import { MissionCard } from "./MissionCard";
import { useMissionJourney } from "./MissionJourney";
import styles from "./mission-home.module.css";

export function MissionSelector({ missions }: { missions: MissionOption[] }) {
  const {
    selectedMissionId,
    selectMission,
    resetJourney,
    trackMissionCta,
    visitedPhaseIds,
  } = useMissionJourney();
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<StateAgenda | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) ?? null;

  useEffect(() => {
    setSelectedAgenda(getStateAgenda(readStateAgenda(window.localStorage)));
  }, []);

  const closeShareCard = useCallback(() => {
    setShareOpen(false);
    window.requestAnimationFrame(() => shareButtonRef.current?.focus());
  }, []);

  return (
    <>
    <section
      className={`${styles.section} ${styles.selectorSection}`}
      id="escolher-missao"
      data-journey-phase="escolher"
      aria-labelledby="mission-selector-title"
      aria-hidden={shareOpen || undefined}
      inert={shareOpen ? true : undefined}
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
                onClick={() => {
                  if (selectedMission.external) recordExternalJourney({
                    channel: selectedMission.id,
                    title: selectedMission.title,
                    returnHref: "/participar",
                  });
                  trackMissionCta(selectedMission);
                }}
              >
                <span>{selectedMission.cta}</span>
                <ArrowIcon />
              </a>
              <button
                ref={shareButtonRef}
                type="button"
                className={styles.shareMissionButton}
                onClick={() => {
                  setShareOpen(true);
                  trackEventIfAvailable("mission_card_opened", {
                    mission: selectedMission.id,
                    source: "mission_selector",
                  });
                }}
              >
                <span><SparkIcon /> Criar meu cartão de missão</span>
                <ArrowIcon />
              </button>
              {selectedAgenda ? (
                <p className={styles.selectedAgendaContext}>
                  <span>Pauta estadual conectada</span>
                  <strong>{selectedAgenda.shortTitle}</strong>
                </p>
              ) : null}
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
    {shareOpen && selectedMission ? (
      <MissionShareCardLazy
        mission={selectedMission}
        agenda={selectedAgenda}
        signalCount={visitedPhaseIds.length}
        onClose={closeShareCard}
      />
    ) : null}
    </>
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

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5 14.2 9l5.3 2.2-5.3 2.2L12 19l-2.2-5.6-5.3-2.2L9.8 9 12 3.5Z" />
    </svg>
  );
}
