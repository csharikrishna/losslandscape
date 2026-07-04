import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import SharpFlatDiagram from "@/components/diagrams/SharpFlatDiagram";

export default function FlatMinimum() {
  return (
    <SectionShell id="flatmin" align="right">
      <Reveal>
        <Panel width="wide">
          <StopBadge index={8} total={10} />
          <h2 className="font-display text-3xl font-semibold text-elevation-low sm:text-4xl">
            Flat, wide minimum
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-dim">
            Low curvature in many directions at once. Training loss here might not be the
            absolute lowest number achievable — but it&apos;s <em>robust</em>. Nudge the weights
            (which is effectively what a slightly-different test example does to the network&apos;s
            effective behavior) and the loss barely moves. Empirically, flat minima generalize
            better than sharp ones with equal or even slightly worse training loss — this is one
            of the best-supported structural explanations we have for why deep learning
            generalizes at all.
          </p>
          <div className="mt-8">
            <SharpFlatDiagram />
          </div>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
