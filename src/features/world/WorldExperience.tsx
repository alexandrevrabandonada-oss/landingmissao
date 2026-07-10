"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { trackEventIfAvailable } from "@/src/lib/trackEvent";
import { selectStoredMission } from "@/src/lib/missionJourneyStorage";
import type { SceneStats, WorldZone } from "./WorldScene";
import { WorldBootShell } from "./WorldBootShell";
import { WorldRuntimeBoundary } from "./WorldRuntimeBoundary";
import {
  PlayerSimulation,
  WORLD_POINTS,
  createPlayerInput,
  type WorldPoint,
  type WorldPointId,
} from "./worldSimulation";
import styles from "./world.module.css";

const WorldViewport = dynamic(
  () => import("./WorldViewport").then((module) => module.WorldViewport),
  {
    ssr: false,
    loading: () => null,
  },
);

const STORAGE_KEY = "missao-eluta:world-journey:v1";
const CONTROLS_HINT_KEY = "missao-eluta:world-controls-seen:v1";
const QUALITY_KEY = "missao-eluta:world-quality:v1";
const MOTION_KEY = "missao-eluta:world-motion:v1";

const ZONE_COPY: Record<WorldZone, { eyebrow: string; title: string }> = {
  fábrica: { eyebrow: "Zona 01", title: "A cidade que herdamos" },
  transição: { eyebrow: "Zona 02", title: "O comum em construção" },
  jardim: { eyebrow: "Zona 03", title: "O futuro que cultivamos" },
};

type ExperienceMode = "loading" | "3d" | "light";

