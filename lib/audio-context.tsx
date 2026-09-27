"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";

interface AudioContextValue {
  isMuted: boolean;
  toggleMute: () => void;
  playTick: () => void;
}

const SoundContext = createContext<AudioContextValue | undefined>(undefined);

const SRC = "/bg-music.mp3";
const TARGET_VOLUME = 0.35;
const FADE_MS = 450;

function createAudioElement(): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = "none";
  audio.loop = true;
  audio.volume = 0;
  audio.src = SRC;
  return audio;
}

/**
 * Time-based volume fade using performance.now().
 * Guaranteed to call onComplete even on iOS Safari where audio.volume is read-only.
 */
function fadeVolume(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  onComplete: () => void
): () => void {
  const t0 = performance.now();
  let rafId = 0;

  const step = (now: number) => {
    const elapsed = now - t0;
    const progress = Math.min(1, elapsed / FADE_MS);

    try {
      audio.volume = from + (to - from) * progress;
    } catch {
      // Ignore volume setting errors on mobile platforms
    }

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      onComplete();
    }
  };

  rafId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(rafId);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);
  const mutedRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelFadeRef = useRef<() => void>(() => {});

  useEffect(() => {
    return () => {
      cancelFadeRef.current();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    // Lazily create audio on user's first click (preserves bandwidth and adheres to autoplay policies)
    const audio = (audioRef.current ??= createAudioElement());
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setIsMuted(nextMuted);

    cancelFadeRef.current();

    if (nextMuted) {
      // Fade down and ensure pause() is called
      cancelFadeRef.current = fadeVolume(audio, audio.volume, 0, () => {
        audio.pause();
      });
    } else {
      // Play within click gesture
      audio.play().catch(() => {
        // Autoplay blocked fallback
        mutedRef.current = true;
        setIsMuted(true);
      });
      cancelFadeRef.current = fadeVolume(audio, audio.volume, TARGET_VOLUME, () => {});
    }
  }, []);

  const playTick = useCallback(() => {
    // No-op for tick sounds to avoid audio clutter
  }, []);

  const value = useMemo(
    () => ({
      isMuted,
      toggleMute,
      playTick,
    }),
    [isMuted, toggleMute, playTick]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useAudio() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
