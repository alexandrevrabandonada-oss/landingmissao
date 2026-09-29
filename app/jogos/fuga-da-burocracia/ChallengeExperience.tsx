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
  survived?: boolean;
};
type Result = { score: number; best: number; survived: boolean };

const route = "/jogos/fuga-da-burocracia";
const originalPoster = "/unity/fuga/IndustrialValley.png";
const v2Poster = "/unity/fuga/challenge-og-v2.png";
const v3Poster = "/unity/fuga/challenge-og-v3.png";
const portrait = "/unity/fuga/AlexandreReference.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createResultCard(score: number, best: number, day: string, version: 1 | 2 | 3): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível");

  context.fillStyle = "#0e1720";
  context.fillRect(0, 0, 1080, 1920);
  let landscape: HTMLImageElement | null = null;
  try {
    landscape = await loadImage(version === 3 ? v3Poster : version === 2 ? v2Poster : originalPoster);
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
  if (version === 3 && landscape) {
    // Keep Alexandre's face and the inhabited city inside the vertical crop.
    const fullHeight = 1080 * landscape.height / landscape.width;
    context.fillStyle = "#0d1a2b";
    context.fillRect(0, 0, 1080, 385);
    context.drawImage(landscape, 0, 388, 1080, fullHeight);
    context.fillStyle = "#f5c438";
    context.fillRect(0, 385, 1080, 5);
    context.fillRect(0, 388 + fullHeight, 1080, 5);
  }
  if (version === 1) {
    try {
      const alexandre = await loadImage(portrait);
      const scale = Math.min(680 / alexandre.width, 870 / alexandre.height);
      context.drawImage(alexandre, 540 - alexandre.width * scale / 2, 490, alexandre.width * scale, alexandre.height * scale);
    } catch { /* the score remains the focal point */ }
  }

  context.fillStyle = "#f5c438";
  context.fillRect(72, 85, 936, 10);
  context.fillRect(72, 1825, 936, 10);
  if (version >= 2) {
    const stampY = version === 3 ? 1090 : 1190;
    context.fillStyle = "#ff6455";
    context.fillRect(72, stampY, 590, 92);
    context.textAlign = "center";
    context.fillStyle = "#0e1720";
    context.font = "bold 44px Arial, sans-serif";
    context.fillText(version === 3 ? "ONDE ESTÃO OS DADOS?" : "URGENTE PRA ONTEM!", 367, stampY + 60, 548);
  }
  if (version >= 2) {
    context.textAlign = "left";
    context.fillStyle = "#f5c438";
    context.font = "bold 76px Arial, sans-serif";
    context.fillText("DESAFIO DOS", 72, 185, 640);
    context.fillText("PROCESSOS", 72, 265, 640);
    context.fillStyle = "#fff";
    context.font = "bold 43px Arial, sans-serif";
    context.fillText(version === 3 ? "45 SEGUNDOS. SUA MARCA NA CIDADE." : "45 SEGUNDOS. FALTA UMA VIA!", 72, 340, 850);
  } else {
    context.textAlign = "center";
    context.fillStyle = "#f5c438";
    context.font = "bold 72px Arial, sans-serif";
    context.fillText("DESAFIO DOS PROCESSOS", 540, 208);
    context.fillStyle = "#fff";
    context.font = "bold 58px Arial, sans-serif";
    context.fillText("45 SEGUNDOS. DEZ ADVOGADOS.", 540, 310);
  }
  context.textAlign = "center";
  context.fillStyle = "rgba(8,15,24,.90)";
  context.fillRect(68, 1320, 944, 430);
  context.fillStyle = "#f5c438";
  context.font = "bold 176px Arial, sans-serif";
  context.fillText(String(score), 540, 1500);
  context.fillStyle = "#fff";
  context.font = "bold 55px Arial, sans-serif";
  context.fillText((version === 3 ? "PONTOS PROTOCOLADOS  ·  MELHOR " : "PONTOS  ·  MELHOR ") + best, 540, 1590, 900);
  context.font = "bold 52px Arial, sans-serif";
  context.fillText(version === 3 ? "VOCÊ PASSA ESSA MARCA?" : "VOCÊ CONSEGUE PASSAR?", 540, 1680);
  context.font = "30px Arial, sans-serif";
  context.fillText("Dia " + day + " · alexandrevrabandonada.online", 540, 1770);
  context.fillText("/jogos/fuga-da-burocracia", 540, 1810);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Falha ao criar card")), "image/png"));
  return new File([blob], `desafio-dos-processos-v${version}-${day}.png`, { type: "image/png" });
}

