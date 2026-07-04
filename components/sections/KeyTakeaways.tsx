import SectionShell from "@/components/ui/SectionShell";
import Panel from "@/components/ui/Panel";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";

const ITEMS = [
  { glyph: "▲", title: "Most of the space is high loss", tone: "text-elevation-high" },
  { glyph: "◡", title: "Good solutions live in wide, low-loss basins", tone: "text-elevation-low" },
  { glyph: "↝", title: "Optimization follows valleys, and avoids high barriers", tone: "text-signal" },
  { glyph: "◌", title: "Flat minima tend to generalize better than sharp ones", tone: "text-elevation-mid" },
  { glyph: "◎", title: "The goal was never zero training loss — it's generalization", tone: "text-ink" },
];

export default function KeyTakeaways() {
  return (
    <SectionShell id="takeaways" align="center" height="short">
      <Reveal className="w-full flex justify-center">
        <Panel width="default">
          <Eyebrow>Key takeaways</Eyebrow>
          <ul className="space-y-4">
            {ITEMS.map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <span className={`mt-0.5 font-display text-lg ${item.tone}`}>{item.glyph}</span>
                <span className="text-sm leading-relaxed text-ink-dim">{item.title}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>
    </SectionShell>
  );
}
