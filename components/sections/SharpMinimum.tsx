import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import SharpFlatDiagram from "@/components/diagrams/SharpFlatDiagram";

export default function SharpMinimum() {
  return (
    <SectionShell id="sharp" align="left">
      <Reveal>
        <Panel width="wide">
          <StopBadge index={2} total={10} />
          <h2 className="font-display text-3xl font-semibold text-elevation-high sm:text-4xl">
            Sharp minimum
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-dim">
            High curvature in some directions. The training loss right at the bottom can be
            excellent — sometimes the best you&apos;ll find anywhere — but small changes to the
            weights cause the loss to increase fast. That sensitivity is exactly the problem: a
            slightly different batch, a slightly different test example, and you&apos;ve fallen off
            the wall.
          </p>
          <div className="mt-8">
            <SharpFlatDiagram />
          </div>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
