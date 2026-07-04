"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

const variants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: false, amount: 0.25 }}
      variants={variants}
      transition={{ delay }}
      // When leaving viewport, revert to hidden so panels don't linger
      {...(!prefersReducedMotion && {
        exit: "hidden",
      })}
    >
      {children}
    </motion.div>
  );
}
