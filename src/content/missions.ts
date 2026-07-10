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
