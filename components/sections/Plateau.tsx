import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import CrossSectionDiagram from "@/components/diagrams/CrossSectionDiagram";

export default function Plateau() {
  return (
    <SectionShell id="plateau" align="right">
      <Reveal>
        <Panel>
          <StopBadge index={4} total={10} />
          <h2 className="font-display text-3xl font-semibold text-elevation-mid sm:text-4xl">
            Plateau
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-dim">
            Not a minimum, not a maximum — just quiet. Gradients are close to zero in every
            direction, so there&apos;s almost no signal to follow. Plain SGD can wander a plateau for
            a very long time; momentum (carrying velocity through the quiet patch) and adaptive
            methods like Adam (which we covered in depth in the optimizer-diagnostics guide) both
            exist partly to survive exactly this terrain.
          </p>
          <div className="mt-7">
            <CrossSectionDiagram variant="plateau" />
          </div>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
