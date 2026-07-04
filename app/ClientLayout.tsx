"use client";

import dynamic from "next/dynamic";
import { ScrollProvider } from "@/lib/scroll-context";
import Nav from "@/components/sections/Nav";
import CodeSnippetOverlay from "@/components/sections/CodeSnippetOverlay";
import CanvasErrorBoundary from "@/components/canvas/CanvasErrorBoundary";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CanvasStage = dynamic(() => import("@/components/canvas/CanvasStage"), {
  ssr: false,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExploreMode = pathname === '/explore';
  const isNNMode = pathname === '/architecture';
  const isHidden = isExploreMode || isNNMode;

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (isHidden) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }, [isHidden]);

  return (
    <ScrollProvider>
      <div className="grain-overlay" />
      <div className="vignette" />
      
      <CanvasErrorBoundary>
        <CanvasStage />
      </CanvasErrorBoundary>

      <Nav />
      <CodeSnippetOverlay />
      
      <main 
        className="relative transition-opacity duration-500"
        style={{ 
          opacity: isHidden ? 0 : 1,
          pointerEvents: isHidden ? 'none' : 'auto'
        }}
      >
        {children}
      </main>
    </ScrollProvider>
  );
}
