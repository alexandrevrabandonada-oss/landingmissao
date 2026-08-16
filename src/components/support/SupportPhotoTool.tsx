"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";

const CANVAS_SIZE = 1080;

type ToolState = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type FrameVariant = "cartaz" | "forte" | "limpo" | "circular";
type SupportMessage = "voto" | "dupla" | "alexandre";

const CIRCLE_CENTER = CANVAS_SIZE / 2;
const CIRCLE_OUTER_RADIUS = 520;
const CIRCLE_INNER_RADIUS = 342;
const POSTER_PHOTO = { x: 72, y: 278, width: 936, height: 470 } as const;
const CAMPAIGN_COLORS = {
  charcoal: "#101214",
  paper: "#F2EFE5",
  teal: "#0E6473",
  yellow: "#F2C230",
  red: "#D64330",
} as const;

function setFont(
  context: CanvasRenderingContext2D,
  weight: number,
  size: number,
  family = "Arial",
) {
  context.font = `${weight} ${size}px ${family}`;
}

function drawStencilText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  color: string,
) {
  setFont(context, 800, size);
  context.lineWidth = 12;
  context.strokeStyle = "rgba(11, 11, 14, 0.88)";
  context.strokeText(text, x, y, maxWidth);
  context.fillStyle = color;
  context.fillText(text, x, y, maxWidth);
}

function drawGrain(context: CanvasRenderingContext2D, opacity = 0.06) {
  context.save();
  context.globalAlpha = opacity;
  for (let y = 0; y < CANVAS_SIZE; y += 9) {
    for (let x = 0; x < CANVAS_SIZE; x += 9) {
      const tone = (x * 17 + y * 31) % 255;
      context.fillStyle = tone > 128 ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
      context.fillRect(x, y, 1, 1);
    }
  }
  context.restore();
}

function drawCornerMark(context: CanvasRenderingContext2D, x: number, y: number, flip = false) {
  context.save();
  context.translate(x, y);
  if (flip) context.scale(-1, 1);
  context.fillStyle = "#ffd100";
  context.fillRect(0, 0, 96, 8);
  context.fillRect(0, 0, 8, 96);
  context.fillStyle = "rgba(226, 219, 199, 0.7)";
  context.fillRect(18, 18, 52, 5);
  context.fillRect(18, 18, 5, 52);
  context.restore();
}

function drawAngledBlock(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  slant = 26,
) {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x + slant, y);
  context.lineTo(x + width, y);
  context.lineTo(x + width - slant, y + height);
  context.lineTo(x, y + height);
  context.closePath();
  context.fill();
  context.restore();
}

function drawProfilePlaceholder(context: CanvasRenderingContext2D, variant: FrameVariant) {
  const centerX = variant === "circular" ? CIRCLE_CENTER : 560;
  const centerY = variant === "circular" ? CIRCLE_CENTER : 420;
  const radius = variant === "circular" ? 248 : 162;

  context.save();
  context.strokeStyle = "rgba(255, 209, 0, 0.32)";
  context.lineWidth = 4;
  context.setLineDash([18, 14]);
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = "rgba(255, 209, 0, 0.075)";
  context.beginPath();
  context.arc(centerX, centerY, radius - 5, 0, Math.PI * 2);
  context.fill();

  context.textAlign = "center";
  context.fillStyle = "#ffd100";
  setFont(context, 900, variant === "circular" ? 44 : 42, "Arial Black, Arial");
  context.fillText("ENVIE SUA FOTO", centerX, centerY + 8);
  context.fillStyle = "rgba(242,242,242,0.72)";
  setFont(context, 700, variant === "circular" ? 24 : 23);
  context.fillText(
    variant === "circular" ? "centralize o rosto no círculo" : "rosto dentro da área guia",
    centerX,
    centerY + 52,
  );
  context.restore();
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  { zoom, offsetX, offsetY }: ToolState,
) {
  const baseScale = Math.max(CANVAS_SIZE / image.naturalWidth, CANVAS_SIZE / image.naturalHeight);
  const scale = baseScale * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = (CANVAS_SIZE - width) / 2 + offsetX;
  const y = (CANVAS_SIZE - height) / 2 + offsetY;

  context.drawImage(image, x, y, width, height);
}

function drawCoverImageInRect(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  { zoom, offsetX, offsetY }: ToolState,
  rect: { x: number; y: number; width: number; height: number },
) {
  const baseScale = Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
  const scale = baseScale * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = rect.x + (rect.width - width) / 2 + offsetX;
  const y = rect.y + (rect.height - height) / 2 + offsetY;

  context.save();
  context.beginPath();
  context.roundRect(rect.x, rect.y, rect.width, rect.height, 4);
  context.clip();
  context.drawImage(image, x, y, width, height);
  context.restore();
}

function drawDiagonalStripe(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  slant = 56,
) {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(x + slant, y);
  context.lineTo(x + width, y);
  context.lineTo(x + width - slant, y + height);
  context.lineTo(x, y + height);
  context.closePath();
  context.fill();
  context.restore();
}

