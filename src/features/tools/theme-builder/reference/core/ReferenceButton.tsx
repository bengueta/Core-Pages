"use client";

import React from "react";

import { buildReferenceButtonStyles, type ReferenceButtonSize, type ReferenceButtonVariant } from "./referenceButtonStyles";

export type ReferenceButtonProps = {
  variant?: ReferenceButtonVariant;
  size?: ReferenceButtonSize;
  pill?: boolean;
  children: React.ReactNode;
  /** Sets `data-e` for pick-mode / token targeting (preferred). */
  dataE?: string;
  /** @deprecated Use `dataE` — same as `data-e` on the button. */
  tokenTarget?: string;
};

export function ReferenceButton({
  variant = "primary",
  size = "md",
  pill,
  children,
  dataE,
  tokenTarget,
}: ReferenceButtonProps) {
  const dataAttr = dataE ?? tokenTarget;
  const finalStyles = buildReferenceButtonStyles(variant, size, pill);

  return (
    <button suppressHydrationWarning data-e={dataAttr} className="t-btn" style={finalStyles}>
      {children}
    </button>
  );
}
