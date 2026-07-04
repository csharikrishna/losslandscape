"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useJourneyScroll } from "@/lib/scroll-context";

const PYTORCH_CODE = `import torch
import torch.nn as nn
import torch.nn.functional as F

class LandscapeNet(nn.Module):
    def __init__(self):
        super(LandscapeNet, self).__init__()
        # 1. Extract local spatial features (16x16 -> 14x14)
        self.conv1 = nn.Conv2d(in_channels=1, out_channels=3, kernel_size=3)
        
        # 2. Extract higher-order features (14x14 -> 10x10)
        self.conv2 = nn.Conv2d(in_channels=3, out_channels=8, kernel_size=5)
        
        # 3. Dense bottleneck mapping (128 nodes)
        self.fc1 = nn.Linear(8 * 10 * 10, 128)
        
        # 4. Final classification output (10 classes)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = torch.flatten(x, 1)
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x`;

import { useState } from "react";

export default function CodeSnippetOverlay() {
  const { isNNMode } = useJourneyScroll();
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <AnimatePresence>
        {isNNMode && (
          <motion.button
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-8 right-8 z-[60] flex items-center gap-3 rounded-full border border-[#00f0ff]/30 bg-void/90 px-5 py-2.5 backdrop-blur-md shadow-2xl hover:bg-[#00f0ff]/10 transition-colors"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#00f0ff]">
              View Source Code
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#00f0ff]">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isNNMode && (
        <motion.div
          className="fixed bottom-8 right-8 z-[60] w-full max-w-[480px] rounded-xl border border-white/10 bg-void/90 p-6 backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#00f0ff]">
              Architecture
            </span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">model.py</span>
              <button 
                onClick={() => setIsMinimized(true)}
                className="group flex h-6 w-6 items-center justify-center rounded-full bg-white/5 hover:bg-white/20 transition-colors"
                title="Minimize code"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/50 group-hover:text-white">
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          </div>
          
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-ink-dim font-mono">
            <code>
              {PYTORCH_CODE.split('\n').map((line, i) => {
                    let styledLine = line;
                    styledLine = styledLine.replace(/(import|class|def|super|return)/g, '<span style="color: rgb(170, 0, 255); font-weight: bold;">$1</span>');
                    styledLine = styledLine.replace(/(self)/g, '<span style="color: rgb(0, 240, 255);">$1</span>');
                    styledLine = styledLine.replace(/(nn\.Module|nn\.Conv2d|nn\.Linear|F\.relu|torch\.flatten)/g, '<span style="color: rgb(242, 193, 78);">$1</span>');
                    styledLine = styledLine.replace(/(# .*)/g, '<span style="color: rgba(255,255,255,0.4);">$1</span>');
                    
                    return (
                      <div key={i} dangerouslySetInnerHTML={{ __html: styledLine || ' ' }} />
                    );
                  })}
            </code>
          </pre>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
