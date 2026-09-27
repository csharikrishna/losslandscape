"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Canvas Stage Encountered Error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.name === "ChunkLoadError" ||
        this.state.error?.message?.includes("Loading chunk");

      return (
        <div className="fixed inset-0 z-0 flex items-center justify-center bg-void-radial">
          <div className="absolute inset-0 bg-elevation-ramp opacity-5" />
          <div className="z-10 max-w-md p-6 text-center rounded-2xl border border-white/10 bg-void/80 backdrop-blur-md">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-signal">
              {isChunkError ? "Network Asset Update" : "3D Canvas Notice"}
            </div>
            <p className="text-sm text-ink-dim max-w-sm mx-auto">
              {isChunkError
                ? "A scene module was refreshed. Retry to reload the 3D pipeline."
                : "Unable to initialize the 3D graphics context. The written expedition remains fully accessible."}
            </p>
            <button
              onClick={this.handleRetry}
              className="mt-4 rounded-full border border-signal/40 bg-signal/10 px-4 py-1.5 font-mono text-xs text-signal hover:bg-signal/20 transition-colors"
            >
              Retry Canvas
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
