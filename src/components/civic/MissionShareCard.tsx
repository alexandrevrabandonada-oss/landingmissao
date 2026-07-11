"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MissionOption } from "@/src/content/missions";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import { SITE_URL } from "@/src/content/siteSeo";
import type { StateAgenda } from "@/src/content/stateAgendas";
import {
  buildLaunchWhatsAppUrl,
  buildTrackedPath,
} from "@/src/lib/shareLaunch";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import styles from "./mission-share-card.module.css";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

const CARD_COPY: Record<MissionOption["id"], { headline: string; accent: string; code: string }> = {
  celular: {
    headline: "ORGANIZAR\nPELO CELULAR",
    accent: "#65b9cf",
    code: "REDE",
  },
  rua: {
    headline: "OCUPAR A RUA\nCOM ORGANIZAÇÃO",
    accent: "#e66f4d",
    code: "TERRITÓRIO",
  },
  contribuir: {
    headline: "SUSTENTAR\nA MOBILIZAÇÃO",
    accent: "#9bd276",
    code: "COMUM",
  },
  compartilhar: {
    headline: "AMPLIAR\nESTA CONVERSA",
    accent: "#ffd100",
    code: "VOZ",
  },
};

export function MissionShareCard({
  mission,
  agenda,
  signalCount,
  onClose,
}: {
  mission: MissionOption;
  agenda?: StateAgenda | null;
  signalCount: number;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("A imagem é criada somente no seu navegador.");
  const safeSignalCount = Math.min(7, Math.max(1, signalCount));
  const sharePath = buildTrackedPath({
    basePath: "/",
    utmSource: "mission_card",
    utmMedium: "share",
    utmContent: agenda ? `${mission.id}_${agenda.id}` : mission.id,
  });
  const shareUrl = new URL(sharePath, SITE_URL).toString();
  const shareText = [
    `Minha missão pelo estado do Rio de Janeiro é ${mission.title.toLowerCase()}.`,
    agenda ? `Quero fortalecer a pauta: ${agenda.title.toLowerCase()}.` : null,
    "Escolha também uma forma possível de participar.",
    SITE_IDENTITY.signature,
    shareUrl,
  ].filter(Boolean).join("\n\n");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) renderMissionCard(canvas, mission, safeSignalCount, agenda);
  }, [agenda, mission, safeSignalCount]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const backgroundSurfaces = Array.from(
      document.querySelectorAll<HTMLElement>('main, [aria-label="Caderno de jornada política"]'),
    );
    const previousSurfaceState = backgroundSurfaces.map((surface) => ({
      surface,
      inert: surface.inert,
      ariaHidden: surface.getAttribute("aria-hidden"),
    }));
    document.body.style.overflow = "hidden";
    backgroundSurfaces.forEach((surface) => {
      surface.inert = true;
      surface.setAttribute("aria-hidden", "true");
    });
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      previousSurfaceState.forEach(({ surface, inert, ariaHidden }) => {
        surface.inert = inert;
        if (ariaHidden === null) surface.removeAttribute("aria-hidden");
        else surface.setAttribute("aria-hidden", ariaHidden);
      });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function getCardFile() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    return blob ? new File([blob], `minha-missao-${mission.id}.png`, { type: "image/png" }) : null;
  }

  async function saveImage() {
    const file = await getCardFile();
    if (!file) {
      setStatus("Não foi possível gerar a imagem neste navegador.");
      return;
    }
    downloadFile(file);
    setStatus("Imagem salva. Agora você pode publicar no WhatsApp, Instagram ou outra rede.");
    trackEventIfAvailable("mission_card_saved", { mission: mission.id });
  }

  async function shareImage() {
    const file = await getCardFile();
    if (!file) {
      setStatus("Não foi possível gerar a imagem neste navegador.");
      return;
    }

    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Minha missão: ${mission.title}`,
          text: shareText,
        });
        setStatus("Cartão compartilhado.");
        trackEventIfAvailable("mission_card_shared", { mission: mission.id, method: "native_file" });
        return;
      }

      downloadFile(file);
      setStatus("A imagem foi salva. Use WhatsApp ou sua rede preferida para publicar.");
      trackEventIfAvailable("mission_card_share_fallback", { mission: mission.id });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("Compartilhamento cancelado. Seu cartão continua pronto.");
        return;
      }
      setStatus("Não foi possível abrir o compartilhamento. Você ainda pode salvar a imagem.");
    }
  }

  function openWhatsApp() {
    window.open(buildLaunchWhatsAppUrl({ text: shareText }), "_blank", "noopener,noreferrer");
    setStatus("WhatsApp aberto com seu convite e o link da jornada.");
    trackEventIfAvailable("mission_card_shared", { mission: mission.id, method: "whatsapp_text" });
  }

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-card-title"
        aria-describedby="mission-card-description"
      >
        <div className={styles.heading}>
          <div>
            <p>Resultado da jornada</p>
            <h2 id="mission-card-title">Seu cartão de missão</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Fechar cartão de missão">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.preview}>
            <canvas
              ref={canvasRef}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              role="img"
              aria-label={`Cartão: minha missão pelo estado do Rio de Janeiro é ${mission.title}${agenda ? `, com a pauta ${agenda.title}` : ""}`}
            />
          </div>

          <div className={styles.actions}>
            <div className={styles.actionCopy}>
              <strong>{mission.title}</strong>
              <p id="mission-card-description">
                Um compromisso visual para compartilhar sem informar nome, foto ou localização.
              </p>
            </div>
            <button type="button" className={styles.primaryAction} onClick={shareImage}>
              Compartilhar imagem <ShareIcon />
            </button>
            <button type="button" className={styles.secondaryAction} onClick={openWhatsApp}>
              Enviar convite no WhatsApp <ArrowIcon />
            </button>
            <button type="button" className={styles.saveAction} onClick={saveImage}>
              Salvar imagem
            </button>
            <p className={styles.status} role="status" aria-live="polite">{status}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function renderMissionCard(
  canvas: HTMLCanvasElement,
  mission: MissionOption,
  signalCount: number,
  agenda?: StateAgenda | null,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const copy = CARD_COPY[mission.id];
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  context.fillStyle = "#090a0c";
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const atmosphere = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  atmosphere.addColorStop(0, "rgba(230,111,77,0.24)");
  atmosphere.addColorStop(0.48, "rgba(255,209,0,0.04)");
  atmosphere.addColorStop(1, "rgba(100,170,111,0.24)");
  context.fillStyle = atmosphere;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  context.strokeStyle = "rgba(245,243,237,0.055)";
  context.lineWidth = 2;
  for (let x = 54; x < CARD_WIDTH; x += 54) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, CARD_HEIGHT);
    context.stroke();
  }
  for (let y = 54; y < CARD_HEIGHT; y += 54) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(CARD_WIDTH, y);
    context.stroke();
  }

  context.fillStyle = copy.accent;
  context.fillRect(0, 0, 20, CARD_HEIGHT);
  context.fillRect(58, 58, 420, 12);
  context.fillStyle = "rgba(245,243,237,0.72)";
  context.fillRect(58, 84, 188, 5);

  context.fillStyle = "#f5f3ed";
  setCanvasFont(context, 900, 34);
  context.fillText("MINHA MISSÃO PELO RIO DE JANEIRO", 62, 150);
  context.fillStyle = copy.accent;
  setCanvasFont(context, 900, 26);
  context.fillText(`${copy.code} · COMPROMISSO ${String(signalCount).padStart(2, "0")}/07`, 62, 198);

  context.save();
  context.translate(878, 140);
  context.rotate(Math.PI / 4);
  context.fillStyle = copy.accent;
  context.fillRect(-62, -62, 124, 124);
  context.fillStyle = "#090a0c";
  context.fillRect(-35, -35, 70, 70);
  context.restore();

  context.fillStyle = "rgba(245,243,237,0.12)";
  context.fillRect(62, 270, 956, 2);

  context.fillStyle = "#f5f3ed";
  setCanvasFont(context, 900, 112, "Arial Black, Arial");
  let headlineY = 430;
  for (const line of copy.headline.split("\n")) {
    context.fillText(line, 62, headlineY, 930);
    headlineY += 122;
  }

  context.fillStyle = copy.accent;
  context.fillRect(62, headlineY + 8, 260, 14);
  context.fillStyle = "rgba(245,243,237,0.68)";
  setCanvasFont(context, 700, 37, "Arial");
  wrapCanvasText(context, mission.description, 62, headlineY + 92, 860, 52, 3);

  if (agenda) {
    context.fillStyle = "rgba(7,8,10,0.78)";
    context.fillRect(62, 842, 900, 74);
    context.fillStyle = agenda.accent;
    context.fillRect(62, 842, 12, 74);
    context.fillStyle = "rgba(245,243,237,0.58)";
    setCanvasFont(context, 900, 21);
    context.fillText("PAUTA ESTADUAL EM ESCUTA", 94, 872);
    context.fillStyle = "#f5f3ed";
    setCanvasFont(context, 900, 27, "Arial Black, Arial");
    context.fillText(agenda.cardLabel, 94, 902, 840);
  }

  const railY = 970;
  context.strokeStyle = "rgba(245,243,237,0.18)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(92, railY);
  context.lineTo(944, railY);
  context.stroke();
  for (let index = 0; index < 7; index += 1) {
    const x = 92 + (852 / 6) * index;
    context.save();
    context.translate(x, railY);
    context.rotate(Math.PI / 4);
    context.fillStyle = index < signalCount ? copy.accent : "#202126";
    context.strokeStyle = index < signalCount ? copy.accent : "rgba(245,243,237,0.24)";
    context.lineWidth = 3;
    context.fillRect(-13, -13, 26, 26);
    context.strokeRect(-13, -13, 26, 26);
    context.restore();
  }
  context.fillStyle = "rgba(245,243,237,0.56)";
  setCanvasFont(context, 800, 24);
  context.fillText(`${signalCount} DE 7 SINAIS DA JORNADA`, 62, 1029);

  context.fillStyle = "rgba(7,8,10,0.9)";
  context.fillRect(0, 1080, CARD_WIDTH, 270);
  context.fillStyle = copy.accent;
  context.fillRect(62, 1116, 612, 10);
  context.fillStyle = "#f5f3ed";
  setCanvasFont(context, 900, 50, "Arial Black, Arial");
  context.fillText("ALEXANDRE VR ABANDONADA", 62, 1195, 940);
  context.fillStyle = copy.accent;
  setCanvasFont(context, 900, 29);
  context.fillText("PRÉ-CAMPANHA · MISSÃO ÉLUTA", 62, 1245);
  context.fillStyle = "rgba(245,243,237,0.66)";
  setCanvasFont(context, 700, 24);
  context.fillText(SITE_IDENTITY.signature.toUpperCase(), 62, 1295);

  context.strokeStyle = "rgba(245,243,237,0.42)";
  context.lineWidth = 3;
  context.strokeRect(38, 38, CARD_WIDTH - 76, CARD_HEIGHT - 76);
  context.strokeStyle = copy.accent;
  context.lineWidth = 7;
  context.strokeRect(24, 24, CARD_WIDTH - 48, CARD_HEIGHT - 48);
}

function setCanvasFont(
  context: CanvasRenderingContext2D,
  weight: number,
  size: number,
  family = "Arial",
) {
  context.font = `${weight} ${size}px ${family}`;
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  lines.forEach((value, index) => context.fillText(value, x, y + index * lineHeight, maxWidth));
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>;
}

function ShareIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
