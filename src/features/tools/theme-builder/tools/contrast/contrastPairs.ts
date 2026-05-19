export type ContrastRuleMode = "all" | "light" | "dark";
export type ContrastRuleType = "text" | "ui";

export type ContrastRule = {
  bg: string;
  fg: string;
  label: string;
  mode?: ContrastRuleMode;
  type?: ContrastRuleType;
  minRatio?: number;
};

/**
 * Canonical, explicit contrast rules for the builder.
 * Keep this list small and high-signal so the status indicator remains actionable.
 *
 * WCAG mapping:
 * - Text contrast (SC 1.4.3): 4.5:1 for normal text.
 * - UI/non-text (SC 1.4.11): 3:1 for visual UI components/states.
 */
export const CONTRAST_PAIRS: readonly ContrastRule[] = [
  // Mode-aware canvas text.
  { bg: "background", fg: "foreground", label: "Canvas / Foreground (Light)", mode: "light", type: "text", minRatio: 4.5 },
  { bg: "primary", fg: "primaryFg", label: "Canvas / Foreground (Dark)", mode: "dark", type: "text", minRatio: 4.5 },

  // Core semantic surfaces.
  { bg: "secondary", fg: "secondaryFg", label: "Secondary / Secondary FG", type: "text", minRatio: 4.5 },
  { bg: "card", fg: "cardFg", label: "Card / Card FG", type: "text", minRatio: 4.5 },
  { bg: "muted", fg: "mutedFg", label: "Muted / Muted FG", type: "text", minRatio: 4.5 },
  { bg: "accent", fg: "accentFg", label: "Accent / Accent FG", type: "text", minRatio: 4.5 },

  // Non-text/UI boundary guidance (SC 1.4.11 at 3:1).
  { bg: "background", fg: "border", label: "Background / Border", type: "ui", minRatio: 3 },
];

