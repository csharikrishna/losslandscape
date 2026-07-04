import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import SgdDiagram from "@/components/diagrams/SgdDiagram";

export default function Sgd() {
  return (
    <SectionShell id="sgd" align="left">
      <Reveal>
        <Panel width="wide">
          <Eyebrow>In between · How you actually get here</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            SGD doesn&apos;t glide. It bounces.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-dim">
            Full-batch gradient descent sees the exact, true gradient every step and glides
            smoothly downhill. Stochastic gradient descent sees only a noisy estimate from a
            small batch — every step is a slightly wrong guess about which way is actually down.
          </p>
          <div className="mt-8">
            <SgdDiagram />
          </div>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
