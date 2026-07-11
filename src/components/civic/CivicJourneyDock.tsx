"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  buildMissionOptions,
  missionPhases,
  type MissionOption,
  type MissionPhaseId,
} from "@/src/content/missions";
import { getStateAgenda, type StateAgendaId } from "@/src/content/stateAgendas";
import {
  buildAppBaseUrl,
  buildDonationUrl,
  buildVolunteerGroupUrl,
} from "@/src/content/siteLinks";
import {
  MISSION_JOURNEY_STORAGE_KEY,
  MISSION_JOURNEY_UPDATED_EVENT,
  readMissionJourney,
} from "@/src/lib/missionJourneyStorage";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import { recordExternalJourney } from "@/src/lib/externalJourneyStorage";
import {
  readStateAgenda,
  STATE_AGENDA_STORAGE_KEY,
  STATE_AGENDA_UPDATED_EVENT,
} from "@/src/lib/stateAgendaStorage";
import {
  WORLD_JOURNEY_STORAGE_KEY,
  WORLD_JOURNEY_UPDATED_EVENT,
  readWorldJourney,
  type StoredWorldPointId,
} from "@/src/lib/worldJourneyStorage";
import { MissionShareCardLazy } from "./MissionShareCardLazy";
import styles from "./civic-journey-dock.module.css";

interface JourneySnapshot {
  selectedMissionId: MissionOption["id"] | null;
  selectedAgendaId: StateAgendaId | null;
  visitedPhaseIds: MissionPhaseId[];
  visitedPointIds: StoredWorldPointId[];
}

interface Recommendation {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
}

const EMPTY_SNAPSHOT: JourneySnapshot = {
  selectedMissionId: null,
  selectedAgendaId: null,
  visitedPhaseIds: ["conhecer"],
  visitedPointIds: [],
};

const WORLD_STEPS: ReadonlyArray<{ id: StoredWorldPointId; label: string }> = [
  { id: "memoria", label: "Memória" },
  { id: "comum", label: "Comum" },
  { id: "missao", label: "Ação" },
];

const HIDDEN_ROUTE_PREFIXES = ["/explorar", "/jogo", "/apoio"];
const JOURNEY_MISSIONS = buildMissionOptions("caderno-jornada");

