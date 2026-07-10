"use client";

import { useLoader } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MEMORIAL_ASSET_URL = "/world/memorial-9-novembro-v1.glb";

interface MemorialAssetProps {
  fallback: ReactNode;
  onReady: () => void;
  onError: () => void;
}

interface MemorialErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError: () => void;
}

interface MemorialErrorBoundaryState {
  failed: boolean;
}

class MemorialErrorBoundary extends Component<
  MemorialErrorBoundaryProps,
  MemorialErrorBoundaryState
> {
  state: MemorialErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): MemorialErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function LoadedMemorial({ onReady }: Pick<MemorialAssetProps, "onReady">) {
  const gltf = useLoader(GLTFLoader, MEMORIAL_ASSET_URL);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return <primitive object={gltf.scene} dispose={null} />;
}

export function MemorialAsset({ fallback, onReady, onError }: MemorialAssetProps) {
  return (
    <MemorialErrorBoundary fallback={fallback} onError={onError}>
      <Suspense fallback={fallback}>
        <LoadedMemorial onReady={onReady} />
      </Suspense>
    </MemorialErrorBoundary>
  );
}

useLoader.preload(GLTFLoader, MEMORIAL_ASSET_URL);
