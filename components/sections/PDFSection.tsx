"use client";

import { useState, useEffect } from "react";
import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

const PDF_PATH = "/pdf/loss-landscape.pdf";

export default function PDFSection() {
  const [open, setOpen] = useState(false);
  const [pdfSupported, setPdfSupported] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "pdfViewerEnabled" in navigator) {
      setPdfSupported(navigator.pdfViewerEnabled);
    }
  }, []);

  return (
    <SectionShell id="read-pdf" align="center" height="medium">
      <Reveal stagger className="w-full flex justify-center">
        <Panel width="wide">
          <Reveal.Item>
            <Eyebrow>Take it with you</Eyebrow>
          </Reveal.Item>
          <Reveal.Item>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                  The full write-up, as a PDF
                </h2>
                <p className="mt-2 max-w-md text-sm leading-[1.85] text-ink-dim">
                  Every idea on this page, in one linear document — good for printing, annotating,
                  or reading offline.
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="rounded-full border border-signal/40 bg-signal/10 px-5 py-2.5 font-mono text-xs text-signal transition-all duration-300 hover:bg-signal/20 hover:scale-105 active:scale-95"
                >
                  {open ? "Hide viewer" : "Read PDF"}
                </button>
                <a
                  href={PDF_PATH}
                  download
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-mono text-xs text-ink-dim transition-all duration-300 hover:border-white/30 hover:text-ink hover:scale-105 active:scale-95"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </Reveal.Item>

          {open && (
            <div className="mt-7 overflow-hidden rounded-xl border border-white/10 bg-void relative h-[70vh] w-full">
              {pdfSupported ? (
                <iframe
                  src={`${PDF_PATH}#view=FitH`}
                  title="The Loss Landscape — full document"
                  className="h-full w-full absolute inset-0"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="font-mono text-sm uppercase tracking-widest text-elevation-mid mb-2">
                    Inline PDF Preview Unavailable
                  </div>
                  <p className="text-ink-dim text-sm max-w-sm mb-6">
                    Mobile browsers generally open PDFs in their native viewer.
                  </p>
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
