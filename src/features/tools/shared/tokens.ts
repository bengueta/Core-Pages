import type { CSSProperties } from "react";

export type GlassTier = "primary" | "secondary" | "thin" | "ultra";
export type GlassTint = "blue" | "green" | "orange" | "purple" | "red" | "yellow";

export type Tokens = {
  blue: string;
  green: string;
  red: string;
  orange: string;
  purple: string;
  yellow: string;
  teal: string;
  indigo: string;

  label1: string;
  label2: string;
  label3: string;
  label4: string;

  fill1: string;
  fill2: string;
  fill3: string;
  fill4: string;

  sep: string;
  sepOpq: string;

  r6: number;
  r10: number;
  r13: number;
  r16: number;
  r20: number;
  r28: number;
  r34: number;

  s4: number;
  s8: number;
  s12: number;
  s16: number;
  s20: number;
  s24: number;
  s32: number;
  s40: number;
  s48: number;

  typo: {
    largeTitle: { size: number; weight: number; tracking: string | number };
    title1: { size: number; weight: number; tracking: string | number };
    title2: { size: number; weight: number; tracking: string | number };
    title3: { size: number; weight: number; tracking: string | number };
    headline: { size: number; weight: number; tracking: string | number };
    body: { size: number; weight: number; tracking: string | number };
    callout: { size: number; weight: number; tracking: string | number };
    subhead: { size: number; weight: number; tracking: string | number };
    footnote: { size: number; weight: number; tracking: string | number };
    caption1: { size: number; weight: number; tracking: string | number };
    caption2: { size: number; weight: number; tracking: string | number };
  };
};

const DARK: Tokens = {
  blue: "#0A84FF",
  green: "#32D74B",
  red: "#FF453A",
  orange: "#FF9F0A",
  purple: "#BF5AF2",
  yellow: "#FFD60A",
  teal: "#64D2FF",
  indigo: "#5E5CE6",

  label1: "rgba(255,255,255,0.96)",
  label2: "rgba(255,255,255,0.60)",
  label3: "rgba(255,255,255,0.35)",
  label4: "rgba(255,255,255,0.20)",

  fill1: "rgba(255,255,255,0.20)",
  fill2: "rgba(255,255,255,0.12)",
  fill3: "rgba(255,255,255,0.07)",
  fill4: "rgba(255,255,255,0.04)",

  sep: "rgba(255,255,255,0.08)",
  sepOpq: "rgba(84,84,88,0.65)",

  r6: 6,
  r10: 10,
  r13: 13,
  r16: 16,
  r20: 20,
  r28: 28,
  r34: 34,

  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32,
  s40: 40,
  s48: 48,

  typo: {
    largeTitle: { size: 34, weight: 700, tracking: "-0.020em" },
    title1: { size: 28, weight: 700, tracking: "-0.015em" },
    title2: { size: 22, weight: 700, tracking: "-0.012em" },
    title3: { size: 20, weight: 600, tracking: "-0.010em" },
    headline: { size: 17, weight: 600, tracking: 0 },
    body: { size: 17, weight: 400, tracking: 0 },
    callout: { size: 16, weight: 400, tracking: 0 },
    subhead: { size: 15, weight: 400, tracking: "-0.005em" },
    footnote: { size: 13, weight: 400, tracking: 0 },
    caption1: { size: 12, weight: 400, tracking: 0 },
    caption2: { size: 11, weight: 500, tracking: "0.005em" },
  },
};

const LIGHT: Tokens = {
  ...DARK,
  label1: "rgba(17,17,19,0.96)",
  label2: "rgba(17,17,19,0.70)",
  label3: "rgba(17,17,19,0.46)",
  label4: "rgba(17,17,19,0.28)",
  fill1: "rgba(17,17,19,0.12)",
  fill2: "rgba(17,17,19,0.08)",
  fill3: "rgba(17,17,19,0.06)",
  fill4: "rgba(17,17,19,0.04)",
  sep: "rgba(17,17,19,0.10)",
  sepOpq: "rgba(142,142,147,0.65)",
};

export function getTokens(isDark: boolean): Tokens {
  return isDark ? DARK : LIGHT;
}

export function glass(
  tier: GlassTier = "primary",
  tint: GlassTint | null = null
): CSSProperties {
  const base = {
    primary: { bg: "rgba(255,255,255,0.085)", blur: 40, sat: 180, border: "rgba(255,255,255,0.18)" },
    secondary: { bg: "rgba(255,255,255,0.058)", blur: 24, sat: 160, border: "rgba(255,255,255,0.12)" },
    thin: { bg: "rgba(255,255,255,0.040)", blur: 12, sat: 140, border: "rgba(255,255,255,0.09)" },
    ultra: { bg: "rgba(255,255,255,0.022)", blur: 6, sat: 130, border: "rgba(255,255,255,0.07)" },
  }[tier];

  const tintMap: Record<GlassTint, { bg: string; border: string }> = {
    blue: { bg: "rgba(10,132,255,0.14)", border: "rgba(10,132,255,0.28)" },
    green: { bg: "rgba(50,215,75,0.10)", border: "rgba(50,215,75,0.24)" },
    orange: { bg: "rgba(255,159,10,0.12)", border: "rgba(255,159,10,0.26)" },
    purple: { bg: "rgba(191,90,242,0.10)", border: "rgba(191,90,242,0.22)" },
    red: { bg: "rgba(255,69,58,0.10)", border: "rgba(255,69,58,0.22)" },
    yellow: { bg: "rgba(255,214,10,0.10)", border: "rgba(255,214,10,0.22)" },
  };

  const t = tint ? tintMap[tint] : { bg: base.bg, border: base.border };

  return {
    background: t.bg,
    backdropFilter: `blur(${base.blur}px) saturate(${base.sat}%)`,
    WebkitBackdropFilter: `blur(${base.blur}px) saturate(${base.sat}%)`,
    border: `1px solid ${t.border}`,
    boxShadow: [
      `inset 0 1px 0 rgba(255,255,255,${tint ? "0.10" : "0.14"})`,
      "inset 0 -0.5px 0 rgba(0,0,0,0.10)",
      "0 2px 6px rgba(0,0,0,0.16)",
      "0 8px 24px rgba(0,0,0,0.28)",
    ].join(","),
  };
}