export function CivicJourneyDock() {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<JourneySnapshot>(EMPTY_SNAPSHOT);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const closeDock = useCallback((restoreFocus = true) => {
    setShareOpen(false);
    setOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  const closeShareCard = useCallback(() => {
    setShareOpen(false);
    window.requestAnimationFrame(() => shareButtonRef.current?.focus());
  }, []);

  const syncJourney = useCallback(() => {
    const mission = readMissionJourney(window.localStorage);
    const world = readWorldJourney(window.localStorage);
    const selectedAgendaId = readStateAgenda(window.localStorage);
    setSnapshot({
      selectedMissionId: mission.selectedMissionId,
      selectedAgendaId,
      visitedPhaseIds: mission.visitedPhaseIds,
      visitedPointIds: world.visitedPointIds,
    });
    setHydrated(true);
  }, []);

  useEffect(() => {
    syncJourney();
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === MISSION_JOURNEY_STORAGE_KEY ||
        event.key === WORLD_JOURNEY_STORAGE_KEY ||
        event.key === STATE_AGENDA_STORAGE_KEY
      ) {
        syncJourney();
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(MISSION_JOURNEY_UPDATED_EVENT, syncJourney);
    window.addEventListener(WORLD_JOURNEY_UPDATED_EVENT, syncJourney);
    window.addEventListener(STATE_AGENDA_UPDATED_EVENT, syncJourney);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(MISSION_JOURNEY_UPDATED_EVENT, syncJourney);
      window.removeEventListener(WORLD_JOURNEY_UPDATED_EVENT, syncJourney);
      window.removeEventListener(STATE_AGENDA_UPDATED_EVENT, syncJourney);
    };
  }, [syncJourney]);

  useEffect(() => {
    setOpen(false);
    setShareOpen(false);
    syncJourney();
  }, [pathname, syncJourney]);

  useEffect(() => {
    if (!open || shareOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDock();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeDock, open, shareOpen]);

  const meaningfulProgress =
    snapshot.visitedPointIds.length > 0 ||
    snapshot.selectedMissionId !== null ||
    snapshot.selectedAgendaId !== null ||
    snapshot.visitedPhaseIds.some((phase) => phase !== "conhecer");
  const hiddenRoute = HIDDEN_ROUTE_PREFIXES.some((route) => pathname.startsWith(route));
  const recommendation = useMemo(() => getRecommendation(snapshot), [snapshot]);
  const selectedMission = JOURNEY_MISSIONS.find((mission) => mission.id === snapshot.selectedMissionId) ?? null;
  const selectedAgenda = getStateAgenda(snapshot.selectedAgendaId);
  const totalProgress = snapshot.visitedPointIds.length + snapshot.visitedPhaseIds.length;

  if (!hydrated || hiddenRoute || !meaningfulProgress) return null;

  const handlePrimaryAction = () => {
    if (recommendation.external) recordExternalJourney({
      channel: snapshot.selectedMissionId ?? "external",
      title: recommendation.title,
      returnHref: "/participar",
    });
    trackEventIfAvailable("civic_journey_next_step_clicked", {
      destination: recommendation.href,
      selected_mission: snapshot.selectedMissionId ?? "none",
      world_points: snapshot.visitedPointIds.length,
      portal_phases: snapshot.visitedPhaseIds.length,
    });
    closeDock(false);
  };

  return (
    <aside className={styles.dock} aria-label="Caderno de jornada política">
      {open ? (
        <section
          className={styles.panel}
          id="civic-journey-panel"
          aria-labelledby="civic-journey-title"
          aria-hidden={shareOpen || undefined}
          inert={shareOpen ? true : undefined}
        >
          <div className={styles.panelHeader}>
            <div>
              <p>Jornada cívica · salva neste navegador</p>
              <h2 id="civic-journey-title">Seu próximo passo</h2>
            </div>
            <button type="button" onClick={() => closeDock()} aria-label="Fechar caderno de jornada">
              <CloseIcon />
            </button>
          </div>

          <div className={styles.progressSummary}>
            <strong>{totalProgress} de 7 sinais registrados</strong>
            <span>{snapshot.visitedPointIds.length} marcos · {snapshot.visitedPhaseIds.length} etapas</span>
          </div>

          <ol className={styles.progressRail} aria-label={`${totalProgress} de 7 sinais da jornada registrados`}>
            {WORLD_STEPS.map((step) => (
              <li key={step.id} data-visited={snapshot.visitedPointIds.includes(step.id)}>
                <i aria-hidden="true" />
                <span>{step.label}</span>
              </li>
            ))}
            {missionPhases.map((phase) => (
              <li key={phase.id} data-visited={snapshot.visitedPhaseIds.includes(phase.id)}>
                <i aria-hidden="true" />
                <span>{phase.label}</span>
              </li>
            ))}
          </ol>

          {selectedAgenda ? (
            <div
              className={styles.agendaContext}
              style={{ "--agenda-accent": selectedAgenda.accent } as CSSProperties}
            >
              <span>Pauta estadual em escuta</span>
              <strong>{selectedAgenda.shortTitle}</strong>
            </div>
          ) : null}

          <div className={styles.recommendation}>
            <p>{recommendation.eyebrow}</p>
            <h3>{recommendation.title}</h3>
            <span>{recommendation.description}</span>
            {recommendation.external ? (
              <a href={recommendation.href} target="_blank" rel="noopener noreferrer" onClick={handlePrimaryAction}>
                Continuar jornada <ArrowIcon />
              </a>
            ) : (
              <Link href={recommendation.href} onClick={handlePrimaryAction}>
                Continuar jornada <ArrowIcon />
              </Link>
            )}
          </div>

          {selectedMission ? (
            <button
              ref={shareButtonRef}
              type="button"
              className={styles.shareCardButton}
              onClick={() => {
                setShareOpen(true);
                trackEventIfAvailable("mission_card_opened", {
                  mission: selectedMission.id,
                  source: "civic_journey",
                });
              }}
            >
              <span><SparkIcon /> Criar cartão da minha missão</span>
              <ArrowIcon />
            </button>
          ) : null}

          <nav className={styles.quickLinks} aria-label="Atalhos da jornada">
            <Link href="/explorar" onClick={() => closeDock(false)}>Explorar</Link>
            <Link href="/pautas" onClick={() => closeDock(false)}>Pautas</Link>
            <Link href="/participar" onClick={() => closeDock(false)}>Participar</Link>
          </nav>
          <p className={styles.privacy}>Nenhum dado pessoal ou localização é armazenado.</p>
        </section>
      ) : (
        <button
          type="button"
          ref={triggerRef}
          className={styles.trigger}
          aria-expanded="false"
          aria-controls="civic-journey-panel"
          onClick={() => {
            setOpen(true);
            trackEventIfAvailable("civic_journey_opened", {
              world_points: snapshot.visitedPointIds.length,
              portal_phases: snapshot.visitedPhaseIds.length,
            });
          }}
        >
          <span className={styles.triggerMarks} aria-hidden="true">
            <i /><i /><i />
          </span>
          <span><small>Caderno de jornada</small><strong>{totalProgress} de 7 sinais</strong></span>
          <ChevronIcon />
        </button>
      )}
      {shareOpen && selectedMission ? (
        <MissionShareCardLazy
          mission={selectedMission}
          agenda={selectedAgenda}
          signalCount={totalProgress}
          onClose={closeShareCard}
        />
      ) : null}
    </aside>
  );
}

function getRecommendation(snapshot: JourneySnapshot): Recommendation {
  if (snapshot.selectedMissionId === "celular") {
    return {
      eyebrow: "Missão escolhida · celular",
      title: "Entrar no App Missão ÉLuta",
      description: "Receba orientação e transforme sua escolha em uma tarefa possível.",
      href: buildAppBaseUrl("caderno-jornada"),
      external: true,
    };
  }
  if (snapshot.selectedMissionId === "rua") {
    return {
      eyebrow: "Missão escolhida · território",
      title: "Encontrar o grupo de voluntários",
      description: "Converse com a organização e combine uma presença segura no seu território.",
      href: buildVolunteerGroupUrl("caderno-jornada"),
      external: true,
    };
  }
  if (snapshot.selectedMissionId === "contribuir") {
    return {
      eyebrow: "Missão escolhida · sustentar",
      title: "Fortalecer a mobilização",
      description: "Ajude a manter comunicação, materiais e organização de base.",
      href: buildDonationUrl("caderno-jornada"),
      external: true,
    };
  }
  if (snapshot.selectedMissionId === "compartilhar") {
    return {
      eyebrow: "Missão escolhida · ampliar",
      title: "Compartilhar com responsabilidade",
      description: "Use os materiais da campanha e convide mais alguém a conhecer.",
      href: "/#agir",
    };
  }
  const selectedAgenda = getStateAgenda(snapshot.selectedAgendaId);
  if (selectedAgenda) {
    return {
      eyebrow: "Pauta estadual escolhida",
      title: `Transformar ${selectedAgenda.shortTitle.toLowerCase()} em missão`,
      description: "Escolha uma forma possível de ajudar essa prioridade a ganhar organização nos territórios.",
      href: "/#escolher-missao",
    };
  }
  if (snapshot.visitedPointIds.includes("comum") || snapshot.visitedPointIds.includes("missao")) {
    return {
      eyebrow: "Do território para a prática",
      title: "Escolher uma missão possível",
      description: "Converta o que você encontrou no distrito em um próximo passo concreto.",
      href: "/#escolher-missao",
    };
  }
  if (snapshot.visitedPointIds.includes("memoria")) {
    return {
      eyebrow: "Da memória para a escuta",
      title: "Conhecer as pautas do estado",
      description: "Relacione a história de Volta Redonda às lutas que atravessam o Rio de Janeiro.",
      href: "/pautas",
    };
  }
  return {
    eyebrow: "Da página para o território",
    title: "Percorrer o Distrito 01",
    description: "Atravesse a fábrica, o comum e o jardim para abrir novas formas de participação.",
    href: "/explorar",
  };
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 14 5-5 5 5" /></svg>;
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>;
}

function SparkIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 14.2 9l5.3 2.2-5.3 2.2L12 19l-2.2-5.6-5.3-2.2L9.8 9 12 3.5Z" /></svg>;
}
