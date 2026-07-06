import { SITE_IDENTITY } from "./siteIdentity";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.alexandrevrabandonada.online"
).replace(/\/$/, "");

export const SEO_IMAGES = {
  preCampanha: "/og-pre-campanha.png",
  quemE: "/og-quem-e.png",
  preCampanhaVoltaRedonda: "/og-pre-campanha-volta-redonda.png",
  missaoEluta: "/og-missao-eluta.png",
  participar: "/og-participar.png",
  pautas: "/og-pautas.png",
  perguntasFrequentes: "/og-perguntas-frequentes.png",
  apoio: "/og-apoio.png",
  metodo: "/og-metodo.png",
  formacao: "/og-formacao.png",
  jogo: "/og-jogo.png",
  jogoRua: "/og-jogo-rua.png",
} as const;

export function canonicalUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function publicAssetUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export const defaultSeo = {
  siteName: SITE_IDENTITY.publicName,
  locale: "pt_BR",
  twitterCard: "summary_large_image",
} as const;
