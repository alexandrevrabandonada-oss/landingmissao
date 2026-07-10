import type { Metadata } from "next";
import { canonicalUrl } from "@/src/content/siteSeo";
import { ExploreEntry } from "./ExploreEntry";

export const metadata: Metadata = {
  title: "Distrito 01 — Entre a Fábrica e o Jardim",
  description:
    "Explore um território interativo entre a memória industrial de Volta Redonda e uma visão de futuro organizada pelo comum.",
  alternates: { canonical: canonicalUrl("/explorar") },
  openGraph: {
    title: "Distrito 01 — Entre a Fábrica e o Jardim",
    description: "Uma experiência interativa da Missão ÉLuta.",
    url: canonicalUrl("/explorar"),
  },
};

export default function ExplorePage() {
  return <ExploreEntry />;
}
