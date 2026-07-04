"use client";

import { useJourneyScroll } from "@/lib/scroll-context";
import SectionShell from "@/components/ui/SectionShell";
import Reveal from "@/components/ui/Reveal";

export default function GrandFinale() {
  const { setIsExploreMode } = useJourneyScroll();

  return (
    <SectionShell id="finale" align="center" height="medium">
      <Reveal className="w-full flex flex-col items-center text-center pb-32">
        <h2 className="font-display text-4xl font-bold text-ink sm:text-5xl mb-6">
          The rails are gone.
        </h2>
        <p className="max-w-xl text-lg text-ink-dim mb-12">
          You&apos;ve reached the end of the guided tour, but the landscape is still here. 
          Break off the path, dive into the matrix, and explore the geometry for yourself.
        </p>
        
        <button
          onClick={() => setIsExploreMode(true)}
          className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-signal px-8 py-4 font-mono text-sm font-bold text-void transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(143,247,224,0.4)]"
        >
          {/* Subtle pulse background */}
          <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          ENTER THE MATRIX
        </button>
      </Reveal>
    </SectionShell>
  );
}
