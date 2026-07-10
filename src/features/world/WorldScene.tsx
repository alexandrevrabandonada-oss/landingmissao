"use client";

import { useFrame, useThree } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  DynamicDrawUsage,
  Fog,
  MathUtils,
  Object3D,
  PerspectiveCamera,
  Vector3,
  type DirectionalLight,
  type Group,
  type HemisphereLight,
  type InstancedMesh,
  type MeshBasicMaterial,
  type PointLight,
  type Points,
} from "three";
import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { InteractiveAlexandre } from "./InteractiveAlexandre";
import {
  WORLD_POINTS,
  type PlayerInput,
  type PlayerSimulation,
  type WorldPointId,
} from "./worldSimulation";

const MemorialAsset = lazy(() =>
  import("./MemorialAsset").then((module) => ({ default: module.MemorialAsset })),
);
const MEMORIAL_POINT = WORLD_POINTS.find((point) => point.id === "memoria") ?? null;

export type WorldZone = "fábrica" | "transição" | "jardim";
export interface SceneStats { calls: number; triangles: number }
type MemorialAssetStatus = "deferred" | "loading" | "ready" | "fallback";
type BeaconRegistry = Partial<Record<WorldPointId, Group | null>>;
type BeaconRegistryRef = MutableRefObject<BeaconRegistry>;

interface WorldSceneProps {
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
  onPositionChange: (position: { x: number; z: number; heading: number; moving: boolean; navigating: boolean; targetId: WorldPointId | null }) => void;
  onZoneChange: (zone: WorldZone) => void;
  onSceneStats: (stats: SceneStats) => void;
}

export function WorldScene(props: WorldSceneProps) {
  const [memorialAssetStatus, setMemorialAssetStatus] = useState<MemorialAssetStatus>("deferred");
  const beaconRegistry = useRef<BeaconRegistry>({});
  const handleMemorialLoadStart = useCallback(
    () => setMemorialAssetStatus((status) => status === "deferred" ? "loading" : status),
    [],
  );
  const handleMemorialReady = useCallback(
    () => setMemorialAssetStatus((status) => status === "loading" ? "ready" : status),
    [],
  );
  const handleMemorialError = useCallback(
    () => setMemorialAssetStatus((status) => status === "loading" ? "fallback" : status),
    [],
  );

  return (
    <>
      <color attach="background" args={["#202a31"]} />
      <fog attach="fog" args={["#394348", 17, 46]} />
      <StaticWorld
        simulation={props.simulation}
        reducedMotion={props.reducedMotion}
        quality={props.quality}
      />
      <BeaconMotionController
        registryRef={beaconRegistry}
        visitedPoints={props.visitedPoints}
        focusPointId={props.focusPointId}
        reducedMotion={props.reducedMotion}
      />
      {WORLD_POINTS.map((point) => (
        <NarrativeLandmark
          key={point.id}
          pointId={point.id}
          position={[point.x, 0, point.z]}
          visited={props.visitedPoints.includes(point.id)}
          active={props.focusPointId === point.id}
          beaconRegistryRef={beaconRegistry}
          simulation={props.simulation}
          memorialAssetStatus={memorialAssetStatus}
          onMemorialLoadStart={handleMemorialLoadStart}
          onMemorialReady={handleMemorialReady}
          onMemorialError={handleMemorialError}
        />
      ))}

      <InteractiveAlexandre
        simulation={props.simulation}
        inputRef={props.inputRef}
        actionSerial={props.actionSerial}
        reducedMotion={props.reducedMotion}
        onNearbyPoint={props.onNearbyPoint}
        onInteract={props.onInteract}
      />
      <CameraRig
        simulation={props.simulation}
        resetSerial={props.cameraResetSerial}
        reducedMotion={props.reducedMotion}
        focusPointId={props.focusPointId}
      />
      <SceneTelemetry
        simulation={props.simulation}
        onPositionChange={props.onPositionChange}
        onZoneChange={props.onZoneChange}
        onSceneStats={props.onSceneStats}
        assetStatus={memorialAssetStatus}
      />
    </>
  );
}

const StaticWorld = memo(function StaticWorld({
  simulation,
  reducedMotion,
  quality,
}: {
  simulation: PlayerSimulation;
  reducedMotion: boolean;
  quality: "balanced" | "high";
}) {
  return (
    <>
      <ZoneAtmosphere simulation={simulation} reducedMotion={reducedMotion} />
      <SkyAndHorizon simulation={simulation} />
      <TerritoryGround />
      <IndustrialZone />
      <TransitionZone />
      <GardenZone reducedMotion={reducedMotion} />
      <VegetationInstances />
      <IndustrialDebris />
      <ReflectivePuddles />
      <GroundShadows />
      <UrbanLights />
      <WayfindingTotems />
      <LandmarkIdentityInstances />
      <EnvironmentalMotion reducedMotion={reducedMotion} quality={quality} />
    </>
  );
});

type LandmarkIdentityPart = {
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
  scale: readonly [number, number, number];
  color: string;
};

