import type { ThemeBuilderState } from "./types";
import {
  Flame,
  Gem,
  Grid3X3,
  Layers,
  Layout,
  Palette,
  Save,
  Sparkles,
  Type,
  Wand2,
  Zap,
  Skull,
} from "lucide-react";

export const SEMANTIC_COLORS = [
  { key: "primary", label: "Primary", default: "#18181b" },
  { key: "primaryFg", label: "Primary FG", default: "#fafafa" },
  { key: "secondary", label: "Secondary", default: "#f4f4f5" },
  { key: "secondaryFg", label: "Secondary FG", default: "#18181b" },
  { key: "accent", label: "Accent", default: "#c9a96e" },
  { key: "accentFg", label: "Accent FG", default: "#ffffff" },
  { key: "destructive", label: "Destructive", default: "#ef4444" },
  { key: "warning", label: "Warning", default: "#f59e0b" },
  { key: "success", label: "Success", default: "#22c55e" },
  { key: "info", label: "Info", default: "#3b82f6" },
  { key: "background", label: "Background (Outer)", default: "#ffffff" },
  { key: "foreground", label: "Foreground", default: "#09090b" },
  { key: "muted", label: "Muted", default: "#f4f4f5" },
  { key: "mutedFg", label: "Muted FG", default: "#71717a" },
  { key: "border", label: "Border", default: "#e4e4e7" },
  { key: "card", label: "Background (Inner/Card)", default: "#ffffff" },
  { key: "cardFg", label: "Card FG", default: "#09090b" },
  { key: "ring", label: "Focus Ring", default: "#18181b" },
] as const;

export const SHADOWS: Record<string, string> = {
  none: "none",
  xs: "0 1px 2px rgba(0,0,0,.05)",
  sm: "0 1px 3px rgba(0,0,0,.1), 0 1px 2px rgba(0,0,0,.06)",
  md: "0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)",
  "2xl": "0 25px 50px -12px rgba(0,0,0,.25)",
  inner: "inset 0 2px 4px rgba(0,0,0,.06)",
};

export const RADII: Record<string, string> = {
  "0": "None",
  "0.125rem": "2XS",
  "0.25rem": "XS",
  "0.375rem": "SM",
  "0.5rem": "MD",
  "0.75rem": "LG",
  "1rem": "XL",
  "1.5rem": "2XL",
  "9999px": "Full",
};

export const TRANSITIONS: Record<string, string> = {
  "0s": "None",
  "0.1s": "Snap",
  "0.15s": "Fast",
  "0.25s": "Normal",
  "0.4s": "Smooth",
  "0.6s": "Slow",
};

export const TYPE_SCALES: Record<string, string> = {
  "1.067": "Minor Second",
  "1.125": "Major Second",
  "1.200": "Minor Third",
  "1.250": "Major Third",
  "1.333": "Perfect Fourth",
  "1.414": "Aug Fourth",
  "1.500": "Perfect Fifth",
  "1.618": "Golden Ratio",
};

export const PATTERNS: Record<string, string> = {
  none: "None",
  grid: "Grid",
  dots: "Dots",
  diagonal: "Diagonal",
  cross: "Crosshatch",
};

export const FONT_STACKS = {
  heading: [
    { name: "DM Sans", value: "'DM Sans', sans-serif" },
    {
      name: "Playfair Display",
      value: "'Playfair Display', serif",
      url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap",
    },
    {
      name: "Syne",
      value: "'Syne', sans-serif",
      url: "https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&display=swap",
    },
    {
      name: "Outfit",
      value: "'Outfit', sans-serif",
      url: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap",
    },
    {
      name: "Fraunces",
      value: "'Fraunces', serif",
      url: "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;800&display=swap",
    },
    {
      name: "Space Grotesk",
      value: "'Space Grotesk', sans-serif",
      url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap",
    },
    {
      name: "Bricolage",
      value: "'Bricolage Grotesque', sans-serif",
      url: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&display=swap",
    },
  ],
  body: [
    { name: "DM Sans", value: "'DM Sans', sans-serif" },
    {
      name: "Outfit",
      value: "'Outfit', sans-serif",
      url: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap",
    },
    {
      name: "Sora",
      value: "'Sora', sans-serif",
      url: "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500&display=swap",
    },
    {
      name: "IBM Plex Sans",
      value: "'IBM Plex Sans', sans-serif",
      url: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500&display=swap",
    },
  ],
  mono: [
    {
      name: "JetBrains Mono",
      value: "'JetBrains Mono', monospace",
      url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap",
    },
    { name: "DM Mono", value: "'DM Mono', monospace" },
  ],
} as const;

