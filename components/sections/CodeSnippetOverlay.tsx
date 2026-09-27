"use client";

import { useState, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMode } from "@/lib/mode-store";

const PYTORCH_CODE = `import torch
import torch.nn as nn
import torch.nn.functional as F

class LandscapeNet(nn.Module):
    def __init__(self):
        super().__init__()
        # 1. Spatial feature maps: 1×8×8 → 3×6×6
        self.conv1 = nn.Conv2d(1, 3, kernel_size=3)
        # 2. Higher-order feature maps: 3×6×6 → 6×4×4
        self.conv2 = nn.Conv2d(3, 6, kernel_size=3)
        # 3. Dense bottleneck mapping: 96 → 32
        self.fc1 = nn.Linear(6 * 4 * 4, 32)
        # 4. Classification logits: 32 → 10
        self.fc2 = nn.Linear(32, 10)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = torch.flatten(x, 1)
        x = F.relu(self.fc1(x))
        return self.fc2(x)`;

// Comment-first alternation with word boundaries to avoid matching inside words like "classes"
const TOKEN_REGEX = /(#.*$)|\b(import|class|def|return|super)\b|\b(self)\b|((?:nn|F|torch)\.\w+)/gm;

function highlightCode(code: string): ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, lineIdx) => {
    const elements: ReactNode[] = [];
    let lastIdx = 0;

    // Reset lastIndex for stateful regex
    TOKEN_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = TOKEN_REGEX.exec(line)) !== null) {
      const matchIdx = match.index;
      if (matchIdx > lastIdx) {
        elements.push(line.slice(lastIdx, matchIdx));
      }

      if (match[1]) {
        // Comment
        elements.push(
          <span key={`c-${matchIdx}`} className="text-ink-faint/60">
            {match[1]}
          </span>
        );
      } else if (match[2]) {
        // Keyword
        elements.push(
          <span key={`k-${matchIdx}`} className="text-signal font-semibold">
            {match[2]}
          </span>
        );
      } else if (match[3]) {
        // Self
        elements.push(
          <span key={`s-${matchIdx}`} className="text-elevation-low">
            {match[3]}
          </span>
        );
      } else if (match[4]) {
        // PyTorch module / function
        elements.push(
          <span key={`p-${matchIdx}`} className="text-elevation-mid">
            {match[4]}
          </span>
        );
      }

      lastIdx = matchIdx + match[0].length;
    }

    if (lastIdx < line.length) {
      elements.push(line.slice(lastIdx));
    }

    return (
      <div key={lineIdx} className="leading-5">
        {elements.length > 0 ? elements : "\u00A0"}
      </div>
    );
  });
}

export default function CodeSnippetOverlay() {
  const mode = useMode();
  const isNNMode = mode === "architecture";
  const [isMinimized, setIsMinimized] = useState(false);

  const highlightedCode = useMemo(() => highlightCode(PYTORCH_CODE), []);

  if (!isNNMode) return null;

  return (
    <AnimatePresence>
      {isMinimized ? (
        <motion.button
          key="minimized-btn"
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[60] flex items-center gap-2.5 rounded-full border border-signal/30 bg-void/90 px-4 py-2 backdrop-blur-md shadow-2xl hover:bg-signal/10 transition-colors"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          aria-label="Expand code panel"
        >
          <span className="h-2 w-2 rounded-full bg-signal animate-pulse" />
          <span className="font-mono text-xs text-signal font-medium">model.py</span>
        </motion.button>
      ) : (
        <motion.div
          key="code-panel"
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[60] w-[calc(100vw-2rem)] sm:w-[440px] max-h-[80vh] overflow-hidden rounded-xl border border-white/10 bg-void/90 p-5 backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-3.5 flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="font-mono text-xs font-semibold tracking-wider text-signal uppercase">
              Architecture Definition
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-ink-faint bg-white/5 px-2 py-0.5 rounded">
                PyTorch
              </span>
              <button
                onClick={() => setIsMinimized(true)}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 hover:bg-white/15 transition-colors"
                title="Minimize code panel"
                aria-label="Minimize code panel"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-ink-faint hover:text-ink"
                >
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          <pre className="overflow-x-auto text-[11px] text-ink font-mono select-text max-h-[50vh]">
            <code>{highlightedCode}</code>
          </pre>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
