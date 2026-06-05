/** מערכת פלטות צבעים – Design Tokens */

export type ColorKey = "default" | "white" | "neutral" | "blue" | "green" | "amber" | "emerald";

export type PaletteRole = "heading" | "body" | "accent" | "buttonBg" | "buttonText";

export type Palette = Partial<Record<PaletteRole, ColorKey>>;

/** Color choices shown in the palette editor (value + Hebrew label). */
export const COLOR_OPTIONS: { value: ColorKey; label: string }[] = [
  { value: "white", label: "לבן" },
  { value: "default", label: "כתום (מותג)" },
  { value: "neutral", label: "אפור" },
  { value: "blue", label: "כחול" },
  { value: "green", label: "ירוק" },
  { value: "amber", label: "צהוב" },
  { value: "emerald", label: "טורקיז" },
];

/** Roles a palette assigns colors to. */
export const PALETTE_ROLES: { role: PaletteRole; label: string }[] = [
  { role: "heading", label: "כותרת" },
  { role: "body", label: "טקסט גוף" },
  { role: "accent", label: "הדגשה" },
  { role: "buttonBg", label: "רקע כפתור" },
  { role: "buttonText", label: "טקסט כפתור" },
];

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
