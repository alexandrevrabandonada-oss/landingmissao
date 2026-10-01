import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/src/content/siteSeo";

const now = new Date();
const SITE = "https://www.alexandrevrabandonada.online";

type Snapshot = {
  schools?: Array<{ slug: string }>;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    {url: canonicalUrl("/jogar/cidade-em-disputa"), lastModified:now, changeFrequency:"weekly",priority:0.8},
    {
      url: canonicalUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: canonicalUrl("/climatizacao"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: canonicalUrl("/climatizacao/dados"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.72,
    },
    {
      url: canonicalUrl("/climatizacao/resolucao"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.74,
    },
    {
      url: canonicalUrl("/climatizacao/evidencias"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: canonicalUrl("/climatizacao/ledger"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.68,
    },
    {
      url: canonicalUrl("/apoio"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: canonicalUrl("/quem-e-alexandre-vr-abandonada"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.82,
    },
    {
      url: canonicalUrl("/pre-campanha-volta-redonda"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: canonicalUrl("/missao-eluta"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.76,
    },
    {
      url: canonicalUrl("/participar"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.74,
    },
    {
      url: canonicalUrl("/pautas"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.72,
    },
    {
      url: canonicalUrl("/perguntas-frequentes"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.68,
    },
    {
      url: canonicalUrl("/metodo"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: canonicalUrl("/formacao/campanhas-de-base"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: canonicalUrl("/explorar"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.64,
    },
  ];

  try {
    const response = await fetch(`${SITE}/api/climatizacao?action=snapshot`, {
      cache: "no-store",
    });
    if (!response.ok) return base;
    const snapshot: Snapshot = await response.json();
    const schoolEntries: MetadataRoute.Sitemap = (snapshot.schools ?? []).map((school) => ({
      url: canonicalUrl(`/climatizacao/escola/${school.slug}`),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.66,
    }));
    return [...base, ...schoolEntries];
  } catch {
    return base;
  }
}