export const PRESETS = {
  midnight: {
    colors: {
      primary: "#18181b",
      primaryFg: "#fafafa",
      secondary: "#f4f4f5",
      secondaryFg: "#18181b",
      accent: "#c9a96e",
      accentFg: "#fff",
      destructive: "#ef4444",
      warning: "#f59e0b",
      success: "#22c55e",
      info: "#3b82f6",
      background: "#fff",
      foreground: "#09090b",
      muted: "#f4f4f5",
      mutedFg: "#71717a",
      border: "#e4e4e7",
      card: "#fff",
      cardFg: "#09090b",
      ring: "#18181b",
    },
    dots: ["#18181b", "#c9a96e", "#f4f4f5"],
  },
  ocean: {
    colors: {
      primary: "#0f4c81",
      primaryFg: "#f0f9ff",
      secondary: "#e0f2fe",
      secondaryFg: "#0c4a6e",
      accent: "#38bdf8",
      accentFg: "#fff",
      destructive: "#ef4444",
      warning: "#f59e0b",
      success: "#22c55e",
      info: "#0ea5e9",
      background: "#f8faff",
      foreground: "#0f172a",
      muted: "#e0f2fe",
      mutedFg: "#64748b",
      border: "#bae6fd",
      card: "#ffffff",
      cardFg: "#0f172a",
      ring: "#0f4c81",
    },
    dots: ["#0f4c81", "#38bdf8", "#e0f2fe"],
  },
  cyberpunk: {
    colors: {
      primary: "#0d0d0d",
      primaryFg: "#f0f0f0",
      secondary: "#1a1a2e",
      secondaryFg: "#e0e0e0",
      accent: "#00ff88",
      accentFg: "#0d0d0d",
      destructive: "#ff3366",
      warning: "#ffaa00",
      success: "#00ff88",
      info: "#00aaff",
      background: "#0a0a0f",
      foreground: "#e0e0e0",
      muted: "#1a1a2e",
      mutedFg: "#888",
      border: "#333",
      card: "#111118",
      cardFg: "#e0e0e0",
      ring: "#00ff88",
    },
    dots: ["#0d0d0d", "#00ff88", "#ff3366"],
  },
  luxe: {
    colors: {
      primary: "#1c1917",
      primaryFg: "#fafaf9",
      secondary: "#f5f5f4",
      secondaryFg: "#1c1917",
      accent: "#d4a953",
      accentFg: "#1c1917",
      destructive: "#dc2626",
      warning: "#d97706",
      success: "#16a34a",
      info: "#2563eb",
      background: "#fffffe",
      foreground: "#0c0a09",
      muted: "#f5f5f4",
      mutedFg: "#78716c",
      border: "#e7e5e4",
      card: "#fafaf9",
      cardFg: "#0c0a09",
      ring: "#1c1917",
    },
    dots: ["#1c1917", "#d4a953", "#f5f5f4"],
  },
} as const;

export const THEME_CONFIGS: Record<
  string,
  Partial<ThemeBuilderState> & { themeStyle?: string }
> = {
  default: {
    cardStyle: "flat",
    shadowType: "soft",
    appBgStyle: "solid",
    borderWidth: 1,
    buttonTransform: "none",
    pattern: "none",
    radius: "0.5rem",
    wrapperStyle: "none",
  },
  glass: {
    cardStyle: "glass",
    shadowType: "soft",
    appBgStyle: "mesh",
    borderWidth: 1,
    buttonTransform: "none",
    pattern: "none",
    radius: "1rem",
    wrapperStyle: "none",
  },
  comic: {
    cardStyle: "flat",
    shadowType: "hard",
    appBgStyle: "solid",
    borderWidth: 3,
    buttonTransform: "uppercase",
    pattern: "dots",
    patternSize: 24,
    patternOpacity: 0.15,
    radius: "0.5rem",
    wrapperStyle: "none",
  },
  brutalist: {
    cardStyle: "flat",
    shadowType: "hard",
    appBgStyle: "grain",
    borderWidth: 4,
    buttonTransform: "uppercase",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fontBody: FONT_STACKS.mono[0].value as any,
    pattern: "grid",
    patternSize: 32,
    radius: "0",
    wrapperStyle: "none",
  },
  neon: {
    cardStyle: "flat",
    shadowType: "neon",
    appBgStyle: "grain",
    borderWidth: 1,
    buttonTransform: "uppercase",
    radius: "0.5rem",
    pattern: "grid",
    patternOpacity: 0.05,
    wrapperStyle: "none",
  },
  metal: {
    cardStyle: "gradient",
    shadowType: "soft",
    appBgStyle: "solid",
    borderWidth: 1,
    buttonTransform: "uppercase",
    radius: "0.5rem",
    wrapperStyle: "none",
  },
};

export const THEME_STYLES = [
  { key: "default", icon: Layers, name: "Default", desc: "Clean standard" },
  { key: "glass", icon: Gem, name: "Glass", desc: "Frosted morphism" },
  { key: "comic", icon: Zap, name: "Comic", desc: "Bold pop art" },
  { key: "metal", icon: Skull, name: "Metal", desc: "Brushed industrial" },
  { key: "neon", icon: Flame, name: "Neon Glow", desc: "Cyberpunk neon" },
  { key: "brutalist", icon: Grid3X3, name: "Brutalist", desc: "Raw & utilitarian" },
] as const;

export const TABS = [
  { key: "presets", icon: Save, label: "Presets" },
  { key: "palette", icon: Palette, label: "Palette" },
  { key: "type", icon: Type, label: "Type" },
  { key: "layout", icon: Layout, label: "Layout" },
  { key: "effects", icon: Wand2, label: "Effects" },
  { key: "themes", icon: Sparkles, label: "Themes" },
] as const;

export function defaultState(): ThemeBuilderState {
  return {
    colors: Object.fromEntries(SEMANTIC_COLORS.map((c) => [c.key, c.default])),
    mode: "light",

    fontHeading: FONT_STACKS.heading[0].value,
    fontBody: FONT_STACKS.body[0].value,
    fontMono: FONT_STACKS.mono[0].value,
    fontWeight: { heading: 700, body: 400 },
    typeScale: "1.250",
    lineHeight: 1.5,
    letterSpacing: 0,

    radius: "0.5rem",
    shadow: "md",
    spacing: 1,
    containerWidth: 1280,
    borderWidth: 1,
    borderStyle: "solid",
    transition: "0.15s",
    animEasing: "ease",

    wrapperStyle: "none",
    appBgStyle: "solid",
    cardStyle: "flat",
    shadowType: "soft",
    buttonTransform: "none",

    pattern: "none",
    patternOpacity: 0.1,
    patternSize: 16,

    glass: { blur: 16, opacity: 0.15, border: 0.2, saturation: 1.5 },
    glow: { color: "var(--c-accent)", intensity: 0.5 },
    themeStyle: "default",
  };
}

