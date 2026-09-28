"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { copyToClipboardSafe } from "@/src/lib/shareLaunch";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import styles from "./challenge.module.css";

type ChallengeMessage = {
  type: "alexandre.challenge";
  kind: "loading" | "ready" | "start" | "retry" | "share" | "result";
  day?: string;
  score?: number;
  best?: number;
  target?: number;
  progress?: number;
  version?: number;
};
type Result = { score: number; best: number };

const route = "/jogos/fuga-da-burocracia";
const poster = "/unity/fuga/IndustrialValley.png";
const portrait = "/unity/fuga/AlexandreReference.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createResultCard(score: number, best: number, day: string): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");

  context.fillStyle = "#0e1720";
  context.fillRect(0, 0, 1080, 1920);
  try {
    const landscape = await loadImage(poster);
    const scale = Math.max(1080 / landscape.width, 1920 / landscape.height);
    const width = landscape.width * scale;
    const height = landscape.height * scale;
    context.drawImage(landscape, (1080 - width) / 2, (1920 - height) / 2, width, height);
  } catch { /* the branded card remains usable without the illustration */ }

  const shade = context.createLinearGradient(0, 0, 0, 1920);
  shade.addColorStop(0, "rgba(4,9,16,.68)");
  shade.addColorStop(.4, "rgba(4,9,16,.12)");
  shade.addColorStop(1, "rgba(4,9,16,.94)");
  context.fillStyle = shade;
  context.fillRect(0, 0, 1080, 1920);
  try {
    const alexandre = await loadImage(portrait);
    const scale = Math.min(680 / alexandre.width, 870 / alexandre.height);
    context.drawImage(alexandre, 540 - alexandre.width * scale / 2, 490, alexandre.width * scale, alexandre.height * scale);
  } catch { /* the score remains the focal point */ }

  context.fillStyle = "#f5c438";
  context.fillRect(72, 85, 936, 10);
  context.fillRect(72, 1825, 936, 10);
  context.textAlign = "center";
  context.fillStyle = "#f5c438";
  context.font = "bold 72px Arial, sans-serif";
  context.fillText("DESAFIO DOS PROCESSOS", 540, 208);
  context.fillStyle = "#fff";
  context.font = "bold 58px Arial, sans-serif";
  context.fillText("45 SEGUNDOS. DEZ ADVOGADOS.", 540, 310);
  context.fillStyle = "rgba(8,15,24,.90)";
  context.fillRect(68, 1320, 944, 430);
  context.fillStyle = "#f5c438";
  context.font = "bold 176px Arial, sans-serif";
  context.fillText(String(score), 540, 1500);
  context.fillStyle = "#fff";
  context.font = "bold 55px Arial, sans-serif";
  context.fillText("PONTOS  ·  MELHOR " + best, 540, 1590);
  context.font = "bold 52px Arial, sans-serif";
  context.fillText("VOCÊ CONSEGUE PASSAR?", 540, 1680);
  context.font = "30px Arial, sans-serif";
  context.fillText("Dia " + day + " · alexandrevrabandonada.online", 540, 1770);
  context.fillText("/jogos/fuga-da-burocracia", 540, 1810);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Falha ao criar card")), "image/png"));
  return new File([blob], `desafio-dos-processos-${day}.png`, { type: "image/png" });
}

