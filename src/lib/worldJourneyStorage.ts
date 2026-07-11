export const WORLD_JOURNEY_STORAGE_KEY = "missao-eluta:world-journey:v1";
export const WORLD_JOURNEY_UPDATED_EVENT = "missao-eluta:world-journey-updated";

export type StoredWorldPointId = "memoria" | "comum" | "missao";
export type StoredWorldMode = "loading" | "3d" | "light";

export interface StoredWorldJourney {
  visitedPointIds: StoredWorldPointId[];
  mode: StoredWorldMode;
}

const DEFAULT_WORLD_JOURNEY: StoredWorldJourney = {
  visitedPointIds: [],
  mode: "3d",
};

export function readWorldJourney(storage: Pick<Storage, "getItem">): StoredWorldJourney {
  try {
    const rawValue = storage.getItem(WORLD_JOURNEY_STORAGE_KEY);
    if (!rawValue) return DEFAULT_WORLD_JOURNEY;

    const parsed = JSON.parse(rawValue) as {
      visitedPointIds?: unknown;
      mode?: unknown;
    };

    return {
      visitedPointIds: Array.isArray(parsed.visitedPointIds)
        ? Array.from(new Set(parsed.visitedPointIds.filter(isStoredWorldPointId)))
        : [],
      mode: isStoredWorldMode(parsed.mode) ? parsed.mode : "3d",
    };
  } catch {
    return DEFAULT_WORLD_JOURNEY;
  }
}

export function writeWorldJourney(
  storage: Pick<Storage, "setItem">,
  journey: StoredWorldJourney,
) {
  storage.setItem(
    WORLD_JOURNEY_STORAGE_KEY,
    JSON.stringify({
      version: 1,
      visitedPointIds: journey.visitedPointIds,
      mode: journey.mode,
      updatedAt: new Date().toISOString(),
    }),
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(WORLD_JOURNEY_UPDATED_EVENT));
  }
}

function isStoredWorldPointId(value: unknown): value is StoredWorldPointId {
  return value === "memoria" || value === "comum" || value === "missao";
}

function isStoredWorldMode(value: unknown): value is StoredWorldMode {
  return value === "loading" || value === "3d" || value === "light";
}
