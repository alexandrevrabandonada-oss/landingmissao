"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { SITE_IDENTITY } from "@/src/content/siteIdentity";
import {
  buildFacebookShareUrl,
  buildLaunchWhatsAppUrl,
  buildRunnerShareMessage,
  copyToClipboardSafe,
  getInstagramShareUrl,
  getTikTokShareUrl,
} from "@/src/lib/shareLaunch";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";

const GAME_WIDTH = 540;
const GAME_HEIGHT = 960;
const HORIZON_Y = 214;
const ROAD_BOTTOM_Y = 846;
const PLAYER_BASE_Y = 778;
const TARGET_DISTANCE = 4300;
const START_TIME = 68;
const HUD_INTERVAL = 120;
const SWIPE_THRESHOLD = 48;
const SWIPE_DOMINANCE_RATIO = 1.2;
const SWIPE_MIN_DURATION = 36;
const SWIPE_MAX_DURATION = 540;
const TAP_FORGIVENESS = 16;
const EASTER_EGG_COUNT = 7;
const SAFE_START_DISTANCE = 620;
const SAFE_START_TIME = 7.5;

const ASSET_PATHS = {
  player: "/game-runner/player-runner.svg",
  road: "/game-runner/lane-road.svg",
  background: "/game-runner/bg-vr-rua.svg",
  processinho: "/game-runner/obstacle-processinho.svg",
  carimbo: "/game-runner/obstacle-carimbo.svg",
  buraco: "/game-runner/obstacle-buraco.svg",
  muralha: "/game-runner/obstacle-muralha.svg",
  ninguemEscuta: "/game-runner/obstacle-ninguem-escuta.svg",
  relato: "/game-runner/collect-relato.svg",
  prova: "/game-runner/collect-prova.svg",
  memoria: "/game-runner/collect-memoria.svg",
  apoio: "/game-runner/collect-apoio.svg",
  megafone: "/game-runner/power-megafone.svg",
  arquivo: "/game-runner/power-arquivo.svg",
  respira: "/game-runner/power-respira.svg",
} as const;

const EASTER_EGGS = [
  { key: "baciao", label: "Bacião Skate Vive", distance: 540, lane: 0, color: "#ffd100" },
  { key: "vr", label: "VR Não Esquece", distance: 1120, lane: 2, color: "#f4f1e4" },
  { key: "recibo", label: "Recibo é lei", distance: 1660, lane: 1, color: "#ffd100" },
  { key: "capivara", label: "Capivara ECO", distance: 2240, lane: 2, color: "#dff26d" },
  { key: "po", label: "Pó preto não é paisagem", distance: 2840, lane: 0, color: "#d34f34" },
  { key: "arquivo", label: "Arquivo Vivo", distance: 3380, lane: 1, color: "#f4f1e4" },
  { key: "escutar", label: "Escutar • Cuidar • Organizar", distance: 3900, lane: 2, color: "#ffd100" },
] as const;

type AssetKey = keyof typeof ASSET_PATHS;
type LoadedAssets = Record<AssetKey, HTMLImageElement>;
type GameStatus = "intro" | "playing" | "won" | "lost";
type ActionType = "left" | "right" | "jump" | "duck";
type CollectType = "relato" | "prova" | "memoria" | "apoio";
type ObstacleType = "processinho" | "carimbo" | "buraco" | "muralha" | "placa";
type PowerType = "megafone" | "arquivo" | "respira";
type EggKey = (typeof EASTER_EGGS)[number]["key"];

type PlayerState = {
  lane: number;
  laneFloat: number;
  targetLane: number;
  jumpVelocity: number;
  jumpOffset: number;
  duckTimer: number;
  shield: number;
};

type WorldEntity<T> = {
  id: number;
  type: T;
  lane: number;
  depth: number;
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
  easterEggsFound: number;
};

type DebugSnapshot = {
  fps: number;
  lane: number;
  stateLabel: string;
  speed: number;
  elapsed: number;
  lastGesture: string;
  distance: number;
  obstaclesGenerated: number;
  collisions: number;
  defeatReason: string;
  usedSwipe: boolean;
  usedButtons: boolean;
};

const INITIAL_SNAPSHOT: Snapshot = {
  status: "intro",
  relatos: 0,
  provas: 0,
  memoria: 0,
  apoio: 0,
  total: 0,
  obstaclesDodged: 0,
  progress: 0,
  distance: 0,
  timeLeft: START_TIME,
  easterEggsFound: 0,
};

