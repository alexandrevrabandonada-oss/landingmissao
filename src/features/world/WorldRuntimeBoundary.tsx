"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface WorldRuntimeBoundaryProps {
  children: ReactNode;
  onError: () => void;
}

interface WorldRuntimeBoundaryState {
  failed: boolean;
}

export class WorldRuntimeBoundary extends Component<
  WorldRuntimeBoundaryProps,
  WorldRuntimeBoundaryState
> {
  state: WorldRuntimeBoundaryState = { failed: false };

  static getDerivedStateFromError(): WorldRuntimeBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
