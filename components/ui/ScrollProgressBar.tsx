"use client";

import { motion, useScroll } from "framer-motion";

/**
 * Hair-thin progress indicator fixed to the top of the viewport.
 */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left pointer-events-none"
      style={{
        scaleX: scrollYProgress,
        background:
          "linear-gradient(90deg, #2E6FF2 0%, #22B8B0 33%, #F2C14E 66%, #F2542D 100%)",
        boxShadow: "0 0 10px rgba(34, 184, 176, 0.4)",
      }}
    />
  );
}
