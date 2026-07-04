import type { ReactNode } from "react";
import clsx from "clsx";

export default function Panel({
  children,
  className,
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "narrow";
}) {
  const widthClass = {
    default: "max-w-xl",
    wide: "max-w-3xl",
    narrow: "max-w-md",
  }[width];

  return (
    <div
      className={clsx(
        "panel-glass w-full rounded-2xl p-7 sm:p-9",
        widthClass,
        className
      )}
    >
      {children}
    </div>
  );
}