export function ChallengeExperience({ day, target, version }: { day: string; target: number; version: 1 | 2 | 3 }) {
  const poster = version === 3 ? v3Poster : version === 2 ? v2Poster : originalPoster;
  const iframe = useRef<HTMLIFrameElement>(null);
  const [runKey, setRunKey] = useState(0);
  const [autoRun, setAutoRun] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [card, setCard] = useState<File | null>(null);
  const [feedback, setFeedback] = useState("");

  const challengeUrl = useMemo(() => {
    const params = new URLSearchParams({ day, target: String(result?.score ?? target), v: String(version) });
    return `${typeof window === "undefined" ? "https://alexandrevrabandonada.online" : window.location.origin}${route}?${params}`;
  }, [day, target, result, version]);
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({ mode: "challenge", day, target: String(target) });
    if (autoRun) params.set("auto", "1");
    return `/unity/fuga/v${version}/index.html?${params}`;
  }, [day, target, autoRun, version]);

  useEffect(() => {
    trackEventIfAvailable("challenge_opened", { version, invited: target > 0 });
    if (target > 0) trackEventIfAvailable("challenge_link_opened", { version });
  }, [target, version]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<ChallengeMessage>) => {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return;
      const message = event.data;
      if (!message || message.type !== "alexandre.challenge" || message.version !== version && message.kind !== "loading") return;
      if (message.kind === "loading") { setProgress(Math.max(0, Math.min(100, Number(message.progress) || 0))); return; }
      if (message.day !== day) return;
      if (message.kind === "ready") { setReady(true); return; }
      if (message.kind === "start") { trackEventIfAvailable("challenge_started", { version, invited: target > 0 }); return; }
      if (message.kind === "retry") { trackEventIfAvailable("challenge_replayed", { version }); return; }
      if (message.kind === "share") { trackEventIfAvailable("challenge_share_clicked", { version, surface: "unity" }); return; }
      if (message.kind === "result") {
        const score = Math.max(0, Math.min(100000, Math.trunc(Number(message.score) || 0)));
        const best = Math.max(score, Math.min(100000, Math.trunc(Number(message.best) || 0)));
        setResult({ score, best, survived: message.survived === true });
        trackEventIfAvailable("challenge_finished", { version, score, invited: target > 0 });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [day, target, runKey, version]);

  useEffect(() => {
    if (!result) { setCard(null); return; }
    let active = true;
    void createResultCard(result.score, result.best, day, version)
      .then((file) => { if (active) setCard(file); })
      .catch(() => { if (active) setCard(null); });
    return () => { active = false; };
  }, [result, day, version]);

  const replay = useCallback(() => {
    trackEventIfAvailable("challenge_replayed", { version, surface: "result" });
    setResult(null); setCard(null); setFeedback(""); setReady(false); setProgress(0);
    setAutoRun(true); setRunKey((current) => current + 1);
  }, [version]);

  const share = useCallback(async () => {
    if (!result) return;
    trackEventIfAvailable("challenge_share_clicked", { version, surface: "result" });
    const text = version === 3 ? `Protocolei ${result.score} pontos. Você passa essa marca?` : `Fiz ${result.score} pontos no Desafio dos Processos. Você consegue passar?`;
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
  }, [result, card, challengeUrl, version]);

  const downloadCard = useCallback(() => {
    if (!card) return;
    const objectUrl = URL.createObjectURL(card);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = card.name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    trackEventIfAvailable("challenge_card_downloaded", { version });
  }, [card, version]);

  return (
    <section className={styles.page} aria-label="Desafio dos Processos">
      <iframe key={runKey} ref={iframe} className={styles.game} src={iframeSrc}
        title="Jogo Alexandre: Desafio dos Processos" allow="web-share; fullscreen" />

      {!ready && <div className={styles.loading} style={{ backgroundImage: `linear-gradient(180deg, rgba(5,9,17,.45), rgba(5,9,17,.92)), url(${poster})` }}>
        <div className={styles.loadingCard}>
          <p className={styles.eyebrow}>Desafio da cidade · 45 segundos</p>
          <h1>Desafio dos Processos</h1>
          <p>{version === 3 ? "Uma cidade fez uma pergunta. Dez advogados pediram outra via. Protocole sua marca e desafie alguém." : "Dez advogados. Um pulo na hora certa. Faça sua marca e desafie alguém."}</p>
          {target > 0 && <p className={styles.target}>Alvo recebido: {target} pontos</p>}
          <div className={styles.progress} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>Carregando jogo… {progress}%</small>
          <Link href="/jogo">Conhecer o outro jogo</Link>
          {version === 3 && <Link href="/quem-e-alexandre-vr-abandonada">Conheça a história de Alexandre</Link>}
        </div>
      </div>}

      {result && <div className={styles.resultShade}>
        <div className={styles.resultPanel}>
          <p className={styles.eyebrow}>{version === 3 ? result.survived ? "A cidade não cabe num formulário" : "Falta uma via! Tente de novo" : version === 2 ? result.survived ? "Carimbo: sobreviveu!" : "Falta uma via!" : "Expediente encerrado"}</p>
          <h2>{result.score} <span>pontos</span></h2>
          <p>Melhor marca neste aparelho: <strong>{result.best}</strong></p>
          {target > 0 && <p className={styles.target}>Alvo recebido: {target} · {result.score > target ? "Você passou!" : result.score === target ? "Empate!" : "Tente de novo!"}</p>}
          <p>{version === 3 ? `Protocolei ${result.score} pontos. Seu amigo passa essa marca?` : version === 2 ? "O próximo formulário é do seu amigo. Ele passa sua marca?" : "Você consegue chamar alguém para superar sua marca?"}</p>
          <div className={styles.actions}>
            <button className={styles.primary} onClick={() => void share()}>Desafiar um amigo</button>
            <button onClick={replay}>Jogar de novo</button>
            <button onClick={downloadCard} disabled={!card}>Baixar card vertical</button>
            {version !== 3 && <Link href="/jogo">Conhecer o outro jogo</Link>}
          </div>
          {version === 3 && <div className={styles.secondaryLinks}>
            <Link href="/jogo">Outro jogo</Link>
            <Link href="/quem-e-alexandre-vr-abandonada">História de Alexandre</Link>
          </div>}
          {feedback && <p className={styles.feedback} role="status">{feedback}</p>}
          <a className={styles.link} href={challengeUrl}>{challengeUrl}</a>
        </div>
      </div>}
    </section>
  );
}
