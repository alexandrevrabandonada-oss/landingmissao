"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import {
  buildFacebookShareUrl,
  buildGameShareMessage,
  getInstagramShareUrl,
  getTikTokShareUrl,
  buildLaunchWhatsAppUrl,
  copyToClipboardSafe,
} from "@/src/lib/shareLaunch";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const GROUND_Y = 432;
const GRAVITY = 1450;
const TARGET_DISTANCE = 12800;
const HUD_INTERVAL = 100;
const SCROLL_BASE = 152;
const PLAYER_MOVE_SPEED = 280;
const INITIAL_OBSTACLE_DELAY = 4;
const INITIAL_COLLECT_DELAY = 0.8;
const EARLY_GRACE_DISTANCE = 840;

const ASSET_PATHS = {
  finishCity: "/game/finish-city.svg",
  playerIdle: "/game/player-idle.png",
  playerRun: "/game/player-run.png",
  playerJump: "/game/player-jump.png",
  sky: "/game/layer-sky.svg",
  serras: "/game/layer-serras.svg",
  industrial: "/game/layer-industrial.svg",
  river: "/game/layer-rio.svg",
  concrete: "/game/layer-concreto.svg",
  relato: "/game/collect-relato.png",
  prova: "/game/collect-prova.png",
  memoria: "/game/collect-memoria.png",
  apoio: "/game/collect-apoio.png",
  processinho: "/game/obstacle-processinho.png",
  carimbo: "/game/obstacle-carimbo.png",
  muralha: "/game/obstacle-muralha.png",
} as const;

const EASTER_EGGS = [
  { key: "baciao", label: "Bacião Skate Vive", worldX: 1700, lane: "ground", color: "#ffd100" },
  { key: "vr", label: "VR Não Esquece", worldX: 3550, lane: "wall", color: "#f1eee5" },
  { key: "recibo", label: "Recibo é lei", worldX: 5440, lane: "ground", color: "#ffd100" },
  { key: "capivara", label: "Capivara ECO escondida", worldX: 7120, lane: "river", color: "#d9f08a" },
  { key: "po", label: "Pó preto não é paisagem", worldX: 9300, lane: "sky", color: "#c0392b" },
  { key: "arquivo", label: "Arquivo Vivo", worldX: 11540, lane: "wall", color: "#f1eee5" },
] as const;

type AssetKey = keyof typeof ASSET_PATHS;
type EasterEggKey = (typeof EASTER_EGGS)[number]["key"];
type InputState = {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
};
type GameStatus = "playing" | "won" | "lost";
type CollectType = "relato" | "prova" | "memoria" | "apoio";
type ObstacleType = "processinho" | "carimbo" | "muralha";
type LoadedAssets = Record<AssetKey, HTMLImageElement>;

type PlayerState = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
};

type ObstacleState = {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  w: number;
  h: number;
};

type CollectState = {
  id: number;
  type: CollectType;
  x: number;
  y: number;
  w: number;
  h: number;
  bob: number;
};

type Snapshot = {
  status: GameStatus;
  relatos: number;
  provas: number;
  memoria: number;
  apoio: number;
  total: number;
  obstaclesDodged: number;
  progress: number;
  distance: number;
  timeLeft: number;
  cityLabel: string;
  easterEggsFound: number;
};

