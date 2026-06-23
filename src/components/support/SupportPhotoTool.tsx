"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";

const CANVAS_SIZE = 1080;

type ToolState = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type FrameVariant = "forte" | "limpo" | "circular";

const CIRCLE_CENTER = CANVAS_SIZE / 2;
const CIRCLE_OUTER_RADIUS = 520;
const CIRCLE_INNER_RADIUS = 342;

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

function drawStrongFrame(context: CanvasRenderingContext2D) {
  context.save();
  context.translate(-28, 18);
  context.rotate(-0.025);
  context.fillStyle = "rgba(190, 35, 26, 0.94)";
  context.fillRect(0, 0, CANVAS_SIZE + 96, 100);
  context.fillStyle = "rgba(255, 209, 0, 0.96)";
  context.fillRect(0, 100, CANVAS_SIZE + 96, 14);
  context.restore();

  context.fillStyle = "rgba(11, 11, 14, 0.84)";
  context.fillRect(0, CANVAS_SIZE - 250, CANVAS_SIZE, 250);
  context.fillStyle = "rgba(255, 209, 0, 0.95)";
  context.fillRect(0, CANVAS_SIZE - 270, CANVAS_SIZE, 20);
  context.fillStyle = "rgba(190, 35, 26, 0.92)";
  context.fillRect(0, CANVAS_SIZE - 250, 26, 250);
  context.fillRect(CANVAS_SIZE - 26, CANVAS_SIZE - 250, 26, 250);

  context.textAlign = "left";
  drawStencilText(context, "EU APOIO", 66, 82, 540, 52, "#ffffff");

  context.fillStyle = "rgba(255, 209, 0, 0.18)";
  context.fillRect(58, 826, 964, 62);
  drawStencilText(context, "GLAUBER BRAGA", 72, 876, 930, 72, "#ffd100");
  drawStencilText(context, "ALEXANDRE VR ABANDONADA", 72, 954, 930, 54, "#ffffff");

  context.fillStyle = "rgba(242,242,242,0.86)";
  setFont(context, 600, 30);
  context.fillText(`${SITE_IDENTITY.contextLabel} • ${SITE_IDENTITY.signature}`, 72, 1002);

  context.strokeStyle = "rgba(255, 209, 0, 0.72)";
  context.lineWidth = 8;
  context.strokeRect(20, 20, CANVAS_SIZE - 40, CANVAS_SIZE - 40);
}

function drawCleanFrame(context: CanvasRenderingContext2D) {
  context.fillStyle = "rgba(11, 11, 14, 0.74)";
  context.fillRect(0, CANVAS_SIZE - 238, CANVAS_SIZE, 238);

  context.fillStyle = "#ffd100";
  context.fillRect(0, CANVAS_SIZE - 238, 420, 14);
  context.fillStyle = "rgba(192, 57, 43, 0.96)";
  context.fillRect(0, CANVAS_SIZE - 224, 312, 8);

  context.fillStyle = "rgba(11, 11, 14, 0.48)";
  context.fillRect(0, 0, CANVAS_SIZE, 116);
  context.fillStyle = "#ffd100";
  context.fillRect(0, 116, 412, 12);

  context.textAlign = "left";
  drawStencilText(context, "EU APOIO", 62, 82, 440, 46, "#ffffff");

  context.fillStyle = "#ffd100";
  setFont(context, 800, 62);
  context.fillText("GLAUBER BRAGA", 62, 886, 920);

  context.fillStyle = "#ffffff";
  setFont(context, 800, 50);
  context.fillText("ALEXANDRE VR ABANDONADA", 62, 952, 920);

  context.fillStyle = "rgba(242,242,242,0.82)";
  setFont(context, 600, 28);
  context.fillText(`${SITE_IDENTITY.contextLabel} • ${SITE_IDENTITY.signature}`, 62, 1002, 920);

  context.strokeStyle = "rgba(255, 255, 255, 0.58)";
  context.lineWidth = 5;
  context.strokeRect(22, 22, CANVAS_SIZE - 44, CANVAS_SIZE - 44);
}

