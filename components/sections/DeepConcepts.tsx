import SectionShell from "@/components/ui/SectionShell";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import ConceptIcon, { type ConceptVariant } from "@/components/diagrams/ConceptIcon";

interface Concept {
  variant: ConceptVariant;
  title: string;
  body: string;
}

const CONCEPTS: Concept[] = [
  {
    variant: "concentration",
    title: "Concentration of measure",
    body: "In high dimensions, the volume of a space concentrates in a thin shell — most random directions look statistically similar. It's a big part of why intuitions from 2D and 3D mislead us here.",
  },
  {
    variant: "typical",
    title: "Typical vs. atypical points",
    body: "Almost all points you'd land on by chance are typical — mediocre, high-loss. The minima that matter are atypical, rare, off in the tail of the distribution of points in parameter space.",
  },
  {
    variant: "basin",
    title: "Basin of attraction",
    body: "The full set of initializations that gradient descent, run from each of them, converges to the same minimum. Wide basins of attraction are one reason some minima are so much easier to find than others.",
  },
  {
    variant: "connectivity",
    title: "Mode connectivity",
    body: "Two very different-looking trained networks often turn out to sit at minima connected by a path of consistently low loss — the landscape's good regions are far more joined-up than early intuition suggested.",
  },
  {
    variant: "flatsharp",
    title: "Flat vs. sharp, revisited",
    body: "Flat minima have small curvature in most directions simultaneously — not just one. That's precisely why perturbations from every direction stay cheap, not just perturbations along one lucky axis.",
  },
  {
    variant: "implicit-bias",
    title: "SGD's implicit bias",
    body: "Left with a choice between an equally-good sharp minimum and flat minimum, SGD's own gradient noise tends to prefer the flat one — nobody told it to; it falls out of the dynamics for free.",
  },
  {
    variant: "reparam",
    title: "Scale & reparameterization",
    body: "The exact same function can be written with very differently-shaped landscapes just by rescaling weights between layers — a reminder that 'sharpness' as raw curvature isn't fully parameterization-invariant, and needs care to measure fairly.",
  },
];

export default function DeepConcepts() {
  return (
    <SectionShell id="concepts" align="center" height="tall" className="items-start pt-24">
      <div className="mx-auto w-full max-w-5xl">
        <Reveal>
          <div className="mb-10 text-center">
            <Eyebrow>Beyond the terrain</Eyebrow>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Seven ideas that don&apos;t fit on a mountain
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-ink-dim">
              A physical landscape is a useful metaphor, not a perfect one. These ideas are
              genuinely high-dimensional phenomena — here&apos;s the honest version, past the
              metaphor.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <div className="panel-glass h-full rounded-2xl p-6">
                <ConceptIcon variant={c.variant} />
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-faint">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
