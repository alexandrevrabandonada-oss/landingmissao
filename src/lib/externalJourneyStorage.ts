export const EXTERNAL_JOURNEY_STORAGE_KEY = "missao:external-journey:v1";

export interface ExternalJourneyIntent {
  channel: string;
  title: string;
  returnHref: string;
  openedAt: string;
}

export function recordExternalJourney(intent: Omit<ExternalJourneyIntent, "openedAt">) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXTERNAL_JOURNEY_STORAGE_KEY, JSON.stringify({
    ...intent,
    openedAt: new Date().toISOString(),
  }));
}

export function readExternalJourney(): ExternalJourneyIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(EXTERNAL_JOURNEY_STORAGE_KEY) ?? "null") as ExternalJourneyIntent | null;
    if (!parsed?.channel || !parsed.title || !parsed.openedAt) return null;
    const age = Date.now() - Date.parse(parsed.openedAt);
    return age >= 0 && age < 1000 * 60 * 60 * 24 * 7 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearExternalJourney() {
  if (typeof window !== "undefined") window.localStorage.removeItem(EXTERNAL_JOURNEY_STORAGE_KEY);
}
