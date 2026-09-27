"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error captured:", error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void px-6 text-center">
      <div className="max-w-md rounded-2xl border border-white/10 bg-void/90 p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-3 font-mono text-xs uppercase tracking-widest text-elevation-high">
          Runtime Notice
        </div>
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Visual pipeline interrupted
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          A temporary rendering anomaly occurred. You can restore the session without losing your place.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-full bg-signal px-6 py-2.5 font-mono text-xs font-semibold text-void transition-all hover:scale-105 active:scale-95"
        >
          Restore view
        </button>
      </div>
    </div>
  );
}
