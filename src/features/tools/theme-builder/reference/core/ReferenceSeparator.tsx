"use client";

import type { CSSProperties } from "react";

export type ReferenceSeparatorProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
  style?: CSSProperties;
};

export function ReferenceSeparator({ orientation = "horizontal", className, style }: ReferenceSeparatorProps) {
  const base: CSSProperties =
    orientation === "horizontal"
      ? {
          width: "100%",
          height: 1,
          margin: "12px 0",
          background: "color-mix(in srgb, var(--c-border) 85%, transparent)",
          flexShrink: 0,
        }
      : {
          width: 1,
          alignSelf: "stretch",
          minHeight: 16,
          background: "color-mix(in srgb, var(--c-border) 85%, transparent)",
          flexShrink: 0,
        };

  return (
    <div
      suppressHydrationWarning
      role="separator"
      aria-orientation={orientation}
      className={className}
      style={{ ...base, ...style }}
    />
  );
}
