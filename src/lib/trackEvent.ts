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

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
    return;
  }

  if (typeof window.plausible === "function") {
    window.plausible(eventName, { props: payload });
    return;
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }
}
