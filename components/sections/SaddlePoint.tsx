import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import SaddleDiagram from "@/components/diagrams/SaddleDiagram";

export default function SaddlePoint() {
  return (
    <SectionShell id="saddle" align="center">
      <Reveal>
        <Panel width="wide">
          <StopBadge index={3} total={10} />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Saddle point
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-dim">
            A minimum in some directions, a maximum in others — and simultaneously true, at the
            exact same point. In low dimensions saddles are curiosities. In the millions of
            dimensions of a real network, they dominate: the odds that <em>every single</em>{" "}
            direction curves the same way at a random critical point collapse almost to zero as
            dimensionality grows. Most of the &quot;stuck&quot; moments in early deep learning research
            that looked like bad local minima turned out to be saddle points instead.
          </p>
          <div className="mt-8">
            <SaddleDiagram />
          </div>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
