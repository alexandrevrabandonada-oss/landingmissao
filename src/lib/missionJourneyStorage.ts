import {
  missionPhases,
  type MissionJourneyState,
  type MissionOption,
  type MissionPhaseId,
} from "@/src/content/missions";

export const MISSION_JOURNEY_STORAGE_KEY = "missao-eluta:landing-journey:v1";

const DEFAULT_JOURNEY: Pick<MissionJourneyState, "selectedMissionId" | "visitedPhaseIds"> = {
  selectedMissionId: null,
  visitedPhaseIds: ["conhecer"],
};

export function readMissionJourney(
  storage: Pick<Storage, "getItem">,
): Pick<MissionJourneyState, "selectedMissionId" | "visitedPhaseIds"> {
  try {
    const rawValue = storage.getItem(MISSION_JOURNEY_STORAGE_KEY);
    if (!rawValue) return DEFAULT_JOURNEY;

    const parsed = JSON.parse(rawValue) as Partial<MissionJourneyState>;
    const selectedMissionId = isMissionId(parsed.selectedMissionId) ? parsed.selectedMissionId : null;
    const visitedPhaseIds = Array.isArray(parsed.visitedPhaseIds)
      ? parsed.visitedPhaseIds.filter(isPhaseId)
      : [];

    return {
      selectedMissionId,
      visitedPhaseIds: visitedPhaseIds.length > 0 ? visitedPhaseIds : ["conhecer"],
    };
  } catch {
    return DEFAULT_JOURNEY;
  }
}

export function writeMissionJourney(
  storage: Pick<Storage, "setItem">,
  state: Pick<MissionJourneyState, "selectedMissionId" | "visitedPhaseIds">,
) {
  const nextState: MissionJourneyState = {
    version: 1,
    selectedMissionId: state.selectedMissionId,
    visitedPhaseIds: state.visitedPhaseIds,
    updatedAt: new Date().toISOString(),
  };
  storage.setItem(MISSION_JOURNEY_STORAGE_KEY, JSON.stringify(nextState));
}

export function selectStoredMission(
  storage: Pick<Storage, "getItem" | "setItem">,
  missionId: MissionOption["id"],
) {
  const current = readMissionJourney(storage);
  writeMissionJourney(storage, {
    selectedMissionId: missionId,
    visitedPhaseIds: current.visitedPhaseIds.includes("escolher")
      ? current.visitedPhaseIds
      : [...current.visitedPhaseIds, "escolher"],
  });
}

function isMissionId(value: unknown): value is MissionOption["id"] {
  return ["celular", "rua", "contribuir", "compartilhar"].includes(String(value));
}

function isPhaseId(value: unknown): value is MissionPhaseId {
  return missionPhases.some((phase) => phase.id === value);
}
