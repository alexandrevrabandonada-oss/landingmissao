import { buildAppSignupUrl, defaultCampaign } from "@/src/content/siteLinks";

interface BuildSignupUrlParams {
  ref?: string | null;
}

export function buildWhatsAppShareMessage(link: string) {
  return [
    "Conheça a pré-campanha Alexandre VR Abandonada e o app Missão ÉLuta.",
    "A ideia é transformar escuta em organização popular.",
    "Escutar • Cuidar • Organizar.",
    `Vem conhecer: ${link}`,
  ].join("\n\n");
}

interface BuildTrackedPathParams {
  basePath: string;
  ref?: string | null;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export function buildTrackedPath({
  basePath,
  ref,
  utmSource,
  utmMedium,
  utmCampaign = defaultCampaign,
}: BuildTrackedPathParams) {
  const parsedUrl = new URL(basePath, "https://landing.local");

  if (ref && ref.trim()) {
    parsedUrl.searchParams.set("ref", ref.trim());
  } else {
    parsedUrl.searchParams.delete("ref");
  }

  if (utmSource) {
    parsedUrl.searchParams.set("utm_source", utmSource);
  }

  if (utmMedium) {
    parsedUrl.searchParams.set("utm_medium", utmMedium);
  }

  if (utmSource || utmMedium) {
    parsedUrl.searchParams.set("utm_campaign", utmCampaign);
  }

  return toOutputUrl(basePath, parsedUrl);
}

export function buildGamePath(ref?: string | null, utmSource = "landing", utmMedium = "game_play") {
  return buildTrackedPath({
    basePath: "/jogo",
    ref,
    utmSource,
    utmMedium,
  });
}

interface BuildGameShareMessageParams {
  link: string;
  title?: string;
  relatos?: number;
  obstaculos?: number;
  easterEggs?: number;
}

export function buildGameShareMessage({
  link,
  title,
  relatos,
  obstaculos,
  easterEggs,
}: BuildGameShareMessageParams) {
  const metricLine =
    typeof relatos === "number" || typeof obstaculos === "number" || typeof easterEggs === "number"
      ? [
          typeof relatos === "number" ? `${relatos} relatos` : null,
          typeof obstaculos === "number" ? `${obstaculos} obstáculos desviados` : null,
          typeof easterEggs === "number" ? `${easterEggs} easter eggs` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";

  return [
    title ? `${title}.` : "Eu joguei a Missão Relâmpago.",
    "Joguei a missão relâmpago da pré-campanha Alexandre VR Abandonada no app Missão ÉLuta.",
    "Reuni relatos, desviei da burocracia e ajudei a organizar uma cidade melhor.",
    metricLine,
    "Escutar • Cuidar • Organizar.",
    `Vem jogar: ${link}`,
  ].filter(Boolean).join("\n\n");
}

function hasAbsoluteProtocol(url: string) {
  return /^https?:\/\//i.test(url);
}

function toOutputUrl(baseUrl: string, parsedUrl: URL) {
  if (hasAbsoluteProtocol(baseUrl)) {
    return parsedUrl.toString();
  }

  return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
}

export function buildLaunchUrl(baseUrl: string, ref?: string | null) {
  return buildTrackedPath({ basePath: baseUrl, ref });
}

export function buildLaunchWhatsAppUrl({ text }: { text: string }) {
  const payload = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?text=${payload}`;
}

export function buildFacebookShareUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function getInstagramShareUrl() {
  return "https://www.instagram.com/";
}

export function getTikTokShareUrl() {
  return "https://www.tiktok.com/";
}

export function buildSignupUrl({ ref }: BuildSignupUrlParams) {
  return buildAppSignupUrl(ref);
}

export async function copyToClipboardSafe(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
