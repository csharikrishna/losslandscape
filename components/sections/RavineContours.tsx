import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import ContoursDiagram from "@/components/diagrams/ContoursDiagram";

export default function RavineContours() {
  return (
    <SectionShell id="ravine" align="center">
      <Reveal stagger>
        <Panel width="wide">
          <Reveal.Item>
            <StopBadge index={7} total={10} />
          </Reveal.Item>
          <Reveal.Item>
            <h2 className="font-display text-3xl font-semibold text-elevation-low sm:text-4xl">
              Valley · Ravine
            </h2>
          </Reveal.Item>
          <Reveal.Item>
            <p className="mt-3 max-w-2xl text-base leading-[1.85] text-ink-dim">
              A long, low-loss corridor: high curvature across it, almost none along it. Ravines
              are where naive gradient descent famously struggles — the gradient points mostly
              across the narrow direction, so unadapted methods zig-zag along the walls instead of
              making progress down the corridor. It&apos;s also exactly the shape that contour lines
              make legible at a glance.
            </p>
          </Reveal.Item>
          <Reveal.Item>
            <div className="mt-8">
              <ContoursDiagram />
            </div>
          </Reveal.Item>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