const INITIAL_SNAPSHOT: Snapshot = {
  status: "playing",
  relatos: 0,
  provas: 0,
  memoria: 0,
  apoio: 0,
  total: 0,
  obstaclesDodged: 0,
  progress: 0,
  distance: 0,
  timeLeft: 90,
  cityLabel: "Cidade travada",
  easterEggsFound: 0,
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function toAbsoluteUrl(path: string) {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createObstacle(id: number): ObstacleState {
  const types: ObstacleType[] = ["carimbo", "processinho", "muralha"];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === "processinho") {
    return {
      id,
      type,
      x: GAME_WIDTH + 40,
      y: 248 + Math.random() * 96,
      w: 102,
      h: 70,
    };
  }

  if (type === "muralha") {
    return {
      id,
      type,
      x: GAME_WIDTH + 40,
      y: GROUND_Y - 104,
      w: 74,
      h: 104,
    };
  }

  return {
    id,
    type,
    x: GAME_WIDTH + 40,
    y: GROUND_Y - 76,
    w: 92,
    h: 76,
  };
}

function createCollectable(id: number): CollectState {
  const types: CollectType[] = ["relato", "prova", "memoria", "apoio"];
  const type = types[Math.floor(Math.random() * types.length)];
  const laneHeights = [GROUND_Y - 84, GROUND_Y - 146, GROUND_Y - 194];
  const y = laneHeights[Math.floor(Math.random() * laneHeights.length)];

  return {
    id,
    type,
    x: GAME_WIDTH + 40,
    y,
    w: 46,
    h: 46,
    bob: Math.random() * Math.PI * 2,
  };
}

function intersects(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function getCityLabel(progress: number) {
  if (progress >= 1) {
    return "Cidade mais organizada";
  }

  if (progress >= 0.7) {
    return "Cidade respondendo";
  }

  if (progress >= 0.35) {
    return "Cidade em escuta";
  }

  return "Cidade travada";
}

function getOutcomeTitle(snapshot: Snapshot) {
  if (snapshot.status === "lost" && snapshot.total >= 8) {
    return "Cidade em Movimento";
  }

  if (snapshot.easterEggsFound >= 4) {
    return "Guardião da Memória";
  }

  if (snapshot.obstaclesDodged >= 8) {
    return "Contra a Burocracia";
  }

  if (snapshot.total >= 8) {
    return "Escutador do Território";
  }

  return "Cidade em Movimento";
}

function getEggY(lane: (typeof EASTER_EGGS)[number]["lane"]) {
  if (lane === "river") {
    return 332;
  }

  if (lane === "sky") {
    return 156;
  }

  if (lane === "wall") {
    return 274;
  }

  return 384;
}

type GameExperienceProps = {
  refId: string;
  shareUrl: string;
  appUrl: string;
  signupUrl: string;
  missionUrl: string;
  exitUrl: string;
};

export default function GameExperience({
  refId,
  shareUrl,
  appUrl,
  signupUrl,
  missionUrl,
  exitUrl,
}: GameExperienceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const finishTrackedRef = useRef<string>("");
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jumpPressed: false,
  });
  const [assets, setAssets] = useState<LoadedAssets | null>(null);
  const [assetError, setAssetError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [runId, setRunId] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);
  const [shareFeedback, setShareFeedback] = useState("");
  const [showEasterEggs, setShowEasterEggs] = useState(false);
  const [discoveredEggs, setDiscoveredEggs] = useState<EasterEggKey[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setPrefersReducedMotion(media.matches);
      setMotionReady(true);
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!motionReady || prefersReducedMotion) {
      return;
    }

    let cancelled = false;

    async function prepareAssets() {
      try {
        const entries = await Promise.all(
          Object.entries(ASSET_PATHS).map(async ([key, src]) => {
            const image = await loadImage(src);
            return [key, image] as const;
          }),
        );

        if (!cancelled) {
          setAssets(Object.fromEntries(entries) as LoadedAssets);
        }
      } catch {
        if (!cancelled) {
          setAssetError(true);
        }
      }
    }

    prepareAssets();

    return () => {
      cancelled = true;
    };
  }, [motionReady, prefersReducedMotion]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        inputRef.current.left = true;
        event.preventDefault();
      }

      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        inputRef.current.right = true;
        event.preventDefault();
      }

      if (event.key === " " || event.key === "ArrowUp") {
        inputRef.current.jumpPressed = true;
        event.preventDefault();
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        inputRef.current.left = false;
      }

      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        inputRef.current.right = false;
      }
    }

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!assets || prefersReducedMotion || !gameStarted || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const ctx = context;
    const loadedAssets = assets;

    let animationFrame = 0;
    let lastTime = performance.now();
    let hudTime = 0;
    let obstacleId = 0;
    let collectId = 0;
    let obstacleTimer = 0;
    let collectTimer = 0;
    const discovered = new Set<EasterEggKey>();

    const player: PlayerState = {
      x: 142,
      y: GROUND_Y - 94,
      w: 84,
      h: 96,
      vx: 0,
      vy: 0,
      onGround: true,
      facing: 1,
    };

    let status: GameStatus = "playing";
    let distance = 0;
    let timeLeft = 90;
    let relatos = 0;
    let provas = 0;
    let memoria = 0;
    let apoio = 0;
    let obstaclesDodged = 0;
    let obstacles: ObstacleState[] = [];
    let collectables: CollectState[] = [];
    obstacleTimer = INITIAL_OBSTACLE_DELAY;
    collectTimer = INITIAL_COLLECT_DELAY;

    setSnapshot(INITIAL_SNAPSHOT);
    setDiscoveredEggs([]);
    setShareFeedback("");

    function publishSnapshot() {
      const total = relatos + provas + memoria + apoio;
      const progress = clamp(distance / TARGET_DISTANCE * 0.72 + total / 26 * 0.28, 0, 1);

      setSnapshot({
        status,
        relatos,
        provas,
        memoria,
        apoio,
        total,
        obstaclesDodged,
        progress,
        distance,
        timeLeft,
        cityLabel: getCityLabel(progress),
        easterEggsFound: discovered.size,
      });

      setDiscoveredEggs(Array.from(discovered));
    }

    function drawLoopingLayer(
      image: HTMLImageElement,
      factor: number,
      opacity = 1,
      yOffset = 0,
      wobble = 0,
    ) {
      const offset = -((distance * factor) % GAME_WIDTH);
      ctx.save();
      ctx.globalAlpha = opacity;
      for (let index = -1; index <= 1; index += 1) {
        const x = offset + index * GAME_WIDTH;
        const y = yOffset + (wobble ? Math.sin((distance * factor + x) * 0.002) * wobble : 0);
        ctx.drawImage(image, x, y, GAME_WIDTH, GAME_HEIGHT);
      }
      ctx.restore();
    }

    function drawGraffitiText(text: string, x: number, y: number, color: string, scale = 1) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.04);
      ctx.fillStyle = "rgba(0,0,0,0.34)";
      ctx.fillRect(-8, -14, text.length * 7 * scale + 16, 22 * scale);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.strokeRect(-8, -14, text.length * 7 * scale + 16, 22 * scale);
      ctx.fillStyle = color;
      ctx.font = `700 ${11 * scale}px Oswald, sans-serif`;
      ctx.fillText(text.toUpperCase(), 0, 0);
      ctx.restore();
    }

    function drawBackground(progress: number) {
      drawLoopingLayer(loadedAssets.sky, 0, 1);
      drawLoopingLayer(loadedAssets.serras, 0.08, 0.95);
      drawLoopingLayer(loadedAssets.river, 0.17, 0.9, 0, 2);
      drawLoopingLayer(loadedAssets.industrial, 0.24, 0.96);

      ctx.save();
      ctx.globalAlpha = clamp(progress * 0.82, 0, 0.82);
      ctx.drawImage(loadedAssets.finishCity, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.restore();

      drawLoopingLayer(loadedAssets.concrete, 0.36, 1);

      ctx.fillStyle = "rgba(255, 209, 0, 0.08)";
      ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

      for (let i = 0; i < 4; i += 1) {
        const stripeX = ((distance * 0.2) + i * 280) % (GAME_WIDTH + 220) - 220;
        ctx.fillStyle = "rgba(255, 209, 0, 0.18)";
        ctx.fillRect(stripeX, GROUND_Y + 50, 120, 10);
      }

      EASTER_EGGS.forEach((egg) => {
        const screenX = egg.worldX - distance + 160;
        if (screenX < -180 || screenX > GAME_WIDTH + 180) {
          return;
        }

        ctx.save();
        ctx.globalAlpha = discovered.has(egg.key) ? 0.44 : 0.92;
        drawGraffitiText(egg.label, screenX, getEggY(egg.lane), egg.color, egg.lane === "sky" ? 0.9 : 1);
        if (egg.lane === "river" && !discovered.has(egg.key)) {
          ctx.strokeStyle = "rgba(217,240,138,0.7)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(screenX - 18, getEggY(egg.lane) - 8, 12, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    function drawPlayer(now: number) {
      const currentSprite = !player.onGround
        ? loadedAssets.playerJump
        : Math.abs(player.vx) > 45
          ? loadedAssets.playerRun
          : loadedAssets.playerIdle;
      const bob = player.onGround && Math.abs(player.vx) > 45 ? Math.sin(now * 0.018) * 3 : 0;
      const tilt = !player.onGround ? clamp(player.vy / 900, -0.16, 0.18) : 0;

      ctx.save();
      ctx.translate(player.x + player.w / 2, player.y + player.h / 2 + bob);
      ctx.scale(player.facing, 1);
      ctx.rotate(player.facing * tilt);
      ctx.drawImage(currentSprite, -player.w / 2, -player.h / 2, player.w, player.h);
      ctx.restore();
    }

    function drawObstacle(obstacle: ObstacleState) {
      const assetKey =
        obstacle.type === "processinho"
          ? "processinho"
          : obstacle.type === "muralha"
            ? "muralha"
            : "carimbo";

      ctx.drawImage(loadedAssets[assetKey], obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    }

    function drawCollectable(item: CollectState, elapsed: number) {
      const bobY = Math.sin(elapsed * 0.004 + item.bob) * 6;
      const glow =
        item.type === "relato" ? "rgba(255,209,0,0.15)"
          : item.type === "prova" ? "rgba(241,238,229,0.16)"
            : item.type === "memoria" ? "rgba(255,209,0,0.1)"
              : "rgba(192,57,43,0.14)";

      ctx.save();
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.ellipse(item.x + item.w / 2, item.y + item.h / 2 + bobY, 20, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(loadedAssets[item.type], item.x, item.y + bobY, item.w, item.h);
      ctx.restore();
    }

    function drawStatus(progress: number) {
      ctx.fillStyle = "rgba(7, 7, 9, 0.5)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      if (status === "won") {
        ctx.fillStyle = "rgba(223, 242, 109, 0.12)";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }

      ctx.fillStyle = "#f2f2f2";
      ctx.font = "700 28px Oswald, sans-serif";
      ctx.textAlign = "center";

      if (status === "won") {
        ctx.fillText("Cidade em reorganização", GAME_WIDTH / 2, 104);
        ctx.font = "500 17px Inter, sans-serif";
        ctx.fillText("Você reuniu relatos e ajudou a organizar uma cidade melhor.", GAME_WIDTH / 2, 136);
      } else {
        ctx.fillText("A burocracia travou o trajeto", GAME_WIDTH / 2, 104);
        ctx.font = "500 17px Inter, sans-serif";
        ctx.fillText("Recomece a missão, junte mais escuta e faça a cidade responder.", GAME_WIDTH / 2, 136);
      }

      ctx.fillStyle = "#ffd100";
      ctx.font = "600 18px Oswald, sans-serif";
      ctx.fillText(SITE_IDENTITY.fullLabel, GAME_WIDTH / 2, 178);

      ctx.fillStyle = "#f2f2f2";
      ctx.font = "500 15px Inter, sans-serif";
      ctx.fillText(SITE_IDENTITY.appFullLabel, GAME_WIDTH / 2, 202);

      ctx.strokeStyle = "rgba(255,209,0,0.32)";
      ctx.strokeRect(GAME_WIDTH / 2 - 168, 234, 336, 102);
      ctx.textAlign = "left";
      ctx.font = "600 16px Inter, sans-serif";
      ctx.fillText(`Relatos reunidos: ${relatos + provas + memoria + apoio}`, GAME_WIDTH / 2 - 142, 268);
      ctx.fillText(`Cidade: ${getCityLabel(progress)}`, GAME_WIDTH / 2 - 142, 295);
      ctx.fillText(`Easter eggs: ${discovered.size}/6`, GAME_WIDTH / 2 - 142, 322);
    }

    function frame(now: number) {
      const deltaMs = now - lastTime;
      lastTime = now;
      const delta = Math.min(deltaMs / 1000, 0.032);
      hudTime += deltaMs;

      if (status === "playing") {
        const direction = (inputRef.current.right ? 1 : 0) - (inputRef.current.left ? 1 : 0);
        const targetVx = direction * PLAYER_MOVE_SPEED;
        player.vx += (targetVx - player.vx) * Math.min(1, delta * 12);

        if (direction !== 0) {
          player.facing = direction > 0 ? 1 : -1;
        }

        if (inputRef.current.jumpPressed && player.onGround) {
          player.vy = -615;
          player.onGround = false;
        }

        inputRef.current.jumpPressed = false;

        player.vy += GRAVITY * delta;
        player.x = clamp(player.x + player.vx * delta, 48, GAME_WIDTH - player.w - 48);
        player.y += player.vy * delta;

        if (player.y + player.h >= GROUND_Y) {
          player.y = GROUND_Y - player.h;
          player.vy = 0;
          player.onGround = true;
        }

        const scrollSpeed = SCROLL_BASE + (inputRef.current.right ? 48 : 0) - (inputRef.current.left ? 28 : 0);
        distance = clamp(distance + scrollSpeed * delta, 0, TARGET_DISTANCE);
        timeLeft = Math.max(0, timeLeft - delta);

        obstacleTimer -= delta;
        collectTimer -= delta;

        if (distance < EARLY_GRACE_DISTANCE) {
          obstacleTimer = Math.max(obstacleTimer, 0.5);
        }

        if (obstacleTimer <= 0) {
          obstacleId += 1;
          obstacles.push(createObstacle(obstacleId));
          obstacleTimer = 1.55 + Math.random() * 0.8;
        }

        if (collectTimer <= 0) {
          const count = Math.random() > 0.62 ? 2 : 1;
          for (let index = 0; index < count; index += 1) {
            collectId += 1;
            const collectable = createCollectable(collectId);
            collectable.x += index * 58;
            collectables.push(collectable);
          }

          collectTimer = 0.62 + Math.random() * 0.72;
        }

        const nextObstacles = obstacles
          .map((obstacle) => ({
            ...obstacle,
            x: obstacle.x - scrollSpeed * delta,
          }));

        obstaclesDodged += nextObstacles.filter((obstacle) => obstacle.x + obstacle.w <= -20).length;
        obstacles = nextObstacles.filter((obstacle) => obstacle.x + obstacle.w > -20);

        collectables = collectables
          .map((item) => ({
            ...item,
            x: item.x - scrollSpeed * delta,
          }))
          .filter((item) => item.x + item.w > -20);

        const playerHitbox = {
          x: player.x + 10,
          y: player.y + 10,
          w: player.w - 20,
          h: player.h - 16,
        };

        for (const egg of EASTER_EGGS) {
          if (!discovered.has(egg.key) && distance >= egg.worldX - 160) {
            discovered.add(egg.key);
          }
        }

        for (const obstacle of obstacles) {
          const hitbox =
            obstacle.type === "processinho"
              ? { x: obstacle.x + 18, y: obstacle.y + 16, w: obstacle.w - 36, h: obstacle.h - 32 }
              : obstacle.type === "muralha"
                ? { x: obstacle.x + 18, y: obstacle.y + 18, w: obstacle.w - 36, h: obstacle.h - 34 }
                : { x: obstacle.x + 14, y: obstacle.y + 12, w: obstacle.w - 28, h: obstacle.h - 18 };

          if (intersects(playerHitbox, hitbox)) {
            status = "lost";
            break;
          }
        }

        collectables = collectables.filter((item) => {
          const hitbox = { x: item.x + 6, y: item.y + 6, w: item.w - 12, h: item.h - 12 };

          if (intersects(playerHitbox, hitbox)) {
            if (item.type === "relato") relatos += 1;
            if (item.type === "prova") provas += 1;
            if (item.type === "memoria") memoria += 1;
            if (item.type === "apoio") apoio += 1;
            return false;
          }

          return true;
        });

        if (distance >= TARGET_DISTANCE || timeLeft <= 0) {
          status = "won";
        }
      }

      const total = relatos + provas + memoria + apoio;
      const progress = clamp(distance / TARGET_DISTANCE * 0.72 + total / 26 * 0.28, 0, 1);

      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      drawBackground(progress);
      collectables.forEach((item) => drawCollectable(item, now));
      obstacles.forEach(drawObstacle);
      drawPlayer(now);

      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 2);
      ctx.lineTo(GAME_WIDTH, GROUND_Y + 2);
      ctx.stroke();

      if (status !== "playing") {
        drawStatus(progress);
      }

      if (hudTime >= HUD_INTERVAL) {
        hudTime = 0;
        publishSnapshot();
      }

      animationFrame = window.requestAnimationFrame(frame);
    }

    animationFrame = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [assets, prefersReducedMotion, gameStarted, runId]);

  const outcomeTitle = getOutcomeTitle(snapshot);
  const didWin = snapshot.status === "won";
  const finishTitle = didWin
    ? "Você reuniu relatos e ajudou a organizar uma cidade melhor."
    : "Você travou numa barreira, mas sua tentativa ainda ajuda a puxar mais gente para a missão.";
  const shareLead = didWin
    ? `Resultado · ${snapshot.total} relatos · ${snapshot.obstaclesDodged} obstáculos desviados · ${snapshot.easterEggsFound} easter eggs`
    : `Tentativa compartilhável · ${snapshot.total} relatos · ${snapshot.obstaclesDodged} obstáculos desviados · ${snapshot.easterEggsFound} easter eggs`;
  const shareButtonLabel = didWin ? "Compartilhar resultado" : "Compartilhar tentativa";
  const shareUrlAbsolute = toAbsoluteUrl(shareUrl);
  const shareMessage = buildGameShareMessage({
    link: shareUrlAbsolute,
    title: outcomeTitle,
    relatos: snapshot.total,
    obstaculos: snapshot.obstaclesDodged,
    easterEggs: snapshot.easterEggsFound,
  });

  async function copyShareLinkOnly() {
    const copied = await copyToClipboardSafe(shareUrlAbsolute);
    if (copied) {
      setShareFeedback("Link copiado.");
      return true;
    }

    return false;
  }

  async function handleShare() {
    trackEventIfAvailable("game_share_click", {
      surface: "native",
      relatos: snapshot.total,
      obstacles_dodged: snapshot.obstaclesDodged,
      easter_eggs: snapshot.easterEggsFound,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Missão ÉLuta: Corre da Burocracia",
          text: shareMessage,
          url: shareUrlAbsolute,
        });
        setShareFeedback("Resultado compartilhado.");
        return;
      } catch {
        // fallback below
      }
    }

    const copied = await copyToClipboardSafe(shareMessage);
    if (copied) {
      setShareFeedback("Mensagem copiada para compartilhar.");
      return;
    }

    if (await copyShareLinkOnly()) {
      return;
    }

    window.open(buildLaunchWhatsAppUrl({ text: shareMessage }), "_blank", "noopener,noreferrer");
    setShareFeedback("Compartilhamento aberto no WhatsApp.");
  }

  async function handleNetworkShare(network: "whatsapp" | "facebook" | "instagram" | "tiktok") {
    trackEventIfAvailable("game_share_click", {
      surface: network,
      relatos: snapshot.total,
      obstacles_dodged: snapshot.obstaclesDodged,
      easter_eggs: snapshot.easterEggsFound,
    });

    if (network === "whatsapp") {
      window.open(buildLaunchWhatsAppUrl({ text: shareMessage }), "_blank", "noopener,noreferrer");
      setShareFeedback("WhatsApp aberto com a mensagem pronta.");
      return;
    }

    if (network === "facebook") {
      window.open(buildFacebookShareUrl(shareUrlAbsolute), "_blank", "noopener,noreferrer");
      setShareFeedback("Facebook aberto com o link do jogo.");
      return;
    }

    const copiedText = await copyToClipboardSafe(shareMessage);
    if (copiedText) {
      setShareFeedback(
        network === "instagram"
          ? "Texto copiado para colar no Instagram."
          : "Texto copiado para colar no TikTok.",
      );
    } else if (await copyShareLinkOnly()) {
      setShareFeedback(
        network === "instagram"
          ? "Link copiado para compartilhar no Instagram."
          : "Link copiado para compartilhar no TikTok.",
      );
    }

    window.open(
      network === "instagram" ? getInstagramShareUrl() : getTikTokShareUrl(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function handleRestart() {
    finishTrackedRef.current = "";
    setRunId((value) => value + 1);
    setGameStarted(true);
    setShowEasterEggs(false);
  }

  function handleStartGame() {
    finishTrackedRef.current = "";
    setGameStarted(true);
    trackEventIfAvailable("game_start", { source: "overlay" });
  }

  function handleAppCtaClick(target: "app" | "mission" | "share3") {
    trackEventIfAvailable("game_app_cta_click", { target });
  }

  function handleButtonPress(action: keyof InputState, active: boolean) {
    if (action === "jumpPressed") {
      if (active) {
        inputRef.current.jumpPressed = true;
      }
      return;
    }

    inputRef.current[action] = active;
  }

  useEffect(() => {
    if (snapshot.status !== "playing") {
      const finishKey = `${snapshot.status}:${snapshot.total}:${snapshot.obstaclesDodged}:${snapshot.easterEggsFound}`;
      if (finishTrackedRef.current !== finishKey) {
        finishTrackedRef.current = finishKey;
        trackEventIfAvailable("game_finish", {
          result: snapshot.status,
          relatos: snapshot.total,
          obstacles_dodged: snapshot.obstaclesDodged,
          easter_eggs: snapshot.easterEggsFound,
        });
      }
    }
  }, [snapshot.status, snapshot.total, snapshot.obstaclesDodged, snapshot.easterEggsFound]);

  const staticShareText = shareMessage;
  const progressPercent = Math.round(snapshot.progress * 100);

  return (
    <section className="game-shell" aria-labelledby="game-shell-title">
      <h2 id="game-shell-title" className="sr-only">Mini-jogo Corre da Burocracia</h2>

      <div className="game-shell__header">
        <div>
          <p className="game-shell__badge">{SITE_IDENTITY.fullLabel}</p>
          <p className="game-shell__helper">
            {refId ? "Convite identificado na rota." : "Missão aberta para mobilização pública."}
          </p>
        </div>
        <div className="game-shell__header-actions">
          <button type="button" className="btn btn-secondary" onClick={handleRestart}>
            Reiniciar
          </button>
          <a href={exitUrl} className="btn btn-ghost">
            Sair
          </a>
        </div>
      </div>

      {motionReady && prefersReducedMotion ? (
        <div className="game-static">
          <div className="game-static__art" aria-hidden="true" />
          <div className="game-static__content">
            <p className="game-static__eyebrow">Movimento reduzido</p>
            <h3 className="game-static__title">Modo estático da missão relâmpago</h3>
            <p className="game-static__text">
              Seu dispositivo prefere menos movimento. Em vez da corrida animada, mostramos a cidade,
              os símbolos da missão e mantemos as ações públicas de compartilhar, entrar no app e
              receber a primeira missão.
            </p>
            <div className="game-static__eggs">
              {EASTER_EGGS.map((egg) => (
                <span key={egg.key}>{egg.label}</span>
              ))}
            </div>
            <div className="game-finish__actions">
              <button type="button" className="btn btn-primary" onClick={handleShare}>
                Compartilhar resultado
              </button>
              <a href={appUrl} className="btn btn-secondary" onClick={() => handleAppCtaClick("app")}>Entrar no app</a>
              <a href={missionUrl} className="btn btn-ghost" onClick={() => handleAppCtaClick("mission")}>Receber primeira missão</a>
            </div>
            <div className="game-social-actions">
              <button type="button" className="btn btn-ghost" onClick={() => handleNetworkShare("whatsapp")}>WhatsApp</button>
              <button type="button" className="btn btn-ghost" onClick={() => handleNetworkShare("facebook")}>Facebook</button>
              <button type="button" className="btn btn-ghost" onClick={() => handleNetworkShare("instagram")}>Instagram</button>
              <button type="button" className="btn btn-ghost" onClick={() => handleNetworkShare("tiktok")}>TikTok</button>
            </div>
            <p className="game-share-feedback">{shareFeedback || staticShareText}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="game-stage">
            <div className="game-hud" aria-live="polite">
              <div className="game-hud__primary">
                <div className="game-chip">
                  <span className="game-chip__label">Relatos</span>
                  <strong>{snapshot.total}</strong>
                </div>
                <div className="game-chip">
                  <span className="game-chip__label">Cidade</span>
                  <strong>{snapshot.cityLabel}</strong>
                </div>
                <div className="game-chip">
                  <span className="game-chip__label">Distância</span>
                  <strong>{Math.round(snapshot.distance)} m</strong>
                </div>
                <div className="game-chip">
                  <span className="game-chip__label">Easter eggs</span>
                  <strong>{snapshot.easterEggsFound}/6</strong>
                </div>
              </div>

              <div className="game-hud__progress">
                <div className="game-progress" aria-hidden="true">
                  <span style={{ width: `${snapshot.progress * 100}%` }} />
                </div>
                <p className="game-progress__text">
                  Barra de progresso da cidade · {progressPercent}% · {Math.ceil(snapshot.timeLeft)}s
                </p>
              </div>
            </div>

            {assetError ? (
              <div className="game-stage__error">
                <p>Os assets do jogo não carregaram corretamente.</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                className="game-canvas"
                width={GAME_WIDTH}
                height={GAME_HEIGHT}
                aria-label="Jogo de plataforma 2D em canvas"
              />
            )}

            {!gameStarted && (
              <div className="game-overlay">
                <div className="game-overlay__panel">
                  <p className="game-overlay__eyebrow">VR Abandonada</p>
                  <h3 className="game-overlay__title">Junte escuta, memória e apoio popular.</h3>
                  <p className="game-overlay__text">
                    Corra por uma cidade industrial travada, desvie do Processinho Voador, do Carimbo
                    da Burocracia e da Muralha do Silêncio. No caminho, encontre sinais escondidos de
                    memória urbana.
                  </p>
                  <div className="game-overlay__tags">
                    <span>Preto • Amarelo • Ferrugem</span>
                    <span>Stencil • Grafite • Concreto</span>
                    <span>Volta Redonda como clima, não como logo</span>
                  </div>
                  <button type="button" className="btn btn-primary btn-lg" onClick={handleStartGame}>
                    Começar missão
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="game-instructions">
            <p>
              PC: esquerda/direita ou A/D para mover, espaço para pular. Mobile: use os botões fixos abaixo.
            </p>
          </div>

          <div className="game-toolbar">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowEasterEggs((value) => !value)}
            >
              Ver easter eggs encontrados
            </button>
            <span className="game-toolbar__count">{discoveredEggs.length} de {EASTER_EGGS.length} vistos</span>
          </div>

          {showEasterEggs && (
            <div className="game-eggs-panel">
              {EASTER_EGGS.map((egg) => {
                const found = discoveredEggs.includes(egg.key);
                return (
                  <div
                    key={egg.key}
                    className={`game-eggs-panel__item${found ? " game-eggs-panel__item--found" : ""}`}
                  >
                    <strong>{egg.label}</strong>
                    <span>{found ? "Encontrado nesta corrida" : "Ainda não apareceu para você"}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="game-controls" aria-label="Controles mobile">
            <button
              type="button"
              className="game-controls__btn"
              onPointerDown={() => handleButtonPress("left", true)}
              onPointerUp={() => handleButtonPress("left", false)}
              onPointerCancel={() => handleButtonPress("left", false)}
              onPointerLeave={() => handleButtonPress("left", false)}
            >
              ←
            </button>
            <button
              type="button"
              className="game-controls__btn"
              onPointerDown={() => handleButtonPress("right", true)}
              onPointerUp={() => handleButtonPress("right", false)}
              onPointerCancel={() => handleButtonPress("right", false)}
              onPointerLeave={() => handleButtonPress("right", false)}
            >
              →
            </button>
            <button
              type="button"
              className="game-controls__btn game-controls__btn--jump"
              onPointerDown={() => handleButtonPress("jumpPressed", true)}
              onPointerUp={() => handleButtonPress("jumpPressed", false)}
              onPointerCancel={() => handleButtonPress("jumpPressed", false)}
              onPointerLeave={() => handleButtonPress("jumpPressed", false)}
            >
              Pular
            </button>
          </div>

          {snapshot.status !== "playing" && (
            <div className="game-finish">
              <div className="game-finish__panel">
                <p className="game-finish__eyebrow">{outcomeTitle}</p>
                <h3 className="game-finish__title">{finishTitle}</h3>
                <p className="game-finish__text">{SITE_IDENTITY.fullLabel}</p>
                <p className="game-finish__text">{SITE_IDENTITY.appFullLabel}</p>

                <div className="game-share-card" aria-label="Card visual compartilhável do resultado">
                  <p className="game-share-card__eyebrow">
                    {didWin ? "Eu joguei a Missão Relâmpago" : "Eu joguei a Missão Relâmpago e quero puxar mais gente"}
                  </p>
                  <h4 className="game-share-card__title">{outcomeTitle}</h4>
                  <p className="game-share-card__meta">Pré-campanha Alexandre VR Abandonada</p>
                  <p className="game-share-card__meta">Missão ÉLuta — Escutar • Cuidar • Organizar</p>
                  <p className="game-share-card__lead">{shareLead}</p>
                  <div className="game-share-card__grid">
                    <span>Relatos coletados {snapshot.total}</span>
                    <span>Obstáculos desviados {snapshot.obstaclesDodged}</span>
                    <span>Easter eggs {snapshot.easterEggsFound}</span>
                    <span>Cidade em progresso {progressPercent}%</span>
                  </div>
                  <p className="game-share-card__footer">
                    {shareUrlAbsolute}
                  </p>
                </div>

                <div className="game-finish__stats">
                  <span>Relatos coletados: {snapshot.total}</span>
                  <span>Obstáculos desviados: {snapshot.obstaclesDodged}</span>
                  <span>Easter eggs: {snapshot.easterEggsFound}/6</span>
                </div>
                <div className="game-finish__actions">
                  <button type="button" className="btn btn-primary" onClick={handleShare}>{shareButtonLabel}</button>
                  <a href={appUrl} className="btn btn-secondary" onClick={() => handleAppCtaClick("app")}>Entrar no app</a>
                  <a href={signupUrl} className="btn btn-ghost" onClick={() => handleAppCtaClick("mission")}>Receber primeira missão</a>
                  <button type="button" className="btn btn-ghost" onClick={() => { handleAppCtaClick("share3"); void handleNetworkShare("whatsapp"); }}>
                    Compartilhar com 3 pessoas
                  </button>
                </div>
                <div className="game-social-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => handleNetworkShare("whatsapp")}>WhatsApp</button>
                  <button type="button" className="btn btn-ghost" onClick={() => handleNetworkShare("facebook")}>Facebook</button>
                  <button type="button" className="btn btn-ghost" onClick={() => handleNetworkShare("instagram")}>Instagram</button>
                  <button type="button" className="btn btn-ghost" onClick={() => handleNetworkShare("tiktok")}>TikTok</button>
                </div>
                <div className="game-finish__subactions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEasterEggs((value) => !value)}>
                    Ver easter eggs encontrados
                  </button>
                  <button type="button" className="btn btn-ghost game-finish__restart" onClick={handleRestart}>
                    Jogar de novo
                  </button>
                </div>
                <p className="game-share-feedback">{shareFeedback}</p>
              </div>
            </div>
          )}
        </>
      )}

      <style>{css}</style>
    </section>
  );
}

const css = `
.game-shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  padding: 1rem;
  border-radius: 28px;
  border: 1px solid rgba(255, 209, 0, 0.22);
  background:
    linear-gradient(160deg, rgba(255,209,0,0.06), rgba(255,255,255,0.015)),
    rgba(10, 10, 13, 0.94);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.34),
    inset 0 0 0 1px rgba(255,255,255,0.03);
  touch-action: none;
  overscroll-behavior: contain;
  -webkit-user-select: none;
  user-select: none;
}
.game-shell__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
}
.game-shell__badge {
  margin: 0;
  color: var(--yellow);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
}
.game-shell__helper {
  margin: 0.35rem 0 0;
  color: var(--muted);
  font-size: 0.88rem;
}
.game-shell__header-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.game-stage {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.08);
  background: #090a0d;
  touch-action: none;
}
.game-stage__error {
  min-height: 360px;
  display: grid;
  place-items: center;
  padding: 1rem;
  color: var(--muted);
}
.game-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  background: #090a0d;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
.game-hud {
  position: absolute;
  inset: 0 0 auto;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.8rem;
  pointer-events: none;
}
.game-hud__primary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6rem;
}
.game-chip {
  min-width: 0;
  padding: 0.65rem 0.75rem;
  border-radius: 14px;
  background: rgba(11, 11, 14, 0.72);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
}
.game-chip__label {
  display: block;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(242,242,242,0.68);
}
.game-chip strong {
  display: block;
  overflow-wrap: anywhere;
  font-family: var(--font-head);
  font-size: 1rem;
  line-height: 1.1;
  color: var(--yellow);
}
.game-hud__progress {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.game-progress {
  overflow: hidden;
  height: 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.08);
}
.game-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffd100, #dff26d);
}
.game-progress__text {
  margin: 0;
  font-size: 0.74rem;
  color: rgba(242,242,242,0.78);
  text-shadow: 0 1px 0 rgba(0,0,0,0.4);
}
.game-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  padding: 1rem;
  background:
    radial-gradient(circle at 15% 18%, rgba(255,209,0,0.16), transparent 26%),
    linear-gradient(180deg, rgba(5,5,8,0.32), rgba(5,5,8,0.72));
  backdrop-filter: blur(1px);
}
.game-overlay__panel {
  width: min(100%, 620px);
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255,209,0,0.26);
  background:
    linear-gradient(145deg, rgba(20,20,24,0.92), rgba(10,10,13,0.92));
  box-shadow: 0 16px 44px rgba(0,0,0,0.36);
}
.game-overlay__eyebrow {
  margin: 0 0 0.7rem;
  color: var(--yellow);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
.game-overlay__title {
  margin: 0 0 0.9rem;
  font-family: var(--font-head);
  font-size: clamp(2rem, 5vw, 3.2rem);
  line-height: 0.95;
}
.game-overlay__text {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}
.game-overlay__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 1rem 0 1.35rem;
}
.game-overlay__tags span {
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  font-size: 0.8rem;
  color: rgba(242,242,242,0.78);
}
.game-instructions {
  color: var(--muted);
  font-size: 0.88rem;
}
.game-instructions p {
  margin: 0;
}
.game-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}
.game-toolbar__count {
  font-size: 0.84rem;
  color: rgba(242,242,242,0.74);
}
.game-eggs-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.game-eggs-panel__item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
}
.game-eggs-panel__item strong {
  font-family: var(--font-head);
  font-size: 1rem;
  color: rgba(242,242,242,0.92);
}
.game-eggs-panel__item span {
  color: var(--muted);
  font-size: 0.82rem;
}
.game-eggs-panel__item--found {
  border-color: rgba(255,209,0,0.28);
  background: linear-gradient(135deg, rgba(255,209,0,0.08), rgba(255,255,255,0.02));
}
.game-controls {
  position: sticky;
  bottom: calc(0.5rem + env(safe-area-inset-bottom));
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.2rem 0 calc(env(safe-area-inset-bottom) + 0.15rem);
  touch-action: none;
}
.game-controls__btn {
  min-height: 64px;
  border: 1px solid rgba(255,209,0,0.22);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,209,0,0.16), rgba(255,209,0,0.05));
  color: var(--text);
  font-size: 1.3rem;
  font-weight: 700;
  -webkit-tap-highlight-color: transparent;
}
.game-controls__btn--jump {
  background: linear-gradient(180deg, rgba(192,57,43,0.3), rgba(192,57,43,0.14));
}
.game-finish {
  display: flex;
  justify-content: center;
}
.game-finish__panel,
.game-static {
  border-radius: 22px;
  border: 1px solid rgba(255,209,0,0.24);
  background: rgba(17, 18, 24, 0.92);
}
.game-finish__panel {
  width: min(100%, 760px);
  padding: 1.35rem;
}
.game-finish__eyebrow,
.game-static__eyebrow {
  margin: 0 0 0.65rem;
  color: var(--yellow);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 700;
}
.game-finish__title,
.game-static__title {
  margin: 0 0 0.9rem;
  font-family: var(--font-head);
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  line-height: 1.1;
}
.game-finish__text,
.game-static__text {
  margin: 0.2rem 0;
  color: var(--muted);
}
.game-share-card {
  margin: 1.2rem 0 1rem;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid rgba(255,209,0,0.24);
  background:
    radial-gradient(circle at 84% 22%, rgba(192,57,43,0.18), transparent 28%),
    linear-gradient(145deg, rgba(255,209,0,0.08), rgba(255,255,255,0.02)),
    rgba(9,10,12,0.9);
}
.game-share-card__eyebrow {
  margin: 0 0 0.45rem;
  color: var(--yellow);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}
.game-share-card__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(1.5rem, 4vw, 2rem);
}
.game-share-card__meta {
  margin: 0.18rem 0 0;
  color: rgba(242,242,242,0.84);
  font-size: 0.84rem;
}
.game-share-card__lead {
  margin: 0.4rem 0 0;
  color: rgba(242,242,242,0.84);
}
.game-share-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 1rem 0 0.8rem;
}
.game-share-card__grid span {
  padding: 0.55rem 0.65rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 0.84rem;
}
.game-share-card__footer {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(242,242,242,0.74);
  overflow-wrap: anywhere;
  word-break: break-word;
}
.game-finish__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1rem 0 1.1rem;
}
.game-finish__stats span {
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 0.84rem;
}
.game-finish__actions,
.game-social-actions,
.game-finish__subactions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}
.game-social-actions {
  margin-top: 0.7rem;
}
.game-finish__subactions {
  margin-top: 0.7rem;
}
.game-finish__restart {
  margin-top: 0;
}
.game-share-feedback {
  margin: 0.8rem 0 0;
  color: rgba(242,242,242,0.74);
  font-size: 0.83rem;
  line-height: 1.5;
  white-space: pre-line;
}
.game-static {
  display: grid;
  grid-template-columns: minmax(220px, 0.9fr) minmax(0, 1.1fr);
  overflow: hidden;
}
.game-static__art {
  min-height: 320px;
  background:
    linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.45)),
    url("/game/finish-city.svg") center / cover no-repeat;
}
.game-static__content {
  padding: 1.4rem;
}
.game-static__eggs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0 1.2rem;
}
.game-static__eggs span {
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  font-size: 0.8rem;
}
@media (max-width: 860px) {
  .game-hud__primary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .game-eggs-panel {
    grid-template-columns: 1fr;
  }
  .game-static {
    grid-template-columns: 1fr;
  }
  .game-static__art {
    min-height: 220px;
  }
}
@media (max-width: 640px) {
  .game-shell {
    padding: 0.8rem;
    border-radius: 20px;
  }
  .game-overlay__panel {
    padding: 1.1rem;
  }
  .game-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .game-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .game-controls__btn--jump {
    grid-column: 1 / -1;
  }
  .game-shell {
    touch-action: none;
  }
  .game-finish__actions,
  .game-social-actions,
  .game-finish__subactions,
  .game-shell__header-actions {
    flex-direction: column;
  }
  .game-finish__actions .btn,
  .game-social-actions .btn,
  .game-finish__subactions .btn,
  .game-shell__header-actions .btn,
  .game-shell__header-actions a,
  .game-toolbar .btn {
    width: 100%;
    justify-content: center;
  }
  .game-share-card__grid {
    grid-template-columns: 1fr;
  }
}
`;
