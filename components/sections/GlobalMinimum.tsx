import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import MinimaPathDiagram from "@/components/diagrams/MinimaPathDiagram";

export default function GlobalMinimum() {
  return (
    <SectionShell id="globalmin" align="center">
      <Reveal>
        <Panel width="wide">
          <StopBadge index={9} total={10} />
          <h2 className="font-display text-3xl font-semibold text-elevation-low sm:text-4xl">
            (Possible) global minimum
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-dim">
            The lowest loss we can find. Note the parenthetical: in a space with millions of
            dimensions, nobody can certify that any point is the single lowest one in the entire
            landscape — we only ever know it&apos;s the best of everywhere we&apos;ve actually looked.
          </p>
          <div className="mt-8">
            <MinimaPathDiagram />
          </div>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