const INITIAL_DEBUG_SNAPSHOT: DebugSnapshot = {
  fps: 0,
  lane: 2,
  stateLabel: "correndo",
  speed: 0,
  elapsed: 0,
  lastGesture: "nenhum",
  distance: 0,
  obstaclesGenerated: 0,
  collisions: 0,
  defeatReason: "",
  usedSwipe: false,
  usedButtons: false,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

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

function getLaneCenter(lane: number, depth: number) {
  const normalizedDepth = clamp(depth, 0, 1.12);
  const spread = lerp(58, 166, normalizedDepth);
  return GAME_WIDTH / 2 + (lane - 1) * spread;
}

function getProjectedY(depth: number) {
  const normalizedDepth = clamp(depth, 0, 1.12);
  return lerp(HORIZON_Y, PLAYER_BASE_Y, normalizedDepth ** 1.18);
}

function getProjectedScale(depth: number) {
  const normalizedDepth = clamp(depth, 0, 1.12);
  return 0.28 + normalizedDepth * 0.9;
}

function getOutcomeTitle(snapshot: Snapshot) {
  if (snapshot.easterEggsFound >= 5) {
    return "Guardião da Memória";
  }

  if (snapshot.obstaclesDodged >= 18) {
    return "Contra a Burocracia";
  }

  if (snapshot.total >= 16) {
    return "Escutador do Território";
  }

  return "Cidade em Movimento";
}

function getRoadLabel(progress: number) {
  if (progress >= 1) {
    return "Cidade em movimento";
  }

  if (progress >= 0.72) {
    return "Rua em resposta";
  }

  if (progress >= 0.4) {
    return "Escuta ganhando corpo";
  }

  return "Rua travada";
}

function getObstacleSpec(type: ObstacleType) {
  switch (type) {
    case "processinho":
      return { width: 86, height: 54, avoid: "duck" as const };
    case "carimbo":
      return { width: 90, height: 82, avoid: "jump" as const };
    case "buraco":
      return { width: 98, height: 44, avoid: "jump" as const };
    case "placa":
      return { width: 92, height: 106, avoid: "duck" as const };
    default:
      return { width: 90, height: 118, avoid: "lane" as const };
  }
}

function getPowerDuration(type: PowerType) {
  if (type === "megafone") {
    return 7.5;
  }

  if (type === "arquivo") {
    return 8;
  }

  return 1;
}

function createCollectable(id: number): WorldEntity<CollectType> {
  const types: CollectType[] = ["relato", "prova", "memoria", "apoio"];
  return {
    id,
    type: types[Math.floor(Math.random() * types.length)],
    lane: Math.floor(Math.random() * 3),
    depth: 0.08,
    bob: Math.random() * Math.PI * 2,
  };
}

function createPowerUp(id: number): WorldEntity<PowerType> {
  const types: PowerType[] = ["megafone", "arquivo", "respira"];
  return {
    id,
    type: types[Math.floor(Math.random() * types.length)],
    lane: Math.floor(Math.random() * 3),
    depth: 0.1,
    bob: Math.random() * Math.PI * 2,
  };
}

function createObstacle(id: number, progress: number): WorldEntity<ObstacleType> {
  const pool: ObstacleType[] =
    progress < 0.2
      ? ["carimbo", "buraco"]
      : progress < 0.55
        ? ["carimbo", "buraco", "processinho", "placa"]
        : ["carimbo", "buraco", "processinho", "muralha", "placa"];

  return {
    id,
    type: pool[Math.floor(Math.random() * pool.length)],
    lane: Math.floor(Math.random() * 3),
    depth: 0.08,
    bob: Math.random() * Math.PI * 2,
  };
}

function pickSafeObstacle(
  id: number,
  progress: number,
  recentObstacles: Array<WorldEntity<ObstacleType>>,
  elapsed: number,
) {
  const recentFront = recentObstacles
    .filter((item) => item.depth < 0.42)
    .slice(-2);
  let candidate = createObstacle(id, progress);
  let attempts = 0;

  while (attempts < 12) {
    const duplicatesLane = recentFront.some((item) => item.lane === candidate.lane);
    const earlyPunish =
      elapsed < 18 &&
      recentFront.some((item) => {
        const isJumpDuckCombo =
          (item.type === "processinho" && candidate.type === "carimbo") ||
          (item.type === "carimbo" && candidate.type === "processinho") ||
          (item.type === "placa" && candidate.type === "carimbo");
        return isJumpDuckCombo;
      });

    if (!(duplicatesLane && progress < 0.48) && !earlyPunish) {
      return candidate;
    }

    candidate = createObstacle(id, progress);
    attempts += 1;
  }

  return candidate;
}

type GameRuaExperienceProps = {
  refId: string;
  debug: boolean;
  playtest: boolean;
  shareUrl: string;
  appUrl: string;
  signupUrl: string;
  missionUrl: string;
  exitUrl: string;
};

export default function GameRuaExperience({
  refId,
  debug,
  playtest,
  shareUrl,
  appUrl,
  missionUrl,
  exitUrl,
}: GameRuaExperienceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const finishRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number; pointerId: number } | null>(null);
  const pointerHandledRef = useRef(false);
  const actionQueueRef = useRef<ActionType[]>([]);
  const [assets, setAssets] = useState<LoadedAssets | null>(null);
  const [assetError, setAssetError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [runId, setRunId] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);
  const [shareFeedback, setShareFeedback] = useState("");
  const [showEasterEggs, setShowEasterEggs] = useState(false);
  const [discoveredEggs, setDiscoveredEggs] = useState<EggKey[]>([]);
  const [debugSnapshot, setDebugSnapshot] = useState(INITIAL_DEBUG_SNAPSHOT);

  const shareUrlAbsolute = useMemo(() => toAbsoluteUrl(shareUrl), [shareUrl]);
  const progressPercent = Math.round(snapshot.progress * 100);
  const outcomeTitle = getOutcomeTitle(snapshot);
  const didWin = snapshot.status === "won";
  const finishTitle = didWin ? "Rua em movimento" : "A rua ainda precisa de mais gente";
  const shareLead = didWin
    ? "Você transformou escuta em organização popular."
    : "A burocracia travou o trajeto, mas a escuta reunida já conta.";

  const shareMessage = useMemo(() => {
    return buildRunnerShareMessage({
      link: shareUrlAbsolute,
      title: outcomeTitle,
      relatos: snapshot.total,
      obstaculos: snapshot.obstaclesDodged,
      easterEggs: snapshot.easterEggsFound,
    });
  }, [outcomeTitle, shareUrlAbsolute, snapshot.easterEggsFound, snapshot.obstaclesDodged, snapshot.total]);

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

    void prepareAssets();

    return () => {
      cancelled = true;
    };
  }, [motionReady, prefersReducedMotion]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();

      if (event.key === "ArrowLeft" || key === "a") {
        actionQueueRef.current.push("left");
        event.preventDefault();
      }

      if (event.key === "ArrowRight" || key === "d") {
        actionQueueRef.current.push("right");
        event.preventDefault();
      }

      if (event.key === "ArrowUp" || event.key === " ") {
        actionQueueRef.current.push("jump");
        event.preventDefault();
      }

      if (event.key === "ArrowDown") {
        actionQueueRef.current.push("duck");
        event.preventDefault();
      }
    }

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (snapshot.status === "won" || snapshot.status === "lost") {
      finishRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [snapshot.status]);

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
    const player: PlayerState = {
      lane: 1,
      laneFloat: 1,
      targetLane: 1,
      jumpVelocity: 0,
      jumpOffset: 0,
      duckTimer: 0,
      shield: 0,
    };

    let animationFrame = 0;
    let lastTime = performance.now();
    let hudAccumulator = 0;
    let entityId = 0;
    let distance = 0;
    let timeLeft = START_TIME;
    let relatos = 0;
    let provas = 0;
    let memoria = 0;
    let apoio = 0;
    let obstaclesDodged = 0;
    let obstaclesGenerated = 0;
    let collisions = 0;
    let status: GameStatus = "playing";
    let magnetUntil = 0;
    let revealUntil = 0;
    let obstacleTimer = 1.6;
    let collectTimer = 0.75;
    let powerTimer = 7;
    let obstacles: Array<WorldEntity<ObstacleType>> = [];
    let collectables: Array<WorldEntity<CollectType>> = [];
    let powers: Array<WorldEntity<PowerType>> = [];
    const discovered = new Set<EggKey>();
    let lastGesture = "nenhum";
    let usedSwipe = false;
    let usedButtons = false;
    let defeatReason = "";

    setSnapshot({ ...INITIAL_SNAPSHOT, status: "playing", timeLeft: START_TIME });
    setDiscoveredEggs([]);
    setShowEasterEggs(false);
    setShareFeedback("");
    setDebugSnapshot(INITIAL_DEBUG_SNAPSHOT);

    function publishSnapshot(nextStatus = status) {
      const total = relatos + provas + memoria + apoio;
      const progress = clamp(distance / TARGET_DISTANCE, 0, 1);
      setSnapshot({
        status: nextStatus,
        relatos,
        provas,
        memoria,
        apoio,
        total,
        obstaclesDodged,
        progress,
        distance,
        timeLeft,
        easterEggsFound: discovered.size,
      });
      setDiscoveredEggs(Array.from(discovered));
    }

    function endGame(nextStatus: GameStatus) {
      if (status !== "playing") {
        return;
      }

      status = nextStatus;
      publishSnapshot(nextStatus);
      setDebugSnapshot((current) => ({
        ...current,
        defeatReason,
        collisions,
      }));
      trackEventIfAvailable("game_finish", {
        variant: "runner_rua",
        status: nextStatus,
        relatos: relatos + provas + memoria + apoio,
        obstacles_dodged: obstaclesDodged,
        easter_eggs: discovered.size,
      });
    }

    function drawBackground(progress: number) {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.drawImage(loadedAssets.background, 0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.save();
      ctx.globalAlpha = clamp(progress * 0.42, 0, 0.42);
      ctx.fillStyle = "#dff26d";
      ctx.fillRect(0, HORIZON_Y + 48, GAME_WIDTH, GAME_HEIGHT - HORIZON_Y - 48);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(162, HORIZON_Y);
      ctx.lineTo(378, HORIZON_Y);
      ctx.lineTo(500, ROAD_BOTTOM_Y);
      ctx.lineTo(40, ROAD_BOTTOM_Y);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(loadedAssets.road, 0, HORIZON_Y - 16, GAME_WIDTH, ROAD_BOTTOM_Y - HORIZON_Y + 40);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
      ctx.lineWidth = 3;
      for (let lane = 0; lane <= 2; lane += 1) {
        ctx.beginPath();
        const topX = lane === 0 ? 162 : lane === 1 ? 270 : 378;
        const bottomX = lane === 0 ? 40 : lane === 1 ? 270 : 500;
        ctx.moveTo(topX, HORIZON_Y);
        ctx.lineTo(bottomX, ROAD_BOTTOM_Y);
        ctx.stroke();
      }

      for (let marker = 0; marker < 8; marker += 1) {
        const t = ((distance * 0.005) + marker / 8) % 1;
        const y = lerp(HORIZON_Y + 32, ROAD_BOTTOM_Y - 36, t ** 1.15);
        const width = lerp(10, 52, t);
        const height = lerp(8, 16, t);
        ctx.fillStyle = "rgba(255, 209, 0, 0.36)";
        ctx.fillRect(GAME_WIDTH / 2 - width / 2, y, width, height);
      }
      ctx.restore();
    }

    function drawEasterEggSigns(progress: number) {
      const currentDistance = distance;
      EASTER_EGGS.forEach((egg) => {
        const delta = egg.distance - currentDistance;
        if (delta < -180 || delta > 880) {
          return;
        }

        const depth = clamp(0.18 + (880 - delta) / 880, 0, 1.02);
        const x = getLaneCenter(egg.lane, depth);
        const y = getProjectedY(depth) - 84;
        const scale = getProjectedScale(depth) * 0.82;
        const found = discovered.has(egg.key);

        ctx.save();
        ctx.globalAlpha = found ? 0.38 : revealUntil > 0 ? 0.95 : 0.8;
        ctx.translate(x, y);
        ctx.rotate(-0.05 + egg.lane * 0.03);
        ctx.fillStyle = "rgba(7, 8, 10, 0.74)";
        ctx.strokeStyle = found ? "rgba(255,255,255,0.18)" : egg.color;
        ctx.lineWidth = 2;
        ctx.fillRect(-56 * scale, -16 * scale, 112 * scale, 28 * scale);
        ctx.strokeRect(-56 * scale, -16 * scale, 112 * scale, 28 * scale);
        ctx.fillStyle = found ? "rgba(242,242,242,0.8)" : egg.color;
        ctx.font = `700 ${10 * scale}px Oswald, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(egg.label.toUpperCase(), 0, 4 * scale);
        ctx.restore();

        if (!found && currentDistance >= egg.distance) {
          if (revealUntil > 0 || Math.abs(egg.lane - player.lane) <= 1) {
            discovered.add(egg.key);
          }
        }
      });

      if (progress >= 1) {
        ctx.save();
        ctx.globalAlpha = 0.62;
        ctx.fillStyle = "#dff26d";
        ctx.font = "700 18px Oswald, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("CIDADE MAIS ORGANIZADA", GAME_WIDTH / 2, 176);
        ctx.restore();
      }
    }

    function drawEntity<T extends string>(
      entity: WorldEntity<T>,
      asset: HTMLImageElement,
      width: number,
      height: number,
      lift = 0,
    ) {
      const scale = getProjectedScale(entity.depth);
      const drawWidth = width * scale;
      const drawHeight = height * scale;
      const x = getLaneCenter(entity.lane, entity.depth) - drawWidth / 2;
      const bob = Math.sin(entity.bob + distance * 0.04) * 4;
      const y = getProjectedY(entity.depth) - drawHeight - lift + bob;
      ctx.drawImage(asset, x, y, drawWidth, drawHeight);
    }

    function drawPlayer() {
      const laneVisual = lerp(player.laneFloat, player.targetLane, 0.18);
      player.laneFloat = laneVisual;

      const drawX = getLaneCenter(player.laneFloat, 1) - 56;
      const isJumping = player.jumpOffset > 1;
      const isDucking = player.duckTimer > 0.05;
      const drawY = PLAYER_BASE_Y - 116 - player.jumpOffset + (isDucking ? 28 : 0);
      const drawW = 112;
      const drawH = isDucking ? 104 : 132;

      ctx.save();
      if (player.shield > 0) {
        ctx.globalAlpha = 0.26;
        ctx.fillStyle = "#dff26d";
        ctx.beginPath();
        ctx.ellipse(drawX + 56, drawY + 66, 70, 82, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.drawImage(loadedAssets.player, drawX, drawY, drawW, drawH);

      if (isJumping) {
        ctx.strokeStyle = "rgba(255, 209, 0, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawX + 24, drawY + drawH + 8);
        ctx.quadraticCurveTo(drawX + 56, drawY + drawH + 2, drawX + 88, drawY + drawH + 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    function advanceDepth<T>(list: Array<WorldEntity<T>>, delta: number, rate: number) {
      return list.map((item) => ({
        ...item,
        depth: item.depth + delta * rate,
      }));
    }

    function consumeActions() {
      const queue = actionQueueRef.current;
      while (queue.length > 0) {
        const action = queue.shift();
        if (!action || status !== "playing") {
          continue;
        }

        if (action === "left") {
          player.targetLane = clamp(player.targetLane - 1, 0, 2);
          player.lane = player.targetLane;
        } else if (action === "right") {
          player.targetLane = clamp(player.targetLane + 1, 0, 2);
          player.lane = player.targetLane;
        } else if (action === "jump" && player.jumpOffset <= 0.5) {
          player.jumpVelocity = 710;
        } else if (action === "duck" && player.jumpOffset <= 3) {
          player.duckTimer = 0.72;
        }
      }
    }

    function applyCollect(type: CollectType) {
      if (type === "relato") {
        relatos += 1;
      } else if (type === "prova") {
        provas += 1;
      } else if (type === "memoria") {
        memoria += 1;
      } else {
        apoio += 1;
      }
    }

    function applyPower(type: PowerType) {
      if (type === "megafone") {
        magnetUntil = getPowerDuration(type);
      } else if (type === "arquivo") {
        revealUntil = getPowerDuration(type);
      } else {
        player.shield = 1;
      }
    }

    function drawStatusOverlay() {
      ctx.save();
      ctx.fillStyle = "rgba(8, 9, 12, 0.58)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = "#f4f1e4";
      ctx.textAlign = "center";
      ctx.font = "700 30px Oswald, sans-serif";
      ctx.fillText(status === "won" ? "Rua reorganizada" : "A rua travou", GAME_WIDTH / 2, 182);
      ctx.font = "500 18px Inter, sans-serif";
      ctx.fillText(
        status === "won"
          ? "Você transformou escuta em organização popular."
          : "A cidade ainda precisa de mais gente puxando junto.",
        GAME_WIDTH / 2,
        216,
      );
      ctx.fillStyle = "#ffd100";
      ctx.font = "700 20px Oswald, sans-serif";
      ctx.fillText(SITE_IDENTITY.fullLabel, GAME_WIDTH / 2, 260);
      ctx.fillStyle = "#f4f1e4";
      ctx.font = "500 16px Inter, sans-serif";
      ctx.fillText(SITE_IDENTITY.appFullLabel, GAME_WIDTH / 2, 286);
      ctx.restore();
    }

    function frame(now: number) {
      const deltaMs = now - lastTime;
      lastTime = now;
      const delta = Math.min(deltaMs / 1000, 0.032);
      hudAccumulator += deltaMs;

      if (status === "playing") {
        const progress = clamp(distance / TARGET_DISTANCE, 0, 1);
        const elapsed = START_TIME - timeLeft;
        const speed = lerp(52, 82, progress);
        const approachRate = lerp(0.19, 0.285, progress);
        distance = clamp(distance + speed * delta, 0, TARGET_DISTANCE);
        timeLeft = Math.max(0, timeLeft - delta);

        obstacleTimer -= delta;
        collectTimer -= delta;
        powerTimer -= delta;
        magnetUntil = Math.max(0, magnetUntil - delta);
        revealUntil = Math.max(0, revealUntil - delta);
        player.duckTimer = Math.max(0, player.duckTimer - delta);

        consumeActions();

        if (player.jumpVelocity > 0 || player.jumpOffset > 0) {
          player.jumpOffset += player.jumpVelocity * delta;
          player.jumpVelocity -= 1480 * delta;
          if (player.jumpOffset <= 0) {
            player.jumpOffset = 0;
            player.jumpVelocity = 0;
          }
        }

        const nearestObstacleDepth = obstacles.reduce((nearest, item) => Math.min(nearest, item.depth), 9);

        if (
          obstacleTimer <= 0 &&
          nearestObstacleDepth > 0.52 &&
          distance > SAFE_START_DISTANCE &&
          elapsed > SAFE_START_TIME
        ) {
          entityId += 1;
          obstacles.push(pickSafeObstacle(entityId, progress, obstacles, elapsed));
          obstaclesGenerated += 1;
          obstacleTimer = lerp(2.05, 1.08, progress) + Math.random() * 0.26;
        }

        if (collectTimer <= 0) {
          const count = Math.random() > 0.58 ? 2 : 1;
          for (let index = 0; index < count; index += 1) {
            entityId += 1;
            const item = createCollectable(entityId);
            item.lane = clamp(item.lane + index - 1, 0, 2);
            item.depth = 0.12 - index * 0.05;
            collectables.push(item);
          }
          collectTimer = lerp(1.05, 0.66, progress) + Math.random() * 0.2;
        }

        if (powerTimer <= 0) {
          entityId += 1;
          powers.push(createPowerUp(entityId));
          powerTimer = 7.2 + Math.random() * 3.6;
        }

        obstacles = advanceDepth(obstacles, delta, approachRate);
        collectables = advanceDepth(collectables, delta, approachRate * 0.98);
        powers = advanceDepth(powers, delta, approachRate * 0.95);

        obstacles = obstacles.filter((item) => {
          if (item.depth > 1.12) {
            obstaclesDodged += 1;
            return false;
          }
          return true;
        });
        collectables = collectables.filter((item) => item.depth <= 1.08);
        powers = powers.filter((item) => item.depth <= 1.08);

        for (const item of collectables) {
          const magnetActive = magnetUntil > 0;
          const canCollect =
            item.depth >= 0.84 &&
            item.depth <= 1.04 &&
            (item.lane === player.lane || (magnetActive && Math.abs(item.lane - player.lane) <= 1));

          if (canCollect) {
            applyCollect(item.type);
            item.depth = 2;
          }
        }

        for (const power of powers) {
          if (
            power.depth >= 0.84 &&
            power.depth <= 1.02 &&
            (power.lane === player.lane || Math.abs(power.lane - player.lane) <= 1)
          ) {
            applyPower(power.type);
            power.depth = 2;
          }
        }

        for (const obstacle of obstacles) {
          if (obstacle.depth < 0.9 || obstacle.depth > 1.02) {
            continue;
          }

          if (obstacle.lane !== player.lane) {
            continue;
          }

          const spec = getObstacleSpec(obstacle.type);
          const jumpedEnough = player.jumpOffset > 78;
          const duckedEnough = player.duckTimer > 0.22;
          const avoided =
            spec.avoid === "jump"
              ? jumpedEnough
              : spec.avoid === "duck"
                ? duckedEnough
                : false;

          if (!avoided) {
            if (player.shield > 0) {
              player.shield = 0;
              obstacle.depth = 2;
              obstaclesDodged += 1;
              collisions += 1;
            } else {
              collisions += 1;
              defeatReason =
                obstacle.type === "carimbo"
                  ? "carimbo_da_burocracia"
                  : obstacle.type === "buraco"
                    ? "buraco_do_abandono"
                    : obstacle.type === "processinho"
                      ? "processinho_voador"
                      : obstacle.type === "placa"
                        ? "ninguem_escuta"
                        : "muralha_do_silencio";
              endGame("lost");
            }
          }
        }

        if (distance >= TARGET_DISTANCE || timeLeft <= 0) {
          if (timeLeft <= 0 && distance < TARGET_DISTANCE) {
            defeatReason = "tempo_esgotado";
          }
          endGame(distance >= TARGET_DISTANCE ? "won" : "lost");
        }

        if (hudAccumulator >= HUD_INTERVAL) {
          publishSnapshot();
          setDebugSnapshot({
            fps: delta > 0 ? Math.round(1 / delta) : 0,
            lane: player.lane + 1,
            stateLabel: player.duckTimer > 0.05 ? "abaixando" : player.jumpOffset > 1 ? "pulando" : "correndo",
            speed: Math.round(speed),
            elapsed: Math.round(START_TIME - timeLeft),
            lastGesture,
            distance: Math.round(distance),
            obstaclesGenerated,
            collisions,
            defeatReason,
            usedSwipe,
            usedButtons,
          });
          hudAccumulator = 0;
        }
      }

      drawBackground(clamp(distance / TARGET_DISTANCE, 0, 1));
      drawEasterEggSigns(clamp(distance / TARGET_DISTANCE, 0, 1));

      collectables.forEach((item) => {
        const asset =
          item.type === "relato"
            ? loadedAssets.relato
            : item.type === "prova"
              ? loadedAssets.prova
              : item.type === "memoria"
                ? loadedAssets.memoria
                : loadedAssets.apoio;
        drawEntity(item, asset, 52, 52, 12);
      });

      powers.forEach((item) => {
        const asset =
          item.type === "megafone"
            ? loadedAssets.megafone
            : item.type === "arquivo"
              ? loadedAssets.arquivo
              : loadedAssets.respira;
        drawEntity(item, asset, 58, 58, 12);
      });

      obstacles.forEach((item) => {
        const asset =
          item.type === "processinho"
            ? loadedAssets.processinho
            : item.type === "carimbo"
              ? loadedAssets.carimbo
              : item.type === "buraco"
                ? loadedAssets.buraco
                : item.type === "muralha"
                  ? loadedAssets.muralha
                  : loadedAssets.ninguemEscuta;
        const spec = getObstacleSpec(item.type);
        drawEntity(item, asset, spec.width, spec.height, item.type === "buraco" ? -18 : 0);
      });

      drawPlayer();

      if (status !== "playing") {
        drawStatusOverlay();
      }

      animationFrame = window.requestAnimationFrame(frame);
    }

    trackEventIfAvailable("game_start", {
      variant: "runner_rua",
      ref_present: Boolean(refId),
    });

    animationFrame = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [assets, gameStarted, prefersReducedMotion, refId, runId]);

  function queueAction(action: ActionType, source: "swipe" | "button" | "keyboard" = "button") {
    if (source === "button") {
      setDebugSnapshot((current) => ({
        ...current,
        usedButtons: true,
      }));
    }
    const lastAction = actionQueueRef.current[actionQueueRef.current.length - 1];
    if (lastAction === action) {
      return;
    }
    actionQueueRef.current.push(action);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (snapshot.status !== "playing") {
      return;
    }

    pointerHandledRef.current = false;
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerId: event.pointerId,
    };
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    if (!start || snapshot.status !== "playing" || pointerHandledRef.current || start.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const duration = performance.now() - start.time;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (duration < SWIPE_MIN_DURATION || duration > SWIPE_MAX_DURATION) {
      return;
    }

    if (absX < TAP_FORGIVENESS && absY < TAP_FORGIVENESS) {
      return;
    }

    if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) {
      return;
    }

    if (absX > absY * SWIPE_DOMINANCE_RATIO) {
      pointerHandledRef.current = true;
      setDebugSnapshot((current) => ({
        ...current,
        lastGesture: deltaX > 0 ? "swipe_right" : "swipe_left",
        usedSwipe: true,
      }));
      queueAction(deltaX > 0 ? "right" : "left", "swipe");
      return;
    }

    if (absY > absX * SWIPE_DOMINANCE_RATIO) {
      pointerHandledRef.current = true;
      setDebugSnapshot((current) => ({
        ...current,
        lastGesture: deltaY < 0 ? "swipe_up" : "swipe_down",
        usedSwipe: true,
      }));
      queueAction(deltaY < 0 ? "jump" : "duck", "swipe");
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const start = pointerStartRef.current;
    if (!start || pointerHandledRef.current || start.pointerId !== event.pointerId || snapshot.status !== "playing") {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) {
      return;
    }

    if (absX > absY * SWIPE_DOMINANCE_RATIO) {
      pointerHandledRef.current = true;
      setDebugSnapshot((current) => ({
        ...current,
        lastGesture: deltaX > 0 ? "swipe_right" : "swipe_left",
        usedSwipe: true,
      }));
      queueAction(deltaX > 0 ? "right" : "left", "swipe");
      return;
    }

    if (absY > absX * SWIPE_DOMINANCE_RATIO) {
      pointerHandledRef.current = true;
      setDebugSnapshot((current) => ({
        ...current,
        lastGesture: deltaY < 0 ? "swipe_up" : "swipe_down",
        usedSwipe: true,
      }));
      queueAction(deltaY < 0 ? "jump" : "duck", "swipe");
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
  }

  function handleStartGame() {
    setGameStarted(true);
    setSnapshot({ ...INITIAL_SNAPSHOT, status: "playing" });
  }

  function handleRestart() {
    setRunId((current) => current + 1);
    setGameStarted(true);
    setSnapshot({ ...INITIAL_SNAPSHOT, status: "playing" });
    setShareFeedback("");
    setDebugSnapshot(INITIAL_DEBUG_SNAPSHOT);
  }

  function handleAppCtaClick(target: "app" | "mission" | "share3") {
    trackEventIfAvailable("game_app_cta_click", {
      variant: "runner_rua",
      target,
      status: snapshot.status,
    });
  }

  async function handleShare() {
    trackEventIfAvailable("game_share_click", {
      variant: "runner_rua",
      method: "native_or_copy",
      status: snapshot.status,
    });

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Rua em Movimento",
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
    setShareFeedback(
      copied
        ? "Mensagem copiada. Cole no WhatsApp, Instagram, TikTok ou onde fizer sentido."
        : "Não foi possível copiar automaticamente. Use os botões por rede abaixo.",
    );
  }

  async function handleCopyLink() {
    const copied = await copyToClipboardSafe(shareUrlAbsolute);
    setShareFeedback(copied ? "Link copiado." : "Não foi possível copiar o link.");
  }

  async function handleCopyMessage() {
    const copied = await copyToClipboardSafe(shareMessage);
    setShareFeedback(copied ? "Mensagem copiada." : "Não foi possível copiar a mensagem.");
  }

  async function handleCopyPlaytestSummary() {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    const userAgentSummary =
      typeof navigator !== "undefined"
        ? navigator.userAgent
            .replace(/\s+/g, " ")
            .slice(0, 120)
        : "desconhecido";
    const inputMode = debugSnapshot.usedSwipe
      ? debugSnapshot.usedButtons
        ? "swipe + botoes"
        : "swipe"
      : debugSnapshot.usedButtons
        ? "botoes"
        : "nao identificado";

    const summary = [
      "Resumo do playtest — Rua em Movimento",
      `tempo sobrevivido: ${Math.max(0, START_TIME - Math.ceil(snapshot.timeLeft))}s`,
      `resultado: ${snapshot.status === "won" ? "vitoria" : "derrota"}`,
      `relatos coletados: ${snapshot.total}`,
      `obstaculos desviados: ${snapshot.obstaclesDodged}`,
      `easter eggs encontrados: ${snapshot.easterEggsFound}`,
      `input usado: ${inputMode}`,
      `tela: ${viewportWidth}x${viewportHeight}`,
      `user agent resumido: ${userAgentSummary}`,
      `ref: ${refId || "sem_ref"}`,
      "Observação do jogador: ______",
    ].join("\n");

    const copied = await copyToClipboardSafe(summary);
    setShareFeedback(copied ? "Resumo do teste copiado." : "Não foi possível copiar o resumo do teste.");
  }

  async function handleNetworkShare(network: "whatsapp" | "facebook" | "instagram" | "tiktok") {
    trackEventIfAvailable("game_share_click", {
      variant: "runner_rua",
      method: network,
      status: snapshot.status,
    });

    if (network === "whatsapp") {
      window.open(buildLaunchWhatsAppUrl({ text: shareMessage }), "_blank", "noopener,noreferrer");
      return;
    }

    if (network === "facebook") {
      window.open(buildFacebookShareUrl(shareUrlAbsolute), "_blank", "noopener,noreferrer");
      return;
    }

    await handleCopyMessage();
    const url = network === "instagram" ? getInstagramShareUrl() : getTikTokShareUrl();
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (!motionReady) {
    return (
      <section className="runner-shell">
        <div className="runner-static">
          <div className="runner-static__art" />
          <div className="runner-static__content">
            <p className="runner-static__eyebrow">Rua em Movimento</p>
            <h2 className="runner-static__title">Carregando a missão de rua.</h2>
            <p className="runner-static__text">
              O runner carrega só aqui para não pesar a landing.
            </p>
          </div>
        </div>
        <style>{css}</style>
      </section>
    );
  }

  if (prefersReducedMotion) {
    return (
      <section className="runner-shell">
        <div className="runner-static">
          <div className="runner-static__art" />
          <div className="runner-static__content">
            <p className="runner-static__eyebrow">Rua em Movimento</p>
            <h2 className="runner-static__title">Movimento reduzido ativo.</h2>
            <p className="runner-static__text">
              Para respeitar a sua preferência, mostramos uma versão estática da missão relâmpago.
            </p>
            <p className="runner-static__text">{SITE_IDENTITY.fullLabel}</p>
            <p className="runner-static__text">{SITE_IDENTITY.appFullLabel}</p>
            <div className="runner-static__eggs">
              {EASTER_EGGS.map((egg) => (
                <span key={egg.key}>{egg.label}</span>
              ))}
            </div>
            <div className="runner-finish__actions">
              <button type="button" className="btn btn-primary" onClick={() => void handleShare()}>
                Compartilhar resultado
              </button>
              <a href={appUrl} className="btn btn-secondary" onClick={() => handleAppCtaClick("app")}>
                Entrar no app
              </a>
              <a href={missionUrl} className="btn btn-ghost" onClick={() => handleAppCtaClick("mission")}>
                Receber primeira missão
              </a>
            </div>
            <div className="runner-social-actions">
              <button type="button" className="btn btn-ghost" onClick={() => void handleNetworkShare("whatsapp")}>
                WhatsApp
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void handleCopyMessage()}>
                Copiar mensagem
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void handleCopyLink()}>
                Copiar link
              </button>
            </div>
            <p className="runner-share-feedback">{shareFeedback}</p>
          </div>
        </div>
        <style>{css}</style>
      </section>
    );
  }

  const roadLabel = getRoadLabel(snapshot.progress);

  return (
    <section className="runner-shell">
      <div className="runner-shell__header">
        <div>
          <p className="runner-shell__badge">Pré-campanha Alexandre VR Abandonada</p>
          <p className="runner-shell__helper">Missão aberta para mobilização pública no celular e no desktop.</p>
        </div>
        <div className="runner-shell__header-actions">
          <a href={exitUrl} className="btn btn-ghost">
            Sair
          </a>
          {gameStarted && (
            <button type="button" className="btn btn-secondary" onClick={handleRestart}>
              Reiniciar
            </button>
          )}
        </div>
      </div>

      <div className="runner-stage-shell">
        <div className="runner-hud">
          <div className="runner-hud__grid">
            <div className="runner-chip">
              <span className="runner-chip__label">Relatos</span>
              <strong>{snapshot.relatos}</strong>
            </div>
            <div className="runner-chip">
              <span className="runner-chip__label">Provas</span>
              <strong>{snapshot.provas}</strong>
            </div>
            <div className="runner-chip">
              <span className="runner-chip__label">Memória</span>
              <strong>{snapshot.memoria}</strong>
            </div>
            <div className="runner-chip">
              <span className="runner-chip__label">Apoio</span>
              <strong>{snapshot.apoio}</strong>
            </div>
            <div className="runner-chip">
              <span className="runner-chip__label">Rua</span>
              <strong>{roadLabel}</strong>
            </div>
            <div className="runner-chip">
              <span className="runner-chip__label">Distância</span>
              <strong>{Math.round(snapshot.distance)} m</strong>
            </div>
            <div className="runner-chip">
              <span className="runner-chip__label">Easter eggs</span>
              <strong>{snapshot.easterEggsFound}/{EASTER_EGG_COUNT}</strong>
            </div>
            <div className="runner-chip">
              <span className="runner-chip__label">Tempo</span>
              <strong>{Math.ceil(snapshot.timeLeft)}s</strong>
            </div>
          </div>

          <div className="runner-hud__progress">
            <div className="runner-progress" aria-hidden="true">
              <span style={{ width: `${snapshot.progress * 100}%` }} />
            </div>
            <p className="runner-progress__text">
              Barra de progresso da rua · {progressPercent}% · {Math.ceil(snapshot.timeLeft)}s
            </p>
          </div>
        </div>

        {debug && (
          <div className="runner-debug" aria-label="Painel de debug local">
            <strong>debug local</strong>
            <span>FPS: {debugSnapshot.fps}</span>
            <span>Faixa: {debugSnapshot.lane}</span>
            <span>Estado: {debugSnapshot.stateLabel}</span>
            <span>Velocidade: {debugSnapshot.speed}</span>
            <span>Tempo: {debugSnapshot.elapsed}s</span>
            <span>Último gesto: {debugSnapshot.lastGesture}</span>
            <span>Distância: {debugSnapshot.distance}m</span>
            <span>Obstáculos: {debugSnapshot.obstaclesGenerated}</span>
            <span>Colisões: {debugSnapshot.collisions}</span>
            <span>Derrota: {debugSnapshot.defeatReason || "-"}</span>
          </div>
        )}

        <div
          className="runner-stage"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            pointerStartRef.current = null;
            pointerHandledRef.current = false;
          }}
        >
          {assetError ? (
            <div className="runner-stage__error">
              <p>Os assets do runner não carregaram corretamente.</p>
            </div>
          ) : (
            <canvas
              key={runId}
              ref={canvasRef}
              className="runner-canvas"
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              aria-label="Runner urbano em três faixas"
            />
          )}

          {!gameStarted && (
            <div className="runner-overlay">
              <div className="runner-overlay__panel">
                <p className="runner-overlay__eyebrow">Rua em Movimento</p>
                <h3 className="runner-overlay__title">Corra da burocracia, colete relatos e organize uma cidade melhor.</h3>
                <p className="runner-overlay__text">Uma missão relâmpago. Um minuto. Uma cidade em movimento.</p>
                <div className="runner-tutorial-grid" aria-label="Como jogar">
                  <div className="runner-tutorial-card">
                    <span className="runner-tutorial-card__icon">↔</span>
                    <span>Deslize para os lados</span>
                  </div>
                  <div className="runner-tutorial-card">
                    <span className="runner-tutorial-card__icon">↑</span>
                    <span>Deslize para cima para pular</span>
                  </div>
                  <div className="runner-tutorial-card">
                    <span className="runner-tutorial-card__icon">↓</span>
                    <span>Deslize para baixo para abaixar</span>
                  </div>
                  <div className="runner-tutorial-card">
                    <span className="runner-tutorial-card__icon">◎</span>
                    <span>Colete relatos e apoio popular</span>
                  </div>
                </div>
                <div className="runner-overlay__tags">
                  <span>Volta Redonda urbana</span>
                  <span>Feito para uma mão</span>
                  <span>Stencil • Grafite • Concreto</span>
                </div>
                <button type="button" className="btn btn-primary btn-lg" onClick={handleStartGame}>
                  Começar missão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {snapshot.status !== "intro" && snapshot.status !== "playing" && (
        <div className="runner-finish" ref={finishRef}>
          <div className="runner-finish__panel">
            <p className="runner-finish__eyebrow">{outcomeTitle}</p>
            <h3 className="runner-finish__title">{finishTitle}</h3>
            <p className="runner-finish__text">{SITE_IDENTITY.fullLabel}</p>
            <p className="runner-finish__text">{SITE_IDENTITY.appFullLabel}</p>

            <div className="runner-share-card" aria-label="Card visual compartilhável do runner">
              <p className="runner-share-card__eyebrow">Eu joguei a Missão Relâmpago</p>
              <h4 className="runner-share-card__title">Rua em Movimento</h4>
              <p className="runner-share-card__meta">Pré-campanha Alexandre VR Abandonada</p>
              <p className="runner-share-card__meta">Missão ÉLuta — Escutar • Cuidar • Organizar</p>
              <p className="runner-share-card__lead">{shareLead}</p>
              <div className="runner-share-card__grid">
                <span>Título: {outcomeTitle}</span>
                <span>Relatos coletados {snapshot.total}</span>
                <span>Obstáculos desviados {snapshot.obstaclesDodged}</span>
                <span>Easter eggs {snapshot.easterEggsFound}</span>
              </div>
              <p className="runner-share-card__footer">{shareUrlAbsolute}</p>
            </div>

            <div className="runner-finish__stats" aria-label="Resumo final">
              <span><strong>{outcomeTitle}</strong><small>Título conquistado</small></span>
              <span><strong>{snapshot.total}</strong><small>Relatos coletados</small></span>
              <span><strong>{snapshot.obstaclesDodged}</strong><small>Obstáculos desviados</small></span>
              <span><strong>{snapshot.easterEggsFound}/{EASTER_EGG_COUNT}</strong><small>Easter eggs encontrados</small></span>
            </div>

            <p className="runner-finish__phrase">Você transformou escuta em organização popular.</p>

            <div className="runner-finish__actions">
              <button type="button" className="btn btn-primary" onClick={() => void handleShare()}>
                Compartilhar resultado
              </button>
              <a href={appUrl} className="btn btn-secondary" onClick={() => handleAppCtaClick("app")}>
                Entrar no app
              </a>
              <a href={missionUrl} className="btn btn-ghost" onClick={() => handleAppCtaClick("mission")}>
                Receber primeira missão
              </a>
              <button type="button" className="btn btn-ghost" onClick={() => { handleAppCtaClick("share3"); void handleNetworkShare("whatsapp"); }}>
                Compartilhar com 3 pessoas
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleRestart}>
                Jogar de novo
              </button>
            </div>

            <div className="runner-social-actions">
              <button type="button" className="btn btn-ghost" onClick={() => void handleNetworkShare("whatsapp")}>
                WhatsApp
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void handleNetworkShare("facebook")}>
                Facebook
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void handleNetworkShare("instagram")}>
                Instagram
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void handleNetworkShare("tiktok")}>
                TikTok
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void handleCopyMessage()}>
                Copiar mensagem
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => void handleCopyLink()}>
                Copiar link
              </button>
            </div>

            <div className="runner-finish__subactions">
              {playtest && (
                <button type="button" className="btn btn-ghost" onClick={() => void handleCopyPlaytestSummary()}>
                  Copiar resumo do teste
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={() => setShowEasterEggs((value) => !value)}>
                Ver easter eggs encontrados
              </button>
            </div>
            <p className="runner-share-feedback">{shareFeedback}</p>
          </div>
        </div>
      )}

      <div className="runner-instructions">
        <p>
          Mobile: swipe esquerda/direita muda de faixa, swipe para cima pula, swipe para baixo abaixa.
          PC: setas esquerda/direita ou A/D mudam de faixa, seta cima ou espaço pula, seta baixo abaixa.
        </p>
      </div>

      <div className="runner-toolbar">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setShowEasterEggs((value) => !value)}
        >
          Ver easter eggs encontrados
        </button>
        <span className="runner-toolbar__count">
          {discoveredEggs.length} de {EASTER_EGG_COUNT} vistos
        </span>
      </div>

      {showEasterEggs && (
        <div className="runner-eggs-panel">
          {EASTER_EGGS.map((egg) => {
            const found = discoveredEggs.includes(egg.key);
            return (
              <div
                key={egg.key}
                className={`runner-eggs-panel__item${found ? " runner-eggs-panel__item--found" : ""}`}
              >
                <strong>{egg.label}</strong>
                <span>{found ? "Encontrado nesta corrida" : "Ainda não apareceu para você"}</span>
              </div>
            );
          })}
        </div>
      )}

      {snapshot.status === "playing" && (
        <div className="runner-controls" aria-label="Controles de acessibilidade para mobile">
          <button type="button" className="runner-controls__btn" onClick={() => queueAction("left")} aria-label="Mover para a esquerda">
            ←
          </button>
          <button type="button" className="runner-controls__btn" onClick={() => queueAction("right")} aria-label="Mover para a direita">
            →
          </button>
          <button type="button" className="runner-controls__btn runner-controls__btn--jump" onClick={() => queueAction("jump")}>
            Pular
          </button>
          <button type="button" className="runner-controls__btn runner-controls__btn--duck" onClick={() => queueAction("duck")}>
            Abaixar
          </button>
        </div>
      )}

      <style>{css}</style>
    </section>
  );
}

const css = `
.runner-shell {
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
  overscroll-behavior: contain;
  -webkit-user-select: none;
  user-select: none;
}
.runner-shell__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
}
.runner-shell__badge {
  margin: 0;
  color: var(--yellow);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 700;
}
.runner-shell__helper {
  margin: 0.35rem 0 0;
  color: var(--muted);
  font-size: 0.88rem;
}
.runner-shell__header-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.runner-stage-shell {
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: #090a0d;
}
.runner-stage {
  position: relative;
  touch-action: none;
  overscroll-behavior: contain;
}
.runner-stage__error {
  min-height: 420px;
  display: grid;
  place-items: center;
  padding: 1rem;
  color: var(--muted);
}
.runner-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 9 / 16;
  max-height: min(82svh, 920px);
  background: #090a0d;
  touch-action: none;
}
.runner-hud {
  position: absolute;
  inset: 0 0 auto;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.8rem;
  pointer-events: none;
}
.runner-debug {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  z-index: 3;
  display: grid;
  gap: 0.2rem;
  min-width: 180px;
  max-width: min(52vw, 260px);
  padding: 0.7rem 0.8rem;
  border-radius: 14px;
  border: 1px solid rgba(255,209,0,0.24);
  background: rgba(9,10,12,0.84);
  box-shadow: 0 10px 28px rgba(0,0,0,0.24);
  color: rgba(242,242,242,0.84);
  font-size: 0.72rem;
  line-height: 1.35;
  pointer-events: none;
}
.runner-debug strong {
  color: var(--yellow);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.66rem;
}
.runner-hud__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
}
.runner-chip {
  min-width: 0;
  padding: 0.58rem 0.66rem;
  border-radius: 14px;
  background: rgba(11, 11, 14, 0.72);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
}
.runner-chip__label {
  display: block;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(242,242,242,0.68);
}
.runner-chip strong {
  display: block;
  overflow-wrap: anywhere;
  font-family: var(--font-head);
  font-size: 0.96rem;
  line-height: 1.08;
  color: var(--yellow);
}
.runner-hud__progress {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.runner-progress {
  overflow: hidden;
  height: 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.08);
}
.runner-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffd100, #dff26d);
}
.runner-progress__text {
  margin: 0;
  font-size: 0.72rem;
  color: rgba(242,242,242,0.8);
  text-shadow: 0 1px 0 rgba(0,0,0,0.4);
}
.runner-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: grid;
  place-items: center;
  padding: 1rem;
  background:
    radial-gradient(circle at 15% 18%, rgba(255,209,0,0.16), transparent 26%),
    linear-gradient(180deg, rgba(5,5,8,0.3), rgba(5,5,8,0.76));
  backdrop-filter: blur(1px);
}
.runner-overlay__panel {
  width: min(100%, 460px);
  padding: 1.3rem;
  border-radius: 24px;
  border: 1px solid rgba(255,209,0,0.26);
  background: linear-gradient(145deg, rgba(20,20,24,0.94), rgba(10,10,13,0.94));
  box-shadow: 0 16px 44px rgba(0,0,0,0.36);
}
.runner-overlay__eyebrow,
.runner-finish__eyebrow,
.runner-static__eyebrow {
  margin: 0 0 0.65rem;
  color: var(--yellow);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 700;
}
.runner-overlay__title,
.runner-finish__title,
.runner-static__title {
  margin: 0 0 0.9rem;
  font-family: var(--font-head);
  font-size: clamp(1.7rem, 4.8vw, 2.8rem);
  line-height: 1.02;
}
.runner-overlay__text,
.runner-finish__text,
.runner-static__text {
  margin: 0;
  color: var(--muted);
  line-height: 1.62;
}
.runner-overlay__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 1rem 0 1.2rem;
}
.runner-overlay__tags span,
.runner-static__eggs span {
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  font-size: 0.8rem;
}
.runner-tutorial-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin: 1rem 0 1.1rem;
}
.runner-tutorial-card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
  padding: 0.8rem;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  color: rgba(242,242,242,0.86);
  font-size: 0.84rem;
  line-height: 1.45;
}
.runner-tutorial-card__icon {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,209,0,0.16);
  color: var(--yellow);
  font-size: 1rem;
  font-weight: 700;
}
.runner-finish {
  display: flex;
  justify-content: center;
}
.runner-finish__panel,
.runner-static {
  border-radius: 22px;
  border: 1px solid rgba(255,209,0,0.24);
  background: rgba(17, 18, 24, 0.92);
}
.runner-finish__panel {
  width: min(100%, 760px);
  padding: 1.35rem;
  scroll-margin-top: 1rem;
}
.runner-share-card {
  margin: 1.2rem 0 1rem;
  padding: 1rem;
  aspect-ratio: 9 / 16;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  border-radius: 20px;
  border: 1px solid rgba(255,209,0,0.24);
  background:
    radial-gradient(circle at 84% 22%, rgba(192,57,43,0.18), transparent 28%),
    linear-gradient(145deg, rgba(255,209,0,0.08), rgba(255,255,255,0.02)),
    rgba(9,10,12,0.9);
}
.runner-share-card__eyebrow {
  margin: 0 0 0.45rem;
  color: var(--yellow);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}