function drawPosterUploadPlaceholder(context: CanvasRenderingContext2D) {
  const centerX = POSTER_PHOTO.x + POSTER_PHOTO.width / 2;
  const centerY = POSTER_PHOTO.y + POSTER_PHOTO.height / 2;

  context.save();
  context.fillStyle = CAMPAIGN_COLORS.paper;
  context.fillRect(POSTER_PHOTO.x, POSTER_PHOTO.y, POSTER_PHOTO.width, POSTER_PHOTO.height);
  context.strokeStyle = CAMPAIGN_COLORS.teal;
  context.lineWidth = 13;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(centerX, centerY - 112);
  context.lineTo(centerX, centerY - 42);
  context.moveTo(centerX - 34, centerY - 80);
  context.lineTo(centerX, centerY - 114);
  context.lineTo(centerX + 34, centerY - 80);
  context.moveTo(centerX - 58, centerY - 30);
  context.lineTo(centerX - 58, centerY + 10);
  context.quadraticCurveTo(centerX - 58, centerY + 30, centerX - 38, centerY + 30);
  context.lineTo(centerX + 38, centerY + 30);
  context.quadraticCurveTo(centerX + 58, centerY + 30, centerX + 58, centerY + 10);
  context.lineTo(centerX + 58, centerY - 30);
  context.stroke();

  context.textAlign = "center";
  context.fillStyle = CAMPAIGN_COLORS.charcoal;
  setFont(context, 900, 39, "Arial Black, Arial");
  context.fillText("CLIQUE AQUI E ENVIE SUA FOTO", centerX, centerY + 96);
  setFont(context, 700, 23);
  context.fillStyle = "rgba(16, 18, 20, 0.58)";
  context.fillText("PNG, JPG OU JPEG  |  MÁX. 5 MB", centerX, centerY + 137);
  context.restore();
}

function drawCampaignPosterFrame(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  state: ToolState,
) {
  context.save();
  context.fillStyle = CAMPAIGN_COLORS.charcoal;
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Editorial rails: the blue anchors the campaign, while yellow acts only as alert.
  context.fillStyle = CAMPAIGN_COLORS.yellow;
  context.fillRect(0, 0, CANVAS_SIZE, 12);
  context.fillStyle = CAMPAIGN_COLORS.teal;
  context.fillRect(0, 12, 22, 1056);
  context.fillStyle = CAMPAIGN_COLORS.paper;
  context.fillRect(22, 12, 5, 1056);

  context.textAlign = "left";
  context.fillStyle = CAMPAIGN_COLORS.yellow;
  setFont(context, 800, 18, "Inter, Arial");
  context.fillText("ARQUIVO VIVO  •  PARTICIPAÇÃO POPULAR", 72, 50);
  context.fillStyle = CAMPAIGN_COLORS.paper;
  setFont(context, 900, 72, "Inter, Arial Black, Arial");
  context.fillText("FAÇA PARTE", 72, 132, 710);
  context.fillText("DESSA LUTA", 72, 216, 710);
  context.textAlign = "right";
  context.fillStyle = "rgba(242, 239, 229, 0.76)";
  setFont(context, 800, 25, "Inter, Arial");
  context.fillText("DEPUTADO", 1008, 132);
  context.fillText("ESTADUAL", 1008, 165);
  context.fillStyle = CAMPAIGN_COLORS.teal;
  context.fillRect(866, 90, 142, 8);

  // A thin paper mount keeps the real photo direct and avoids a plastic treatment.
  context.fillStyle = CAMPAIGN_COLORS.paper;
  context.fillRect(56, 262, 968, 502);

  if (image) {
    drawCoverImageInRect(context, image, state, POSTER_PHOTO);
  } else {
    drawPosterUploadPlaceholder(context);
  }

  context.fillStyle = CAMPAIGN_COLORS.teal;
  context.fillRect(27, 780, 1053, 300);
  context.fillStyle = CAMPAIGN_COLORS.charcoal;
  context.fillRect(56, 780, 615, 300);
  context.fillStyle = CAMPAIGN_COLORS.yellow;
  context.fillRect(56, 780, 615, 10);

  context.fillStyle = CAMPAIGN_COLORS.red;
  context.fillRect(82, 816, 154, 42);
  context.fillStyle = CAMPAIGN_COLORS.paper;
  setFont(context, 900, 24, "Inter, Arial Black, Arial");
  context.textAlign = "center";
  context.fillText("EU VOTO", 159, 845, 132);

  context.textAlign = "left";
  context.fillStyle = CAMPAIGN_COLORS.paper;
  setFont(context, 900, 79, "Inter, Arial Black, Arial");
  context.fillText("ALEXANDRE", 82, 939, 552);

  context.fillStyle = CAMPAIGN_COLORS.teal;
  context.fillRect(82, 987, 60, 7);
  context.fillRect(574, 987, 60, 7);
  context.fillStyle = CAMPAIGN_COLORS.paper;
  setFont(context, 900, 32, "Inter, Arial Black, Arial");
  context.textAlign = "center";
  context.fillText("VR ABANDONADA", 358, 1002, 404);

  context.fillStyle = CAMPAIGN_COLORS.yellow;
  setFont(context, 900, 134, "Inter, Arial Black, Arial");
  context.textAlign = "left";
  context.fillText("50800", 691, 934, 350);
  context.fillStyle = CAMPAIGN_COLORS.paper;
  setFont(context, 800, 21, "Inter, Arial");
  context.fillText("DEPUTADO ESTADUAL", 697, 979, 322);
  context.fillStyle = CAMPAIGN_COLORS.red;
  context.fillRect(697, 1004, 84, 8);
  context.fillStyle = "rgba(242, 239, 229, 0.72)";
  setFont(context, 700, 17, "Inter, Arial");
  context.fillText("NOSSA VOZ  •  NOSSO FUTURO", 697, 1045, 324);

  drawGrain(context, 0.028);
  context.restore();
}

function drawCircularImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  { zoom, offsetX, offsetY }: ToolState,
) {
  context.save();
  context.beginPath();
  context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_INNER_RADIUS, 0, Math.PI * 2);
  context.clip();

  const diameter = CIRCLE_INNER_RADIUS * 2;
  const baseScale = Math.max(diameter / image.naturalWidth, diameter / image.naturalHeight);
  const scale = baseScale * zoom;
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  const x = CIRCLE_CENTER - width / 2 + offsetX;
  const y = CIRCLE_CENTER - height / 2 + offsetY;

  context.drawImage(image, x, y, width, height);
  context.restore();
}

