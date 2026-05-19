"use client";

import type { CSSProperties } from "react";

export type ReferenceProgressProps = {
  value: number;
  max?: number;
  /** Semantic fill color (must match `data-e` on the fill segment for pick mode). */
  fillKey?: "primary" | "secondary" | "accent";
  /** Optional override for track `data-e` (track uses muted/border mix; default `muted`). */
  dataETrack?: string;
  /** Bar height in px */
  height?: number;
};

const FILL_BG: Record<NonNullable<ReferenceProgressProps["fillKey"]>, string> = {
  primary: "var(--c-primary)",
  secondary: "var(--c-secondary)",
  accent: "var(--c-accent)",
};

export function ReferenceProgress({ value, max = 100, fillKey = "primary", dataETrack = "muted", height = 8 }: ReferenceProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const track: CSSProperties = {
    width: "100%",
    height,
    borderRadius: 999,
    background: "color-mix(in srgb, var(--c-muted) 70%, var(--c-border))",
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px color-mix(in srgb, var(--c-fg) 8%, transparent)",
  };

  const fill: CSSProperties = {
    height: "100%",
    width: `${pct}%`,
    borderRadius: 999,
    background: FILL_BG[fillKey],
    transition: "width var(--transition) var(--easing)",
  };

  return (
    <div
      suppressHydrationWarning
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      data-e={dataETrack}
      style={track}
    >
      <div suppressHydrationWarning style={fill} data-e={fillKey} />
    </div>
  );
}
