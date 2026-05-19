"use client";

import type { CSSProperties } from "react";

export type ReferenceSkeletonProps = {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  className?: string;
  style?: CSSProperties;
  dataE?: string;
};

export function ReferenceSkeleton({
  width = "100%",
  height = 12,
  borderRadius = "var(--radius)",
  className,
  style,
  dataE,
}: ReferenceSkeletonProps) {
  const s: CSSProperties = {
    width,
    height,
    borderRadius,
    display: "block",
    ...style,
  };

  return (
    <div
      suppressHydrationWarning
      data-e={dataE}
      className={`t-ref-skeleton ${className ?? ""}`.trim()}
      style={s}
    />
  );
}
