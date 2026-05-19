"use client";

import type { CSSProperties, ReactNode } from "react";

type Pad = number | "none";

export function RefBlockTitle({ children }: { children: ReactNode }) {
  return <div className="t-heading">{children}</div>;
}

/** `t-card` + optional `t-heading`; use `padding="none"` + `style` for nav/hero/table. */
export function RefCard({
  children,
  title,
  padding = 14,
  className = "",
  style,
  dataE = "card",
}: {
  children: ReactNode;
  title?: string;
  padding?: Pad;
  className?: string;
  style?: CSSProperties;
  dataE?: string;
}) {
  const basePad: CSSProperties =
    padding === "none" || padding === 0 ? { padding: 0 } : { padding: `calc(${padding}px * var(--spacing))` };
  return (
    <div className={["t-card", className].filter(Boolean).join(" ")} data-e={dataE} style={{ ...basePad, ...style }}>
      {title != null ? <div className="t-heading">{title}</div> : null}
      {children}
    </div>
  );
}
