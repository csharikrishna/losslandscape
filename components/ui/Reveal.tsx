"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.03,
    },
  },
};

// Clean transform and opacity without expensive backdrop/filter blur animations
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const legacyVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  stagger?: boolean;
}

const Reveal = Object.assign(
  function RevealRoot({
    children,
    delay = 0,
    className,
    stagger = false,
  }: RevealProps) {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
      <motion.div
        className={className}
        initial={prefersReducedMotion ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger ? containerVariants : legacyVariants}
        transition={{ delay }}
      >
        {children}
      </motion.div>
    );
  },
  {
    Item: RevealItem,
  }
);

export default Reveal;
