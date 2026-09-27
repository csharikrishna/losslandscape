import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import CrossSectionDiagram from "@/components/diagrams/CrossSectionDiagram";

export default function Cliff() {
  return (
    <SectionShell id="cliff" align="left">
      <Reveal stagger>
        <Panel>
          <Reveal.Item>
            <StopBadge index={5} total={10} />
          </Reveal.Item>
          <Reveal.Item>
            <h2 className="font-display text-3xl font-semibold text-elevation-high sm:text-4xl">
              Cliff
            </h2>
          </Reveal.Item>
          <Reveal.Item>
            <p className="mt-3 text-base leading-[1.85] text-ink-dim">
              Recurrent networks are famous for these: loss stays reasonable for a long stretch,
              then changes explosively over a tiny region of parameter space. Step onto a cliff
              with an ordinary-sized update and you can be hurled somewhere the network has never
              been — which is precisely why gradient clipping exists: cap the step size before it
              ever reaches the edge.
            </p>
          </Reveal.Item>
          <Reveal.Item>
            <div className="mt-7">
              <CrossSectionDiagram variant="cliff" />
            </div>
          </Reveal.Item>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
