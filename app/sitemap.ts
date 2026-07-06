import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/src/content/siteSeo";

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: canonicalUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
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
  ];
}
