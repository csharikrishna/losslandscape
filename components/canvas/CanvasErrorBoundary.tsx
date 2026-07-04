"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WebGL Canvas Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 flex items-center justify-center bg-void-radial">
          <div className="absolute inset-0 bg-elevation-ramp opacity-10" />
          <div className="z-10 p-6 text-center">
             <div className="mb-2 font-mono text-[11px] uppercase tracking-widest2 text-signal">WebGL Not Supported</div>
             <p className="text-sm text-ink-dim max-w-sm mx-auto">Your browser or device was unable to load the 3D terrain. The content is still fully readable below.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
