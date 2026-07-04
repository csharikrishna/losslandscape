import type { ReactNode } from "react";
import clsx from "clsx";

type Align = "left" | "right" | "center";

const alignClasses: Record<Align, string> = {
  left: "md:justify-start md:pl-10 lg:pl-24",
  right: "md:justify-end md:pr-10 lg:pr-24",
  center: "md:justify-center",
};

export default function SectionShell({
  id,
  height = "tall",
  align = "left",
  children,
  className,
}: {
  id: string;
  height?: "hero" | "tall" | "medium" | "short";
  align?: Align;
  children: ReactNode;
  className?: string;
}) {
  const heightClass = {
    hero: "min-h-[100vh]",
    tall: "min-h-[145vh]",
    medium: "min-h-[120vh]",
    short: "min-h-[85vh]",
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
