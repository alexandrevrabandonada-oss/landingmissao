const appBaseUrl = (
  process.env.NEXT_PUBLIC_ELUTA_APP_URL || "https://app.missaoeluta.org"
).replace(/\/$/, "");

export const defaultCampaign = "pre_campanha_alexandre_vr_abandonada";
const defaultSource = "landing";

interface TrackingOptions {
  ref?: string | null;
  utmMedium?: string;
  utmSource?: string;
  utmCampaign?: string;
}

function join(path: string) {
  return `${appBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function addTracking(
  baseUrl: string,
  {
    ref,
    utmMedium = "cta",
    utmSource = defaultSource,
    utmCampaign = defaultCampaign,
  }: TrackingOptions = {},
) {
  const parsedUrl = new URL(baseUrl);

  if (ref && ref.trim()) {
    parsedUrl.searchParams.set("ref", ref.trim());
  } else {
    parsedUrl.searchParams.delete("ref");
  }

  parsedUrl.searchParams.set("utm_source", utmSource);
  parsedUrl.searchParams.set("utm_medium", utmMedium);
  parsedUrl.searchParams.set("utm_campaign", utmCampaign);

  return parsedUrl.toString();
}

function buildAppUrl(path: string, options?: TrackingOptions) {
  return addTracking(join(path), options);
}

export const siteLinks = {
  appBaseUrl,
  appSignupUrl: join("/auth?mode=signup&next=/voluntario/hoje"),
  appFormacaoUrl: join("/auth?mode=signup&next=/formacao"),
  appMissoesUrl: join("/auth?mode=signup&next=/voluntario/missoes"),
  appDebatesUrl: join("/auth?mode=signup&next=/debates"),
  appConviteUrl: join("/auth?mode=signup&next=/voluntario/convite"),
} as const;

export function buildAppBaseUrl(ref?: string | null) {
  return addTracking(appBaseUrl, { ref });
}

export function buildAppSignupUrl(ref?: string | null) {
  return buildAppUrl("/auth?mode=signup&next=/voluntario/hoje", { ref });
}

export function buildAppFormacaoUrl(ref?: string | null) {
  return buildAppUrl("/auth?mode=signup&next=/formacao", { ref });
}

export function buildAppMissoesUrl(ref?: string | null) {
  return buildAppUrl("/auth?mode=signup&next=/voluntario/missoes", { ref });
}

export function buildAppDebatesUrl(ref?: string | null) {
  return buildAppUrl("/auth?mode=signup&next=/debates", { ref });
}

export function buildAppConviteUrl(ref?: string | null) {
  return buildAppUrl("/auth?mode=signup&next=/voluntario/convite", { ref });
}

export function buildGameAppBaseUrl(ref?: string | null) {
  return addTracking(appBaseUrl, {
    ref,
    utmSource: "game",
    utmMedium: "finish",
  });
}

export function buildGameAppSignupUrl(ref?: string | null) {
  return buildAppUrl("/auth?mode=signup&next=/voluntario/hoje", {
    ref,
    utmSource: "game",
    utmMedium: "finish",
  });
}

export function buildGameAppMissoesUrl(ref?: string | null) {
  return buildAppUrl("/auth?mode=signup&next=/voluntario/missoes", {
    ref,
    utmSource: "game",
    utmMedium: "mission",
  });
}

export type SiteLinks = typeof siteLinks;
