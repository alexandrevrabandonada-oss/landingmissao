"use client";

import dynamic from "next/dynamic";

export const MissionShareCardLazy = dynamic(
  () => import("./MissionShareCard").then((module) => module.MissionShareCard),
  { ssr: false },
);
