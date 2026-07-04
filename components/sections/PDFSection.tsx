"use client";

import { useState } from "react";
import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

const PDF_PATH = "/pdf/loss-landscape.pdf";

export default function PDFSection() {
  const [open, setOpen] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);

  return (
    <SectionShell id="read-pdf" align="center" height="medium">
      <Reveal className="w-full flex justify-center">
        <Panel width="wide">
          <Eyebrow>Take it with you</Eyebrow>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                The full write-up, as a PDF
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-dim">
                Every idea on this page, in one linear document — good for printing, annotating,
                or reading offline.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => setOpen((v) => !v)}
                className="rounded-full border border-signal/40 bg-signal/10 px-5 py-2.5 font-mono text-xs text-signal transition-colors hover:bg-signal/20"
              >
                {open ? "Hide viewer" : "Read PDF"}
              </button>
              <a
                href={PDF_PATH}
                download
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-mono text-xs text-ink-dim transition-colors hover:border-white/30 hover:text-ink"
              >
                Download PDF
              </a>
            </div>
          </div>

          {open && (
            <div className="mt-7 overflow-hidden rounded-xl border border-white/10 bg-void relative h-[70vh] w-full">
              {!embedFailed ? (
                <iframe
                  src={`${PDF_PATH}#view=FitH`}
                  title="The Loss Landscape — full document"
                  className="h-full w-full absolute inset-0"
                  onError={() => setEmbedFailed(true)}
                  // Try to catch load errors on some browsers
                  onLoad={(e) => {
                    try {
                      // Accessing contentWindow might throw cross-origin on some setups if it failed
                      if (!e.currentTarget.contentWindow) setEmbedFailed(true);
                    } catch (err) {
                      // Cross origin error usually means it loaded (browser PDF viewer takes over)
                    }
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="font-mono text-sm uppercase tracking-widest text-elevation-mid mb-2">Embed Unavailable</div>
                  <p className="text-ink-dim text-sm max-w-sm mb-6">Your browser prefers not to embed PDFs directly on this page.</p>
                  <a
                    href={PDF_PATH}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-signal px-6 py-3 font-mono text-xs font-semibold text-void transition-opacity hover:opacity-90"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              )}
            </div>
          )}
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
