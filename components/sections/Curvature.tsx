import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import CurvatureDiagram from "@/components/diagrams/CurvatureDiagram";

export default function Curvature() {
  return (
    <SectionShell id="curvature" align="left">
      <Reveal>
        <Panel>
          <Eyebrow>In between · Curvature</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Curvature, from every angle
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-dim">
            &quot;Sharp&quot; and &quot;flat&quot; aren&apos;t single numbers — curvature depends on which direction you
            probe. The Hessian&apos;s eigenvalues are exactly that: one curvature measurement per
            direction, all at once.
          </p>
          <div className="mt-7">
            <CurvatureDiagram />
          </div>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
