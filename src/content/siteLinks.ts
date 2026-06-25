const appBaseUrl = (
  process.env.NEXT_PUBLIC_ELUTA_APP_URL || "https://missaoeluta.online"
).replace(/\/$/, "");
const appAuthUrl = (
  process.env.NEXT_PUBLIC_ELUTA_AUTH_URL || "https://missaoeluta.online/auth"
).replace(/\/$/, "");
const gamesBaseUrl = (
  process.env.NEXT_PUBLIC_ABANDONADA_GAMES_URL || "https://abandonadagames.online"
).replace(/\/$/, "");
const donationBaseUrl = (
  process.env.NEXT_PUBLIC_DONATION_URL || "https://queroapoiar.com.br/alexandrefonseca"
).replace(/\/$/, "");
const volunteerGroupUrl = (
  process.env.NEXT_PUBLIC_VOLUNTEER_GROUP_URL ||
  "https://chat.whatsapp.com/Bg2hJf84ih47kXgPcMVOGW"
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
  appAuthUrl,
  gamesBaseUrl,
  donationBaseUrl,
  volunteerGroupUrl,
  appSignupUrl: join("/auth?mode=signup&next=/voluntario/hoje"),
  appFormacaoUrl: join("/auth?mode=signup&next=/formacao"),
  appMissoesUrl: join("/auth?mode=signup&next=/voluntario/missoes"),
  appDebatesUrl: join("/auth?mode=signup&next=/debates"),
  appConviteUrl: join("/auth?mode=signup&next=/voluntario/convite"),
} as const;

export function buildDonationUrl(ref?: string | null) {
  return addTracking(donationBaseUrl, {
    ref,
    utmMedium: "donation_cta",
  });
}

export function buildVolunteerGroupUrl(ref?: string | null) {
  return addTracking(volunteerGroupUrl, {
    ref,
    utmMedium: "volunteer_group",
  });
}

export function buildAppBaseUrl(ref?: string | null) {
  return addTracking(appAuthUrl, { ref });
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
  return addTracking(appAuthUrl, {
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

export function buildGamesHubUrl(ref?: string | null) {
  return addTracking(gamesBaseUrl, {
    ref,
    utmMedium: "external_hub",
  });
}

export type SiteLinks = typeof siteLinks;
