import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

const FACTS = [
  "Most of the space is high loss — good solutions are the rare exception.",
  "Good solutions cluster in wide, low-loss basins, not isolated pinpoints.",
  "Optimization threads its way through valleys, and mostly avoids high barriers.",
  "Flat minima tend to generalize better than sharp ones, often at equal training loss.",
  "The goal was never zero training loss — it was always generalization.",
];

export default function Overlook() {
  return (
    <SectionShell id="overlook" align="center" height="medium" className="text-center">
      <Reveal className="w-full flex justify-center">
        <Panel width="wide" className="text-left">
          <Eyebrow>10 · Look back at the route</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            The whole range, from up here
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-dim">
            Pull back far enough and every feature you just walked through — the sharp spike,
            the saddle, the plateau, the cliff, the ridge, the ravine, the two minima — resolves
            into one continuous, absurdly high-dimensional surface. A handful of structural
            truths about it hold up across almost every architecture anyone has trained:
          </p>
          <ul className="mt-6 space-y-3">
            {FACTS.map((fact) => (
              <li key={fact} className="flex items-start gap-3 text-sm text-ink-dim">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                {fact}
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
