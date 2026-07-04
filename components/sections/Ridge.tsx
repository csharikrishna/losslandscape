import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import StopBadge from "@/components/ui/StopBadge";
import Reveal from "@/components/ui/Reveal";
import CrossSectionDiagram from "@/components/diagrams/CrossSectionDiagram";

export default function Ridge() {
  return (
    <SectionShell id="ridge" align="right">
      <Reveal>
        <Panel>
          <StopBadge index={6} total={10} />
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Ridge</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-dim">
            A wall of high loss standing between two otherwise-reasonable basins. Ridges are why
            training can look like it &quot;settles&quot; — the optimizer isn&apos;t stuck at a true minimum,
            it&apos;s simply boxed in by a barrier it doesn&apos;t have enough step size (or luck) to
            clear, and a genuinely better basin sits unreachable on the far side.
          </p>
          <div className="mt-7">
            <CrossSectionDiagram variant="ridge" />
          </div>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
