import { ReactNode } from "react";
import clsx from "clsx";

type Align = "left" | "right" | "center";

const alignClasses: Record<Align, string> = {
  left: "md:justify-start md:pl-10 lg:pl-24",
  right: "md:justify-end md:pr-10 lg:pr-24",
  center: "md:justify-center",
};

interface SectionShellProps {
  id: string;
  height?: "hero" | "tall" | "medium" | "short";
  align?: Align;
  children: ReactNode;
  className?: string;
}

export default function SectionShell({
  id,
  height = "tall",
  align = "left",
  children,
  className,
}: SectionShellProps) {
  // Use svh units to prevent scroll jitter when mobile browser address bars expand/collapse
  const heightClass = {
    hero: "min-h-[100svh]",
    tall: "min-h-[160svh]",
    medium: "min-h-[135svh]",
    short: "min-h-[85svh]",
  }[height];

  return (
    <section
      id={id}
      className={clsx(
        "relative z-10 flex w-full items-center px-5",
        heightClass,
        alignClasses[align],
        className
      )}
    >
      {children}
    </section>
  );
}
