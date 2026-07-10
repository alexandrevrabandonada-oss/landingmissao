"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { memo, useEffect, useRef, type MutableRefObject } from "react";
import { WorldScene, type SceneStats, type WorldZone } from "./WorldScene";
import type {
  PlayerInput,
  PlayerSimulation,
  WorldPointId,
} from "./worldSimulation";

interface WorldViewportProps {
  simulation: PlayerSimulation;
  inputRef: MutableRefObject<PlayerInput>;
  actionSerial: number;
  cameraResetSerial: number;
  reducedMotion: boolean;
  quality: "balanced" | "high";
  visitedPoints: WorldPointId[];
  focusPointId: WorldPointId | null;
  onNearbyPoint: (pointId: WorldPointId | null) => void;
  onInteract: (pointId: WorldPointId) => void;
  onPositionChange: (position: {
    x: number;
    z: number;
    heading: number;
    moving: boolean;
    navigating: boolean;
    targetId: WorldPointId | null;
  }) => void;
  onZoneChange: (zone: WorldZone) => void;
  onSceneStats: (stats: SceneStats) => void;
  onReady: () => void;
  onError: () => void;
}

const BALANCED_DPR: [number, number] = [0.9, 1.2];
const HIGH_DPR: [number, number] = [1, 1.45];
const CAMERA_CONFIG = {
  position: [2.4, 3.8, 9.5] as [number, number, number],
  fov: 49,
  near: 0.1,
  far: 70,
};
const GL_CONFIG = {
  antialias: false,
  alpha: false,
  stencil: false,
  powerPreference: "high-performance" as const,
};

export const WorldViewport = memo(function WorldViewport({
  simulation,
  inputRef,
  actionSerial,
  cameraResetSerial,
  reducedMotion,
  quality,
  visitedPoints,
  focusPointId,
  onNearbyPoint,
  onInteract,
  onPositionChange,
  onZoneChange,
  onSceneStats,
  onReady,
  onError,
}: WorldViewportProps) {
  return (
    <Canvas
      dpr={quality === "balanced" ? BALANCED_DPR : HIGH_DPR}
      camera={CAMERA_CONFIG}
      gl={GL_CONFIG}
    >
      <RuntimeLifecycle onReady={onReady} onError={onError} />
      <WorldScene
        simulation={simulation}
        inputRef={inputRef}
        actionSerial={actionSerial}
        cameraResetSerial={cameraResetSerial}
        reducedMotion={reducedMotion}
        quality={quality}
        visitedPoints={visitedPoints}
        focusPointId={focusPointId}
        onNearbyPoint={onNearbyPoint}
        onInteract={onInteract}
        onPositionChange={onPositionChange}
        onZoneChange={onZoneChange}
        onSceneStats={onSceneStats}
      />
    </Canvas>
  );
});

function RuntimeLifecycle({ onReady, onError }: { onReady: () => void; onError: () => void }) {
  const gl = useThree((state) => state.gl);
  const firstFrameReported = useRef(false);
  const readyFrame = useRef<number | null>(null);

  useFrame(() => {
    if (firstFrameReported.current) return;
    firstFrameReported.current = true;
    readyFrame.current = window.requestAnimationFrame(onReady);
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLoss);
      if (readyFrame.current !== null) window.cancelAnimationFrame(readyFrame.current);
    };
  }, [gl, onError]);

  return null;
}
