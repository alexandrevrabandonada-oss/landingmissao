"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  missionPhases,
  type MissionJourneyState,
  type MissionOption,
  type MissionPhaseId,
} from "@/src/content/missions";
import {
  MISSION_JOURNEY_STORAGE_KEY,
  readMissionJourney,
  writeMissionJourney,
} from "@/src/lib/missionJourneyStorage";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";

interface MissionJourneyContextValue {
  activePhaseId: MissionPhaseId;
  selectedMissionId: MissionOption["id"] | null;
  visitedPhaseIds: MissionPhaseId[];
  selectMission: (missionId: MissionOption["id"]) => void;
  resetJourney: () => void;
  trackMissionCta: (mission: MissionOption) => void;
}

const MissionJourneyContext = createContext<MissionJourneyContextValue | null>(null);

function readStoredJourney(): Pick<MissionJourneyState, "selectedMissionId" | "visitedPhaseIds"> {
  if (typeof window === "undefined") {
    return { selectedMissionId: null, visitedPhaseIds: ["conhecer"] };
  }

  return readMissionJourney(window.localStorage);
}

function isPhaseId(value: unknown): value is MissionPhaseId {
  return missionPhases.some((phase) => phase.id === value);
}

export function MissionJourneyProvider({ children }: { children: ReactNode }) {
  const [activePhaseId, setActivePhaseId] = useState<MissionPhaseId>("conhecer");
  const [selectedMissionId, setSelectedMissionId] = useState<MissionOption["id"] | null>(null);
  const [visitedPhaseIds, setVisitedPhaseIds] = useState<MissionPhaseId[]>(["conhecer"]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const lastTrackedPhase = useRef<MissionPhaseId | null>(null);
  const completionTracked = useRef(false);

  useEffect(() => {
    const storedJourney = readStoredJourney();
    setSelectedMissionId(storedJourney.selectedMissionId);
    setVisitedPhaseIds(storedJourney.visitedPhaseIds);
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    writeMissionJourney(window.localStorage, {
      selectedMissionId,
      visitedPhaseIds,
    });
  }, [hasHydrated, selectedMissionId, visitedPhaseIds]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-journey-phase]"),
    );

    if (sections.length === 0 || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const phaseId = visibleEntry?.target.getAttribute("data-journey-phase");

        if (!isPhaseId(phaseId)) {
          return;
        }

        setActivePhaseId(phaseId);
        setVisitedPhaseIds((current) =>
          current.includes(phaseId) ? current : [...current, phaseId],
        );
      },
      { rootMargin: "-24% 0px -58%", threshold: [0.12, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lastTrackedPhase.current === activePhaseId) {
      return;
    }

    lastTrackedPhase.current = activePhaseId;
    trackEventIfAvailable("mission_phase_viewed", { phase: activePhaseId });

    if (activePhaseId === "agir" && selectedMissionId && !completionTracked.current) {
      completionTracked.current = true;
      trackEventIfAvailable("mission_journey_completed", { mission: selectedMissionId });
    }
  }, [activePhaseId, selectedMissionId]);

  const selectMission = useCallback((missionId: MissionOption["id"]) => {
    setSelectedMissionId(missionId);
    setVisitedPhaseIds((current) =>
      current.includes("escolher") ? current : [...current, "escolher"],
    );
    trackEventIfAvailable("mission_selected", { mission: missionId });
  }, []);

  const resetJourney = useCallback(() => {
    setActivePhaseId("conhecer");
    setSelectedMissionId(null);
    setVisitedPhaseIds(["conhecer"]);
    completionTracked.current = false;
    window.localStorage.removeItem(MISSION_JOURNEY_STORAGE_KEY);
    trackEventIfAvailable("mission_journey_reset");
    document.getElementById("conhecer")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const trackMissionCta = useCallback((mission: MissionOption) => {
    trackEventIfAvailable("mission_cta_clicked", {
      mission: mission.id,
      destination: mission.href,
      external: mission.external,
    });
  }, []);

  const value = useMemo<MissionJourneyContextValue>(
    () => ({
      activePhaseId,
      selectedMissionId,
      visitedPhaseIds,
      selectMission,
      resetJourney,
      trackMissionCta,
    }),
    [
      activePhaseId,
      resetJourney,
      selectMission,
      selectedMissionId,
      trackMissionCta,
      visitedPhaseIds,
    ],
  );

  return (
    <MissionJourneyContext.Provider value={value}>
      {children}
    </MissionJourneyContext.Provider>
  );
}

export function useMissionJourney() {
  const context = useContext(MissionJourneyContext);
  if (!context) {
    throw new Error("useMissionJourney must be used inside MissionJourneyProvider");
  }
  return context;
}
