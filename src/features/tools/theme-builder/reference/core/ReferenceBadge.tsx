"use client";

import type { CSSProperties, ReactNode } from "react";

export type ReferenceBadgeVariant = "default" | "secondary" | "destructive" | "outline";

const VARIANT_STYLES: Record<ReferenceBadgeVariant, CSSProperties> = {
  default: {
    background: "var(--c-primary)",
    color: "var(--c-primary-fg)",
    border: "1px solid transparent",
  },
  secondary: {
    background: "var(--c-secondary)",
    color: "var(--c-secondary-fg)",
    border: "1px solid transparent",
  },
  destructive: {
    background: "var(--c-destructive)",
    color: "#fff",
    border: "1px solid transparent",
  },
  outline: {
    background: "transparent",
    color: "var(--c-fg)",
    border: "1px solid var(--c-border)",
    boxShadow: "none",
  },
};

export type ReferenceBadgeProps = {
  variant?: ReferenceBadgeVariant;
  children: ReactNode;
  /** Pick-mode / token targeting */
  dataE?: string;
  /** Compact circular pill (counts, icons row) */
  pill?: boolean;
  /** Use tabular monospace for numeric badges */
  mono?: boolean;
  className?: string;
};

export function ReferenceBadge({
  variant = "default",
  children,
  dataE,
  pill,
  mono,
  className,
}: ReferenceBadgeProps) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    fontFamily: mono ? "var(--font-mono)" : "var(--font-body)",
    fontSize: pill ? 10 : 11,
    fontWeight: 600,
    lineHeight: 1,
    borderRadius: pill ? 999 : "var(--radius)",
    padding: pill ? "0 6px" : "3px 9px",
    minHeight: pill ? 20 : undefined,
    minWidth: pill ? 20 : undefined,
    boxShadow: variant === "outline" ? "none" : "var(--shadow-actual)",
    ...VARIANT_STYLES[variant],
  };

  return (
    <span suppressHydrationWarning data-e={dataE} className={className} style={base}>
      {children}
    </span>
  );
}
