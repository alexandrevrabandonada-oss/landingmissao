"use client";

import dynamic from "next/dynamic";
import { WorldBootShell } from "@/src/features/world/WorldBootShell";

const WorldExperience = dynamic(() => import("@/src/features/world/WorldExperience"), {
  ssr: false,
  loading: () => <WorldBootShell fullscreen />,
});

export function ExploreEntry() {
  return <WorldExperience />;
}
