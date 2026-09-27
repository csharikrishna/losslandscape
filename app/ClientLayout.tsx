"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { MotionConfig } from "framer-motion";
import { AudioProvider } from "@/lib/audio-context";
import { useMode } from "@/lib/mode-store";
import { useJourneyScrollMapper } from "@/lib/useJourneyScroll";
import Nav from "@/components/sections/Nav";
import CodeSnippetOverlay from "@/components/sections/CodeSnippetOverlay";
import CustomCursor from "@/components/ui/CustomCursor";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import AudioToggle from "@/components/ui/AudioToggle";
import CanvasErrorBoundary from "@/components/canvas/CanvasErrorBoundary";

const CanvasStage = dynamic(() => import("@/components/canvas/CanvasStage"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-0 canvas-loading" aria-hidden="true">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="font-mono text-xs text-ink-faint/40 animate-pulse">
          Loading terrain…
        </div>
      </div>
    </div>
  ),
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const mode = useMode();
  const isJourney = mode === "journey";
  const mainRef = useRef<HTMLElement>(null);

  // Mount the journey scroll anchor observer only while in journey mode
  useJourneyScrollMapper(isJourney);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Manage scroll lock and DOM inertness for accessibility
    if (!isJourney) {
      document.body.style.overflow = "hidden";
      if (mainRef.current) {
        // Modern inert attribute prevents keyboard focus and screen reader confusion in background
        (mainRef.current as HTMLElement & { inert?: boolean }).inert = true;
      }
    } else {
      document.body.style.overflow = "";
      if (mainRef.current) {
        (mainRef.current as HTMLElement & { inert?: boolean }).inert = false;
      }
    }
  }, [isJourney]);

  return (
    <MotionConfig reducedMotion="user">
      <AudioProvider>
        <div className="grain-overlay" />
        <div className="vignette" />

        <CanvasErrorBoundary>
          <CanvasStage />
        </CanvasErrorBoundary>

        <Nav />
        <CodeSnippetOverlay />
        {isJourney && <ScrollProgressBar />}
        <CustomCursor />
        <AudioToggle />

        <main
          ref={mainRef}
          className="relative transition-opacity duration-400"
          style={{
            opacity: isJourney ? 1 : 0,
            pointerEvents: isJourney ? "auto" : "none",
          }}
        >
          {children}
        </main>
      </AudioProvider>
    </MotionConfig>
  );
}
