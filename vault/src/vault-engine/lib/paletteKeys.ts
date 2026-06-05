import type { Palette } from "./palette";

/** מפת מזהי פלטה → ערכי צבע */
export type PalettesState = Record<string, Palette>;

export const DEFAULT_PALETTE_KEY = "default";
export const DEFAULT_PALETTE_LABEL = "ברירת מחדל";

/** מזהה ייחודי לפלטה חדשה (client-side; Date/Math fine in the browser). */
export function newCustomPaletteId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function labelForPaletteId(
  id: string,
  displayNames: Record<string, string>
): string {
  if (displayNames[id]) return displayNames[id];
  if (id === DEFAULT_PALETTE_KEY) return DEFAULT_PALETTE_LABEL;
  return id;
}
