import { contrastRatio, relativeLuminance } from "../contrast/contrast";
import { CONTRAST_PAIRS } from "../contrast/contrastPairs";
import type { ThemeMode } from "../../types";

const BLACK = "#000000";
const WHITE = "#ffffff";

export function pickReadableFg(bgHex: string, threshold = 4.5): string {
  const b = contrastRatio(bgHex, BLACK) ?? 0;
  const w = contrastRatio(bgHex, WHITE) ?? 0;

  if (b >= threshold && w >= threshold) return b >= w ? BLACK : WHITE;
  if (b >= threshold) return BLACK;
  if (w >= threshold) return WHITE;
  return b >= w ? BLACK : WHITE;
}

function pickReadableFgKeepingStyle(bgHex: string, currentFgHex: string | undefined, threshold: number): string {
  if (currentFgHex) {
    const currentRatio = contrastRatio(bgHex, currentFgHex);
    if (currentRatio !== null && currentRatio >= threshold) return currentFgHex;
  }
  return pickReadableFg(bgHex, threshold);
}

const AUTO_FG_EDITABLE_KEYS = new Set(["primaryFg", "secondaryFg", "accentFg", "foreground", "mutedFg", "cardFg", "border"]);

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixTowardWhite(hex: string, t: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(rgb.r + (255 - rgb.r) * t, rgb.g + (255 - rgb.g) * t, rgb.b + (255 - rgb.b) * t);
}

function liftToMinLuminance(hex: string, minLuminance: number): string {
  const current = relativeLuminance(hex);
  if (current === null || current >= minLuminance) return hex;

  // Binary-search the smallest blend-to-white that satisfies the luminance floor.
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 18; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = mixTowardWhite(hex, mid);
    const lum = relativeLuminance(candidate) ?? 0;
    if (lum >= minLuminance) hi = mid;
    else lo = mid;
  }
  return mixTowardWhite(hex, hi);
}

export function autoGenerateForegrounds(colors: Record<string, string>, mode: ThemeMode): Record<string, string> {
  const patch: Record<string, string> = {};
  const workingColors: Record<string, string> = { ...colors };

  // Keep Light mode background tone within the configured guardrail.
  if (mode === "light" && workingColors.background) {
    const lifted = liftToMinLuminance(workingColors.background, 0.35);
    if (lifted !== workingColors.background) {
      patch.background = lifted;
      workingColors.background = lifted;
    }
  }

  // Keep Light mode inner surface (card) tone within a readable bright floor.
  if (mode === "light" && workingColors.card) {
    const liftedCard = liftToMinLuminance(workingColors.card, 0.3);
    if (liftedCard !== workingColors.card) {
      patch.card = liftedCard;
      workingColors.card = liftedCard;
    }
  }

  for (const rule of CONTRAST_PAIRS) {
    if (rule.mode && rule.mode !== "all" && rule.mode !== mode) continue;
    if (!AUTO_FG_EDITABLE_KEYS.has(rule.fg)) continue;

    const bg = workingColors[rule.bg];
    if (!bg) continue;

    const currentFg = workingColors[rule.fg];
    const threshold = rule.minRatio ?? 4.5;
    const nextFg = pickReadableFgKeepingStyle(bg, currentFg, threshold);
    patch[rule.fg] = nextFg;
    workingColors[rule.fg] = nextFg;
  }

  return patch;
}