function drawArcText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  size: number,
  reverse = false,
) {
  const chars = text.split("");
  const angleStep = (endAngle - startAngle) / Math.max(chars.length - 1, 1);

  context.save();
  context.fillStyle = color;
  context.textAlign = "center";
  context.textBaseline = "middle";
  setFont(context, 900, size);

  chars.forEach((char, index) => {
    const angle = reverse ? endAngle - angleStep * index : startAngle + angleStep * index;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    context.save();
    context.translate(x, y);
    context.rotate(angle + Math.PI / 2 + (reverse ? Math.PI : 0));
    context.lineWidth = 7;
    context.strokeStyle = "rgba(11, 11, 14, 0.9)";
    context.strokeText(char, 0, 0);
    context.fillText(char, 0, 0);
    context.restore();
  });

  context.restore();
}

function drawStrongFrame(context: CanvasRenderingContext2D, message: SupportMessage) {
  const bottomY = 794;
  const isVote = message === "voto";
  const isAlexandreOnly = message !== "dupla";
  const alexandrePanelY = 722;

  const shade = context.createLinearGradient(0, 0, 0, CANVAS_SIZE);
  shade.addColorStop(0, "rgba(11,11,14,0.08)");
  shade.addColorStop(0.52, "rgba(0,0,0,0)");
  shade.addColorStop(0.75, "rgba(0,0,0,0.18)");
  shade.addColorStop(1, "rgba(0,0,0,0.86)");
  context.fillStyle = shade;
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  context.fillStyle = isAlexandreOnly ? "rgba(11, 11, 14, 0.24)" : "rgba(11, 11, 14, 0.42)";
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawGrain(context, 0.045);

  context.fillStyle = isAlexandreOnly ? "rgba(7, 7, 8, 0.82)" : "rgba(7, 7, 8, 0.64)";
  context.fillRect(56, 56, isAlexandreOnly ? 360 : 316, 106);
  context.fillStyle = "#f3f0e8";
  context.fillRect(56, 56, 9, 106);
  context.fillStyle = "#ffd100";
  context.fillRect(76, 56, 9, 106);

  context.textAlign = "left";
  drawStencilText(
    context,
    isVote ? "EU VOTO" : "EU APOIO",
    112,
    122,
    isAlexandreOnly ? 248 : 218,
    isAlexandreOnly ? 40 : 34,
    "#ffffff",
  );

  if (isAlexandreOnly) {
    const sideWash = context.createLinearGradient(0, 0, 260, 0);
    sideWash.addColorStop(0, "rgba(255, 209, 0, 0.34)");
    sideWash.addColorStop(0.38, "rgba(255, 209, 0, 0.08)");
    sideWash.addColorStop(1, "rgba(255, 209, 0, 0)");
    context.fillStyle = sideWash;
    context.fillRect(0, 0, 300, CANVAS_SIZE);
    context.fillStyle = "rgba(255, 209, 0, 0.98)";
    context.fillRect(0, 0, 18, CANVAS_SIZE);
    context.fillStyle = "rgba(243, 240, 232, 0.88)";
    context.fillRect(34, 0, 6, CANVAS_SIZE);
    context.fillStyle = "rgba(255, 209, 0, 0.14)";
    context.fillRect(0, 676, CANVAS_SIZE, 48);
    context.fillStyle = "rgba(192, 57, 43, 0.86)";
    context.fillRect(0, 704, 460, 10);
  }

  context.fillStyle = isAlexandreOnly ? "rgba(7, 7, 8, 0.95)" : "rgba(7, 7, 8, 0.92)";
  context.fillRect(0, isAlexandreOnly ? alexandrePanelY : bottomY, CANVAS_SIZE, CANVAS_SIZE);
  context.fillStyle = "rgba(226, 219, 199, 0.1)";
  context.fillRect(56, (isAlexandreOnly ? alexandrePanelY : bottomY) + 24, CANVAS_SIZE - 112, 1);
  context.fillStyle = "#ffd100";
  context.fillRect(56, isAlexandreOnly ? alexandrePanelY : bottomY, isAlexandreOnly ? 780 : 474, 16);
  context.fillStyle = "rgba(174, 55, 38, 0.9)";
  context.fillRect(56, (isAlexandreOnly ? alexandrePanelY : bottomY) + 30, isAlexandreOnly ? 330 : 192, 8);
  context.fillStyle = "rgba(255, 209, 0, 0.11)";
  context.fillRect(56, (isAlexandreOnly ? alexandrePanelY : bottomY) + 58, CANVAS_SIZE - 112, isAlexandreOnly ? 150 : 86);

  context.fillStyle = "#ffd100";
  setFont(context, 900, isAlexandreOnly ? 108 : 70, "Arial Black, Arial");
  context.fillText(isAlexandreOnly ? "ALEXANDRE" : "GLAUBER BRAGA", 74, isAlexandreOnly ? 840 : 886, 960);

  context.fillStyle = "#f3f0e8";
  setFont(context, 900, isAlexandreOnly ? 84 : 50, "Arial Black, Arial");
  context.fillText(isAlexandreOnly ? "VR ABANDONADA" : "ALEXANDRE VR ABANDONADA", 74, isAlexandreOnly ? 928 : 954, 960);

  if (isAlexandreOnly) {
    drawAngledBlock(context, 74, 958, 610, 46, "rgba(255, 209, 0, 0.94)", 20);
    context.fillStyle = "#0b0b0e";
    setFont(context, 900, 27, "Arial Black, Arial");
    context.fillText("PRÉ-CANDIDATO A DEPUTADO ESTADUAL", 102, 991, 550);
    context.fillStyle = "rgba(243, 240, 232, 0.82)";
    setFont(context, 800, 25);
    context.fillText(isVote ? "50800" : SITE_IDENTITY.signature, 76, 1046);
    if (isVote) {
      context.fillStyle = "#c0392b";
      setFont(context, 900, 92, "Arial Black, Arial");
      context.textAlign = "right";
      context.fillText("50800", 1010, 1048, 310);
      context.textAlign = "left";
    }
  } else {
    context.fillStyle = "rgba(243, 240, 232, 0.82)";
    setFont(context, 700, 28);
    context.fillText(`${SITE_IDENTITY.contextLabel} • ${SITE_IDENTITY.signature}`, 80, 1012);
  }

  drawCornerMark(context, 34, 34);
  drawCornerMark(context, CANVAS_SIZE - 34, 34, true);

  context.strokeStyle = "rgba(226, 219, 199, 0.46)";
  context.lineWidth = 2;
  context.strokeRect(54, 54, CANVAS_SIZE - 108, CANVAS_SIZE - 108);
  context.strokeStyle = "rgba(255, 209, 0, 0.7)";
  context.lineWidth = 6;
  context.strokeRect(28, 28, CANVAS_SIZE - 56, CANVAS_SIZE - 56);
}

function renderSupportCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | null,
  state: ToolState,
  variant: FrameVariant,
  message: SupportMessage,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (variant === "cartaz") {
    drawCampaignPosterFrame(context, image, state);
    return;
  }

  if (image) {
    if (variant === "circular") {
      drawCircularImage(context, image, state);
    } else {
      drawCoverImage(context, image, state);
    }
    drawFrame(context, true, variant, message);
    return;
  }

  drawFrame(context, false, variant, message);
}

function drawCleanFrame(context: CanvasRenderingContext2D, message: SupportMessage) {
  const isVote = message === "voto";
  const isAlexandreOnly = message !== "dupla";
  const topFade = context.createLinearGradient(0, 0, 0, 180);
  topFade.addColorStop(0, "rgba(11, 11, 14, 0.48)");
  topFade.addColorStop(1, "rgba(11, 11, 14, 0)");
  context.fillStyle = topFade;
  context.fillRect(0, 0, CANVAS_SIZE, 180);
  drawGrain(context, 0.03);

  const panel = context.createLinearGradient(0, 790, 0, CANVAS_SIZE);
  panel.addColorStop(0, "rgba(11, 11, 14, 0)");
  panel.addColorStop(0.34, "rgba(11, 11, 14, 0.78)");
  panel.addColorStop(1, "rgba(11, 11, 14, 0.94)");
  context.fillStyle = panel;
  context.fillRect(0, 720, CANVAS_SIZE, 360);

  context.fillStyle = "#ffd100";
  context.fillRect(62, 820, 260, 10);
  context.fillStyle = "rgba(226, 219, 199, 0.76)";
  context.fillRect(62, 844, 126, 6);

  context.textAlign = "left";
  context.fillStyle = "rgba(243, 240, 232, 0.94)";
  setFont(context, 900, 38, "Arial Black, Arial");
  context.fillText(isVote ? "EU VOTO" : "EU APOIO", 62, 92);

  context.fillStyle = "#ffd100";
  setFont(context, 900, isAlexandreOnly ? 64 : 64, "Arial Black, Arial");
  context.fillText(isAlexandreOnly ? "ALEXANDRE" : "GLAUBER BRAGA", 62, 904, 920);

  context.fillStyle = "#f3f0e8";
  setFont(context, 900, isAlexandreOnly ? 56 : 48, "Arial Black, Arial");
  context.fillText(isAlexandreOnly ? "VR ABANDONADA" : "ALEXANDRE VR ABANDONADA", 62, 966, 920);

  context.fillStyle = "rgba(242,242,242,0.82)";
  setFont(context, 700, isAlexandreOnly ? 25 : 27);
  context.fillText(
    isVote
      ? "50800"
      : isAlexandreOnly
      ? `Pré-candidato a deputado estadual • ${SITE_IDENTITY.signature}`
      : `${SITE_IDENTITY.contextLabel} • ${SITE_IDENTITY.signature}`,
    62,
    1016,
    920,
  );

  context.strokeStyle = "rgba(226, 219, 199, 0.48)";
  context.lineWidth = 3;
  context.strokeRect(36, 36, CANVAS_SIZE - 72, CANVAS_SIZE - 72);
}

function drawCircularFrame(context: CanvasRenderingContext2D, hasPhoto: boolean, message: SupportMessage) {
  const isVote = message === "voto";
  const isAlexandreOnly = message !== "dupla";
  if (!hasPhoto) {
    context.fillStyle = "#0b0b0e";
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.fillStyle = "rgba(255, 209, 0, 0.08)";
    context.beginPath();
    context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_INNER_RADIUS, 0, Math.PI * 2);
    context.fill();
    drawProfilePlaceholder(context, "circular");
  }

  const ringGradient = context.createRadialGradient(
    CIRCLE_CENTER,
    CIRCLE_CENTER,
    CIRCLE_INNER_RADIUS,
    CIRCLE_CENTER,
    CIRCLE_CENTER,
    CIRCLE_OUTER_RADIUS,
  );
  ringGradient.addColorStop(0, "#151515");
  ringGradient.addColorStop(0.58, "#050505");
  ringGradient.addColorStop(1, "#151515");

  context.fillStyle = ringGradient;
  context.beginPath();
  context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_OUTER_RADIUS, 0, Math.PI * 2);
  context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_INNER_RADIUS, 0, Math.PI * 2, true);
  context.fill();

  context.strokeStyle = "#ffd100";
  context.lineWidth = 12;
  context.beginPath();
  context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_OUTER_RADIUS - 18, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = 8;
  context.beginPath();
  context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_INNER_RADIUS + 12, 0, Math.PI * 2);
  context.stroke();

  context.strokeStyle = "rgba(192, 57, 43, 0.9)";
  context.lineWidth = 10;
  context.beginPath();
  context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_OUTER_RADIUS - 38, 2.55, 3.58);
  context.stroke();
  context.beginPath();
  context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_OUTER_RADIUS - 38, -0.6, 0.54);
  context.stroke();

  drawArcText(
    context,
    isVote
      ? "EU VOTO  *  ALEXANDRE VR  *"
      : isAlexandreOnly
        ? "EU APOIO  *  ALEXANDRE VR  *"
        : "EU APOIO  *  GLAUBER BRAGA  *",
    CIRCLE_CENTER,
    CIRCLE_CENTER,
    444,
    Math.PI * 1.08,
    Math.PI * 1.92,
    "#ffffff",
    42,
  );
  drawArcText(
    context,
    isAlexandreOnly ? "VR ABANDONADA" : "VR ABANDONADA",
    CIRCLE_CENTER,
    CIRCLE_CENTER,
    444,
    Math.PI * 0.2,
    Math.PI * 0.8,
    "#ffd100",
    46,
    true,
  );

  context.textAlign = "center";
  context.fillStyle = "#ffd100";
  setFont(context, 900, 34);
  context.fillText(isVote ? "EU VOTO" : "EU APOIO", CIRCLE_CENTER, 174);

  context.fillStyle = "rgba(11, 11, 14, 0.78)";
  context.fillRect(isAlexandreOnly ? 210 : 274, 842, isAlexandreOnly ? 660 : 532, 82);
  context.fillStyle = "#ffffff";
  setFont(context, 800, isAlexandreOnly ? 31 : 28);
  context.fillText(isAlexandreOnly ? "ALEXANDRE VR ABANDONADA" : "ALEXANDRE VR ABANDONADA", CIRCLE_CENTER, 886);
  if (isAlexandreOnly) {
    context.fillStyle = "#ffd100";
    setFont(context, 800, isVote ? 30 : 20);
    context.fillText(isVote ? "50800" : "PRÉ-CANDIDATO A DEPUTADO ESTADUAL", CIRCLE_CENTER, 914);
  }
}

