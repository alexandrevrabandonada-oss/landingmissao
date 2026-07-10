"use client";

import { useState } from "react";
import {
  buildLaunchWhatsAppUrl,
  buildWhatsAppShareMessage,
  copyToClipboardSafe,
} from "@/src/lib/shareLaunch";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import styles from "./mission-home.module.css";

interface ShareMissionActionsProps {
  sharePath: string;
  siteOrigin: string;
}
export function ShareMissionActions({ sharePath, siteOrigin }: ShareMissionActionsProps) {
  const [feedback, setFeedback] = useState(false);
  const absoluteUrl = new URL(sharePath, siteOrigin).toString();

  function openWhatsApp() {
    trackEventIfAvailable("mission_cta_clicked", {
      mission: "compartilhar",
      destination: "whatsapp",
      external: true,
    });
    const text = buildWhatsAppShareMessage(absoluteUrl);
    window.open(buildLaunchWhatsAppUrl({ text }), "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    const copied = await copyToClipboardSafe(absoluteUrl);
    if (!copied) {
      return;
    }
    trackEventIfAvailable("mission_cta_clicked", {
      mission: "compartilhar",
      destination: "clipboard",
      external: false,
    });
    setFeedback(true);
    window.setTimeout(() => setFeedback(false), 2400);
  }

  return (
    <div className={styles.shareActions} role="group" aria-label="Compartilhar a pré-campanha">
      <button type="button" className={styles.primaryButton} onClick={openWhatsApp}>
        <span>Compartilhar no WhatsApp</span>
        <SendIcon />
      </button>
      <button type="button" className={styles.secondaryButton} onClick={copyLink}>
        {feedback ? <CheckIcon /> : <LinkIcon />}
        <span aria-live="polite">{feedback ? "Link copiado" : "Copiar link"}</span>
      </button>
    </div>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 3-7.3 18-4.1-7.8L3 9.7 21 3Z" />
      <path d="m9.6 13.2 5.3-4.5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.8-1.7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m4 10.5 3.3 3.2L16 5.8" />
    </svg>
  );
}
