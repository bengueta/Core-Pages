import type { ExportFormat, ThemeBuilderState } from "./types";
import { SHADOWS } from "./config";
import { FONT_STACKS } from "./config";
import { SEMANTIC_COLORS } from "./config";

const PALETTE_COLOR_KEYS: ReadonlySet<string> = new Set(SEMANTIC_COLORS.map((c) => c.key));

/** Map preview `data-e` (camelCase or kebab segments) to a palette key from `SEMANTIC_COLORS`. */
export function normalizeDataEToPaletteKey(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (PALETTE_COLOR_KEYS.has(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  if (PALETTE_COLOR_KEYS.has(lower)) return lower;
  const camelFromKebab = lower.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
  if (PALETTE_COLOR_KEYS.has(camelFromKebab)) return camelFromKebab;
  return null;
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (mx + mn) / 2;

  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (mx === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslStr(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${h} ${s}% ${l}%`;
}

export function loadFont(url?: string): void {
  if (!url) return;
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${url}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = url;
  document.head.appendChild(l);
}

export type CssVars = Record<string, string>;

export function buildCssVars(state: ThemeBuilderState): CssVars {
  const c = state.colors;
  const isDark = state.mode === "dark";

  let cardBg = isDark ? c.primary : c.card;
  let cardBackdrop = "none";
  let cardBorder = `${state.borderWidth}px ${state.borderStyle} var(--c-border)`;
  let shadowActual = SHADOWS[state.shadow] || "none";
  let btnBorder = "none";

  if (state.cardStyle === "glass") {
    cardBg = `color-mix(in srgb, ${cardBg} ${state.glass.opacity * 100}%, transparent)`;
    cardBackdrop = `blur(${state.glass.blur}px) saturate(${state.glass.saturation})`;
    cardBorder = `1px solid color-mix(in srgb, var(--c-fg) ${state.glass.border * 100}%, transparent)`;
  } else if (state.cardStyle === "gradient") {
    cardBg = `linear-gradient(145deg, ${cardBg}, color-mix(in srgb, ${cardBg} 80%, #000))`;
    cardBorder = `1px solid color-mix(in srgb, var(--c-fg) 15%, transparent)`;
  }

  if (state.shadowType === "hard") {
    shadowActual = `${state.borderWidth + 1}px ${state.borderWidth + 1}px 0 var(--c-fg)`;
    btnBorder = `${state.borderWidth}px solid var(--c-fg)`;
  } else if (state.shadowType === "neon") {
    const gc = state.glow.color === "var(--c-accent)" ? c.accent : state.glow.color;
    shadowActual = `0 0 ${state.glow.intensity * 20}px ${gc}33, 0 0 ${state.glow.intensity * 40}px ${gc}22`;
    btnBorder = `1px solid ${gc}55`;
  }

  return {
    "--c-primary": c.primary,
    "--c-primary-fg": c.primaryFg,
    "--c-secondary": c.secondary,
    "--c-secondary-fg": c.secondaryFg,
    "--c-accent": c.accent,
    "--c-accent-fg": c.accentFg,
    "--c-destructive": c.destructive,
    "--c-warning": c.warning,
    "--c-success": c.success,
    "--c-info": c.info,
    "--c-bg": isDark ? c.primary : c.background,
    "--c-fg": isDark ? c.primaryFg : c.foreground,
    "--c-muted": c.muted,
    "--c-muted-fg": c.mutedFg,
    "--c-border": c.border,
    "--c-card": isDark ? c.primary : c.card,
    "--c-card-fg": c.cardFg,
    "--c-ring": c.ring,

    "--radius": state.radius,
    "--shadow": SHADOWS[state.shadow] || "none",
    "--shadow-actual": shadowActual,
    "--transition": state.transition,
    "--easing": state.animEasing,
    "--spacing": String(state.spacing),
    "--line-height": String(state.lineHeight),
    "--letter-spacing": `${state.letterSpacing}em`,

    "--font-heading": state.fontHeading,
    "--font-body": state.fontBody,
    "--font-mono": state.fontMono,
    "--fw-heading": String(state.fontWeight.heading),
    "--fw-body": String(state.fontWeight.body),
    "--border-width": `${state.borderWidth}px`,
    "--border-style": state.borderStyle,

    "--card-bg": cardBg,
    "--card-backdrop": cardBackdrop,
    "--card-border": cardBorder,

    "--btn-transform": state.buttonTransform,
    "--btn-border": btnBorder,
    "--btn-weight": String(state.shadowType === "hard" ? 700 : state.fontWeight.body),
  };
}

export function generateExport(state: ThemeBuilderState, cssVars: CssVars, fmt: ExportFormat): string {
  const rootExtra =
    `\n  /* Advanced Effects */` +
    `\n  --card-bg: ${cssVars["--card-bg"]};` +
    `\n  --card-backdrop: ${cssVars["--card-backdrop"]};` +
    `\n  --card-border: ${cssVars["--card-border"]};` +
    `\n  --shadow-actual: ${cssVars["--shadow-actual"]};`;

  switch (fmt) {
    case "pack":
      // The UI exposes pack outputs separately; defaulting to tokens JSON is safest for direct calls.
      return generateExport(state, cssVars, "json");
    case "css":
      return (
        "/* Theme Builder Pro — CSS Export */\n" +
        ":root {\n" +
        `  --primary: ${state.colors.primary};\n` +
        `  --primary-foreground: ${state.colors.primaryFg};\n` +
        `  --background: ${state.colors.background};\n` +
        `  --foreground: ${state.colors.foreground};\n` +
        `  --card: ${state.colors.card};\n` +
        `  --border: ${state.colors.border};\n` +
        `  --radius: ${state.radius};\n` +
        `  --font-heading: ${state.fontHeading};\n` +
        `  --font-body: ${state.fontBody};` +
        `${rootExtra}\n` +
        "}\n\n" +
        ".card {\n" +
        "  background: var(--card-bg);\n" +
        "  backdrop-filter: var(--card-backdrop);\n" +
        "  -webkit-backdrop-filter: var(--card-backdrop);\n" +
        "  border: var(--card-border);\n" +
        "  box-shadow: var(--shadow-actual);\n" +
        "  border-radius: var(--radius);\n" +
        `  transition: all ${state.transition} ${state.animEasing};\n` +
        "}\n" +
        ".card:hover {\n" +
        "  transform: translateY(-2px);\n" +
        "}"
      );

    case "tailwind":
      return `// tailwind.config.ts (Partial)
export default {
  theme: {
    extend: {
      colors: { primary: "${state.colors.primary}", background: "${state.colors.background}" },
      borderRadius: { DEFAULT: "${state.radius}" },
      boxShadow: { DEFAULT: "${cssVars["--shadow-actual"]}" }
    },
  },
};`;

    case "json":
      return JSON.stringify(state, null, 2);
  }
}

function loadFontForValue(fontValue: string): void {
  const all = [...FONT_STACKS.heading, ...FONT_STACKS.body, ...FONT_STACKS.mono];
  const match = all.find((f) => f.value === fontValue);
  loadFont((match as { url?: string } | undefined)?.url);
}

export function ensureStateFontsLoaded(state: ThemeBuilderState): void {
  loadFontForValue(state.fontHeading);
  loadFontForValue(state.fontBody);
  loadFontForValue(state.fontMono);
}

function isHexColor(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);
}

/**
 * Normalize a ThemeBuilderState before saving/importing.
 * - Ensures all semantic color keys exist with valid hex values (fallbacks to defaults).
 * - Keeps the rest of the state as-is (full restore).
 */
export function normalizePresetState(state: ThemeBuilderState): ThemeBuilderState {
  const normalizedColors: Record<string, string> = { ...state.colors };
  for (const c of SEMANTIC_COLORS) {
    const cur = normalizedColors[c.key];
    normalizedColors[c.key] = isHexColor(cur) ? cur : c.default;
  }
  return { ...state, colors: normalizedColors };
}

export type PresetsStorageV1 = {
  version: 1;
  presets: Array<{ id: string; name: string; savedAt: string; state: ThemeBuilderState }>;
};

export function parsePresetsStorage(raw: string | null): PresetsStorageV1 | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as { version?: unknown; presets?: unknown };
    if (obj.version !== 1 || !Array.isArray(obj.presets)) return null;
    const presets = obj.presets
      .map((p) => {
        if (!p || typeof p !== "object") return null;
        const pp = p as { id?: unknown; name?: unknown; savedAt?: unknown; state?: unknown };
        if (typeof pp.id !== "string") return null;
        if (typeof pp.name !== "string" || !pp.name.trim()) return null;
        if (typeof pp.savedAt !== "string") return null;
        if (!pp.state || typeof pp.state !== "object") return null;
        const st = pp.state as ThemeBuilderState;
        if (!st.colors || typeof st.colors !== "object") return null;
        const normalizedState = normalizePresetState(st);
        return { id: pp.id, name: pp.name, savedAt: pp.savedAt, state: normalizedState };
      })
      .filter(Boolean) as PresetsStorageV1["presets"];
    return { version: 1, presets };
  } catch {
    return null;
  }
}

export function serializePresetsStorage(presets: PresetsStorageV1["presets"]): string {
  const payload: PresetsStorageV1 = { version: 1, presets };
  return JSON.stringify(payload);
}