export function ChallengeExperience({ day, target }: { day: string; target: number }) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [runKey, setRunKey] = useState(0);
  const [autoRun, setAutoRun] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [card, setCard] = useState<File | null>(null);
  const [feedback, setFeedback] = useState("");

  const challengeUrl = useMemo(() => {
    const params = new URLSearchParams({ day, target: String(result?.score ?? target), v: "1" });
    return `${typeof window === "undefined" ? "https://alexandrevrabandonada.online" : window.location.origin}${route}?${params}`;
  }, [day, target, result]);
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({ mode: "challenge", day, target: String(target) });
    if (autoRun) params.set("auto", "1");
    return `/unity/fuga/v1/index.html?${params}`;
  }, [day, target, autoRun]);

  useEffect(() => {
    trackEventIfAvailable("challenge_opened", { version: 1, invited: target > 0 });
    if (target > 0) trackEventIfAvailable("challenge_link_opened", { version: 1 });
  }, [target]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<ChallengeMessage>) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return;
      const message = event.data;
      if (!message || message.type !== "alexandre.challenge" || message.version !== 1 && message.kind !== "loading") return;
      if (message.kind === "loading") { setProgress(Math.max(0, Math.min(100, Number(message.progress) || 0))); return; }
      if (message.day !== day) return;
      if (message.kind === "ready") { setReady(true); return; }
      if (message.kind === "start") { trackEventIfAvailable("challenge_started", { version: 1, invited: target > 0 }); return; }
      if (message.kind === "retry") { trackEventIfAvailable("challenge_replayed", { version: 1 }); return; }
      if (message.kind === "share") { trackEventIfAvailable("challenge_share_clicked", { version: 1, surface: "unity" }); return; }
      if (message.kind === "result") {
        const score = Math.max(0, Math.min(100000, Math.trunc(Number(message.score) || 0)));
        const best = Math.max(score, Math.min(100000, Math.trunc(Number(message.best) || 0)));
        setResult({ score, best });
        trackEventIfAvailable("challenge_finished", { version: 1, score, invited: target > 0 });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [day, target, runKey]);

  useEffect(() => {
    if (!result) { setCard(null); return; }
    let active = true;
    void createResultCard(result.score, result.best, day)
      .then((file) => { if (active) setCard(file); })
      .catch(() => { if (active) setCard(null); });
    return () => { active = false; };
  }, [result, day]);

  const replay = useCallback(() => {
    trackEventIfAvailable("challenge_replayed", { version: 1, surface: "result" });
    setResult(null); setCard(null); setFeedback(""); setReady(false); setProgress(0);
    setAutoRun(true); setRunKey((current) => current + 1);
  }, []);

  const share = useCallback(async () => {
    if (!result) return;
    trackEventIfAvailable("challenge_share_clicked", { version: 1, surface: "result" });
    const text = `Fiz ${result.score} pontos no Desafio dos Processos. Você consegue passar?`;
    try {
      if (navigator.share) {
        const files = card && navigator.canShare?.({ files: [card] }) ? [card] : undefined;
        await navigator.share({ title: "Desafio dos Processos", text, url: challengeUrl, ...(files ? { files } : {}) });
        setFeedback("Desafio enviado!");
        return;
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
    }
    const copied = await copyToClipboardSafe(`${text} ${challengeUrl}`);
    setFeedback(copied ? "Convite copiado. Envie para um amigo!" : "Copie o endereço do desafio abaixo.");
  }, [result, card, challengeUrl]);

  const downloadCard = useCallback(() => {
    if (!card) return;
    const objectUrl = URL.createObjectURL(card);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = card.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    trackEventIfAvailable("challenge_card_downloaded", { version: 1 });
  }, [card]);

  return (
    <section className={styles.page} aria-label="Desafio dos Processos">
      <iframe key={runKey} ref={iframe} className={styles.game} src={iframeSrc}
        title="Jogo Alexandre: Desafio dos Processos" allow="web-share; fullscreen" />

      {!ready && <div className={styles.loading} style={{ backgroundImage: `linear-gradient(180deg, rgba(5,9,17,.45), rgba(5,9,17,.92)), url(${poster})` }}>
        <div className={styles.loadingCard}>
          <p className={styles.eyebrow}>Novo desafio · 45 segundos</p>
          <h1>Desafio dos Processos</h1>
          <p>Dez advogados. Um pulo na hora certa. Faça sua marca e desafie alguém.</p>
          {target > 0 && <p className={styles.target}>Alvo recebido: {target} pontos</p>}
          <div className={styles.progress} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>Carregando jogo… {progress}%</small>
          <Link href="/jogo">Conhecer o outro jogo</Link>
        </div>
      </div>}

      {result && <div className={styles.resultShade}>
        <div className={styles.resultPanel}>
          <p className={styles.eyebrow}>Expediente encerrado</p>
          <h2>{result.score} <span>pontos</span></h2>
          <p>Melhor marca neste aparelho: <strong>{result.best}</strong></p>
          {target > 0 && <p className={styles.target}>Alvo recebido: {target} · {result.score > target ? "Você passou!" : result.score === target ? "Empate!" : "Tente de novo!"}</p>}
          <p>Você consegue chamar alguém para superar sua marca?</p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={() => void share()}>Desafiar um amigo</button>
            <button onClick={replay}>Jogar de novo</button>
            <button onClick={downloadCard} disabled={!card}>Baixar card vertical</button>
            <Link href="/jogo">Conhecer o outro jogo</Link>
          </div>
          {feedback && <p className={styles.feedback} role="status">{feedback}</p>}
          <a className={styles.link} href={challengeUrl}>{challengeUrl}</a>
        </div>
      </div>}
    </section>
  );
}
