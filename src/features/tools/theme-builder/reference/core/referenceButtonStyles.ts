import type { CSSProperties } from "react";

export type ReferenceButtonVariant = "primary" | "secondary" | "accent" | "destructive" | "outline" | "ghost";
export type ReferenceButtonSize = "sm" | "md" | "lg";

export function buildReferenceButtonStyles(
  variant: ReferenceButtonVariant,
  size: ReferenceButtonSize,
  pill: boolean | undefined,
): CSSProperties {
  const base: CSSProperties = {
    fontFamily: "var(--font-body)",
    fontWeight: "var(--btn-weight, 500)",
    borderRadius: pill ? "999px" : "var(--radius)",
    textTransform: "var(--btn-transform)" as CSSProperties["textTransform"],
    fontSize: size === "sm" ? 11 : size === "lg" ? 14 : 12,
    padding: size === "sm" ? "6px 12px" : size === "lg" ? "14px 24px" : "10px 18px",
    boxShadow: "var(--shadow-actual)",
    border: "var(--btn-border, none)",
  };

  const variants: Record<ReferenceButtonVariant, CSSProperties> = {
    primary: { background: "var(--c-primary)", color: "var(--c-primary-fg)" },
    secondary: { background: "var(--c-secondary)", color: "var(--c-secondary-fg)" },
    accent: { background: "var(--c-accent)", color: "var(--c-accent-fg)" },
    destructive: { background: "var(--c-destructive)", color: "#fff" },
    outline: {
      background: "transparent",
      color: "var(--c-primary)",
      border: "1.5px solid var(--c-primary)",
      boxShadow: "none",
    },
    ghost: {
      background: "transparent",
      color: "var(--c-muted-fg)",
      border: "1px solid var(--c-border)",
      boxShadow: "none",
    },
  };

  const finalStyles: CSSProperties = { ...base, ...variants[variant] };
  if ((variant === "outline" || variant === "ghost") && base.border !== "none") {
    finalStyles.border = base.border;
  }
  return finalStyles;
}
