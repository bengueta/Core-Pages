"use client";

import Image from "next/image";
import { useState } from "react";
import type { CSSProperties } from "react";

export type ReferenceAvatarProps = {
  src?: string;
  alt: string;
  fallback: string;
  size?: number;
  shape?: "circle" | "rounded";
  dataE?: string;
  /** Ring matching card surface (overlap stacks) */
  withRing?: boolean;
};

export function ReferenceAvatar({
  src,
  alt,
  fallback,
  size = 40,
  shape = "circle",
  dataE,
  withRing,
}: ReferenceAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  const shell: CSSProperties = {
    width: size,
    height: size,
    borderRadius: shape === "circle" ? "50%" : "calc(var(--radius) * 0.85)",
    overflow: "hidden",
    flexShrink: 0,
    background: "color-mix(in srgb, var(--c-muted) 55%, var(--c-card))",
    color: "var(--c-muted-fg)",
    fontFamily: "var(--font-body)",
    fontSize: Math.max(11, Math.round(size * 0.32)),
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: withRing ? "0 0 0 2px var(--c-card)" : undefined,
  };

  return (
    <div suppressHydrationWarning data-e={dataE} style={shell} aria-label={alt}>
      {showImg ? (
        <Image
          src={src!}
          alt={alt}
          width={size}
          height={size}
          unoptimized
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{fallback.slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
