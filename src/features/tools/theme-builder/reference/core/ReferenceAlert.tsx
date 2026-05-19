"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type ReferenceAlertVariant = "info" | "success" | "warning" | "destructive";

const VARIANT_CSS: Record<ReferenceAlertVariant, string> = {
  info: "--c-info",
  success: "--c-success",
  warning: "--c-warning",
  destructive: "--c-destructive",
};

function tokenVar(v: ReferenceAlertVariant): string {
  return `var(${VARIANT_CSS[v]})`;
}

const ICONS: Record<ReferenceAlertVariant, React.ReactNode> = {
  info: <Info aria-hidden size={16} strokeWidth={2} />,
  success: <CheckCircle2 aria-hidden size={16} strokeWidth={2} />,
  warning: <TriangleAlert aria-hidden size={16} strokeWidth={2} />,
  destructive: <AlertCircle aria-hidden size={16} strokeWidth={2} />,
};

export function ReferenceAlert({
  variant,
  title,
  description,
  tokenTarget,
}: {
  variant: ReferenceAlertVariant;
  title: string;
  description?: string;
  /** Pick-mode target; defaults to semantic key (e.g. `info`). */
  tokenTarget?: string;
}) {
  const t = tokenVar(variant);
  const dataE = tokenTarget ?? variant;

  const shell: React.CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "10px 12px",
    borderRadius: "var(--radius)",
    boxShadow: "var(--shadow-actual)",
    fontFamily: "var(--font-body)",
    border: `1px solid color-mix(in srgb, ${t} 38%, var(--c-border))`,
    background: `color-mix(in srgb, ${t} 16%, var(--c-card))`,
    color: "var(--c-card-fg)",
  };

  const iconWrap: React.CSSProperties = {
    flexShrink: 0,
    marginTop: 1,
    color: t,
    display: "flex",
    lineHeight: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.35,
    color: `color-mix(in srgb, ${t} 55%, var(--c-card-fg))`,
  };

  const descStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.45,
    marginTop: 3,
    color: "var(--c-card-fg)",
    opacity: 0.92,
  };

  return (
    <div
      suppressHydrationWarning
      role="status"
      data-e={dataE}
      style={shell}
    >
      <span style={iconWrap}>{ICONS[variant]}</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={titleStyle}>{title}</div>
        {description ? <div style={descStyle}>{description}</div> : null}
      </div>
    </div>
  );
}