function drawFrame(
  context: CanvasRenderingContext2D,
  hasPhoto: boolean,
  variant: FrameVariant,
  message: SupportMessage,
) {
  if (variant === "circular") {
    drawCircularFrame(context, hasPhoto, message);
    return;
  }

  const gradient = context.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  gradient.addColorStop(0, "rgba(11, 11, 14, 0.04)");
  gradient.addColorStop(0.46, "rgba(11, 11, 14, 0)");
  gradient.addColorStop(1, "rgba(11, 11, 14, 0.72)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  if (!hasPhoto) {
    const placeholder = context.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    placeholder.addColorStop(0, "#24231f");
    placeholder.addColorStop(0.48, "#30302b");
    placeholder.addColorStop(1, "#11110f");
    context.fillStyle = placeholder;
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawGrain(context, 0.05);
    drawProfilePlaceholder(context, variant);
  }

  if (variant === "limpo") {
    drawCleanFrame(context, message);
  } else {
    drawStrongFrame(context, message);
  }
}

export function SupportPhotoTool() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("A foto fica no seu navegador. Nada é enviado para servidor.");
  const [state, setState] = useState<ToolState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [variant, setVariant] = useState<FrameVariant>("cartaz");
  const [message, setMessage] = useState<SupportMessage>("voto");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderSupportCanvas(canvas, image, state, variant, message);
  }, [image, state, variant, message]);

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setFileName("");
      setStatus("Envie uma imagem PNG, JPG ou JPEG.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileName("");
      setStatus("A imagem precisa ter no máximo 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = new Image();
      nextImage.onload = () => {
        setImage(nextImage);
        setFileName(file.name);
        setState({ zoom: 1, offsetX: 0, offsetY: 0 });
        setStatus("Foto carregada. Ajuste o enquadramento e baixe a montagem.");
      };
      nextImage.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function updateState(key: keyof ToolState, value: number) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function resetFrame() {
    setState({ zoom: 1, offsetX: 0, offsetY: 0 });
  }

  function portraitFrame() {
    if (variant === "cartaz") {
      const isPortraitPhoto = image
        ? image.naturalHeight / image.naturalWidth > 1.15
        : false;
      setState({ zoom: 1.08, offsetX: 0, offsetY: isPortraitPhoto ? 360 : 36 });
      return;
    }

    if (variant === "circular") {
      setState({ zoom: 1.04, offsetX: 0, offsetY: 80 });
      return;
    }

    setState({ zoom: 1.02, offsetX: 0, offsetY: 220 });
  }

  function getCanvasBlob() {
    const canvas = canvasRef.current;
    if (!canvas) return Promise.resolve<Blob | null>(null);
    renderSupportCanvas(canvas, image, state, variant, message);

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
    });
  }

  async function downloadImage() {
    if (!image) {
      setStatus("Escolha uma foto antes de baixar a montagem.");
      return;
    }

    const blob = await getCanvasBlob();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      message === "voto"
        ? "eu-voto-alexandre-vr-abandonada-50800.png"
        : message === "alexandre"
        ? "eu-apoio-alexandre-vr-abandonada.png"
        : "eu-apoio-glauber-braga-alexandre-vr-abandonada.png";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus("Imagem pronta. O download foi iniciado.");
  }

  async function shareImage() {
    if (!image) {
      setStatus("Escolha uma foto antes de compartilhar a montagem.");
      return;
    }

    const blob = await getCanvasBlob();
    if (!blob) return;

    const file = new File(
      [blob],
      message === "voto"
        ? "eu-voto-alexandre-vr-abandonada-50800.png"
        : message === "alexandre"
        ? "eu-apoio-alexandre-vr-abandonada.png"
        : "eu-apoio-glauber-braga-alexandre-vr-abandonada.png",
      {
        type: "image/png",
      },
    );
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };

    if (nav.canShare?.({ files: [file] }) && nav.share) {
      await nav.share({
        files: [file],
        title:
          message === "voto"
            ? "Eu voto Alexandre VR Abandonada 50800"
            : message === "alexandre"
            ? "Eu apoio Alexandre VR Abandonada"
            : "Eu apoio Glauber Braga e Alexandre VR Abandonada",
      });
      return;
    }

    await downloadImage();
  }

  return (
    <div className="support-tool">
      <header className="support-tool__masthead">
        <div className="support-tool__brand" aria-label="Alexandre 50800, deputado estadual">
          <strong>50800</strong>
          <span>Deputado estadual</span>
        </div>
        <div className="support-tool__intro">
          <h1>Faça parte dessa luta.</h1>
          <p>Envie sua foto e gere a arte “Eu voto Alexandre VR Abandonada 50800”.</p>
        </div>
        <div className="support-tool__actions support-tool__actions--top">
          <button type="button" className="btn btn-primary btn-lg" onClick={downloadImage} disabled={!image}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 18v2h14v-2" />
            </svg>
            Baixar imagem
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={shareImage} disabled={!image}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="18" cy="5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="19" r="2.5" />
              <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
            </svg>
            Compartilhar
          </button>
        </div>
      </header>

      <div className="support-tool__workspace">
        <div className="support-tool__stage">
        <div className="support-tool__stage-head">
          <span>Preview 1080 × 1080</span>
          <strong>
            {variant === "cartaz"
              ? "Cartaz 50800"
              : variant === "circular"
                ? "Perfil circular"
                : variant === "limpo"
                  ? "Perfil limpo"
                  : "Perfil forte"}
          </strong>
        </div>
        <div className="support-tool__preview" aria-label="Prévia da montagem">
          <canvas ref={canvasRef} className="support-tool__canvas" />
          <input
            id="support-photo-input"
            className="support-tool__preview-upload"
            type="file"
            accept="image/png,image/jpeg"
            aria-label={image ? "Trocar foto da montagem" : "Escolher foto para a montagem"}
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
            onChange={handleImageUpload}
          />
          {image ? (
            <div
              className={`support-tool__guide ${variant === "cartaz" ? "support-tool__guide--poster" : ""}`}
              aria-hidden="true"
            />
          ) : null}
        </div>
        <div className="support-tool__mobile-adjust" aria-label="Ajuste rápido da foto">
          <div className="support-tool__mobile-actions" role="group" aria-label="Ajustes rápidos">
            <button type="button" className="support-tool__chip" onClick={portraitFrame}>
              Centralizar rosto
            </button>
            <button type="button" className="support-tool__chip" onClick={resetFrame}>
              Resetar
            </button>
          </div>
          <label>
            Zoom
            <input
              type="range"
              min="1"
              max="2.2"
              step="0.02"
              value={state.zoom}
              onChange={(event) => updateState("zoom", Number(event.target.value))}
            />
          </label>
          <label>
            Horizontal
            <input
              type="range"
              min="-260"
              max="260"
              step="4"
              value={state.offsetX}
              onChange={(event) => updateState("offsetX", Number(event.target.value))}
            />
          </label>
          <label>
            Vertical
            <input
              type="range"
              min="-420"
              max="460"
              step="4"
              value={state.offsetY}
              onChange={(event) => updateState("offsetY", Number(event.target.value))}
            />
          </label>
        </div>
        </div>

        <div className="support-tool__controls">
        <div className="support-tool__controls-head">
          <span>01</span>
          <div>
            <strong>Monte sua imagem</strong>
            <p>Escolha uma foto, ajuste o rosto e baixe em PNG.</p>
          </div>
        </div>

        <label className="support-tool__upload" htmlFor="support-photo-input">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5h10l4 4v10H4z" />
            <path d="M14 5v4h4M8 15l2.2-2.2L13 15.5l1.5-1.5L18 17.5M8 9h2" />
          </svg>
          <span>
            <strong>Escolher foto</strong>
            <small>PNG ou JPEG · máximo 5 MB</small>
          </span>
        </label>

        <p className="support-tool__status" role="status">
          {fileName ? `Arquivo: ${fileName}. ${status}` : status}
        </p>

        <fieldset className="support-tool__variant">
          <legend>Mensagem da arte</legend>
          <label>
            <input
              type="radio"
              name="support-message"
              value="voto"
              checked={message === "voto"}
              onChange={() => setMessage("voto")}
            />
            Voto 50800
            <span>Eu voto Alexandre VR Abandonada 50800</span>
          </label>
          <label>
            <input
              type="radio"
              name="support-message"
              value="alexandre"
              checked={message === "alexandre"}
              onChange={() => setMessage("alexandre")}
            />
            Só Alexandre
            <span>Eu apoio Alexandre VR Abandonada, pré-candidato a deputado estadual</span>
          </label>
          <label>
            <input
              type="radio"
              name="support-message"
              value="dupla"
              checked={message === "dupla"}
              onChange={() => setMessage("dupla")}
            />
            Glauber + Alexandre
            <span>Eu apoio Glauber Braga e Alexandre VR Abandonada</span>
          </label>
        </fieldset>

        <fieldset className="support-tool__variant">
          <legend>Modelo</legend>
          <label>
            <input
              type="radio"
              name="support-frame"
              value="cartaz"
              checked={variant === "cartaz"}
              onChange={() => {
                setVariant("cartaz");
                setMessage("voto");
              }}
            />
            Cartaz 50800
            <span>identidade da campanha, sem foto do candidato</span>
          </label>
          <label>
            <input
              type="radio"
              name="support-frame"
              value="forte"
              checked={variant === "forte"}
              onChange={() => setVariant("forte")}
            />
            Perfil forte
            <span>impacto para feed e status</span>
          </label>
          <label>
            <input
              type="radio"
              name="support-frame"
              value="limpo"
              checked={variant === "limpo"}
              onChange={() => setVariant("limpo")}
            />
            Perfil limpo
            <span>mais foto, menos ruído</span>
          </label>
          <label>
            <input
              type="radio"
              name="support-frame"
              value="circular"
              checked={variant === "circular"}
              onChange={() => setVariant("circular")}
            />
            Perfil circular
            <span>melhor para avatar</span>
          </label>
        </fieldset>

        <div className="support-tool__quick-actions" role="group" aria-label="Ajustes rápidos">
          <button type="button" className="support-tool__chip" onClick={portraitFrame}>
            Centralizar rosto
          </button>
          <button type="button" className="support-tool__chip" onClick={resetFrame}>
            Resetar
          </button>
        </div>

        <label className="support-tool__field">
          <span className="support-tool__field-meta">
            <span>Zoom</span>
            <output>{Math.round(state.zoom * 100)}%</output>
          </span>
          <input
            type="range"
            min="1"
            max="2.2"
            step="0.02"
            value={state.zoom}
            onChange={(event) => updateState("zoom", Number(event.target.value))}
          />
        </label>

        <label className="support-tool__field">
          <span className="support-tool__field-meta">
            <span>Mover na horizontal</span>
            <output>{state.offsetX}</output>
          </span>
          <input
            type="range"
            min="-260"
            max="260"
            step="4"
            value={state.offsetX}
            onChange={(event) => updateState("offsetX", Number(event.target.value))}
          />
        </label>

        <label className="support-tool__field">
          <span className="support-tool__field-meta">
            <span>Mover na vertical</span>
            <output>{state.offsetY}</output>
          </span>
          <input
            type="range"
            min="-420"
            max="460"
            step="4"
            value={state.offsetY}
            onChange={(event) => updateState("offsetY", Number(event.target.value))}
          />
        </label>

        <div className="support-tool__actions support-tool__actions--mobile">
          <button type="button" className="btn btn-primary btn-lg" onClick={downloadImage} disabled={!image}>
            Baixar imagem
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={shareImage} disabled={!image}>
            Compartilhar
          </button>
        </div>
        </div>
      </div>

      <style>{`
        .support-tool {
          --studio-charcoal: #101214;
          --studio-paper: #f2efe5;
          --studio-teal: #0e6473;
          --studio-yellow: #f2c230;
          --studio-red: #d64330;
          display: block;
        }

        .support-tool__masthead {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: clamp(1.2rem, 2.5vw, 2.5rem);
          align-items: center;
          min-height: 104px;
          padding: 1rem 0 1.35rem;
          border-bottom: 1px solid rgba(242, 239, 229, 0.14);
        }

        .support-tool__brand {
          display: grid;
          align-content: center;
          min-width: 138px;
          padding-right: 1.4rem;
          border-right: 1px solid rgba(242, 239, 229, 0.24);
          text-transform: uppercase;
        }

        .support-tool__brand strong {
          color: var(--studio-teal);
          font-family: var(--font-head);
          font-size: clamp(2.35rem, 4vw, 3.4rem);
          line-height: 0.82;
          letter-spacing: -0.055em;
        }

        .support-tool__brand span {
          margin-top: 0.42rem;
          color: var(--studio-paper);
          font-size: 0.62rem;
          font-weight: 850;
          letter-spacing: 0.12em;
        }

        .support-tool__intro h1 {
          margin: 0;
          color: var(--studio-paper);
          font-family: var(--font-head);
          font-size: clamp(1.45rem, 2.4vw, 2.1rem);
          line-height: 1;
          letter-spacing: -0.035em;
        }

        .support-tool__intro p {
          margin: 0.52rem 0 0;
          color: rgba(242, 239, 229, 0.62);
          font-size: 0.94rem;
          line-height: 1.45;
        }

        .support-tool__workspace {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 390px;
          gap: 1rem;
          align-items: start;
          padding-top: 1rem;
        }

        .support-tool__stage,
        .support-tool__controls {
          border: 1px solid rgba(242, 239, 229, 0.16);
          border-radius: 4px;
          background: #101214;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);
        }

        .support-tool__stage {
          min-width: 0;
          overflow: hidden;
        }

        .support-tool__stage-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.15rem;
          color: var(--studio-paper);
          background: #0b4e59;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .support-tool__stage-head strong {
          color: var(--studio-paper);
          font-size: 0.78rem;
        }

        .support-tool__preview {
          --preview-padding: clamp(1rem, 3vw, 2.25rem);
          position: relative;
          padding: var(--preview-padding);
          border: 0;
          border-radius: 0;
          background:
            linear-gradient(rgba(14, 100, 115, 0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 100, 115, 0.09) 1px, transparent 1px),
            #11171a;
          background-size: 32px 32px;
          overflow: hidden;
        }

        .support-tool__canvas {
          display: block;
          width: 100%;
          aspect-ratio: 1;
          height: auto;
          border-radius: 2px;
          background: var(--bg);
          box-shadow:
            0 22px 58px rgba(0,0,0,0.48),
            0 0 0 1px rgba(255,255,255,0.045);
        }

        .support-tool__preview-upload {
          position: absolute;
          z-index: 2;
          inset: var(--preview-padding);
          width: auto;
          height: auto;
          border: 0;
          border-radius: 2px;
          opacity: 0;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: rgba(242, 194, 48, 0.2);
        }

        .support-tool__preview:has(.support-tool__preview-upload:focus-visible) {
          box-shadow: inset 0 0 0 4px #f2c230;
        }

        .support-tool__guide {
          position: absolute;
          inset: 24% 24% 30%;
          border: 2px dashed rgba(255, 255, 255, 0.34);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 0 999px rgba(11, 11, 14, 0.05);
        }

        .support-tool__guide--poster {
          inset: 25.75% 6.65% 30.75%;
          border-radius: 2px;
          border-color: rgba(242, 239, 229, 0.78);
          box-shadow: inset 0 0 0 1px rgba(16, 18, 20, 0.24);
        }

        .support-tool__mobile-adjust {
          display: none;
        }

        .support-tool__controls {
          position: sticky;
          top: 1rem;
          padding: 1.15rem;
          display: grid;
          gap: 1rem;
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
          scrollbar-color: rgba(14, 100, 115, 0.7) transparent;
        }

        .support-tool__controls-head {
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(242, 239, 229, 0.12);
        }

        .support-tool__controls-head > span {
          display: none;
        }

        .support-tool__controls-head strong {
          display: block;
          color: var(--text);
          color: #58aebb;
          font-size: 1.08rem;
          line-height: 1.2;
        }

        .support-tool__controls-head p {
          margin: 0.25rem 0 0;
          color: var(--muted);
          font-size: 0.84rem;
          line-height: 1.45;
        }

        .support-tool__upload {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.85rem;
          min-height: 104px;
          padding: 1rem;
          border: 1px dashed rgba(242, 239, 229, 0.28);
          border-radius: 3px;
          background: rgba(242, 239, 229, 0.025);
          color: var(--studio-paper);
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease;
        }

        .support-tool__upload:hover {
          border-color: #58aebb;
          background: rgba(14, 100, 115, 0.12);
        }

        .support-tool__upload svg {
          width: 30px;
          height: 30px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.5;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .support-tool__upload span {
          display: grid;
          gap: 0.18rem;
        }

        .support-tool__upload strong {
          font-size: 0.94rem;
        }

        .support-tool__upload small {
          color: var(--muted);
          font-size: 0.72rem;
          font-weight: 600;
        }

        .support-tool__status {
          margin: 0;
          color: var(--muted);
          font-size: 0.92rem;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .support-tool__quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }

        .support-tool__variant {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.6rem;
          margin: 0;
          padding: 0;
          border: 0;
        }

        .support-tool__variant legend {
          grid-column: 1 / -1;
          padding: 0;
          color: var(--text);
          font-size: 0.92rem;
          font-weight: 700;
        }

        .support-tool__variant label {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.1rem 0.55rem;
          min-height: 58px;
          padding: 0.68rem 0.78rem;
          border: 1px solid rgba(242, 239, 229, 0.14);
          border-radius: 3px;
          background: rgba(242, 239, 229, 0.035);
          color: var(--text);
          font-weight: 800;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }

        .support-tool__variant label:has(input:checked) {
          border-color: rgba(14, 100, 115, 0.92);
          background: rgba(14, 100, 115, 0.22);
        }

        .support-tool__variant label:hover {
          transform: translateY(-1px);
          border-color: rgba(242, 194, 48, 0.5);
        }

        .support-tool__variant label span {
          grid-column: 2;
          color: var(--muted);
          font-size: 0.75rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .support-tool__variant input {
          accent-color: #f2c230;
        }

        .support-tool__chip {
          min-height: 42px;
          border: 1px solid rgba(226, 219, 199, 0.14);
          border-radius: 3px;
          background: rgba(242, 239, 229, 0.04);
          color: var(--text);
          cursor: pointer;
          font-weight: 700;
        }

        .support-tool__chip:hover {
          border-color: #f2c230;
          color: #f2c230;
        }

        .support-tool__field {
          display: grid;
          gap: 0.55rem;
          color: var(--text);
          font-weight: 600;
          font-size: 0.92rem;
        }

        .support-tool__field input {
          width: 100%;
          accent-color: #f2c230;
          cursor: pointer;
        }

        .support-tool__field-meta {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .support-tool__field-meta output {
          color: #58aebb;
          font-size: 0.78rem;
          font-variant-numeric: tabular-nums;
        }

        .support-tool__actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        .support-tool__actions .btn {
          justify-content: center;
          border-radius: 3px;
          min-height: 50px;
          padding-inline: 1rem;
          white-space: nowrap;
        }

        .support-tool__actions .btn svg {
          width: 19px;
          height: 19px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .support-tool__actions--mobile {
          display: none;
        }

        @media (max-width: 860px) {
          .support-tool__masthead {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding-top: 0.75rem;
          }

          .support-tool__brand {
            width: fit-content;
            min-width: 0;
            padding: 0 0 0.75rem;
            border-right: 0;
            border-bottom: 1px solid rgba(242, 239, 229, 0.18);
          }

          .support-tool__brand strong {
            font-size: 2.75rem;
          }

          .support-tool__actions--top {
            display: none;
          }

          .support-tool__workspace {
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .support-tool__stage {
            position: relative;
            border-radius: 6px;
          }

          .support-tool__stage-head {
            padding-bottom: 0.55rem;
            font-size: 0.63rem;
            letter-spacing: 0.12em;
          }

          .support-tool__stage-head strong {
            font-size: 0.68rem;
          }

          .support-tool__preview {
            --preview-padding: 0.5rem;
            border-radius: 3px;
          }

          .support-tool__canvas {
            border-radius: 2px;
          }

          .support-tool__mobile-adjust {
            display: grid;
            gap: 0.62rem;
            margin-top: 0.72rem;
            padding: 0.72rem;
            border: 1px solid rgba(14, 100, 115, 0.58);
            border-radius: 4px;
            background: rgba(14, 100, 115, 0.12);
          }

          .support-tool__mobile-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }

          .support-tool__mobile-adjust .support-tool__chip {
            min-height: 38px;
            font-size: 0.82rem;
          }

          .support-tool__mobile-adjust label {
            display: grid;
            gap: 0.28rem;
            color: var(--text);
            font-size: 0.76rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }

          .support-tool__mobile-adjust input {
            width: 100%;
            accent-color: #f2c230;
          }

          .support-tool__controls {
            position: static;
            max-height: none;
            overflow: visible;
          }

          .support-tool__controls > .support-tool__quick-actions,
          .support-tool__controls > .support-tool__field {
            display: none;
          }

          .support-tool__actions--mobile {
            display: grid;
          }
        }

        @media (max-width: 480px) {
          .support-tool__stage-head {
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
