import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import CrossSectionDiagram from "@/components/diagrams/CrossSectionDiagram";

export default function Plateau() {
  return (
    <SectionShell id="plateau" align="right">
      <Reveal stagger>
        <Panel>
          <Reveal.Item>
            <StopBadge index={4} total={10} />
          </Reveal.Item>
          <Reveal.Item>
            <h2 className="font-display text-3xl font-semibold text-elevation-mid sm:text-4xl">
              Plateau
            </h2>
          </Reveal.Item>
          <Reveal.Item>
            <p className="mt-3 text-base leading-[1.85] text-ink-dim">
              Not a minimum, not a maximum — just quiet. Gradients are close to zero in every
              direction, so there&apos;s almost no signal to follow. Plain SGD can wander a plateau for
              a very long time; momentum (carrying velocity through the quiet patch) and adaptive
              methods like Adam (which adapt coordinate step sizes using running gradient moments) both
              exist partly to survive exactly this terrain.
            </p>
          </Reveal.Item>
          <Reveal.Item>
            <div className="mt-7">
              <CrossSectionDiagram variant="plateau" />
            </div>
          </Reveal.Item>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
