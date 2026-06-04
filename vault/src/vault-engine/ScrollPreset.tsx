"use client";

import { motion } from "framer-motion";
import { getScrollPreset } from "./lib/utils";

interface ScrollPresetProps {
  preset?: string | null;
  children: React.ReactNode;
  className?: string;
}

export default function ScrollPreset({ preset, children, className }: ScrollPresetProps) {
  const config = getScrollPreset(preset);

  if (preset === "none") {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={config.initial}
      whileInView={config.whileInView}
      viewport={config.viewport}
      transition={config.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