.runner-share-card__title {
  margin: 0;
  font-family: var(--font-head);
  font-size: clamp(1.5rem, 4vw, 2rem);
}
.runner-share-card__meta {
  margin: 0.18rem 0 0;
  color: rgba(242,242,242,0.84);
  font-size: 0.84rem;
}
.runner-share-card__lead {
  margin: 0.5rem 0 0;
  color: rgba(242,242,242,0.84);
}
.runner-share-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 1rem 0 0.8rem;
}
.runner-share-card__grid span {
  padding: 0.55rem 0.65rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 0.84rem;
}
.runner-share-card__footer {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(242,242,242,0.74);
  overflow-wrap: anywhere;
}
.runner-finish__stats,
.runner-finish__actions,
.runner-social-actions,
.runner-finish__subactions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}
.runner-finish__stats {
  margin: 1rem 0 0.8rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.runner-finish__stats span {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-width: 0;
  padding: 0.72rem 0.8rem;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
}
.runner-finish__stats strong {
  color: var(--yellow);
  font-family: var(--font-head);
  font-size: 1.08rem;
  line-height: 1.05;
}
.runner-finish__stats small {
  color: rgba(242,242,242,0.74);
  font-size: 0.78rem;
}
.runner-finish__phrase {
  margin: 0 0 1rem;
  color: #f4f1e4;
  font-size: 1rem;
}
.runner-share-feedback {
  margin: 0.8rem 0 0;
  color: rgba(242,242,242,0.74);
  font-size: 0.83rem;
  line-height: 1.5;
  white-space: pre-line;
}
.runner-instructions {
  color: var(--muted);
  font-size: 0.88rem;
}
.runner-instructions p {
  margin: 0;
}
.runner-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: center;
  flex-wrap: wrap;
}
.runner-toolbar__count {
  font-size: 0.84rem;
  color: rgba(242,242,242,0.74);
}
.runner-eggs-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}
.runner-eggs-panel__item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.9rem;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
}
.runner-eggs-panel__item strong {
  font-family: var(--font-head);
  font-size: 1rem;
  color: rgba(242,242,242,0.92);
}
.runner-eggs-panel__item span {
  color: var(--muted);
  font-size: 0.82rem;
}
.runner-eggs-panel__item--found {
  border-color: rgba(255,209,0,0.28);
  background: linear-gradient(135deg, rgba(255,209,0,0.08), rgba(255,255,255,0.02));
}
.runner-controls {
  position: sticky;
  bottom: calc(0.5rem + env(safe-area-inset-bottom));
  z-index: 4;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  padding: 0.2rem 0 calc(env(safe-area-inset-bottom) + 0.2rem);
}
.runner-controls__btn {
  min-height: 68px;
  border: 1px solid rgba(255,209,0,0.32);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255,209,0,0.2), rgba(255,209,0,0.07));
  box-shadow: 0 10px 24px rgba(0,0,0,0.18);
  color: var(--text);
  font-size: 1.02rem;
  font-weight: 700;
  -webkit-tap-highlight-color: transparent;
}
.runner-controls__btn--jump {
  background: linear-gradient(180deg, rgba(192,57,43,0.3), rgba(192,57,43,0.14));
}
.runner-controls__btn--duck {
  background: linear-gradient(180deg, rgba(244,241,228,0.18), rgba(255,255,255,0.08));
}
.runner-static {
  display: grid;
  grid-template-columns: minmax(220px, 0.9fr) minmax(0, 1.1fr);
  overflow: hidden;
}
.runner-static__art {
  min-height: 320px;
  background:
    linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.45)),
    url("/game-runner/lancamento-preview.svg") center / cover no-repeat;
}
.runner-static__content {
  padding: 1.4rem;
}
@media (max-width: 900px) {
  .runner-hud__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .runner-finish__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .runner-static {
    grid-template-columns: 1fr;
  }
  .runner-static__art {
    min-height: 240px;
  }
  .runner-debug {
    position: static;
    margin: 0.8rem 0 0;
    max-width: none;
  }
}
@media (max-width: 640px) {
  .runner-shell {
    padding: 0.8rem;
    border-radius: 20px;
  }
  .runner-overlay__panel {
    padding: 1.05rem;
  }
  .runner-tutorial-grid,
  .runner-share-card__grid,
  .runner-eggs-panel,
  .runner-finish__stats {
    grid-template-columns: 1fr;
  }
  .runner-share-card {
    aspect-ratio: auto;
  }
  .runner-finish__actions,
  .runner-social-actions,
  .runner-finish__subactions,
  .runner-shell__header-actions,
  .runner-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .runner-finish__actions .btn,
  .runner-social-actions .btn,
  .runner-finish__subactions .btn,
  .runner-shell__header-actions .btn,
  .runner-shell__header-actions a,
  .runner-toolbar .btn {
    width: 100%;
    justify-content: center;
  }
  .runner-controls__btn {
    min-height: 72px;
  }
}
`;
