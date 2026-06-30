import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/src/content/siteSeo";

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: canonicalUrl("/lancamento"),
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

