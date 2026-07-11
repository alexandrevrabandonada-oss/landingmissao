import {
  buildAppMissoesUrl,
  buildDonationUrl,
  buildVolunteerGroupUrl,
} from "@/src/content/siteLinks";

export const missionPhases = [
  { id: "conhecer", step: "01", label: "Conhecer", href: "#conhecer" },
  { id: "escolher", step: "02", label: "Escolher missão", href: "#escolher-missao" },
  { id: "entender", step: "03", label: "Ver como funciona", href: "#como-funciona" },
  { id: "agir", step: "04", label: "Agir e compartilhar", href: "#agir" },
] as const;

export type MissionPhaseId = (typeof missionPhases)[number]["id"];

export type MissionIcon = "phone" | "people" | "heart" | "send";

export interface MissionOption {
  id: "celular" | "rua" | "contribuir" | "compartilhar";
  title: string;
  description: string;
  nextStep: string;
  cta: string;
  href: string;
  external: boolean;
  icon: MissionIcon;
}
export interface MissionJourneyState {
  version: 1;
  selectedMissionId: MissionOption["id"] | null;
  visitedPhaseIds: MissionPhaseId[];
  updatedAt: string;
}

export function buildMissionOptions(ref?: string | null): MissionOption[] {
  return [
    {
      id: "celular",
      title: "Ajudar pelo celular",
      description: "Entre no app, conheça as missões e participe de onde estiver.",
      nextStep: "conhecer as missões disponíveis no App Missão ÉLuta.",
      cta: "Conhecer as missões no app",
      href: buildAppMissoesUrl(ref),
      external: true,
      icon: "phone",
    },
    {
      id: "rua",
      title: "Participar na rua",
      description: "Aproxime-se do grupo e encontre uma ação possível no território.",
      nextStep: "ver as formas de participar com o grupo de voluntários.",
      cta: "Entrar no grupo de voluntários",
      href: buildVolunteerGroupUrl(ref),
      external: true,
      icon: "people",
    },
    {
      id: "contribuir",
      title: "Contribuir",
      description: "Ajude a sustentar comunicação, materiais e mobilização de base.",
      nextStep: "conhecer a página segura de contribuição.",
      cta: "Contribuir com a mobilização",
      href: buildDonationUrl(ref),
      external: true,
      icon: "heart",
    },
    {
      id: "compartilhar",
      title: "Compartilhar",
      description: "Leve a proposta para sua rede e convide mais pessoas a conhecer.",
      nextStep: "escolher um canal e compartilhar a página.",
      cta: "Ir para as ações de compartilhamento",
      href: "/#agir",
      external: false,
      icon: "send",
    },
  ];
}
