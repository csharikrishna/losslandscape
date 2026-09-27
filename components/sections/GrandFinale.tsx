"use client";

import SectionShell from "@/components/ui/SectionShell";
import Reveal from "@/components/ui/Reveal";
import { setMode } from "@/lib/mode-store";

export default function GrandFinale() {
  return (
    <SectionShell id="finale" align="center" height="medium">
      <Reveal stagger className="w-full flex flex-col items-center text-center pb-32">
        <Reveal.Item>
          <h2 className="font-display text-4xl font-bold text-ink sm:text-5xl mb-6">
            The rails are gone.
          </h2>
        </Reveal.Item>
        <Reveal.Item>
          <p className="max-w-xl text-lg leading-[1.85] text-ink-dim mb-12">
            You&apos;ve reached the end of the guided tour, but the landscape is still here. 
            Break off the path, fly through the terrain freely, and inspect the high-dimensional geometry for yourself.
          </p>
        </Reveal.Item>
        
        <Reveal.Item>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <button
              onClick={() => setMode("explore")}
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-signal px-8 py-4 font-mono text-sm font-bold text-void transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(143,247,224,0.4)] active:scale-95"
            >
              {/* Shimmer sweep on hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              EXPLORE LANDSCAPE
            </button>
            
            <button
              onClick={() => setMode("architecture")}
              className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full border border-signal/50 bg-signal/10 px-8 py-4 font-mono text-sm font-bold text-signal transition-all hover:scale-105 hover:bg-signal/20 hover:shadow-[0_0_30px_rgba(143,247,224,0.3)] active:scale-95"
            >
              {/* Shimmer sweep on hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              VIEW ARCHITECTURE
            </button>
          </div>
        </Reveal.Item>
      </Reveal>
    </SectionShell>
  );
}
