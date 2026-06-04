/** מערכת פלטות צבעים – Design Tokens */

export type ColorKey = "default" | "white" | "neutral" | "blue" | "green" | "amber" | "emerald";

export type PaletteRole = "heading" | "body" | "accent" | "buttonBg" | "buttonText";

export type Palette = Partial<Record<PaletteRole, ColorKey>>;

export const COLOR_HEX: Record<string, string> = {
  default: "#fb923c",
  white:   "#ffffff",
  neutral: "#9ca3af",
  blue:    "#60a5fa",
  green:   "#4ade80",
  amber:   "#fbbf24",
  emerald: "#34d399",
};

export const DEFAULT_PALETTE: Palette = {
  heading:    "white",
  body:       "white",
  accent:     "default",
  buttonBg:   "default",
  buttonText: "white",
};

/** מחזיר משתני CSS מהפלטה */
export function paletteToCssVars(palette: Palette | undefined): Record<string, string> {
  const p = palette ?? DEFAULT_PALETTE;
  const hex = (role: PaletteRole) =>
    COLOR_HEX[(p[role] ?? DEFAULT_PALETTE[role] ?? "default") as ColorKey] ?? COLOR_HEX.default;
  const accentHex = hex("accent");
  return {
    "--palette-heading":    hex("heading"),
    "--palette-body":       hex("body"),
    "--palette-accent":     accentHex,
    "--palette-accent2":    accentHex,
    "--palette-border":     accentHex,
    "--palette-buttonBg":   hex("buttonBg"),
    "--palette-buttonText": hex("buttonText"),
  };
}
