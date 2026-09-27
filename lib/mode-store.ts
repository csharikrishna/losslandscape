"use client";

import { useSyncExternalStore } from "react";

export type Mode = "journey" | "explore" | "architecture";

const listeners = new Set<() => void>();

function readModeFromLocation(): Mode {
  if (typeof window === "undefined") return "journey";
  
  const searchParam = new URLSearchParams(window.location.search).get("mode");
  if (searchParam === "explore" || searchParam === "architecture") {
    return searchParam;
  }

  // Backwards compatibility with pathname routes
  const path = window.location.pathname;
  if (path === "/explore") return "explore";
  if (path === "/architecture") return "architecture";

  return "journey";
}

let currentMode: Mode = "journey";

if (typeof window !== "undefined") {
  currentMode = readModeFromLocation();
  window.addEventListener("popstate", () => {
    currentMode = readModeFromLocation();
    listeners.forEach((l) => l());
  });
}

export function setMode(next: Mode) {
  if (typeof window === "undefined") return;
  if (next === currentMode) return;

  currentMode = next;
  const url = next === "journey" ? window.location.pathname : `?mode=${next}`;
  window.history.pushState(null, "", url);
  listeners.forEach((l) => l());
}

export function useMode(): Mode {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    () => currentMode,
    () => "journey"
  );
}

// Camera commands for Architecture mode (replaces untyped window CustomEvents)
type CommandListener = () => void;
const resetNNListeners = new Set<CommandListener>();
const tourListeners = new Set<CommandListener>();

export function commandResetNNCamera() {
  resetNNListeners.forEach((fn) => fn());
}

export function onResetNNCamera(fn: CommandListener) {
  resetNNListeners.add(fn);
  return () => {
    resetNNListeners.delete(fn);
  };
}

export function commandToggleTour() {
  tourListeners.forEach((fn) => fn());
}

export function onToggleTour(fn: CommandListener) {
  tourListeners.add(fn);
  return () => {
    tourListeners.delete(fn);
  };
}
