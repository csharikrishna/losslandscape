import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import Eyebrow from "@/components/ui/Eyebrow";
import MathTag from "@/components/ui/MathTag";
import Reveal from "@/components/ui/Reveal";

export default function Basics() {
  return (
    <SectionShell id="basics" align="right">
      <Reveal>
        <Panel width="wide">
          <Eyebrow>01 · Foundations</Eyebrow>
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            The surface you can&apos;t see
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-dim">
            A neural network&apos;s weights are a single point <MathTag>θ ∈ ℝᵈ</MathTag> — for a
            small model, thousands of numbers; for a modern one, billions. The{" "}
            <strong className="text-ink">loss function</strong> <MathTag tone="high">L(θ)</MathTag>{" "}
            assigns that point a single score: how wrong the network currently is. Plot{" "}
            <MathTag>L</MathTag> over every possible <MathTag>θ</MathTag> and you get a surface —
            the loss landscape — living in <MathTag>d + 1</MathTag> dimensions. Every diagram on
            this page, including the terrain you&apos;re flying through right now, is a 2D or 3D slice
            of a space no one can actually visualize directly.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { tag: "∇L(θ)", name: "Gradient", desc: "points toward steepest increase; optimizers step opposite it" },
              { tag: "∇²L(θ)", name: "Hessian", desc: "curvature matrix — how the gradient itself changes" },
              { tag: "∇L=0, ∇²L⪰0", name: "Minimum", desc: "flat in every direction, and curving upward, not down" },
            ].map((item) => (
              <div key={item.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                <MathTag>{item.tag}</MathTag>
                <p className="mt-2 font-display text-sm font-semibold text-ink">{item.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-faint">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-7 text-sm leading-relaxed text-ink-faint">
            One thing worth sitting with before we go further:{" "}
            <span className="text-ink-dim">almost all of this space is bad.</span> As
            dimensionality grows, the volume of parameter space that scores well shrinks to a
            vanishingly thin sliver — most of the &quot;terrain&quot; ahead is high loss. Good solutions
            are the exception, not the rule, which is exactly why the shape of where they hide
            matters so much.
          </p>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