export default function WorldExperience() {
  const inputRef = useRef(createPlayerInput());
  const worldShellRef = useRef<HTMLDivElement>(null);
  const worldLoadedTrackedRef = useRef(false);
  const runtimeFailureHandledRef = useRef(false);
  const mapCloseRef = useRef<HTMLButtonElement>(null);
  const storyCloseRef = useRef<HTMLButtonElement>(null);
  const pausePrimaryRef = useRef<HTMLButtonElement>(null);
  const mapDialogRef = useRef<HTMLDivElement>(null);
  const pauseDialogRef = useRef<HTMLDivElement>(null);
  const storyDialogRef = useRef<HTMLElement>(null);
  const surfaceOpenerRef = useRef<HTMLElement | null>(null);
  const objectiveCardRef = useRef<HTMLElement>(null);
  const zoneRevealTimerRef = useRef<number | null>(null);
  const journeyNoticeTimerRef = useRef<number | null>(null);
  const completionAnnouncedRef = useRef(false);
  const [simulation] = useState(() => new PlayerSimulation());
  const [mode, setMode] = useState<ExperienceMode>("loading");
  const [webglAvailable, setWebglAvailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [nearbyPointId, setNearbyPointId] = useState<WorldPointId | null>(null);
  const [activePoint, setActivePoint] = useState<WorldPoint | null>(null);
  const [visitedPoints, setVisitedPoints] = useState<WorldPointId[]>([]);
  const [actionSerial, setActionSerial] = useState(0);
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const [hasHydrated, setHasHydrated] = useState(false);
  const [missionSelectedInWorld, setMissionSelectedInWorld] = useState(false);
  const [objectiveExpanded, setObjectiveExpanded] = useState(true);
  const [cameraResetSerial, setCameraResetSerial] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({
    x: 0,
    z: 2.25,
    heading: Math.PI,
    moving: false,
    navigating: false,
    targetId: null as WorldPointId | null,
  });
  const [currentZone, setCurrentZone] = useState<WorldZone>("fábrica");
  const [scenePhase, setScenePhase] = useState<"booting" | "ready" | "failed">("booting");
  const [runtimeAttempt, setRuntimeAttempt] = useState(0);
  const [performanceTier, setPerformanceTier] = useState<"balanced" | "high">("balanced");
  const [zoneReveal, setZoneReveal] = useState<WorldZone | null>(null);
  const [controlsHintVisible, setControlsHintVisible] = useState(true);
  const [controlsHintForced, setControlsHintForced] = useState(false);
  const [journeyNotice, setJourneyNotice] = useState<{
    eyebrow: string;
    title: string;
    tone: "route" | "arrival" | "complete";
  } | null>(null);

  const dismissControlsHint = useCallback(() => {
    setControlsHintVisible(false);
    setControlsHintForced(false);
    try {
      window.localStorage.setItem(CONTROLS_HINT_KEY, "1");
    } catch {
      // A orientação ainda funciona sem persistência local.
    }
  }, []);

  const showJourneyNotice = useCallback((
    eyebrow: string,
    title: string,
    tone: "route" | "arrival" | "complete",
    duration = 1800,
  ) => {
    if (journeyNoticeTimerRef.current) window.clearTimeout(journeyNoticeTimerRef.current);
    setJourneyNotice({ eyebrow, title, tone });
    journeyNoticeTimerRef.current = window.setTimeout(() => setJourneyNotice(null), duration);
  }, []);

  const handleWorldReady = useCallback(() => {
    setScenePhase("ready");
    if (worldLoadedTrackedRef.current) return;
    worldLoadedTrackedRef.current = true;
    trackEventIfAvailable("world_loaded", { mode: "3d" });
  }, []);

  const handleWorldError = useCallback(() => {
    if (runtimeFailureHandledRef.current) return;
    runtimeFailureHandledRef.current = true;
    setScenePhase("failed");
    setPaused(false);
    setMode("light");
    window.history.replaceState(null, "", "/explorar?modo=leve");
    trackEventIfAvailable("world_fallback_used", { reason: "runtime_error" });
    trackEventIfAvailable("world_mode_selected", { mode: "light", source: "runtime_error" });
  }, []);

  const rememberSurfaceOpener = useCallback(() => {
    if (activePoint || mapOpen || paused) return;
    const activeElement = document.activeElement;
    surfaceOpenerRef.current = activeElement instanceof HTMLElement ? activeElement : null;
  }, [activePoint, mapOpen, paused]);

  const restoreSurfaceFocus = useCallback(() => {
    const opener = surfaceOpenerRef.current;
    surfaceOpenerRef.current = null;
    window.setTimeout(() => opener?.focus(), 0);
  }, []);

  const closeStory = useCallback(() => {
    setActivePoint(null);
    restoreSurfaceFocus();
  }, [restoreSurfaceFocus]);

  const closeMap = useCallback(() => {
    setMapOpen(false);
    restoreSurfaceFocus();
  }, [restoreSurfaceFocus]);

  const closePause = useCallback(() => {
    setPaused(false);
    restoreSurfaceFocus();
  }, [restoreSurfaceFocus]);

  const openMap = useCallback((source: "header" | "pause" = "header") => {
    rememberSurfaceOpener();
    setActivePoint(null);
    setPaused(false);
    setMapOpen(true);
    trackEventIfAvailable("world_spatial_map_opened", { zone: currentZone, source });
  }, [currentZone, rememberSurfaceOpener]);

  const openPause = useCallback(() => {
    rememberSurfaceOpener();
    setActivePoint(null);
    setMapOpen(false);
    setPaused(true);
  }, [rememberSurfaceOpener]);

  const collapseObjectiveSafely = useCallback(() => {
    const focusedElement = document.activeElement;
    if (focusedElement instanceof Node && objectiveCardRef.current?.contains(focusedElement)) return;
    setObjectiveExpanded(false);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const requestedLightMode = new URLSearchParams(window.location.search).get("modo") === "leve";
    const webglAvailable = supportsWebGL();
    const initialMode = requestedLightMode || !webglAvailable ? "light" : "3d";
    setWebglAvailable(webglAvailable);
    setMode(initialMode);
    setScenePhase(initialMode === "3d" ? "booting" : "ready");
    let storedTier: string | null = null;
    let hasStoredMotionPreference = false;

    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as {
        visitedPointIds?: unknown;
      } | null;
      if (Array.isArray(stored?.visitedPointIds)) {
        setVisitedPoints(stored.visitedPointIds.filter(isWorldPointId));
      }
      setControlsHintVisible(window.localStorage.getItem(CONTROLS_HINT_KEY) !== "1");
      const storedMotion = window.localStorage.getItem(MOTION_KEY);
      if (storedMotion === "reduced" || storedMotion === "full") {
        hasStoredMotionPreference = true;
        setReducedMotion(storedMotion === "reduced");
      }
      storedTier = window.localStorage.getItem(QUALITY_KEY);
    } catch {
      setVisitedPoints([]);
    }

    setHasHydrated(true);
    trackEventIfAvailable("world_entered", { requested_mode: requestedLightMode ? "light" : "3d" });
    trackEventIfAvailable("world_mode_selected", { mode: initialMode, source: "entry" });
    trackEventIfAvailable("district_entered", { district: "distrito-01" });
    const automaticTier = window.matchMedia("(max-width: 700px)").matches ? "balanced" : "high";
    const tier = storedTier === "balanced" || storedTier === "high" ? storedTier : automaticTier;
    setPerformanceTier(tier);
    trackEventIfAvailable("world_performance_tier_selected", { tier });
    if (initialMode === "light") {
      trackEventIfAvailable("world_fallback_used", {
        reason: requestedLightMode ? "requested" : "webgl_unavailable",
      });
    }
    const syncMotionPreference = (event: MediaQueryListEvent) => {
      if (!hasStoredMotionPreference) setReducedMotion(event.matches);
    };
    media.addEventListener("change", syncMotionPreference);
    return () => media.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 700px)");
    setObjectiveExpanded(!breakpoint.matches);
    const syncObjectiveLayout = (event: MediaQueryListEvent) => setObjectiveExpanded(!event.matches);
    breakpoint.addEventListener("change", syncObjectiveLayout);
    const timeout = breakpoint.matches ? null : window.setTimeout(collapseObjectiveSafely, 5200);
    return () => {
      breakpoint.removeEventListener("change", syncObjectiveLayout);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [collapseObjectiveSafely]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setControlsHintVisible(false), 8000);
    return () => {
      window.clearTimeout(timeout);
      if (zoneRevealTimerRef.current) window.clearTimeout(zoneRevealTimerRef.current);
      if (journeyNoticeTimerRef.current) window.clearTimeout(journeyNoticeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!controlsHintForced) return;
    const timeout = window.setTimeout(() => setControlsHintForced(false), 6000);
    return () => window.clearTimeout(timeout);
  }, [controlsHintForced]);

  useEffect(() => {
    if (!nearbyPointId) return;
    if (window.matchMedia("(max-width: 700px)").matches) return;
    setObjectiveExpanded(true);
    const timeout = window.setTimeout(collapseObjectiveSafely, 4200);
    return () => window.clearTimeout(timeout);
  }, [collapseObjectiveSafely, nearbyPointId]);

  useEffect(() => {
    if (!nearbyPointId) return;
    const point = WORLD_POINTS.find((candidate) => candidate.id === nearbyPointId);
    if (point) showJourneyNotice("Você chegou", getWorldPointShortTitle(point), "arrival");
  }, [nearbyPointId, showJourneyNotice]);

  useEffect(() => {
    if (
      !hasHydrated ||
      activePoint ||
      visitedPoints.length < WORLD_POINTS.length ||
      completionAnnouncedRef.current
    ) return;
    completionAnnouncedRef.current = true;
    showJourneyNotice("Travessia concluída", "Os três marcos foram registrados", "complete", 3600);
    trackEventIfAvailable("world_journey_completed", { visited_points: visitedPoints.length });
  }, [activePoint, hasHydrated, showJourneyNotice, visitedPoints.length]);

  useEffect(() => {
    const dialog = activePoint
      ? storyDialogRef.current
      : mapOpen
        ? mapDialogRef.current
        : paused
          ? pauseDialogRef.current
          : null;
    if (!dialog) return;

    const initialFocus = activePoint
      ? storyCloseRef.current
      : mapOpen
        ? mapCloseRef.current
        : pausePrimaryRef.current;
    initialFocus?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.closest("[inert]") && element.getClientRects().length > 0);
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

    dialog.addEventListener("keydown", trapFocus);
    return () => dialog.removeEventListener("keydown", trapFocus);
  }, [activePoint, mapOpen, paused]);

  useEffect(() => {
    if (mode === "light" && !worldLoadedTrackedRef.current) {
      worldLoadedTrackedRef.current = true;
      trackEventIfAvailable("world_loaded", { mode: "light" });
    }
  }, [mode]);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        visitedPointIds: visitedPoints,
        mode,
        updatedAt: new Date().toISOString(),
      }),
    );
  }, [hasHydrated, mode, visitedPoints]);

  useEffect(() => {
    inputRef.current.paused = paused || mapOpen || mode !== "3d" || activePoint !== null;
  }, [activePoint, mapOpen, mode, paused]);

  useEffect(() => {
    const keyMap: Record<string, keyof Pick<ReturnType<typeof createPlayerInput>, "forward" | "backward" | "left" | "right">> = {
      ArrowUp: "forward",
      w: "forward",
      W: "forward",
      ArrowDown: "backward",
      s: "backward",
      S: "backward",
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isInteractiveTarget = target?.closest("button, a, input, select, textarea, summary");
      if (isInteractiveTarget && event.key !== "Escape") return;

      if (event.key === "Escape") {
        event.preventDefault();
        if (activePoint) closeStory();
        else if (mapOpen) closeMap();
        else if (paused) closePause();
        else if (mode === "3d") openPause();
        return;
      }

      if (activePoint || mapOpen || paused) return;

      const action = keyMap[event.key];
      if (action && mode === "3d") {
        event.preventDefault();
        inputRef.current[action] = true;
        dismissControlsHint();
      }
      if ((event.key === "Enter" || event.key === " ") && mode === "3d") {
        event.preventDefault();
        if (!paused) {
          setActionSerial((serial) => serial + 1);
          trackEventIfAvailable("world_character_action", { near_point: nearbyPointId ?? "none" });
        }
      }
      if ((event.key === "c" || event.key === "C") && mode === "3d") {
        setCameraResetSerial((serial) => serial + 1);
        trackEventIfAvailable("world_camera_recentered", { source: "keyboard" });
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const action = keyMap[event.key];
      if (action) inputRef.current[action] = false;
    };
    const clearKeys = () => {
      inputRef.current.forward = false;
      inputRef.current.backward = false;
      inputRef.current.left = false;
      inputRef.current.right = false;
      inputRef.current.joystickX = 0;
      inputRef.current.joystickY = 0;
      setJoystick({ x: 0, y: 0 });
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, [activePoint, closeMap, closePause, closeStory, dismissControlsHint, mapOpen, mode, nearbyPointId, openPause, paused]);

  const triggerAction = useCallback(() => {
    if (paused || mode !== "3d") return;
    setActionSerial((serial) => serial + 1);
    trackEventIfAvailable("world_character_action", { near_point: nearbyPointId ?? "none" });
  }, [mode, nearbyPointId, paused]);

  const openPoint = useCallback((pointId: WorldPointId) => {
    const point = WORLD_POINTS.find((candidate) => candidate.id === pointId) ?? null;
    if (!point) return;
    rememberSurfaceOpener();
    setMapOpen(false);
    setPaused(false);
    setActivePoint(point);
    setVisitedPoints((current) => (current.includes(pointId) ? current : [...current, pointId]));
    trackEventIfAvailable("point_of_interest_opened", { point_id: pointId, point_kind: point.kind });
    if (point.kind === "memória") trackEventIfAvailable("history_opened", { point_id: pointId });
    if (point.kind === "pauta") trackEventIfAvailable("agenda_opened", { point_id: pointId });
  }, [rememberSurfaceOpener]);

  const updatePlayerPosition = useCallback((position: {
    x: number;
    z: number;
    heading: number;
    moving: boolean;
    navigating: boolean;
    targetId: WorldPointId | null;
  }) => {
    setPlayerPosition((current) =>
      Math.abs(current.x - position.x) +
        Math.abs(current.z - position.z) +
        Math.abs(current.heading - position.heading) >
        0.08 ||
      current.navigating !== position.navigating ||
      current.targetId !== position.targetId
        ? position
        : current,
    );
  }, []);

  const updateZone = useCallback((zone: WorldZone) => {
    setCurrentZone(zone);
    setZoneReveal(zone);
    if (zoneRevealTimerRef.current) window.clearTimeout(zoneRevealTimerRef.current);
    zoneRevealTimerRef.current = window.setTimeout(() => setZoneReveal(null), 1600);
    trackEventIfAvailable("district_transition_entered", { zone });
  }, []);

  const updateSceneStats = useCallback((stats: SceneStats) => {
    const shell = worldShellRef.current;
    if (!shell) return;
    shell.dataset.drawCalls = String(stats.calls);
    shell.dataset.triangles = String(stats.triangles);
  }, []);

  function switchMode(nextMode: Exclude<ExperienceMode, "loading">) {
    if (nextMode === "3d" && !webglAvailable) return;
    if (nextMode === "3d") {
      runtimeFailureHandledRef.current = false;
      setScenePhase("booting");
      setRuntimeAttempt((attempt) => attempt + 1);
      const shell = worldShellRef.current;
      if (shell) {
        delete shell.dataset.drawCalls;
        delete shell.dataset.triangles;
      }
    } else {
      setScenePhase("ready");
    }
    setMode(nextMode);
    setPaused(false);
    const nextUrl = nextMode === "light" ? "/explorar?modo=leve" : "/explorar";
    window.history.replaceState(null, "", nextUrl);
    trackEventIfAvailable("world_mode_selected", { mode: nextMode });
  }

  function changePerformanceTier(nextTier: "balanced" | "high") {
    setPerformanceTier(nextTier);
    try {
      window.localStorage.setItem(QUALITY_KEY, nextTier);
    } catch {
      // O ajuste continua válido durante a sessão.
    }
    trackEventIfAvailable("world_performance_tier_selected", { tier: nextTier, source: "settings" });
  }

  function toggleReducedMotion() {
    setReducedMotion((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(MOTION_KEY, next ? "reduced" : "full");
      } catch {
        // O ajuste continua válido durante a sessão.
      }
      trackEventIfAvailable("world_motion_preference_changed", { reduced: next });
      return next;
    });
  }

  function cancelAssistedNavigation() {
    const targetId = playerPosition.targetId;
    const target = WORLD_POINTS.find((point) => point.id === targetId);
    simulation.cancelMove();
    setPlayerPosition((current) => ({
      ...current,
      moving: false,
      navigating: false,
      targetId: null,
    }));
    showJourneyNotice(
      "Rota cancelada",
      target ? getWorldPointShortTitle(target) : "Você retomou o controle",
      "route",
    );
    trackEventIfAvailable("world_assisted_navigation_cancelled", { point_id: targetId ?? "unknown" });
  }

  const selectMapPoint = useCallback((point: WorldPoint) => {
    dismissControlsHint();
    if (mode === "3d") {
      setMapOpen(false);
      restoreSurfaceFocus();
      simulation.moveTo(point);
      showJourneyNotice("Rota traçada", getWorldPointShortTitle(point), "route");
      trackEventIfAvailable("world_assisted_navigation", { point_id: point.id, source: "map" });
      return;
    }
    setMapOpen(false);
    openPoint(point.id);
  }, [dismissControlsHint, mode, openPoint, restoreSurfaceFocus, showJourneyNotice, simulation]);

  function updateJoystick(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const radius = rect.width / 2;
    const rawX = (event.clientX - (rect.left + radius)) / radius;
    const rawY = (event.clientY - (rect.top + radius)) / radius;
    const magnitude = Math.max(1, Math.hypot(rawX, rawY));
    const next = { x: rawX / magnitude, y: rawY / magnitude };
    inputRef.current.joystickX = next.x;
    inputRef.current.joystickY = next.y;
    setJoystick(next);
    dismissControlsHint();
  }

  function releaseJoystick(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    inputRef.current.joystickX = 0;
    inputRef.current.joystickY = 0;
    setJoystick({ x: 0, y: 0 });
  }

  if (mode === "loading") {
    return <WorldBootShell fullscreen />;
  }

  const nearbyPoint = WORLD_POINTS.find((point) => point.id === nearbyPointId) ?? null;
  const journeyComplete = visitedPoints.length >= WORLD_POINTS.length;
  const nextUnvisitedPoint = WORLD_POINTS.find((point) => !visitedPoints.includes(point.id)) ?? null;
  const navigationTarget = WORLD_POINTS.find((point) => point.id === playerPosition.targetId) ?? null;
  const objectiveTarget = navigationTarget ?? (journeyComplete ? null : nearbyPoint ?? nextUnvisitedPoint);
  const objectiveDistance = objectiveTarget
    ? Math.max(0, Math.round(Math.hypot(objectiveTarget.x - playerPosition.x, objectiveTarget.z - playerPosition.z)))
    : null;
  const objectiveTitle = objectiveTarget ? getWorldPointShortTitle(objectiveTarget) : "Travessia registrada";
  const objectiveSummary = objectiveTarget?.summary
    ?? "Os três marcos foram registrados. Agora escolha como levar essa transformação para fora da tela.";
  const objectiveMeta = objectiveTarget
    ? `${currentZone} · ${visitedPoints.length}/${WORLD_POINTS.length} · ${objectiveDistance} m`
    : `Travessia concluída · ${visitedPoints.length}/${WORLD_POINTS.length}`;
  const targetHeading = objectiveTarget
    ? Math.atan2(-(objectiveTarget.x - playerPosition.x), -(objectiveTarget.z - playerPosition.z))
    : playerPosition.heading;
  const objectiveBearing = normalizeAngle(targetHeading - playerPosition.heading);
  const journeyProgress = visitedPoints.length / WORLD_POINTS.length;
  const showMovementHint = controlsHintForced || (controlsHintVisible && !nearbyPoint);
  const showRouteHint = playerPosition.navigating && !nearbyPoint && !showMovementHint;
  const hintMode = showMovementHint ? "controls" : nearbyPoint ? "nearby" : showRouteHint ? "route" : null;
  const shellStyle = { "--journey-progress": `${journeyProgress * 100}%` } as CSSProperties;
  const activePointIndex = activePoint ? WORLD_POINTS.findIndex((point) => point.id === activePoint.id) : -1;
  const nextStoryPoint = activePointIndex >= 0 ? WORLD_POINTS[activePointIndex + 1] ?? null : null;
  const surfaceOpen = Boolean(activePoint || mapOpen || paused);
  const sceneReady = mode !== "3d" || scenePhase === "ready";

  return (
    <div
      ref={worldShellRef}
      className={styles.worldShell}
      data-mode={mode}
      data-zone={currentZone}
      data-reduced-motion={reducedMotion}
      data-scene-phase={mode === "3d" ? scenePhase : "ready"}
      data-hud-transient={Boolean(zoneReveal || journeyNotice)}
      aria-busy={mode === "3d" && !sceneReady}
      style={shellStyle}
    >
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {mode === "3d" && !sceneReady ? "Preparando o território interativo." : "Distrito pronto para explorar."}
      </div>
      <div
        className={styles.gameplayLayer}
        inert={surfaceOpen ? true : undefined}
        aria-hidden={surfaceOpen || undefined}
      >
      <header className={styles.topBar}>
        <Link
          href="/"
          prefetch={false}
          className={styles.backLink}
          title="Voltar para a landing"
          onClick={() => trackEventIfAvailable("world_returned_to_landing", { source: "header" })}
        >
          <span aria-hidden="true">←</span>
          <span className={styles.brandLabel}>Missão ÉLuta</span>
        </Link>
        <div className={styles.districtLabel}>
          <span>Distrito 01</span>
          Entre a Fábrica e o Jardim
        </div>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.modeButton}
            onClick={() => switchMode(mode === "3d" ? "light" : "3d")}
            disabled={mode === "light" && !webglAvailable}
            aria-label={mode === "3d" ? "Ativar modo leve" : "Ativar modo 3D"}
          >
            <span className={styles.actionIcon} aria-hidden="true">◐</span>
            <span className={styles.actionLabel}>{mode === "3d" ? "Leve" : webglAvailable ? "3D" : "Sem 3D"}</span>
          </button>
          <button
            type="button"
            onClick={() => openMap("header")}
            aria-expanded={mapOpen}
            disabled={!sceneReady}
          >
            <span className={styles.actionIcon} aria-hidden="true">⌖</span>
            <span className={styles.actionLabel}>Mapa</span>
          </button>
          {mode === "3d" ? (
            <>
              <button
                type="button"
                className={styles.cameraButton}
                onClick={() => {
                  setCameraResetSerial((serial) => serial + 1);
                  trackEventIfAvailable("world_camera_recentered", { source: "hud" });
                }}
                aria-label="Recentralizar câmera"
                disabled={!sceneReady}
              >
                <span className={styles.actionIcon} aria-hidden="true">◎</span>
                <span className={styles.actionLabel}>Câmera</span>
              </button>
              <button
                type="button"
                onClick={() => (paused ? closePause() : openPause())}
                aria-pressed={paused}
                aria-label={paused ? "Continuar jornada" : "Pausar jornada"}
                disabled={!sceneReady}
              >
                <span className={styles.actionIcon} aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
                <span className={styles.actionLabel}>{paused ? "Seguir" : "Pausa"}</span>
              </button>
            </>
          ) : null}
        </div>
      </header>

      {mode === "3d" ? (
        <div
          className={styles.journeyProgress}
          role="progressbar"
          aria-label="Progresso dos marcos registrados"
          aria-hidden={!sceneReady || undefined}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(journeyProgress * 100)}
        />
      ) : null}

      {mode === "3d" ? (
        <>
          <div
            className={styles.canvasWrap}
            data-ready={sceneReady}
            role="img"
            aria-label="Território 3D interativo entre a fábrica e o jardim"
          >
            <WorldRuntimeBoundary key={runtimeAttempt} onError={handleWorldError}>
              <WorldViewport
                simulation={simulation}
                inputRef={inputRef}
                actionSerial={actionSerial}
                cameraResetSerial={cameraResetSerial}
                reducedMotion={reducedMotion}
                quality={performanceTier}
                visitedPoints={visitedPoints}
                focusPointId={objectiveTarget?.id ?? null}
                onNearbyPoint={setNearbyPointId}
                onInteract={openPoint}
                onPositionChange={updatePlayerPosition}
                onZoneChange={updateZone}
                onSceneStats={updateSceneStats}
                onReady={handleWorldReady}
                onError={handleWorldError}
              />
            </WorldRuntimeBoundary>
            <WorldBootShell hidden={sceneReady} announce={false} />
          </div>

          <aside
            ref={objectiveCardRef}
            className={styles.objectiveCard}
            data-expanded={objectiveExpanded}
            data-complete={journeyComplete && !objectiveTarget}
            aria-label="Objetivo atual"
            aria-hidden={!sceneReady || undefined}
            inert={!sceneReady ? true : undefined}
          >
            <button
              type="button"
              className={styles.objectiveToggle}
              aria-expanded={objectiveExpanded}
              aria-controls="world-objective-details"
              onClick={() => {
                setObjectiveExpanded((expanded) => {
                  trackEventIfAvailable(expanded ? "world_objective_collapsed" : "world_objective_expanded");
                  return !expanded;
                });
              }}
            >
              <span>{objectiveMeta}</span>
              <strong>{objectiveTitle}</strong>
              {objectiveTarget ? (
                <span
                  className={styles.objectiveCompass}
                  style={{ "--objective-bearing": `${objectiveBearing}rad` } as CSSProperties}
                  aria-hidden="true"
                >
                  <b>↑</b>
                </span>
              ) : (
                <span className={styles.objectiveCompleteMark} aria-hidden="true">✓</span>
              )}
              <i aria-hidden="true">{objectiveExpanded ? "−" : "+"}</i>
            </button>
            <div
              id="world-objective-details"
              className={styles.objectiveDetails}
              aria-hidden={!objectiveExpanded}
              inert={!objectiveExpanded}
            >
              <p>{objectiveSummary}</p>
              <div
                className={styles.checkpointTrail}
                role="progressbar"
                aria-label="Marcos visitados"
                aria-valuemin={0}
                aria-valuemax={3}
                aria-valuenow={visitedPoints.length}
              >
                {WORLD_POINTS.map((point, index) => (
                  <span
                    key={point.id}
                    data-visited={visitedPoints.includes(point.id)}
                    data-current={objectiveTarget?.id === point.id}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
            {!nearbyPoint && (playerPosition.navigating || nextUnvisitedPoint) ? (
              <button
                type="button"
                tabIndex={objectiveExpanded ? 0 : -1}
                onClick={() => {
                  if (playerPosition.navigating) {
                    cancelAssistedNavigation();
                  } else {
                    if (!nextUnvisitedPoint) return;
                    dismissControlsHint();
                    simulation.moveTo(nextUnvisitedPoint);
                    showJourneyNotice("Rota traçada", getWorldPointShortTitle(nextUnvisitedPoint), "route");
                    trackEventIfAvailable("world_assisted_navigation", { point_id: nextUnvisitedPoint.id });
                  }
                }}
              >
                {playerPosition.navigating ? "Cancelar rota assistida" : "Ir até o próximo marco"}
              </button>
            ) : journeyComplete && !nearbyPoint ? (
              <button
                type="button"
                tabIndex={objectiveExpanded ? 0 : -1}
                onClick={() => openMap("header")}
              >
                Rever os marcos no mapa
              </button>
            ) : null}
            </div>
          </aside>

          {sceneReady && zoneReveal ? (
            <div className={styles.zoneReveal} role="status">
              <span>{ZONE_COPY[zoneReveal].eyebrow}</span>
              <strong>{ZONE_COPY[zoneReveal].title}</strong>
            </div>
          ) : null}

          {sceneReady && journeyNotice ? (
            <div
              className={styles.journeyNotice}
              data-tone={journeyNotice.tone}
              data-offset={Boolean(zoneReveal)}
              aria-hidden="true"
            >
              <span>{journeyNotice.eyebrow}</span>
              <strong>{journeyNotice.title}</strong>
            </div>
          ) : null}

          {sceneReady && hintMode ? (
            <div
              className={styles.contextHint}
              data-visible="true"
              data-nearby={hintMode === "nearby"}
              data-mode={hintMode}
            >
              <span
                aria-hidden="true"
                style={hintMode === "controls" ? { transform: `rotate(${objectiveBearing}rad)` } : undefined}
              >
                {hintMode === "nearby" ? "✦" : hintMode === "route" ? "↝" : "↑"}
              </span>
              <p>
                <small>{hintMode === "nearby" ? nearbyPoint?.kind : hintMode === "route" ? "Rota assistida" : "Como explorar"}</small>
                <strong>
                  {hintMode === "nearby"
                    ? "Use Interagir para abrir este marco"
                    : hintMode === "route"
                      ? "Toque no controle para assumir o caminho"
                      : "Arraste o controle para caminhar"}
                </strong>
              </p>
            </div>
          ) : null}

          <div
            className={styles.mobileControls}
            aria-label="Controles do personagem"
            aria-hidden={!sceneReady || undefined}
            inert={!sceneReady ? true : undefined}
          >
            <div
              className={styles.joystick}
              data-active={Math.hypot(joystick.x, joystick.y) > 0.08}
              role="group"
              aria-label="Controle direcional: arraste para caminhar"
              aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight W A S D"
              tabIndex={0}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                updateJoystick(event);
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) updateJoystick(event);
              }}
              onPointerUp={releaseJoystick}
              onPointerCancel={releaseJoystick}
            >
              <span
                style={{ transform: `translate(${joystick.x * 31}px, ${joystick.y * 31}px)` }}
                aria-hidden="true"
              />
            </div>
            <button type="button" className={styles.actionButton} data-nearby={Boolean(nearbyPoint)} onClick={triggerAction}>
              <span aria-hidden="true">✦</span>
              {nearbyPoint ? "Interagir" : "Saudar"}
            </button>
          </div>

          <p className={styles.keyboardHint}>WASD para caminhar · Enter para interagir · C para câmera</p>
        </>
      ) : (
        <LightMode
          visitedPoints={visitedPoints}
          onOpenPoint={openPoint}
          onEnable3d={() => switchMode("3d")}
          canEnable3d={webglAvailable}
        />
      )}
      </div>

      {activePoint ? (
        <>
          <div className={styles.storyScrim} aria-hidden="true" onPointerDown={closeStory} />
          <aside
            ref={storyDialogRef}
            className={styles.storyPanel}
            data-kind={activePoint.kind}
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-panel-title"
            aria-describedby="story-panel-body"
          >
            <button
              type="button"
              ref={storyCloseRef}
              className={styles.closeButton}
              onClick={closeStory}
              aria-label="Fechar diário de campo"
            >
              ×
            </button>
            <div className={styles.storyMeta}>
              <span>Diário de campo · {activePoint.kind}</span>
              <strong>Marco {String(activePointIndex + 1).padStart(2, "0")} de {String(WORLD_POINTS.length).padStart(2, "0")} · registrado</strong>
            </div>
            <div className={styles.storyProgress} aria-hidden="true">
              {WORLD_POINTS.map((point, index) => (
                <span key={point.id} data-complete={index <= activePointIndex} />
              ))}
            </div>
            <h2 id="story-panel-title">{activePoint.title}</h2>
            <p id="story-panel-body">{activePoint.body}</p>
            {activePoint.id === "missao" ? (
              <button
                type="button"
                className={styles.storyMissionButton}
                aria-pressed={missionSelectedInWorld}
                onClick={() => {
                  selectStoredMission(window.localStorage, "celular");
                  setMissionSelectedInWorld(true);
                  trackEventIfAvailable("mission_selected_from_world", { mission: "celular" });
                }}
              >
                {missionSelectedInWorld ? "Missão celular selecionada ✓" : "Selecionar: ajudar pelo celular"}
              </button>
            ) : null}
            <div className={styles.storyFooter}>
              {activePoint.actionHref && activePoint.actionLabel ? (
                activePoint.external ? (
                  <a
                    href={activePoint.actionHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.storyAction}
                    onClick={() =>
                      trackEventIfAvailable("world_cta_clicked", {
                        point_id: activePoint.id,
                        destination: activePoint.actionHref,
                      })
                    }
                  >
                    {activePoint.actionLabel}
                    <span aria-hidden="true">↗</span>
                    <span className={styles.srOnly}>(abre em nova aba)</span>
                  </a>
                ) : (
                  <Link
                    href={activePoint.actionHref}
                    className={styles.storyAction}
                    onClick={() =>
                      trackEventIfAvailable("world_cta_clicked", {
                        point_id: activePoint.id,
                        destination: activePoint.actionHref,
                      })
                    }
                  >
                    {activePoint.actionLabel}
                    <span aria-hidden="true">→</span>
                  </Link>
                )
              ) : null}
              {nextStoryPoint ? (
                <button
                  type="button"
                  className={styles.storyNext}
                  onClick={() => {
                    trackEventIfAvailable("world_story_continued", {
                      from_point_id: activePoint.id,
                      to_point_id: nextStoryPoint.id,
                    });
                    if (mode === "3d") {
                      dismissControlsHint();
                      setActivePoint(null);
                      restoreSurfaceFocus();
                      simulation.moveTo(nextStoryPoint);
                      showJourneyNotice("Rota traçada", getWorldPointShortTitle(nextStoryPoint), "route");
                    } else {
                      openPoint(nextStoryPoint.id);
                    }
                  }}
                >
                  <small>Continuar percurso</small>
                  <strong>{nextStoryPoint.title}</strong>
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                <p className={styles.storyComplete}>Travessia registrada · 03/03</p>
              )}
            </div>
          </aside>
        </>
      ) : null}

      {paused ? (
        <div className={styles.pauseOverlay} role="dialog" aria-modal="true" aria-labelledby="pause-title">
          <div ref={pauseDialogRef}>
            <span>Jornada pausada</span>
            <h2 id="pause-title">O território espera.</h2>
            <button ref={pausePrimaryRef} type="button" onClick={closePause}>Continuar explorando</button>
            <button
              type="button"
              onClick={() => openMap("pause")}
            >
              Abrir mapa do território
            </button>
            <button
              type="button"
              onClick={() => {
                closePause();
                switchMode("light");
              }}
            >
              Usar modo leve
            </button>
            <button
              type="button"
              onClick={() => {
                setCameraResetSerial((serial) => serial + 1);
                closePause();
                trackEventIfAvailable("world_camera_recentered", { source: "pause" });
              }}
            >
              Recentralizar câmera
            </button>
            <button
              type="button"
              onClick={() => {
                closePause();
                setControlsHintVisible(true);
                setControlsHintForced(true);
              }}
            >
              Mostrar controles
            </button>
            <details className={styles.pauseSettings}>
              <summary>Acessibilidade e desempenho</summary>
              <div>
                <button
                  type="button"
                  aria-pressed={performanceTier === "high"}
                  onClick={() => changePerformanceTier(performanceTier === "high" ? "balanced" : "high")}
                >
                  Qualidade: {performanceTier === "high" ? "detalhada" : "equilibrada"}
                </button>
                <button type="button" aria-pressed={reducedMotion} onClick={toggleReducedMotion}>
                  Movimento reduzido: {reducedMotion ? "ligado" : "desligado"}
                </button>
              </div>
            </details>
            <Link
              href="/"
              prefetch={false}
              onClick={() => trackEventIfAvailable("world_returned_to_landing", { source: "pause" })}
            >
              Voltar para a landing
            </Link>
          </div>
        </div>
      ) : null}

      {mapOpen ? (
        <div className={styles.mapOverlay} role="dialog" aria-modal="true" aria-labelledby="map-title">
          <div ref={mapDialogRef}>
            <button
              type="button"
              ref={mapCloseRef}
              className={styles.closeButton}
              onClick={closeMap}
              aria-label="Fechar mapa"
            >
              ×
            </button>
            <span>Mapa narrativo</span>
            <h2 id="map-title">Do portão à Central de Missões</h2>
            <SpatialMap
              position={playerPosition}
              visitedPoints={visitedPoints}
              onSelectPoint={selectMapPoint}
            />
            <ol>
              {WORLD_POINTS.map((point, index) => (
                <li key={point.id} data-visited={visitedPoints.includes(point.id)}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <button
                    type="button"
                    onClick={() => selectMapPoint(point)}
                    aria-label={`${point.title}. ${visitedPoints.includes(point.id) ? "Visitado" : "Não visitado"}. ${mode === "3d" ? "Traçar rota" : "Abrir ponto"}.`}
                  >
                    <small>{point.kind}</small>
                    <strong>{point.title}</strong>
                    <span className={styles.srOnly}>
                      {visitedPoints.includes(point.id) ? "Visitado" : "Não visitado"}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}

      <div className={styles.liveRegion} aria-live="polite">
        {journeyNotice
          ? `${journeyNotice.eyebrow}: ${journeyNotice.title}.`
          : nearbyPoint
            ? `Ponto próximo: ${nearbyPoint.title}. Use o botão Interagir.`
            : ""}
      </div>
    </div>
  );
}

function SpatialMap({
  position,
  visitedPoints,
  onSelectPoint,
}: {
  position: { x: number; z: number };
  visitedPoints: WorldPointId[];
  onSelectPoint: (point: WorldPoint) => void;
}) {
  const playerStyle = {
    "--player-x": `${MathUtilsClamp((position.x + 5) / 10, 0.04, 0.96) * 100}%`,
    "--player-y": `${MathUtilsClamp((2.5 - position.z) / 13, 0.03, 0.97) * 100}%`,
  } as CSSProperties;

  return (
    <div className={styles.spatialMap} style={playerStyle} aria-label="Mapa espacial do território">
      <div className={styles.mapZones} aria-hidden="true">
        <span>Fábrica</span>
        <span>Mutirão</span>
        <span>Jardim</span>
      </div>
      <svg viewBox="0 0 320 260" role="img" aria-label="Caminho curvo entre os três marcos">
        <path d="M160 10 C128 54 202 80 173 126 C141 174 181 194 160 250" />
      </svg>
      {WORLD_POINTS.map((point, index) => (
        <button
          type="button"
          key={point.id}
          className={styles.mapPoint}
          data-visited={visitedPoints.includes(point.id)}
          style={{ left: `${MathUtilsClamp((point.x + 5) / 10, 0.04, 0.96) * 100}%`, top: `${MathUtilsClamp((2.5 - point.z) / 13, 0.03, 0.97) * 100}%` }}
          aria-label={`${index + 1}. ${point.title}. ${visitedPoints.includes(point.id) ? "Visitado" : "Não visitado"}. Selecionar marco.`}
          title={point.title}
          onClick={() => onSelectPoint(point)}
        >
          {index + 1}
          <span className={styles.mapPointLabel} aria-hidden="true">
            {point.id === "memoria" ? "Memorial" : point.id === "comum" ? "O comum" : "Missões"}
          </span>
        </button>
      ))}
      <span className={styles.mapPlayer} aria-label="Sua posição"><i /></span>
    </div>
  );
}

function MathUtilsClamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAngle(value: number) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function getWorldPointShortTitle(point: WorldPoint) {
  if (point.id === "memoria") return "Memorial 9 de Novembro";
  if (point.id === "comum") return "Do abandono ao comum";
  return "Central de Missões";
}

function LightMode({
  visitedPoints,
  onOpenPoint,
  onEnable3d,
  canEnable3d,
}: {
  visitedPoints: WorldPointId[];
  onOpenPoint: (pointId: WorldPointId) => void;
  onEnable3d: () => void;
  canEnable3d: boolean;
}) {
  return (
    <section className={styles.lightMode} aria-labelledby="light-mode-title">
      <div className={styles.lightIntro}>
        <div>
          <span>Exploração acessível</span>
          <h1 id="light-mode-title">Entre a Fábrica e o Jardim</h1>
          <p>
            Percorra a mesma história sem WebGL. Todo conteúdo, missão e próximo passo continua disponível.
          </p>
          {canEnable3d ? <button type="button" onClick={onEnable3d}>Experimentar modo 3D</button> : null}
        </div>
        <Image
          src="/alexandre-retrato-hero.webp"
          alt="Alexandre VR Abandonada"
          width={520}
          height={520}
          sizes="(max-width: 700px) 80vw, 380px"
        />
      </div>
      <ol className={styles.lightJourney}>
        {WORLD_POINTS.map((point, index) => (
          <li key={point.id} data-visited={visitedPoints.includes(point.id)}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <small>{point.kind}</small>
              <h2>{point.title}</h2>
              <p>{point.summary}</p>
              <button type="button" onClick={() => onOpenPoint(point.id)}>Abrir ponto</button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function isWorldPointId(value: unknown): value is WorldPointId {
  return typeof value === "string" && WORLD_POINTS.some((point) => point.id === value);
}
