"use client";

import type { MissionIcon, MissionOption } from "@/src/content/missions";
import styles from "./mission-home.module.css";

interface MissionCardProps {
  mission: MissionOption;
  selected: boolean;
  onSelect: (missionId: MissionOption["id"]) => void;
}
export function MissionCard({ mission, selected, onSelect }: MissionCardProps) {
  return (
    <button
      type="button"
      className={`${styles.missionCard} ${selected ? styles.missionCardSelected : ""}`}
      onClick={() => onSelect(mission.id)}
      aria-pressed={selected}
    >
      <span className={styles.missionIcon} aria-hidden="true">
        <MissionGlyph icon={mission.icon} />
      </span>
      <span className={styles.missionCardCopy}>
        <strong>{mission.title}</strong>
        <small>{mission.description}</small>
      </span>
      <span className={styles.selectionMark} aria-hidden="true">
        {selected ? <CheckIcon /> : null}
      </span>
    </button>
  );
}

function MissionGlyph({ icon }: { icon: MissionIcon }) {
  if (icon === "phone") {
    return (
      <svg viewBox="0 0 24 24">
        <rect x="6.8" y="2.5" width="10.4" height="19" rx="2.2" />
        <path d="M10 5h4M11 18.5h2" />
      </svg>
    );
  }
  if (icon === "people") {
    return (
      <svg viewBox="0 0 24 24">
        <circle cx="9" cy="8" r="3.2" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3.5 20v-2.2A5.5 5.5 0 0 1 9 12.3a5.5 5.5 0 0 1 5.5 5.5V20M14.5 14.2a4.7 4.7 0 0 1 6 4.5V20" />
      </svg>
    );
  }
  if (icon === "heart") {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M20.2 5.6a4.6 4.6 0 0 0-6.5 0L12 7.3l-1.7-1.7a4.6 4.6 0 0 0-6.5 6.5L12 20.3l8.2-8.2a4.6 4.6 0 0 0 0-6.5Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24">
      <path d="m21 3-7.3 18-4.1-7.8L3 9.7 21 3Z" />
      <path d="m9.6 13.2 5.3-4.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20">
      <path d="m4 10.5 3.3 3.2L16 5.8" />
    </svg>
  );
}
