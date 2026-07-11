"use client";

import { useFrame } from "@react-three/fiber";
import { MathUtils, type Group, type Mesh } from "three";
import { useRef, type MutableRefObject } from "react";
import type { PlayerInput, PlayerSimulation, WorldPointId } from "./worldSimulation";

interface InteractiveAlexandreProps {
  simulation: PlayerSimulation;
  inputRef: MutableRefObject<PlayerInput>;
  actionSerial: number;
  reducedMotion: boolean;
  onNearbyPoint: (pointId: WorldPointId | null) => void;
  onInteract: (pointId: WorldPointId) => void;
}

export function InteractiveAlexandre({
  simulation,
  inputRef,
  actionSerial,
  reducedMotion,
  onNearbyPoint,
  onInteract,
}: InteractiveAlexandreProps) {
  const characterRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const mouthRef = useRef<Mesh>(null);
  const eyeRefs = useRef<Array<Mesh | null>>([]);
  const lastNearbyRef = useRef<WorldPointId | null>(null);
  const lastActionSerialRef = useRef(actionSerial);
  const gestureUntilRef = useRef(0);
  const walkPhaseRef = useRef(0);
  const walkBlendRef = useRef(0);

  useFrame((state, delta) => {
    simulation.step(inputRef.current, Math.min(delta, 0.05));
    const elapsed = state.clock.elapsedTime;
    const character = characterRef.current;
    if (!character) return;

    character.position.set(simulation.x, 0, simulation.z);
    const turn = Math.atan2(
      Math.sin(simulation.heading - character.rotation.y),
      Math.cos(simulation.heading - character.rotation.y),
    );
    character.rotation.y += turn * (1 - Math.exp(-delta * 9));

    const nearbyPoint = simulation.nearestPoint();
    const nearbyId = nearbyPoint?.id ?? null;
    if (nearbyId !== lastNearbyRef.current) {
      lastNearbyRef.current = nearbyId;
      onNearbyPoint(nearbyId);
    }

    if (lastActionSerialRef.current !== actionSerial) {
      lastActionSerialRef.current = actionSerial;
      gestureUntilRef.current = elapsed + 0.72;
      if (nearbyPoint) onInteract(nearbyPoint.id);
    }

    const gestureActive = elapsed < gestureUntilRef.current;
    const walkTarget = simulation.moving && !reducedMotion ? 1 : 0;
    walkBlendRef.current += (walkTarget - walkBlendRef.current) * (1 - Math.exp(-delta * 8));
    walkPhaseRef.current += delta * (7.4 + walkBlendRef.current * 1.6);
    const walkCycle = Math.sin(walkPhaseRef.current) * walkBlendRef.current;
    const limbSmoothing = 1 - Math.exp(-delta * 12);
    const idle = reducedMotion ? 0 : Math.sin(elapsed * 2.2) * 0.012;
    character.position.y = idle + Math.abs(walkCycle) * 0.018;

    if (headRef.current) {
      headRef.current.rotation.z = reducedMotion ? 0 : Math.sin(elapsed * 0.72) * 0.025;
      headRef.current.rotation.x = MathUtils.lerp(
        headRef.current.rotation.x,
        gestureActive ? -0.08 : Math.sin(elapsed * 0.55) * 0.018,
        1 - Math.exp(-delta * 5.2),
      );
    }
    const blink = !reducedMotion && Math.sin(elapsed * 0.72) > 0.986 ? 0.12 : 1;
    eyeRefs.current.forEach((eye) => {
      if (eye) eye.scale.y = MathUtils.lerp(eye.scale.y, 0.025 * blink, 0.42);
    });
    if (mouthRef.current) {
      mouthRef.current.scale.y = MathUtils.lerp(mouthRef.current.scale.y, gestureActive ? 1.8 : 1, 0.15);
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, walkCycle * 0.58, limbSmoothing);
      leftArmRef.current.rotation.z = MathUtils.lerp(
        leftArmRef.current.rotation.z,
        gestureActive ? 2.55 + Math.sin(elapsed * 15) * 0.035 : -0.08,
        1 - Math.exp(-delta * 13),
      );
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, -walkCycle * 0.58, limbSmoothing);
      rightArmRef.current.rotation.z = MathUtils.lerp(rightArmRef.current.rotation.z, 0.08, limbSmoothing);
    }
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, -walkCycle * 0.52, limbSmoothing);
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, walkCycle * 0.52, limbSmoothing);
    }
  });

  return (
    <group ref={characterRef} name="Alexandre VR Abandonada — avatar interativo" scale={0.8}>
      <mesh position={[0, 0.012, 0.08]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.62, 0.9, 1]}>
        <circleGeometry args={[1, 20]} />
        <meshBasicMaterial color="#040506" transparent opacity={0.36} depthWrite={false} />
      </mesh>
      <group ref={leftLegRef} position={[0.22, 1.02, 0]}>
        <mesh position={[0, -0.53, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 1.06, 8]} />
          <meshStandardMaterial color="#16191f" roughness={0.88} flatShading />
        </mesh>
        <mesh position={[0, -1.08, -0.08]} scale={[0.19, 0.11, 0.31]}>
          <boxGeometry />
          <meshStandardMaterial color="#090a0c" roughness={0.9} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[-0.22, 1.02, 0]}>
        <mesh position={[0, -0.53, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 1.06, 8]} />
          <meshStandardMaterial color="#16191f" roughness={0.88} flatShading />
        </mesh>
        <mesh position={[0, -1.08, -0.08]} scale={[0.19, 0.11, 0.31]}>
          <boxGeometry />
          <meshStandardMaterial color="#090a0c" roughness={0.9} />
        </mesh>
      </group>

      <mesh position={[0, 1.12, 0]} scale={[0.42, 0.2, 0.28]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#171a20" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 1.68, 0]} scale={[0.46, 0.72, 0.3]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#30343b" emissive="#111820" emissiveIntensity={0.12} roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0, 1.7, 0.302]} rotation={[0, 0, Math.PI / 4]} scale={[0.12, 0.12, 0.025]}>
        <boxGeometry />
        <meshBasicMaterial color="#d46643" />
      </mesh>
      <mesh position={[0, 1.65, -0.305]} scale={[1, 1.3, 1]}>
        <torusGeometry args={[0.23, 0.014, 6, 28]} />
        <meshStandardMaterial color="#4e3427" roughness={0.84} />
      </mesh>
      <mesh position={[0, 1.37, -0.325]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.1, 0.1, 0.035]} />
        <meshStandardMaterial color="#b9964e" metalness={0.2} roughness={0.62} />
      </mesh>

      <group ref={rightArmRef} position={[-0.52, 1.98, 0]} rotation={[0, 0, 0.08]}>
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.32, 8]} />
          <meshStandardMaterial color="#30343b" emissive="#111820" emissiveIntensity={0.1} roughness={0.92} />
        </mesh>
        <mesh position={[0, -0.56, 0]}>
          <cylinderGeometry args={[0.125, 0.105, 0.62, 8]} />
          <meshStandardMaterial color="#b97d5f" roughness={0.78} flatShading />
        </mesh>
        <mesh position={[0, -0.91, 0]} scale={[0.13, 0.16, 0.13]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#b97d5f" roughness={0.78} />
        </mesh>
      </group>

      <group ref={leftArmRef} position={[0.52, 1.98, 0]} rotation={[0, 0, -0.08]}>
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.16, 0.14, 0.32, 8]} />
          <meshStandardMaterial color="#30343b" emissive="#111820" emissiveIntensity={0.1} roughness={0.92} />
        </mesh>
        <mesh position={[0, -0.56, 0]}>
          <cylinderGeometry args={[0.125, 0.105, 0.62, 8]} />
          <meshStandardMaterial color="#b97d5f" roughness={0.78} flatShading />
        </mesh>
        {[0, 1, 2].map((band) => (
          <mesh key={band} position={[0, -0.38 - band * 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.127, 0.026, 5, 12]} />
            <meshStandardMaterial color="#a93d32" roughness={0.74} />
          </mesh>
        ))}
        <mesh position={[0, -0.91, 0]} scale={[0.13, 0.16, 0.13]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#b97d5f" roughness={0.78} />
        </mesh>
      </group>

      <group ref={headRef} position={[0, 2.25, 0]}>
      <mesh position={[0, 0.13, 0]} scale={[0.31, 0.39, 0.29]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#bd8265" roughness={0.76} flatShading />
      </mesh>
      <mesh position={[0, 0.43, 0.015]} scale={[0.34, 0.18, 0.3]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#171516" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-0.14, 0.54, -0.02]} scale={[0.2, 0.14, 0.22]} rotation={[0, 0, -0.22]}>
        <sphereGeometry args={[1, 9, 7]} />
        <meshStandardMaterial color="#171516" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.08, 0.56, -0.035]} scale={[0.22, 0.15, 0.23]} rotation={[0, 0, 0.18]}>
        <sphereGeometry args={[1, 9, 7]} />
        <meshStandardMaterial color="#171516" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0, -0.045]} scale={[0.29, 0.23, 0.28]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial color="#241c1a" roughness={0.94} flatShading />
      </mesh>
      {[-0.105, 0.105].map((x, index) => (
        <group key={x}>
          <mesh
            ref={(eye) => { eyeRefs.current[index] = eye; }}
            position={[x, 0.22, -0.27]}
            scale={[0.035, 0.025, 0.022]}
          >
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#17120f" />
          </mesh>
          <mesh position={[x, 0.3, -0.255]} scale={[0.11, 0.022, 0.018]}>
            <boxGeometry />
            <meshStandardMaterial color="#211918" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.17, -0.315]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.045, 0.11, 8]} />
        <meshStandardMaterial color="#b8795d" roughness={0.8} />
      </mesh>
      <mesh ref={mouthRef} position={[0, 0.01, -0.285]} scale={[0.1, 0.025, 0.025]}>
        <boxGeometry />
        <meshStandardMaterial color="#e7a08a" roughness={0.7} />
      </mesh>
      </group>
    </group>
  );
}
