"use client";

import { useAudio } from "@/lib/audio-context";
import { motion } from "framer-motion";

export default function AudioToggle() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <button
      onClick={toggleMute}
      className="fixed bottom-6 left-6 z-50 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-[#0d1220]/80 backdrop-blur-md transition-all hover:scale-105 hover:border-signal/40 hover:bg-signal/10 active:scale-95 focus-visible:outline-signal"
      aria-label={isMuted ? "Unmute background audio" : "Mute background audio"}
      title={isMuted ? "Unmute audio (M)" : "Mute audio (M)"}
    >
      {isMuted ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-faint"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <div className="flex h-4 items-center gap-[2.5px] px-1">
          {/* Animated waveform bars using GPU transform scaleY instead of layout height */}
          {[
            { delay: 0.0, dur: 0.8 },
            { delay: 0.2, dur: 0.9 },
            { delay: 0.4, dur: 0.7 },
            { delay: 0.1, dur: 1.0 },
          ].map((bar, i) => (
            <motion.div
              key={i}
              style={{ originY: 1 }}
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{
                duration: bar.dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: bar.delay,
              }}
              className="h-3.5 w-[2px] rounded-full bg-signal"
            />
          ))}
        </div>
      )}
    </button>
  );
}