function drawCircularFrame(context: CanvasRenderingContext2D, hasPhoto: boolean) {
  if (!hasPhoto) {
    context.fillStyle = "#0b0b0e";
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.fillStyle = "rgba(255, 209, 0, 0.08)";
    context.beginPath();
    context.arc(CIRCLE_CENTER, CIRCLE_CENTER, CIRCLE_INNER_RADIUS, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#ffd100";
    context.textAlign = "center";
    setFont(context, 800, 46);
    context.fillText("ENVIE SUA FOTO", CIRCLE_CENTER, CIRCLE_CENTER - 10);
    context.fillStyle = "rgba(242,242,242,0.72)";
    setFont(context, 600, 26);
    context.fillText("modelo circular para perfil", CIRCLE_CENTER, CIRCLE_CENTER + 42);
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
    "EU APOIO  *  GLAUBER BRAGA  *",
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
    "VR ABANDONADA",
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
  setFont(context, 900, 42);
  context.fillText("EU APOIO", CIRCLE_CENTER, 166);

  context.fillStyle = "rgba(11, 11, 14, 0.68)";
  context.fillRect(314, 850, 452, 58);
  context.fillStyle = "#ffffff";
  setFont(context, 800, 30);
  context.fillText("ALEXANDRE", CIRCLE_CENTER, 888);
}

function drawFrame(context: CanvasRenderingContext2D, hasPhoto: boolean, variant: FrameVariant) {
  if (variant === "circular") {
    drawCircularFrame(context, hasPhoto);
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
    placeholder.addColorStop(0, "#17171b");
    placeholder.addColorStop(0.52, "#23232a");
    placeholder.addColorStop(1, "#0b0b0e");
    context.fillStyle = placeholder;
    context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    context.strokeStyle = "rgba(255, 209, 0, 0.28)";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(CANVAS_SIZE / 2, 430, 174, 0, Math.PI * 2);
    context.stroke();
    context.fillStyle = "rgba(255, 209, 0, 0.08)";
    context.beginPath();
    context.arc(CANVAS_SIZE / 2, 430, 170, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ffd100";
    setFont(context, 800, 54);
    context.textAlign = "center";
    context.fillText("ENVIE SUA FOTO", CANVAS_SIZE / 2, 480);
    context.fillStyle = "rgba(242,242,242,0.72)";
    setFont(context, 500, 30);
    context.fillText("centralize o rosto nesta area", CANVAS_SIZE / 2, 535);
  }

  if (variant === "limpo") {
    drawCleanFrame(context);
  } else {
    drawStrongFrame(context);
  }
}

export function SupportPhotoTool() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("A foto fica no seu navegador. Nada é enviado para servidor.");
  const [state, setState] = useState<ToolState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [variant, setVariant] = useState<FrameVariant>("forte");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (image) {
      if (variant === "circular") {
        drawCircularImage(context, image, state);
      } else {
        drawCoverImage(context, image, state);
      }
      drawFrame(context, true, variant);
      return;
    }

    drawFrame(context, false, variant);
  }, [image, state, variant]);

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Envie um arquivo de imagem.");
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
    if (variant === "circular") {
      setState({ zoom: 1.04, offsetX: 0, offsetY: 80 });
      return;
    }

    setState({ zoom: 1.02, offsetX: 0, offsetY: 360 });
  }

  function getCanvasBlob() {
    const canvas = canvasRef.current;
    if (!canvas) return Promise.resolve<Blob | null>(null);

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
    link.download = "eu-apoio-glauber-braga-alexandre-vr-abandonada.png";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function shareImage() {
    if (!image) {
      setStatus("Escolha uma foto antes de compartilhar a montagem.");
      return;
    }

    const blob = await getCanvasBlob();
    if (!blob) return;

    const file = new File([blob], "eu-apoio-glauber-braga-alexandre-vr-abandonada.png", {
      type: "image/png",
    });
    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };

    if (nav.canShare?.({ files: [file] }) && nav.share) {
      await nav.share({
        files: [file],
        title: "Eu apoio Glauber Braga e Alexandre VR Abandonada",
      });
      return;
    }

    await downloadImage();
  }

  return (
    <div className="support-tool">
      <div className="support-tool__preview" aria-label="Prévia da montagem">
        <canvas ref={canvasRef} className="support-tool__canvas" />
        {image ? <div className="support-tool__guide" aria-hidden="true" /> : null}
      </div>

      <div className="support-tool__controls">
        <label className="support-tool__upload">
          <span>Escolher foto</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>

        <p className="support-tool__status" role="status">
          {fileName ? `Arquivo: ${fileName}` : status}
        </p>

        <fieldset className="support-tool__variant">
          <legend>Modelo</legend>
          <label>
            <input
              type="radio"
              name="support-frame"
              value="forte"
              checked={variant === "forte"}
              onChange={() => setVariant("forte")}
            />
            Perfil forte
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

        <label className="support-tool__field">
          Mover na horizontal
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
          Mover na vertical
          <input
            type="range"
            min="-420"
            max="460"
            step="4"
            value={state.offsetY}
            onChange={(event) => updateState("offsetY", Number(event.target.value))}
          />
        </label>

        <div className="support-tool__actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={downloadImage} disabled={!image}>
            Baixar imagem
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={shareImage} disabled={!image}>
            Compartilhar
          </button>
        </div>
      </div>

      <style>{`
        .support-tool {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 1.5rem;
          align-items: start;
        }

        .support-tool__preview,
        .support-tool__controls {
          border: 1px solid var(--border);
          border-radius: 8px;
          background:
            linear-gradient(180deg, rgba(255, 209, 0, 0.04), transparent 26%),
            var(--surface);
        }

        .support-tool__preview {
          position: relative;
          padding: 0.75rem;
        }

        .support-tool__canvas {
          width: 100%;
          aspect-ratio: 1;
          height: auto;
          border-radius: 6px;
          background: var(--bg);
        }

        .support-tool__guide {
          position: absolute;
          inset: 23% 23% 29%;
          border: 2px dashed rgba(255, 255, 255, 0.44);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 0 999px rgba(11, 11, 14, 0.08);
        }

        .support-tool__controls {
          padding: 1rem;
          display: grid;
          gap: 1rem;
        }

        .support-tool__upload {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-height: 48px;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          background: var(--yellow);
          color: var(--bg);
          font-weight: 700;
          cursor: pointer;
        }

        .support-tool__upload input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
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
          display: flex;
          align-items: center;
          gap: 0.45rem;
          min-height: 42px;
          padding: 0.55rem 0.65rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: rgba(255,255,255,0.04);
          color: var(--text);
          font-weight: 700;
          cursor: pointer;
        }

        .support-tool__variant input {
          accent-color: var(--yellow);
        }

        .support-tool__chip {
          min-height: 40px;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: rgba(255,255,255,0.04);
          color: var(--text);
          cursor: pointer;
          font-weight: 700;
        }

        .support-tool__chip:hover {
          border-color: var(--yellow);
          color: var(--yellow);
        }

        .support-tool__field {
          display: grid;
          gap: 0.45rem;
          color: var(--text);
          font-weight: 600;
          font-size: 0.92rem;
        }

        .support-tool__field input {
          width: 100%;
          accent-color: var(--yellow);
        }

        .support-tool__actions {
          display: grid;
          gap: 0.75rem;
        }

        @media (max-width: 860px) {
          .support-tool {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
