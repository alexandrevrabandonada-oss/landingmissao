import { CIVIC_OUTCOME_EVENT, classifyCivicEvent } from "./civicEventTaxonomy";

type TrackPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: TrackPayload }) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEventIfAvailable(eventName: string, payload: TrackPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const civicOutcome = classifyCivicEvent(eventName);
  const normalizedPayload = { ...payload, civic_outcome: civicOutcome };

  window.dispatchEvent(new CustomEvent(CIVIC_OUTCOME_EVENT, {
    detail: { eventName, outcome: civicOutcome },
  }));

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, normalizedPayload);
    return;
  }

  if (typeof window.plausible === "function") {
    window.plausible(eventName, { props: normalizedPayload });
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...normalizedPayload,
    });
  }
}
