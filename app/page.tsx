"use client";

import dynamic from "next/dynamic";
import { ScrollProvider, useJourneyScroll } from "@/lib/scroll-context";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Basics from "@/components/sections/Basics";
import SharpMinimum from "@/components/sections/SharpMinimum";
import SaddlePoint from "@/components/sections/SaddlePoint";
import Plateau from "@/components/sections/Plateau";
import Cliff from "@/components/sections/Cliff";
import Ridge from "@/components/sections/Ridge";
import RavineContours from "@/components/sections/RavineContours";
import Curvature from "@/components/sections/Curvature";
import FlatMinimum from "@/components/sections/FlatMinimum";
import GlobalMinimum from "@/components/sections/GlobalMinimum";
import Sgd from "@/components/sections/Sgd";
import Overlook from "@/components/sections/Overlook";
import DeepConcepts from "@/components/sections/DeepConcepts";
import KeyTakeaways from "@/components/sections/KeyTakeaways";
import PDFSection from "@/components/sections/PDFSection";
import GrandFinale from "@/components/sections/GrandFinale";
import Footer from "@/components/sections/Footer";
import CanvasErrorBoundary from "@/components/canvas/CanvasErrorBoundary";

// The 3D canvas touches WebGL/window on mount; loading it only on the client
// avoids any server-render mismatch.
const CanvasStage = dynamic(() => import("@/components/canvas/CanvasStage"), {
  ssr: false,
});

function MainContent() {
  const { isExploreMode } = useJourneyScroll();
  
  // Disable body scroll when exploring
  if (typeof document !== "undefined") {
    if (isExploreMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  return (
    <main 
      className="relative transition-opacity duration-500"
      style={{ 
        opacity: isExploreMode ? 0 : 1,
        pointerEvents: isExploreMode ? 'none' : 'auto'
      }}
    >
      <Hero />
      <Basics />
      <SharpMinimum />
      <SaddlePoint />
      <Plateau />
      <Cliff />
      <Ridge />
      <RavineContours />
      <Curvature />
      <FlatMinimum />
      <GlobalMinimum />
      <Sgd />
      <Overlook />
      <DeepConcepts />
      <KeyTakeaways />
      <PDFSection />
      <GrandFinale />
    </main>
  );
}

export default function Home() {
  return (
    <ScrollProvider>
      <div className="grain-overlay" />
      <div className="vignette" />
      <CanvasErrorBoundary>
        <CanvasStage />
      </CanvasErrorBoundary>

      <Nav />
      <MainContent />
      <Footer />
    </ScrollProvider>
  );
}