function LandmarkIdentityInstances() {
  const structures = useRef<InstancedMesh>(null);
  const symbols = useRef<InstancedMesh>(null);
  const transform = useMemo(() => new Object3D(), []);
  const structureParts = useMemo<LandmarkIdentityPart[]>(() => [
    // Memorial: fissuras no piso e testemunhos inclinados preservam a ideia de ruptura.
    { position: [-3.1, 0.035, -2.05], rotation: [0, 0.7, 0], scale: [1.15, 0.045, 0.075], color: "#a34f39" },
    { position: [-2.55, 0.036, -1.88], rotation: [0, -0.25, 0], scale: [0.82, 0.045, 0.065], color: "#467579" },
    { position: [-1.68, 0.034, -2.15], rotation: [0, -0.8, 0], scale: [1.02, 0.045, 0.07], color: "#bd704b" },
    { position: [-3.18, 0.035, -3.25], rotation: [0, -0.55, 0], scale: [0.9, 0.045, 0.065], color: "#744a40" },
    { position: [-1.63, 0.034, -3.32], rotation: [0, 0.62, 0], scale: [0.86, 0.045, 0.065], color: "#3c6267" },
    { position: [-3.48, 0.55, -2.72], rotation: [0.08, 0, -0.12], scale: [0.09, 1.1, 0.09], color: "#765047" },
    { position: [-1.23, 0.42, -2.62], rotation: [-0.05, 0, 0.14], scale: [0.08, 0.84, 0.08], color: "#55706b" },

    // Comum: um pórtico aberto enquadra o espaço de encontro sem fechá-lo.
    { position: [1.02, 1.05, -7.12], rotation: [0, 0, -0.025], scale: [0.13, 2.1, 0.13], color: "#729b58" },
    { position: [3.18, 1.05, -7.12], rotation: [0, 0, 0.025], scale: [0.13, 2.1, 0.13], color: "#729b58" },
    { position: [2.1, 2.08, -7.12], scale: [2.28, 0.13, 0.13], color: "#b49a53" },
    { position: [2.1, 0.035, -5.38], scale: [0.07, 0.045, 1.15], color: "#638a55" },
    { position: [1.27, 0.035, -5.68], rotation: [0, -0.7, 0], scale: [0.07, 0.045, 0.92], color: "#8a7345" },
    { position: [2.93, 0.035, -5.68], rotation: [0, 0.7, 0], scale: [0.07, 0.045, 0.92], color: "#8a7345" },

    // Central: moldura cívica forte, reconhecível mesmo atrás do HUD mobile.
    { position: [-1.18, 1.13, -9.15], scale: [0.12, 2.26, 0.12], color: "#d6a848" },
    { position: [1.18, 1.13, -9.15], scale: [0.12, 2.26, 0.12], color: "#d6a848" },
    { position: [0, 2.27, -9.15], scale: [2.48, 0.12, 0.12], color: "#f0bd4f" },
    { position: [0, 0.08, -9.15], scale: [2.48, 0.08, 0.12], color: "#856f43" },
  ], []);
  const symbolParts = useMemo<LandmarkIdentityPart[]>(() => [
    { position: [-3.05, 0.25, -1.92], rotation: [0, 0, 0.15], scale: [0.17, 0.27, 0.17], color: "#d96542" },
    { position: [-2.35, 0.2, -1.7], rotation: [0, 0, -0.2], scale: [0.14, 0.22, 0.14], color: "#d8a55a" },
    { position: [-1.65, 0.24, -1.94], rotation: [0, 0, 0.2], scale: [0.16, 0.25, 0.16], color: "#5e9290" },
    { position: [1.42, 0.23, -6.58], scale: [0.16, 0.24, 0.16], color: "#83b95e" },
    { position: [2.1, 0.22, -6.35], rotation: [0, 0, 0.2], scale: [0.15, 0.22, 0.15], color: "#d1af58" },
    { position: [2.78, 0.23, -6.58], rotation: [0, 0, -0.2], scale: [0.16, 0.24, 0.16], color: "#6fa488" },
    { position: [-0.48, 2.48, -9.13], scale: [0.16, 0.16, 0.16], color: "#d96542" },
    { position: [0, 2.48, -9.13], rotation: [0, 0, Math.PI / 4], scale: [0.16, 0.16, 0.16], color: "#ffd15c" },
    { position: [0.48, 2.48, -9.13], scale: [0.16, 0.16, 0.16], color: "#83b95e" },
  ], []);

  useLayoutEffect(() => {
    const applyParts = (mesh: InstancedMesh | null, parts: LandmarkIdentityPart[]) => {
      if (!mesh) return;
      parts.forEach((part, index) => {
        transform.position.set(...part.position);
        transform.rotation.set(...(part.rotation ?? [0, 0, 0]), "XYZ");
        transform.scale.set(...part.scale);
        transform.updateMatrix();
        mesh.setMatrixAt(index, transform.matrix);
        mesh.setColorAt(index, new Color(part.color));
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    };

    applyParts(structures.current, structureParts);
    applyParts(symbols.current, symbolParts);
  }, [structureParts, symbolParts, transform]);

  return (
    <group>
      <instancedMesh ref={structures} args={[undefined, undefined, structureParts.length]}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.9} metalness={0.08} />
      </instancedMesh>
      <instancedMesh ref={symbols} args={[undefined, undefined, symbolParts.length]} renderOrder={2}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}

function CameraRig({
  simulation,
  resetSerial,
  reducedMotion,
  focusPointId,
}: {
  simulation: PlayerSimulation;
  resetSerial: number;
  reducedMotion: boolean;
  focusPointId: WorldPointId | null;
}) {
  const { camera } = useThree();
  const cameraTarget = useMemo(() => new Vector3(), []);
  const lookTarget = useMemo(() => new Vector3(), []);
  const smoothedLookTarget = useMemo(() => new Vector3(0, 1.35, -1), []);
  const focusPoint = useMemo(
    () => WORLD_POINTS.find((point) => point.id === focusPointId) ?? null,
    [focusPointId],
  );
  const lastReset = useRef(resetSerial);
  const introUntil = useRef(2.8);

  useFrame((state, delta) => {
    if (lastReset.current !== resetSerial) {
      lastReset.current = resetSerial;
      introUntil.current = state.clock.elapsedTime + 1.25;
    }
    const intro = state.clock.elapsedTime < introUntil.current && !simulation.moving;
    const territoryProgress = MathUtils.clamp((2.25 - simulation.z) / 11.7, 0, 1);
    const portrait = camera instanceof PerspectiveCamera && camera.aspect < 0.82;
    const landscape = camera instanceof PerspectiveCamera && camera.aspect > 1.35;
    const lateralScale = portrait ? 0.58 : 1;
    const rawLateral = (intro ? 2.45 : MathUtils.lerp(1.05, -0.45, territoryProgress)) * lateralScale;
    const shoulderDirection = focusPoint?.id === "missao" ? -1 : 1;
    const lateralFloor = portrait ? 0.48 : landscape ? 0.95 : 0.65;
    const lateral = intro || !focusPoint
      ? rawLateral
      : shoulderDirection * Math.max(Math.abs(rawLateral), lateralFloor);
    const cameraHeight = (intro ? 3.75 : MathUtils.lerp(4.05, 4.65, territoryProgress)) + (landscape ? 0.3 : 0);
    const cameraDistance = (intro ? 7.3 : MathUtils.lerp(8.35, 9.35, territoryProgress)) + (landscape ? 0.7 : 0);
    const lookAhead = MathUtils.lerp(3.1, 4.15, territoryProgress) + (landscape ? 0.25 : 0);
    const sway = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 1.1) * 0.045;
    const focusDistance = focusPoint
      ? Math.hypot(focusPoint.x - simulation.x, focusPoint.z - simulation.z)
      : Number.POSITIVE_INFINITY;
    const focusReveal = focusPoint
      ? 1 - MathUtils.clamp((focusDistance - 0.65) / 3.5, 0, 1)
      : 0;
    const focusInfluence = focusPoint
      ? simulation.navigationTargetId === focusPoint.id
        ? 0.34
        : MathUtils.lerp(0.14, 0.28, 1 - MathUtils.clamp(focusDistance / 9, 0, 1))
      : 0;
    const opposingOffset = focusPoint
      ? MathUtils.clamp((focusPoint.x - simulation.x) * 0.1, -0.3, 0.3)
      : 0;
    const standardCameraX = simulation.x + lateral + sway - opposingOffset;
    const standardCameraZ = simulation.z + cameraDistance;
    const revealOffset = portrait ? 0.72 : landscape ? 1.15 : 0.9;
    const revealCameraX = standardCameraX + shoulderDirection * revealOffset;
    const revealCameraZ = standardCameraZ - (portrait ? 0.7 : 0.9);
    cameraTarget.set(
      MathUtils.lerp(standardCameraX, revealCameraX, focusReveal),
      MathUtils.lerp(cameraHeight, portrait ? 3.55 : landscape ? 3.95 : 3.8, focusReveal),
      MathUtils.lerp(standardCameraZ, revealCameraZ, focusReveal),
    );
    const speed = intro ? 3.6 : 5.8;
    camera.position.lerp(cameraTarget, 1 - Math.exp(-delta * speed));
    const standardLookX = MathUtils.lerp(
      simulation.x - (intro ? 0.22 : 0),
      focusPoint?.x ?? simulation.x,
      focusInfluence,
    );
    const standardLookZ = MathUtils.lerp(
      simulation.z - lookAhead,
      focusPoint?.z ?? simulation.z - lookAhead,
      focusInfluence,
    );
    lookTarget.set(
      MathUtils.lerp(standardLookX, focusPoint?.x ?? standardLookX, focusReveal * 0.94),
      MathUtils.lerp(1.35, 1.25, focusReveal),
      MathUtils.lerp(standardLookZ, focusPoint?.z ?? standardLookZ, focusReveal * 0.94),
    );
    smoothedLookTarget.lerp(lookTarget, 1 - Math.exp(-delta * 5.2));
    camera.lookAt(smoothedLookTarget);
    const targetFov = MathUtils.lerp(49, 46, territoryProgress)
      + (portrait ? 1.5 : 0)
      + (landscape ? 1.5 : 0)
      + focusReveal * (portrait ? 1.8 : 0.8);
    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = MathUtils.lerp(camera.fov, targetFov, 1 - Math.exp(-delta * 3.5));
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function SceneTelemetry({
  simulation,
  onPositionChange,
  onZoneChange,
  onSceneStats,
  assetStatus,
}: Pick<WorldSceneProps, "simulation" | "onPositionChange" | "onZoneChange" | "onSceneStats"> & {
  assetStatus: MemorialAssetStatus;
}) {
  const { gl } = useThree();
  const lastReport = useRef(0);
  const lastZone = useRef<WorldZone>("fábrica");
  const statsReported = useRef(false);

  useEffect(() => {
    statsReported.current = false;
  }, [assetStatus]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (elapsed - lastReport.current > 0.25) {
      lastReport.current = elapsed;
      onPositionChange({
        x: simulation.x,
        z: simulation.z,
        heading: simulation.heading,
        moving: simulation.moving,
        navigating: simulation.autoNavigating,
        targetId: simulation.navigationTargetId,
      });
      const zone: WorldZone = simulation.z > -3.8 ? "fábrica" : simulation.z > -7.2 ? "transição" : "jardim";
      if (zone !== lastZone.current) {
        lastZone.current = zone;
        onZoneChange(zone);
      }
    }
    if (!statsReported.current && assetStatus !== "loading" && elapsed > 2) {
      statsReported.current = true;
      onSceneStats({ calls: gl.info.render.calls, triangles: gl.info.render.triangles });
    }
  });
  return null;
}

function ZoneAtmosphere({
  simulation,
  reducedMotion,
}: {
  simulation: PlayerSimulation;
  reducedMotion: boolean;
}) {
  const { scene } = useThree();
  const hemisphere = useRef<HemisphereLight>(null);
  const directional = useRef<DirectionalLight>(null);
  const particles = useRef<Points>(null);
  const industrialLight = useRef<PointLight>(null);
  const gardenLight = useRef<PointLight>(null);
  const background = useMemo(() => new Color(), []);
  const fogColor = useMemo(() => new Color(), []);
  const coldSky = useMemo(() => new Color("#2c373f"), []);
  const warmSky = useMemo(() => new Color("#68735d"), []);
  const coldFog = useMemo(() => new Color("#344047"), []);
  const warmFog = useMemo(() => new Color("#66705b"), []);
  const warmHemisphere = useMemo(() => new Color("#f1d799"), []);
  const coldDirectional = useMemo(() => new Color("#bfd2d0"), []);
  const warmDirectional = useMemo(() => new Color("#ffe0a1"), []);
  const coldGround = useMemo(() => new Color("#302820"), []);
  const warmGround = useMemo(() => new Color("#43513b"), []);
  const particlePositions = useMemo(() => {
    const values = new Float32Array(72 * 3);
    for (let index = 0; index < 72; index += 1) {
      const angle = index * 2.399;
      const radius = 2.4 + (index % 11) * 0.58;
      values[index * 3] = Math.cos(angle) * radius;
      values[index * 3 + 1] = 0.4 + ((index * 7) % 31) * 0.15;
      values[index * 3 + 2] = 2.4 - ((index * 13) % 70) * 0.2;
    }
    return values;
  }, []);

  useFrame((state, delta) => {
    const progress = MathUtils.clamp((2.25 - simulation.z) / 11.7, 0, 1);
    const zoneMix = MathUtils.smoothstep(progress, 0.45, 0.84);
    background.lerpColors(coldSky, warmSky, zoneMix);
    fogColor.lerpColors(coldFog, warmFog, zoneMix);
    if (scene.background instanceof Color) scene.background.copy(background);
    if (scene.fog instanceof Fog) {
      scene.fog.color.copy(fogColor);
      scene.fog.near = MathUtils.lerp(12, 17, zoneMix);
      scene.fog.far = MathUtils.lerp(36, 48, zoneMix);
    }
    if (hemisphere.current) {
      hemisphere.current.intensity = MathUtils.lerp(1.45, 2.05, zoneMix);
      hemisphere.current.color.lerpColors(coldSky, warmHemisphere, zoneMix);
      hemisphere.current.groundColor.lerpColors(coldGround, warmGround, zoneMix);
    }
    if (directional.current) {
      directional.current.intensity = MathUtils.lerp(1.9, 2.35, zoneMix);
      directional.current.color.lerpColors(coldDirectional, warmDirectional, zoneMix);
    }
    if (industrialLight.current) industrialLight.current.intensity = MathUtils.lerp(3.25, 0.75, zoneMix);
    if (gardenLight.current) gardenLight.current.intensity = MathUtils.lerp(0.55, 4.25, zoneMix);
    if (!reducedMotion && particles.current) {
      particles.current.rotation.y += delta * 0.012;
      particles.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemisphere} args={["#b9d5d2", "#3a2d22", 1.7]} />
      <directionalLight ref={directional} position={[-7, 12, 9]} intensity={1.9} color="#bfd2d0" />
      <pointLight ref={industrialLight} position={[-3.4, 3.7, -2]} intensity={3.25} distance={10} color="#bd4e2f" />
      <pointLight ref={gardenLight} position={[2.1, 4, -8]} intensity={0.55} distance={11} color="#ffd56b" />
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#e8d58c" size={0.055} transparent opacity={0.48} depthWrite={false} />
      </points>
    </>
  );
}

function SkyAndHorizon({ simulation }: { simulation: PlayerSimulation }) {
  const horizon = useRef<Group>(null);
  const mountains = useRef<InstancedMesh>(null);
  const buildings = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const mountainPlacements = useMemo(
    () =>
      [-13, -8, -3, 2, 7, 12].map((x, index) => ({
        color: index < 2 ? "#2c353b" : index < 4 ? "#354640" : "#49604e",
        position: [x, 4 + (index % 2) * 0.8, -28 + (index % 3) * 2.2] as const,
        rotation: index % 2 ? -0.08 : 0.1,
        scale: [5.4, 7 + (index % 3), 5.4] as const,
      })),
    [],
  );
  const buildingPlacements = useMemo(
    () =>
      [-3.2, -1.6, 0, 1.7, 3.2].map((x, index) => ({
        color: index < 3 ? "#273035" : "#39433d",
        position: [x, 1.2 + (index % 2) * 0.55, -(index % 3) * 0.8] as const,
        scale: [1.1, 2.4 + (index % 2), 1.1] as const,
      })),
    [],
  );

  useLayoutEffect(() => {
    mountainPlacements.forEach((placement, index) => {
      temp.position.set(...placement.position);
      temp.rotation.set(0, 0, placement.rotation, "XYZ");
      temp.scale.set(...placement.scale);
      temp.updateMatrix();
      mountains.current?.setMatrixAt(index, temp.matrix);
      mountains.current?.setColorAt(index, new Color(placement.color));
    });

    buildingPlacements.forEach((placement, index) => {
      temp.position.set(...placement.position);
      temp.rotation.set(0, 0, 0, "XYZ");
      temp.scale.set(...placement.scale);
      temp.updateMatrix();
      buildings.current?.setMatrixAt(index, temp.matrix);
      buildings.current?.setColorAt(index, new Color(placement.color));
    });

    [mountains.current, buildings.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
  }, [buildingPlacements, mountainPlacements, temp]);

  useFrame((_, delta) => {
    if (!horizon.current) return;
    horizon.current.position.x = MathUtils.lerp(
      horizon.current.position.x,
      simulation.x * 0.16,
      1 - Math.exp(-delta * 1.8),
    );
    horizon.current.position.z = MathUtils.lerp(
      horizon.current.position.z,
      simulation.z,
      1 - Math.exp(-delta * 2.2),
    );
  });

  return (
    <group ref={horizon}>
      <mesh position={[8, 9, -34]}>
        <circleGeometry args={[5.5, 32]} />
        <meshBasicMaterial color="#e9b25a" fog={false} />
      </mesh>
      <group position={[0, -0.3, 0]}>
        <instancedMesh ref={mountains} args={[undefined, undefined, mountainPlacements.length]}>
          <coneGeometry args={[1, 1, 4]} />
          <meshStandardMaterial roughness={1} flatShading />
        </instancedMesh>
      </group>
      <group position={[-9, 0, -18]}>
        <instancedMesh ref={buildings} args={[undefined, undefined, buildingPlacements.length]}>
          <boxGeometry />
          <meshStandardMaterial roughness={1} />
        </instancedMesh>
      </group>
    </group>
  );
}

function TerritoryGround() {
  const surfaces = useRef<InstancedMesh>(null);
  const centerLines = useRef<InstancedMesh>(null);
  const marks = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const route = useMemo(
    () => [
      { x: 0, z: 1.5, r: 0 },
      { x: -0.35, z: -0.7, r: 0.08 },
      { x: 0.25, z: -3.1, r: -0.12 },
      { x: 0.65, z: -5.5, r: -0.16 },
      { x: 0.15, z: -7.8, r: 0.12 },
      { x: 0, z: -10.1, r: 0 },
    ],
    [],
  );
  const baseSurfaces = useMemo(
    () => [
      { color: "#25282a", position: [0, -0.2, -4.2] as const, scale: [24, 22, 1] as const },
      { color: "#333234", position: [-5, -0.11, -1.4] as const, scale: [10, 9, 1] as const },
      { color: "#304434", position: [4.7, -0.1, -8] as const, scale: [11, 9, 1] as const },
    ],
    [],
  );
  const groundMarks = useMemo(
    () => [
      { color: "#765847", position: [-2.1, -0.035, -4.35] as const, rotation: 0, scale: 0.34 },
      { color: "#765847", position: [2.6, -0.035, -5.3] as const, rotation: 0.55, scale: 0.42 },
      { color: "#566b43", position: [-1.8, -0.035, -6.5] as const, rotation: 1.1, scale: 0.5 },
      { color: "#566b43", position: [2.2, -0.035, -8.2] as const, rotation: 1.65, scale: 0.58 },
    ],
    [],
  );

  useLayoutEffect(() => {
    baseSurfaces.forEach((surface, index) => {
      temp.position.set(surface.position[0], surface.position[1], surface.position[2]);
      temp.rotation.set(-Math.PI / 2, 0, 0, "XYZ");
      temp.scale.set(surface.scale[0], surface.scale[1], surface.scale[2]);
      temp.updateMatrix();
      surfaces.current?.setMatrixAt(index, temp.matrix);
      surfaces.current?.setColorAt(index, new Color(surface.color));
    });

    route.forEach((part, index) => {
      const surfaceIndex = baseSurfaces.length + index;
      temp.position.set(part.x, -0.055 + index * 0.002, part.z);
      temp.rotation.set(-Math.PI / 2, part.r, 0, "YXZ");
      temp.scale.set(4.3 - index * 0.12, 2.65, 1);
      temp.updateMatrix();
      surfaces.current?.setMatrixAt(surfaceIndex, temp.matrix);
      surfaces.current?.setColorAt(
        surfaceIndex,
        new Color(index < 2 ? "#292728" : index < 4 ? "#34312d" : "#3b3a2e"),
      );

      temp.position.set(part.x, -0.043 + index * 0.002, part.z);
      temp.rotation.set(-Math.PI / 2, part.r, 0, "YXZ");
      temp.scale.set(0.07, 1.1, 1);
      temp.updateMatrix();
      centerLines.current?.setMatrixAt(index, temp.matrix);
      centerLines.current?.setColorAt(index, new Color(index < 3 ? "#9d7350" : "#d5b85d"));
    });

    groundMarks.forEach((mark, index) => {
      temp.position.set(mark.position[0], mark.position[1], mark.position[2]);
      temp.rotation.set(-Math.PI / 2, 0, mark.rotation, "XYZ");
      temp.scale.set(mark.scale, mark.scale, 1);
      temp.updateMatrix();
      marks.current?.setMatrixAt(index, temp.matrix);
      marks.current?.setColorAt(index, new Color(mark.color));
    });

    [surfaces.current, centerLines.current, marks.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
  }, [baseSurfaces, groundMarks, route, temp]);

  return (
    <group>
      <instancedMesh ref={surfaces} args={[undefined, undefined, baseSurfaces.length + route.length]}>
        <planeGeometry />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
      <instancedMesh ref={centerLines} args={[undefined, undefined, route.length]}>
        <planeGeometry />
        <meshBasicMaterial />
      </instancedMesh>
      <instancedMesh ref={marks} args={[undefined, undefined, groundMarks.length]}>
        <circleGeometry args={[1, 7]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}

function IndustrialDebris() {
  const rubbleRef = useRef<InstancedMesh>(null);
  const seamRef = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const rubble = useMemo(
    () => [
      [-2.8, 0.08, 1.1, 0.35], [2.7, 0.07, 0.6, -0.28], [-3.6, 0.09, -0.6, 0.18],
      [3.2, 0.06, -1.5, 0.5], [-2.6, 0.08, -2.2, -0.4], [3.7, 0.1, -2.8, 0.22],
      [-3.15, 0.07, -3.4, 0.62], [2.9, 0.08, -3.8, -0.18],
    ],
    [],
  );
  const seams = useMemo(
    () => [
      [-1.45, 0.005, 0.4, 0.2], [1.7, 0.006, -0.6, -0.34], [-1.1, 0.007, -1.8, 0.48],
      [1.3, 0.008, -3.1, -0.15], [-1.6, 0.009, -4.2, 0.28], [1.8, 0.01, -5.5, -0.42],
      [-1.2, 0.011, -6.7, 0.18], [1.45, 0.012, -8.1, -0.2],
    ],
    [],
  );

  useEffect(() => {
    rubble.forEach(([x, y, z, rotation], index) => {
      temp.position.set(x, y, z);
      temp.rotation.set(0.12 * (index % 2), rotation, 0.08);
      temp.scale.set(0.2 + (index % 3) * 0.08, 0.1 + (index % 2) * 0.06, 0.3 + (index % 4) * 0.06);
      temp.updateMatrix();
      rubbleRef.current?.setMatrixAt(index, temp.matrix);
    });
    seams.forEach(([x, y, z, rotation], index) => {
      temp.position.set(x, y, z);
      temp.rotation.set(0, rotation, 0);
      temp.scale.set(0.025, 0.008, 0.7 + (index % 3) * 0.22);
      temp.updateMatrix();
      seamRef.current?.setMatrixAt(index, temp.matrix);
    });
    if (rubbleRef.current) rubbleRef.current.instanceMatrix.needsUpdate = true;
    if (seamRef.current) seamRef.current.instanceMatrix.needsUpdate = true;
  }, [rubble, seams, temp]);

  return (
    <group>
      <instancedMesh ref={rubbleRef} args={[undefined, undefined, rubble.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#55463e" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={seamRef} args={[undefined, undefined, seams.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#151719" />
      </instancedMesh>
    </group>
  );
}

function ReflectivePuddles() {
  const puddles = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const placements = useMemo(
    () => [
      [-1.55, 0.014, 0.15, 0.55, 0.22, 0.18],
      [1.75, 0.015, -1.7, 0.8, 0.28, -0.35],
      [-1.9, 0.016, -3.65, 0.62, 0.2, 0.45],
      [1.25, 0.017, -5.2, 0.48, 0.16, -0.18],
    ],
    [],
  );

  useEffect(() => {
    placements.forEach(([x, y, z, scaleX, scaleZ, rotation], index) => {
      temp.position.set(x, y, z);
      temp.rotation.set(-Math.PI / 2, 0, rotation);
      temp.scale.set(scaleX, scaleZ, 1);
      temp.updateMatrix();
      puddles.current?.setMatrixAt(index, temp.matrix);
    });
    if (puddles.current) puddles.current.instanceMatrix.needsUpdate = true;
  }, [placements, temp]);

  return (
    <instancedMesh ref={puddles} args={[undefined, undefined, placements.length]}>
      <circleGeometry args={[1, 14]} />
      <meshStandardMaterial color="#304b50" metalness={0.35} roughness={0.22} transparent opacity={0.66} />
    </instancedMesh>
  );
}

function GroundShadows() {
  const shadows = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const placements = useMemo(
    () => [
      [-4.45, 0.008, 0.2, 2.5, 1.8], [-5.3, 0.008, -3.3, 2.2, 1.65],
      [-4.4, 0.008, -5.7, 2.3, 1.55], [3.9, 0.008, -5.5, 1.8, 1.1],
      [-4.2, 0.008, -9.4, 2.4, 1.7], [4.2, 0.008, -9.2, 2.5, 1.8],
    ],
    [],
  );

  useEffect(() => {
    placements.forEach(([x, y, z, scaleX, scaleZ], index) => {
      temp.position.set(x, y, z);
      temp.rotation.set(-Math.PI / 2, 0, 0);
      temp.scale.set(scaleX, scaleZ, 1);
      temp.updateMatrix();
      shadows.current?.setMatrixAt(index, temp.matrix);
    });
    if (shadows.current) shadows.current.instanceMatrix.needsUpdate = true;
  }, [placements, temp]);

  return (
    <instancedMesh ref={shadows} args={[undefined, undefined, placements.length]}>
      <circleGeometry args={[1, 18]} />
      <meshBasicMaterial color="#07090a" transparent opacity={0.2} depthWrite={false} />
    </instancedMesh>
  );
}

function WayfindingTotems() {
  const posts = useRef<InstancedMesh>(null);
  const plaques = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const colors = useMemo(
    () => ["#b95d42", "#d6a94e", "#64786a", "#d6a94e", "#77a45d", "#3f786e"].map((value) => new Color(value)),
    [],
  );
  const totems = useMemo(
    () => [
      { x: -2.65, z: -3.85, rotation: 0.22 },
      { x: 2.65, z: -7.2, rotation: -0.22 },
    ],
    [],
  );

  useEffect(() => {
    totems.forEach((totem, index) => {
      temp.position.set(totem.x, 1.25, totem.z);
      temp.rotation.set(0, totem.rotation, 0);
      temp.scale.set(0.075, 1.25, 0.075);
      temp.updateMatrix();
      posts.current?.setMatrixAt(index, temp.matrix);

      for (let plaque = 0; plaque < 3; plaque += 1) {
        const plaqueIndex = index * 3 + plaque;
        temp.position.set(totem.x + (index ? -0.32 : 0.32), 1.05 + plaque * 0.42, totem.z);
        temp.rotation.set(0, totem.rotation, plaque % 2 ? -0.06 : 0.04);
        temp.scale.set(0.46 - plaque * 0.045, 0.105, 0.055);
        temp.updateMatrix();
        plaques.current?.setMatrixAt(plaqueIndex, temp.matrix);
        plaques.current?.setColorAt(plaqueIndex, colors[plaqueIndex]);
      }
    });
    if (posts.current) posts.current.instanceMatrix.needsUpdate = true;
    if (plaques.current) {
      plaques.current.instanceMatrix.needsUpdate = true;
      if (plaques.current.instanceColor) plaques.current.instanceColor.needsUpdate = true;
    }
  }, [colors, temp, totems]);

  return (
    <group>
      <instancedMesh ref={posts} args={[undefined, undefined, totems.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#3d3934" />
      </instancedMesh>
      <instancedMesh ref={plaques} args={[undefined, undefined, 6]}>
        <boxGeometry />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}

function UrbanLights() {
  return (
    <group>
      <StreetLamps />
      <StringLights />
    </group>
  );
}

function StreetLamps() {
  const poles = useRef<InstancedMesh>(null);
  const arms = useRef<InstancedMesh>(null);
  const bulbs = useRef<InstancedMesh>(null);
  const transforms = useMemo(() => {
    const parent = new Object3D();
    const part = new Object3D();
    parent.add(part);
    return { parent, part };
  }, []);
  const lamps = useMemo(
    () => [
      { color: "#d86942", position: [-2.65, 0, -4.45] as const, rotation: 0.2 },
      { color: "#e6bd58", position: [2.85, 0, -7.25] as const, rotation: -0.32 },
    ],
    [],
  );

  useLayoutEffect(() => {
    lamps.forEach((lamp, index) => {
      const { parent, part } = transforms;
      parent.position.set(lamp.position[0], lamp.position[1], lamp.position[2]);
      parent.rotation.set(0, lamp.rotation, 0, "XYZ");
      parent.scale.set(1, 1, 1);

      part.position.set(0, 1.55, 0);
      part.rotation.set(0, 0, 0, "XYZ");
      part.scale.set(1, 3.1, 1);
      parent.updateMatrixWorld(true);
      poles.current?.setMatrixAt(index, part.matrixWorld);

      part.position.set(0.35, 3.02, 0);
      part.rotation.set(0, 0, Math.PI / 2, "XYZ");
      part.scale.set(1, 0.7, 1);
      parent.updateMatrixWorld(true);
      arms.current?.setMatrixAt(index, part.matrixWorld);

      part.position.set(0.7, 2.92, 0);
      part.rotation.set(0, 0, 0, "XYZ");
      part.scale.set(0.18, 0.12, 0.18);
      parent.updateMatrixWorld(true);
      bulbs.current?.setMatrixAt(index, part.matrixWorld);
      bulbs.current?.setColorAt(index, new Color(lamp.color));
    });

    [poles.current, arms.current, bulbs.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
  }, [lamps, transforms]);

  return (
    <group>
      <instancedMesh ref={poles} args={[undefined, undefined, lamps.length]}>
        <cylinderGeometry args={[0.045, 0.075, 1, 7]} />
        <meshBasicMaterial color="#4c4742" />
      </instancedMesh>
      <instancedMesh ref={arms} args={[undefined, undefined, lamps.length]}>
        <cylinderGeometry args={[0.035, 0.045, 1, 7]} />
        <meshBasicMaterial color="#4c4742" />
      </instancedMesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, lamps.length]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}

function StringLights() {
  const bulbs = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const count = 9;

  useEffect(() => {
    for (let index = 0; index < count; index += 1) {
      const progress = index / (count - 1);
      temp.position.set(-2.4 + progress * 4.8, -Math.sin(progress * Math.PI) * 0.35, 0);
      temp.scale.setScalar(index % 2 ? 0.07 : 0.085);
      temp.updateMatrix();
      bulbs.current?.setMatrixAt(index, temp.matrix);
    }
    if (bulbs.current) bulbs.current.instanceMatrix.needsUpdate = true;
  }, [temp]);

  return (
    <group position={[0.8, 4.15, -9.9]} rotation={[0, -0.08, 0]}>
      <mesh position={[0, -0.18, 0]} rotation={[0, 0, 0]}><boxGeometry args={[4.9, 0.018, 0.018]} /><meshStandardMaterial color="#34322d" /></mesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 7, 5]} />
        <meshBasicMaterial color="#ffe29a" />
      </instancedMesh>
    </group>
  );
}

function EnvironmentalMotion({
  reducedMotion,
  quality,
}: {
  reducedMotion: boolean;
  quality: "balanced" | "high";
}) {
  const smoke = useRef<Points>(null);
  const rotor = useRef<Group>(null);
  const waterMaterial = useRef<MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    if (!reducedMotion && smoke.current) {
      smoke.current.position.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.1;
      smoke.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.14) * 0.04;
    }
    if (!reducedMotion && rotor.current) rotor.current.rotation.z -= delta * 0.42;
    if (waterMaterial.current) {
      waterMaterial.current.opacity = reducedMotion
        ? 0.42
        : 0.32 + Math.sin(state.clock.elapsedTime * 1.4) * 0.12;
    }
  });

  return (
    <group>
      <IndustrialSmoke smokeRef={smoke} quality={quality} />
      <WindRotor rotorRef={rotor} />
      <WaterGlints materialRef={waterMaterial} quality={quality} />
    </group>
  );
}

function IndustrialSmoke({
  smokeRef,
  quality,
}: {
  smokeRef: MutableRefObject<Points | null>;
  quality: "balanced" | "high";
}) {
  const count = quality === "high" ? 34 : 18;
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const stack = index % 2 ? 0.7 : -0.7;
      const rise = Math.floor(index / 2) * 0.19;
      const drift = Math.sin(index * 1.7) * (0.08 + rise * 0.04);
      values[index * 3] = stack + drift;
      values[index * 3 + 1] = 4.3 + rise;
      values[index * 3 + 2] = (index % 5) * 0.045;
    }
    return values;
  }, [count]);

  return (
    <points ref={smokeRef} position={[4.4, 0, -0.5]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#8f9692" size={quality === "high" ? 0.24 : 0.2} transparent opacity={0.2} depthWrite={false} />
    </points>
  );
}

function WindRotor({ rotorRef }: { rotorRef: MutableRefObject<Group | null> }) {
  const blades = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);

  useEffect(() => {
    for (let index = 0; index < 3; index += 1) {
      const angle = (index / 3) * Math.PI * 2;
      temp.position.set(Math.sin(angle) * 0.58, Math.cos(angle) * 0.58, 0);
      temp.rotation.set(0, 0, -angle);
      temp.scale.set(0.13, 0.62, 0.045);
      temp.updateMatrix();
      blades.current?.setMatrixAt(index, temp.matrix);
    }
    if (blades.current) blades.current.instanceMatrix.needsUpdate = true;
  }, [temp]);

  return (
    <group position={[-2.2, 0, -10.1]} rotation={[0, -0.15, 0]}>
      <mesh position={[0, 2.1, 0.08]}><cylinderGeometry args={[0.06, 0.11, 4.2, 8]} /><meshBasicMaterial color="#a48750" /></mesh>
      <group ref={rotorRef} position={[0, 4.15, 0]}>
        <instancedMesh ref={blades} args={[undefined, undefined, 3]}>
          <boxGeometry />
          <meshBasicMaterial color="#d6c278" />
        </instancedMesh>
        <mesh position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.16, 0.16, 0.22, 10]} /><meshBasicMaterial color="#536c5c" /></mesh>
      </group>
    </group>
  );
}

function WaterGlints({
  materialRef,
  quality,
}: {
  materialRef: MutableRefObject<MeshBasicMaterial | null>;
  quality: "balanced" | "high";
}) {
  const glints = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const count = quality === "high" ? 6 : 3;

  useEffect(() => {
    for (let index = 0; index < count; index += 1) {
      temp.position.set(0.5 + (index % 2 ? 0.12 : -0.1), 0.018, -7.75 - index * (3.3 / Math.max(1, count - 1)));
      temp.rotation.set(-Math.PI / 2, 0, index % 2 ? 0.22 : -0.16);
      temp.scale.set(0.2 + (index % 3) * 0.05, 0.025, 1);
      temp.updateMatrix();
      glints.current?.setMatrixAt(index, temp.matrix);
    }
    if (glints.current) glints.current.instanceMatrix.needsUpdate = true;
  }, [count, temp]);

  return (
    <instancedMesh ref={glints} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={materialRef} color="#b8e6dc" transparent opacity={0.4} depthWrite={false} />
    </instancedMesh>
  );
}

function IndustrialZone() {
  return (
    <group>
      <Warehouses />
      <group position={[4.4, 0, -0.5]}>
        <IndustrialStacks />
        <PipeRack />
      </group>
      <group position={[-3.2, 0, -2.9]}>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.7, 0.72, 1.1, 14]} />
          <meshStandardMaterial color="#4b4b4a" metalness={0.15} roughness={0.86} />
        </mesh>
        <mesh position={[0, 1.13, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.5, 0.07, 7, 18, Math.PI]} />
          <meshStandardMaterial color="#9b523d" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Warehouses() {
  const bodies = useRef<InstancedMesh>(null);
  const roofs = useRef<InstancedMesh>(null);
  const windows = useRef<InstancedMesh>(null);
  const accents = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const placements = useMemo(
    () => [
      { position: [-4.45, 0, 0.2] as const, scale: 1.05 },
      { position: [-5.3, 0, -3.3] as const, scale: 0.86 },
    ],
    [],
  );

  useLayoutEffect(() => {
    placements.forEach((warehouse, warehouseIndex) => {
      const [x, y, z] = warehouse.position;
      const scale = warehouse.scale;

      temp.position.set(x, y + 1.05 * scale, z);
      temp.rotation.set(0, 0, 0, "XYZ");
      temp.scale.set(3.2 * scale, 2.1 * scale, 2.7 * scale);
      temp.updateMatrix();
      bodies.current?.setMatrixAt(warehouseIndex, temp.matrix);

      temp.position.set(x, y + 2.25 * scale, z);
      temp.rotation.set(0, 0, Math.PI / 4, "XYZ");
      temp.scale.set(1.65 * scale, 1.65 * scale, 1.45 * scale);
      temp.updateMatrix();
      roofs.current?.setMatrixAt(warehouseIndex, temp.matrix);

      [-0.9, 0, 0.9].forEach((windowX, windowIndex) => {
        const instanceIndex = warehouseIndex * 3 + windowIndex;
        temp.position.set(x + windowX * scale, y + 1.2 * scale, z + 1.36 * scale);
        temp.rotation.set(0, 0, 0, "XYZ");
        temp.scale.set(0.52 * scale, 0.82 * scale, 0.05 * scale);
        temp.updateMatrix();
        windows.current?.setMatrixAt(instanceIndex, temp.matrix);
      });

      temp.position.set(x - 1.63 * scale, y + 1.15 * scale, z);
      temp.rotation.set(0, 0, 0, "XYZ");
      temp.scale.set(0.09 * scale, 1.7 * scale, 1.4 * scale);
      temp.updateMatrix();
      accents.current?.setMatrixAt(warehouseIndex, temp.matrix);
    });

    [bodies.current, roofs.current, windows.current, accents.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
  }, [placements, temp]);

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, placements.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#3a3b3d" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={roofs} args={[undefined, undefined, placements.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#454548" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, undefined, placements.length * 3]}>
        <boxGeometry />
        <meshStandardMaterial color="#253b41" emissive="#34535d" emissiveIntensity={0.25} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={accents} args={[undefined, undefined, placements.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#a14c36" roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

function IndustrialStacks() {
  const bodies = useRef<InstancedMesh>(null);
  const caps = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const stacks = useMemo(
    () => [
      { capColor: "#a55a3f", height: 3.2, position: [-0.7, 0] as const },
      { capColor: "#8c4937", height: 4.2, position: [0.7, -0.7] as const },
    ],
    [],
  );

  useLayoutEffect(() => {
    stacks.forEach((stack, index) => {
      temp.position.set(stack.position[0], stack.height / 2, stack.position[1]);
      temp.rotation.set(0, 0, 0, "XYZ");
      temp.scale.set(1, stack.height, 1);
      temp.updateMatrix();
      bodies.current?.setMatrixAt(index, temp.matrix);

      temp.position.set(stack.position[0], stack.height - 0.45, stack.position[1]);
      temp.scale.set(1, 1, 1);
      temp.updateMatrix();
      caps.current?.setMatrixAt(index, temp.matrix);
      caps.current?.setColorAt(index, new Color(stack.capColor));
    });

    [bodies.current, caps.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
  }, [stacks, temp]);

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, stacks.length]}>
        <cylinderGeometry args={[0.34, 0.48, 1, 10]} />
        <meshStandardMaterial color="#48484a" roughness={0.96} flatShading />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, stacks.length]}>
        <cylinderGeometry args={[0.36, 0.36, 0.18, 10]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
    </group>
  );
}

function PipeRack() {
  const columns = useRef<InstancedMesh>(null);
  const rails = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    [-0.48, 0.48].forEach((x, index) => {
      temp.position.set(x, 0, 0);
      temp.rotation.set(0, 0, 0, "XYZ");
      temp.scale.set(0.11, 2.4, 0.11);
      temp.updateMatrix();
      columns.current?.setMatrixAt(index, temp.matrix);
    });
    [0.45, 0.8, 1.15].forEach((y, index) => {
      temp.position.set(0, y, 0);
      temp.scale.set(1.1, 0.09, 0.09);
      temp.updateMatrix();
      rails.current?.setMatrixAt(index, temp.matrix);
    });
    [columns.current, rails.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
  }, [temp]);

  return (
    <group position={[-0.2, 1.2, 1.35]}>
      <instancedMesh ref={columns} args={[undefined, undefined, 2]}>
        <boxGeometry />
        <meshStandardMaterial color="#765246" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={rails} args={[undefined, undefined, 3]}>
        <boxGeometry />
        <meshStandardMaterial color="#b55b3e" roughness={0.85} />
      </instancedMesh>
    </group>
  );
}

function TransitionZone() {
  return (
    <group>
      <group position={[-4.4, 0, -5.7]}>
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[3.2, 1.5, 2.1]} />
          <meshStandardMaterial color="#514b45" roughness={1} />
        </mesh>
        <mesh position={[0, 1.58, 0]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[3.45, 0.13, 2.35]} />
          <meshStandardMaterial color="#8c593f" roughness={0.95} />
        </mesh>
        <TransitionMuralPanels />
      </group>
      <group position={[3.9, 0, -5.5]}>
        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[2.8, 0.54, 1.3]} />
          <meshStandardMaterial color="#745f46" roughness={1} />
        </mesh>
        <mesh position={[0, 1.2, -0.9]}>
          <boxGeometry args={[2.3, 0.13, 0.5]} />
          <meshStandardMaterial color="#94734f" roughness={1} />
        </mesh>
      </group>
      <TransitionBenches />
    </group>
  );
}

function TransitionBenches() {
  const seats = useRef<InstancedMesh>(null);
  const legs = useRef<InstancedMesh>(null);
  const transforms = useMemo(() => {
    const parent = new Object3D();
    const part = new Object3D();
    parent.add(part);
    return { parent, part };
  }, []);
  const benches = useMemo(
    () => [
      { position: [-2.8, 0, -4.6] as const, rotation: 0.35 },
      { position: [2.7, 0, -6.4] as const, rotation: -0.55 },
    ],
    [],
  );

  useLayoutEffect(() => {
    benches.forEach((bench, benchIndex) => {
      const { parent, part } = transforms;
      parent.position.set(bench.position[0], bench.position[1], bench.position[2]);
      parent.rotation.set(0, bench.rotation, 0, "XYZ");
      parent.scale.set(1, 1, 1);

      part.position.set(0, 0.25, 0);
      part.rotation.set(0, 0, 0, "XYZ");
      part.scale.set(1.45, 0.18, 0.42);
      parent.updateMatrixWorld(true);
      seats.current?.setMatrixAt(benchIndex, part.matrixWorld);

      [-0.55, 0.55].forEach((legX, legIndex) => {
        part.position.set(legX, 0.12, 0);
        part.scale.set(0.12, 0.35, 0.34);
        parent.updateMatrixWorld(true);
        legs.current?.setMatrixAt(benchIndex * 2 + legIndex, part.matrixWorld);
      });
    });

    [seats.current, legs.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
  }, [benches, transforms]);

  return (
    <group>
      <instancedMesh ref={seats} args={[undefined, undefined, benches.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#805b40" />
      </instancedMesh>
      <instancedMesh ref={legs} args={[undefined, undefined, benches.length * 2]}>
        <boxGeometry />
        <meshStandardMaterial color="#493e34" />
      </instancedMesh>
    </group>
  );
}

function TransitionMuralPanels() {
  const panels = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const placements = useMemo(
    () =>
      [-0.95, -0.32, 0.32, 0.95].map((x, index) => ({
        color: ["#b64d35", "#d2a047", "#52776a", "#6f8d51"][index],
        x,
      })),
    [],
  );

  useLayoutEffect(() => {
    placements.forEach((placement, index) => {
      temp.position.set(placement.x, 0.85, 1.07);
      temp.rotation.set(0, 0, 0, "XYZ");
      temp.scale.set(0.48, 0.55, 0.05);
      temp.updateMatrix();
      panels.current?.setMatrixAt(index, temp.matrix);
      panels.current?.setColorAt(index, new Color(placement.color));
    });
    if (panels.current) {
      panels.current.instanceMatrix.needsUpdate = true;
      if (panels.current.instanceColor) panels.current.instanceColor.needsUpdate = true;
      panels.current.computeBoundingBox();
      panels.current.computeBoundingSphere();
    }
  }, [placements, temp]);

  return (
    <instancedMesh ref={panels} args={[undefined, undefined, placements.length]}>
      <boxGeometry />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

function GardenZone({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <GardenPlanters />
      <group position={[-4.2, 0, -9.4]}>
        <mesh position={[0, 1.15, 0]}><boxGeometry args={[3.7, 2.3, 2.4]} /><meshStandardMaterial color="#725d43" roughness={1} /></mesh>
        <mesh position={[0, 2.45, 0]} rotation={[0, 0, Math.PI / 4]} scale={[1.9, 1.9, 1.3]}><boxGeometry /><meshStandardMaterial color="#596c4a" roughness={0.9} /></mesh>
        <mesh position={[1.88, 1.15, 0]}><boxGeometry args={[0.12, 2.15, 1.6]} /><meshStandardMaterial color="#d4a849" /></mesh>
      </group>
      <SolarCanopies />
      <mesh position={[0.5, -0.02, -9.4]} rotation={[-Math.PI / 2, 0, -0.16]}>
        <planeGeometry args={[0.8, 4.1]} />
        <meshStandardMaterial color="#447582" metalness={0.15} roughness={0.4} />
      </mesh>
      <GardenAnimatedInstances reducedMotion={reducedMotion} />
      <group position={[3.2, 0, -11.2]}>
        <CommunityGatewayPosts />
        <mesh position={[0, 4.9, 0]} rotation={[0, 0, 0.03]}><boxGeometry args={[4.2, 0.08, 0.08]} /><meshStandardMaterial color="#cba24f" /></mesh>
      </group>
    </group>
  );
}

function GardenPlanters() {
  const planters = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    [-1.4, 0, 1.4].forEach((z, index) => {
      temp.position.set(0, 0.24, z);
      temp.rotation.set(0, 0, 0, "XYZ");
      temp.scale.set(3.2, 0.48, 0.8);
      temp.updateMatrix();
      planters.current?.setMatrixAt(index, temp.matrix);
    });
    if (planters.current) {
      planters.current.instanceMatrix.needsUpdate = true;
      planters.current.computeBoundingBox();
      planters.current.computeBoundingSphere();
    }
  }, [temp]);

  return (
    <group position={[4.2, 0, -9.2]}>
      <instancedMesh ref={planters} args={[undefined, undefined, 3]}>
        <boxGeometry />
        <meshStandardMaterial color="#755739" roughness={1} />
      </instancedMesh>
    </group>
  );
}

function CommunityGatewayPosts() {
  const posts = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);

  useLayoutEffect(() => {
    [-2, 2].forEach((x, index) => {
      temp.position.set(x, 2.7 + (index % 2) * 0.3, 0);
      temp.rotation.set(0, 0, index % 2 ? 0.08 : -0.08, "XYZ");
      temp.scale.set(0.08, 5.4, 0.08);
      temp.updateMatrix();
      posts.current?.setMatrixAt(index, temp.matrix);
    });
    if (posts.current) {
      posts.current.instanceMatrix.needsUpdate = true;
      posts.current.computeBoundingBox();
      posts.current.computeBoundingSphere();
    }
  }, [temp]);

  return (
    <instancedMesh ref={posts} args={[undefined, undefined, 2]}>
      <boxGeometry />
      <meshStandardMaterial color="#b98e48" roughness={0.9} />
    </instancedMesh>
  );
}

function VegetationInstances() {
  const plants = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const placements = useMemo(() => {
    const values: Array<{ x: number; y: number; z: number; color: string }> = [];

    [-0.9, -0.3, 0.3, 0.9].forEach((x, index) => {
      values.push({ x: 3.9 + x, y: 0.57, z: -5.5 + (index % 2 ? 0.15 : -0.15), color: index % 2 ? "#729b54" : "#4d7650" });
    });

    [-1.4, 0, 1.4].forEach((rowZ, row) => {
      [-1.1, -0.55, 0, 0.55, 1.1].forEach((x, index) => {
        values.push({ x: 4.2 + x, y: 0.58, z: -9.2 + rowZ, color: (index + row) % 2 ? "#6f9d54" : "#4c7c4e" });
      });
    });

    for (let index = 0; index < 6; index += 1) {
      const angle = (index / 6) * Math.PI * 2;
      values.push({
        x: 2.1 + Math.cos(angle) * 0.56,
        y: 0.58,
        z: -7.15 + Math.sin(angle) * 0.56,
        color: index % 2 ? "#83b95e" : "#4f7c4c",
      });
    }

    return values;
  }, []);

  useEffect(() => {
    placements.forEach((placement, index) => {
      temp.position.set(placement.x, placement.y, placement.z);
      temp.rotation.set(0, index * 0.74, 0);
      temp.scale.set(0.34, 0.48, 0.34);
      temp.updateMatrix();
      plants.current?.setMatrixAt(index, temp.matrix);
      plants.current?.setColorAt(index, new Color(placement.color));
    });
    if (plants.current) {
      plants.current.instanceMatrix.needsUpdate = true;
      if (plants.current.instanceColor) plants.current.instanceColor.needsUpdate = true;
    }
  }, [placements, temp]);

  return (
    <instancedMesh ref={plants} args={[undefined, undefined, placements.length]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={1} flatShading />
    </instancedMesh>
  );
}

function GardenAnimatedInstances({ reducedMotion }: { reducedMotion: boolean }) {
  const trunks = useRef<InstancedMesh>(null);
  const mainCrowns = useRef<InstancedMesh>(null);
  const secondaryCrowns = useRef<InstancedMesh>(null);
  const flagCloths = useRef<InstancedMesh>(null);
  const flagBadges = useRef<InstancedMesh>(null);
  const temp = useMemo(() => new Object3D(), []);
  const treeTransforms = useMemo(() => {
    const pivot = new Object3D();
    const detail = new Object3D();
    pivot.add(detail);
    return { pivot, detail };
  }, []);
  const flagTransforms = useMemo(() => {
    const pivot = new Object3D();
    const detail = new Object3D();
    pivot.add(detail);
    return { pivot, detail };
  }, []);
  const treePlacements = useMemo(
    () => [
      { color: "#3f7048", x: -3.1, z: -7.3 },
      { color: "#527d4d", x: 4.45, z: -7.05 },
      { color: "#3f7048", x: 5.4, z: -10.4 },
    ],
    [],
  );
  const flagPlacements = useMemo(
    () => [
      { color: "#d56542", delay: 0, x: 1.65 },
      { color: "#e2ba51", delay: 1.2, x: 3.2 },
      { color: "#5f8b58", delay: 2.4, x: 4.75 },
    ],
    [],
  );

  const updateAnimatedInstances = useCallback((elapsed: number) => {
    treePlacements.forEach((placement, index) => {
      const sway = reducedMotion ? 0 : Math.sin(elapsed * 0.7 + index) * 0.025;

      temp.position.set(placement.x, 2.75, placement.z);
      temp.rotation.set(0, 0, sway, "XYZ");
      temp.scale.set(1.15, 0.85, 1);
      temp.updateMatrix();
      mainCrowns.current?.setMatrixAt(index, temp.matrix);

      const { pivot, detail } = treeTransforms;
      pivot.position.set(placement.x, 2.75, placement.z);
      pivot.rotation.set(0, 0, sway, "XYZ");
      pivot.scale.set(1, 1, 1);
      detail.position.set(0.75, -0.1, 0.1);
      detail.rotation.set(0, 0, 0, "XYZ");
      detail.scale.setScalar(0.65);
      pivot.updateMatrixWorld(true);
      secondaryCrowns.current?.setMatrixAt(index, detail.matrixWorld);
    });

    flagPlacements.forEach((placement, index) => {
      const rotationY = reducedMotion ? 0 : Math.sin(elapsed * 0.8 + placement.delay) * 0.1;
      const rotationZ = reducedMotion ? 0 : Math.sin(elapsed * 1.25 + placement.delay) * 0.06;
      const { pivot, detail } = flagTransforms;
      pivot.position.set(placement.x, 4.42, -11.2);
      pivot.rotation.set(0, rotationY, rotationZ, "XYZ");
      pivot.scale.set(1, 1, 1);

      detail.position.set(0, -0.42, 0);
      detail.rotation.set(0, 0, 0, "XYZ");
      detail.scale.set(1, 1, 1);
      pivot.updateMatrixWorld(true);
      flagCloths.current?.setMatrixAt(index, detail.matrixWorld);

      detail.position.set(0, -0.84, 0);
      detail.rotation.set(0, 0, Math.PI / 4, "XYZ");
      detail.scale.set(0.32, 0.32, 0.02);
      pivot.updateMatrixWorld(true);
      flagBadges.current?.setMatrixAt(index, detail.matrixWorld);
    });

    [mainCrowns.current, secondaryCrowns.current, flagCloths.current, flagBadges.current].forEach((mesh) => {
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    });
  }, [flagPlacements, flagTransforms, reducedMotion, temp, treePlacements, treeTransforms]);

  useLayoutEffect(() => {
    treePlacements.forEach((placement, index) => {
      temp.position.set(placement.x, 1.25, placement.z);
      temp.rotation.set(0, 0, 0, "XYZ");
      temp.scale.set(1, 1, 1);
      temp.updateMatrix();
      trunks.current?.setMatrixAt(index, temp.matrix);
      mainCrowns.current?.setColorAt(index, new Color(placement.color));
    });
    flagPlacements.forEach((placement, index) => {
      flagCloths.current?.setColorAt(index, new Color(placement.color));
    });

    [mainCrowns.current, secondaryCrowns.current, flagCloths.current, flagBadges.current].forEach((mesh) => {
      mesh?.instanceMatrix.setUsage(DynamicDrawUsage);
    });
    updateAnimatedInstances(0);

    [trunks.current, mainCrowns.current, secondaryCrowns.current, flagCloths.current, flagBadges.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
    if (mainCrowns.current?.boundingSphere) mainCrowns.current.boundingSphere.radius += 0.05;
    if (secondaryCrowns.current?.boundingSphere) secondaryCrowns.current.boundingSphere.radius += 0.05;
    if (flagCloths.current?.boundingSphere) flagCloths.current.boundingSphere.radius += 0.25;
    if (flagBadges.current?.boundingSphere) flagBadges.current.boundingSphere.radius += 0.25;
  }, [flagPlacements, temp, treePlacements, updateAnimatedInstances]);

  useFrame((state) => {
    if (!reducedMotion) updateAnimatedInstances(state.clock.elapsedTime);
  });

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, treePlacements.length]}>
        <cylinderGeometry args={[0.17, 0.27, 2.5, 8]} />
        <meshStandardMaterial color="#644831" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={mainCrowns} args={[undefined, undefined, treePlacements.length]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={secondaryCrowns} args={[undefined, undefined, treePlacements.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#638c50" roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={flagCloths} args={[undefined, undefined, flagPlacements.length]}>
        <planeGeometry args={[0.92, 0.78]} />
        <meshStandardMaterial roughness={0.9} side={DoubleSide} />
      </instancedMesh>
      <instancedMesh ref={flagBadges} args={[undefined, undefined, flagPlacements.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#242821" />
      </instancedMesh>
    </group>
  );
}

function SolarCanopies() {
  const posts = useRef<InstancedMesh>(null);
  const panels = useRef<InstancedMesh>(null);
  const seams = useRef<InstancedMesh>(null);
  const transforms = useMemo(() => {
    const parent = new Object3D();
    const part = new Object3D();
    parent.add(part);
    return { parent, part };
  }, []);
  const placements = useMemo(
    () => [
      [2.1, 0, -10.4] as const,
      [3.8, 0, -7.9] as const,
    ],
    [],
  );

  useLayoutEffect(() => {
    placements.forEach((position, canopyIndex) => {
      const { parent, part } = transforms;
      parent.position.set(position[0], position[1], position[2]);
      parent.rotation.set(0, -0.18, 0, "XYZ");
      parent.scale.set(1, 1, 1);

      [-0.85, 0.85].forEach((postX, postIndex) => {
        part.position.set(postX, 1.2, 0);
        part.rotation.set(0, 0, 0, "XYZ");
        part.scale.set(1, 1, 1);
        parent.updateMatrixWorld(true);
        posts.current?.setMatrixAt(canopyIndex * 2 + postIndex, part.matrixWorld);
      });

      part.position.set(0, 2.4, 0);
      part.rotation.set(0.12, 0, 0, "XYZ");
      part.scale.set(2.5, 0.08, 1.35);
      parent.updateMatrixWorld(true);
      panels.current?.setMatrixAt(canopyIndex, part.matrixWorld);

      [-0.62, 0, 0.62].forEach((seamX, seamIndex) => {
        part.position.set(seamX, 2.445, 0);
        part.rotation.set(0, 0, 0, "XYZ");
        part.scale.set(0.025, 0.01, 1.25);
        parent.updateMatrixWorld(true);
        seams.current?.setMatrixAt(canopyIndex * 3 + seamIndex, part.matrixWorld);
      });
    });

    [posts.current, panels.current, seams.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingBox();
      mesh.computeBoundingSphere();
    });
  }, [placements, transforms]);

  return (
    <group>
      <instancedMesh ref={posts} args={[undefined, undefined, placements.length * 2]}>
        <cylinderGeometry args={[0.07, 0.1, 2.4, 8]} />
        <meshStandardMaterial color="#c49b4a" />
      </instancedMesh>
      <instancedMesh ref={panels} args={[undefined, undefined, placements.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#28586b" metalness={0.35} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={seams} args={[undefined, undefined, placements.length * 3]}>
        <boxGeometry />
        <meshBasicMaterial color="#89b5ba" />
      </instancedMesh>
    </group>
  );
}

function NarrativeLandmark({
  pointId,
  position,
  visited,
  active,
  beaconRegistryRef,
  simulation,
  memorialAssetStatus,
  onMemorialLoadStart,
  onMemorialReady,
  onMemorialError,
}: {
  pointId: WorldPointId;
  position: [number, number, number];
  visited: boolean;
  active: boolean;
  beaconRegistryRef: BeaconRegistryRef;
  simulation: PlayerSimulation;
  memorialAssetStatus: MemorialAssetStatus;
  onMemorialLoadStart: () => void;
  onMemorialReady: () => void;
  onMemorialError: () => void;
}) {
  const accent = pointId === "memoria" ? "#d96542" : pointId === "comum" ? "#83b95e" : "#ffd15c";
  if (pointId === "memoria") {
    return (
      <group position={position}>
        <MemorialGroundTreatment />
        <DeferredMemorialBody
          simulation={simulation}
          accent={accent}
          status={memorialAssetStatus}
          onLoadStart={onMemorialLoadStart}
          onReady={onMemorialReady}
          onError={onMemorialError}
        />
        <Beacon
          pointId={pointId}
          registryRef={beaconRegistryRef}
          accent={accent}
          visited={visited}
          active={active}
          iconHeight={2.65}
          ringRadius={1.12}
        />
      </group>
    );
  }
  if (pointId === "comum") {
    return (
      <group position={position}>
        <group position={[0, 0, -1.05]}>
          <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.85, 0.95, 0.5, 12]} /><meshStandardMaterial color="#6d553d" roughness={1} /></mesh>
        </group>
        <Beacon pointId={pointId} registryRef={beaconRegistryRef} accent={accent} visited={visited} active={active} />
      </group>
    );
  }
  return (
    <group position={position}>
      <mesh position={[0, 1.1, 0]}><boxGeometry args={[2.05, 2.2, 0.35]} /><meshStandardMaterial color="#4c4d42" roughness={0.94} /></mesh>
      <mesh position={[0, 1.18, 0.19]}><circleGeometry args={[0.56, 16]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} /></mesh>
      <mesh position={[0, 1.18, 0.23]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.38, 0.38, 0.05]} /><meshBasicMaterial color="#252722" /></mesh>
      <Beacon pointId={pointId} registryRef={beaconRegistryRef} accent={accent} visited={visited} active={active} />
    </group>
  );
}

function DeferredMemorialBody({
  simulation,
  accent,
  status,
  onLoadStart,
  onReady,
  onError,
}: {
  simulation: PlayerSimulation;
  accent: string;
  status: MemorialAssetStatus;
  onLoadStart: () => void;
  onReady: () => void;
  onError: () => void;
}) {
  const assetEnabled = status !== "deferred";

  return (
    <>
      {status !== "ready" ? <ProceduralMemorialBody accent={accent} /> : null}
      {status === "deferred" ? (
        <MemorialActivationProbe simulation={simulation} onActivate={onLoadStart} />
      ) : null}
      {assetEnabled ? (
        <Suspense fallback={null}>
          <MemorialAsset fallback={null} onReady={onReady} onError={onError} />
        </Suspense>
      ) : null}
    </>
  );
}

function MemorialActivationProbe({
  simulation,
  onActivate,
}: {
  simulation: PlayerSimulation;
  onActivate: () => void;
}) {
  const triggered = useRef(false);

  useFrame(() => {
    if (triggered.current || !MEMORIAL_POINT) return;
    const distance = Math.hypot(
      simulation.x - MEMORIAL_POINT.x,
      simulation.z - MEMORIAL_POINT.z,
    );
    if (simulation.navigationTargetId !== "memoria" && distance >= 5) return;
    triggered.current = true;
    onActivate();
  });

  return null;
}

function ProceduralMemorialBody({ accent }: { accent: string }) {
  return (
    <group>
      {[-0.55, 0, 0.55].map((x, index) => (
        <mesh
          key={x}
          position={[x, 0.65 + index * 0.12, 0]}
          rotation={[0, 0, index === 1 ? -0.1 : 0.08]}
        >
          <boxGeometry args={[0.36, 1.3 + index * 0.25, 0.34]} />
          <meshStandardMaterial color={index === 1 ? accent : "#65524a"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function MemorialGroundTreatment() {
  return (
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.32, 0.72, 1]}>
      <circleGeometry args={[1, 20]} />
      <meshStandardMaterial
        color="#304b50"
        metalness={0.28}
        roughness={0.26}
        transparent
        opacity={0.72}
      />
    </mesh>
  );
}

function BeaconMotionController({
  registryRef,
  visitedPoints,
  focusPointId,
  reducedMotion,
}: {
  registryRef: BeaconRegistryRef;
  visitedPoints: WorldPointId[];
  focusPointId: WorldPointId | null;
  reducedMotion: boolean;
}) {
  const visitedSet = useMemo(() => new Set(visitedPoints), [visitedPoints]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    WORLD_POINTS.forEach((point) => {
      const beacon = registryRef.current[point.id];
      if (!beacon) return;
      const active = focusPointId === point.id;
      const visited = visitedSet.has(point.id);
      const baseScale = active ? 1.16 : visited ? 0.94 : 1;
      const pulseAmount = reducedMotion ? 0 : active ? 0.11 : visited ? 0.018 : 0.055;
      const pulse = baseScale + Math.sin(elapsed * (active ? 2.8 : 2.1)) * pulseAmount;
      beacon.scale.setScalar(pulse);
      beacon.rotation.y = reducedMotion ? 0 : elapsed * (active ? 0.36 : 0.16);
    });
  });

  return null;
}

function Beacon({
  pointId,
  registryRef,
  accent,
  visited,
  active,
  iconHeight,
  ringRadius = 0.66,
}: {
  pointId: WorldPointId;
  registryRef: BeaconRegistryRef;
  accent: string;
  visited: boolean;
  active: boolean;
  iconHeight?: number;
  ringRadius?: number;
}) {
  const registerBeacon = useCallback((node: Group | null) => {
    if (node) registryRef.current[pointId] = node;
    else delete registryRef.current[pointId];
  }, [pointId, registryRef]);
  const iconY = iconHeight === undefined
    ? active ? 1.95 : visited ? 1.52 : 1.75
    : iconHeight + (active ? 0.14 : visited ? -0.08 : 0);
  return (
    <group ref={registerBeacon}>
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringRadius, ringRadius + 0.08, 30]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={active ? 0.94 : visited ? 0.24 : 0.64}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[0, iconY, 0]}
        rotation={[0, 0, Math.PI / 4]}
        scale={active ? 1.28 : 1}
        renderOrder={8}
      >
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={active ? 2.1 : visited ? 0.28 : 1.15}
          transparent
          opacity={visited ? 0.72 : 1}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
