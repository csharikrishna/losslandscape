import clsx from "clsx";

/** A small mono "instrument label" for equations/notation — e.g. <MathTag>∇L(θ)</MathTag>.
 *  Signals "this is notation" via typeface + chip styling rather than italics. */
export default function MathTag({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "low" | "high";
}) {
  const toneClass =
    tone === "low" ? "chip-low" : tone === "high" ? "chip-high" : "border-white/15 bg-white/5 text-ink-dim";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[13px]",
        toneClass
      )}
    >
      {children}
    </span>
  );
}
