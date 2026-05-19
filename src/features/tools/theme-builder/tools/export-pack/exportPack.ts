import type { ThemeBuilderState } from "../../types";
import type { CssVars } from "../../lib";
import { SEMANTIC_COLORS, TYPE_SCALES, SHADOWS, PATTERNS } from "../../config";

export type ExportPack = {
  /** Full :root block — every computed CSS variable */
  cssVariables: string;
  /** Suggested Tailwind `theme.extend` fragment */
  tailwindSnippet: string;
  /** Single JSON document for LLMs / codegen — full theme + css_variables map */
  aiThemeSpecification: string;
};

function sortedCssEntries(cssVars: CssVars): [string, string][] {
  return Object.entries(cssVars).sort(([a], [b]) => a.localeCompare(b));
}

function buildTailwindExtend(state: ThemeBuilderState, cssVars: CssVars): string {
  const colorEntries = SEMANTIC_COLORS.map((c) => `        "${c.key}": "${state.colors[c.key] ?? c.default}",`).join("\n");
  const shadowEsc = (cssVars["--shadow-actual"] ?? "none").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `// CoreStrategy — theme.extend fragment (merge into tailwind.config)
// Map these to your design system names as needed.
export const coreStrategyThemeExtend = {
  colors: {
${colorEntries}
  },
  borderRadius: {
    DEFAULT: "${state.radius}",
  },
  boxShadow: {
    theme: "${shadowEsc}",
  },
  fontFamily: {
    heading: ${JSON.stringify(state.fontHeading.split(",")[0].replace(/'/g, "").trim())},
    body: ${JSON.stringify(state.fontBody.split(",")[0].replace(/'/g, "").trim())},
    mono: ${JSON.stringify(state.fontMono.split(",")[0].replace(/'/g, "").trim())},
  },
  transitionDuration: {
    DEFAULT: "${state.transition}",
  },
} as const;
`;
}

/**
 * Canonical object for AI assistants: structured theme + every CSS variable + usage hints.
 */
export function buildAiThemeSpecificationObject(state: ThemeBuilderState, cssVars: CssVars): Record<string, unknown> {
  const css_variables = Object.fromEntries(sortedCssEntries(cssVars));

  const color_roles: Record<string, { label: string; hex: string; usage_hint: string }> = {};
  for (const c of SEMANTIC_COLORS) {
    color_roles[c.key] = {
      label: c.label,
      hex: state.colors[c.key] ?? c.default,
      usage_hint:
        c.key === "primary"
          ? "Main brand surface (app may map dark-mode chrome via mode)"
          : c.key.includes("Fg")
            ? "Foreground on the paired surface (e.g. primaryFg on primary)"
            : c.key === "muted"
              ? "Subtle fills and disabled surfaces"
              : c.key === "border"
                ? "Dividers and outlines"
                : c.key === "ring"
                  ? "Focus rings"
                  : "Semantic UI color",
    };
  }

  return {
    $schema: "https://corestrategy.app/schemas/theme-export/v1",
    schemaVersion: 1,
    about: {
      title: "CoreStrategy design token export",
      purpose:
        "Give this JSON to an AI or codegen tool to recreate the same visual system on another site or framework.",
      how_to_apply: [
        "Apply css_variables as CSS custom properties on :root (and mirror for dark mode if you support both).",
        "theme.mode documents the builder preview mode; map --c-bg/--c-fg and related tokens accordingly.",
        "Prefer css_variables for derived values (glass cards, neon shadows).",
        "Load webfonts referenced in theme.typography or use system fallbacks from the stack strings.",
      ],
    },
    generatedAt: new Date().toISOString(),
    theme: {
      mode: state.mode,
      themeStyle: state.themeStyle,
      colors: state.colors,
      typography: {
        fontHeading: state.fontHeading,
        fontBody: state.fontBody,
        fontMono: state.fontMono,
        fontWeight: state.fontWeight,
        typeScale: state.typeScale,
        typeScaleName: TYPE_SCALES[state.typeScale] ?? state.typeScale,
        lineHeight: state.lineHeight,
        letterSpacingEm: state.letterSpacing,
      },
      layout: {
        radius: state.radius,
        spacingMultiplier: state.spacing,
        containerWidthPx: state.containerWidth,
        borderWidthPx: state.borderWidth,
        borderStyle: state.borderStyle,
        wrapperStyle: state.wrapperStyle,
      },
      motion: {
        transition: state.transition,
        easing: state.animEasing,
      },
      surface: {
        appBackgroundStyle: state.appBgStyle,
        pattern: state.pattern,
        patternLabel: PATTERNS[state.pattern] ?? state.pattern,
        patternOpacity: state.patternOpacity,
        patternSizePx: state.patternSize,
      },
      components: {
        cardStyle: state.cardStyle,
        shadowType: state.shadowType,
        shadowPresetKey: state.shadow,
        shadowPresetCss: SHADOWS[state.shadow] ?? "none",
        buttonTextTransform: state.buttonTransform,
        glass: state.glass,
        glow: state.glow,
      },
    },
    css_variables,
    color_roles,
  };
}

export function generateExportPack(state: ThemeBuilderState, cssVars: CssVars): ExportPack {
  const cssVariables =
    `/* CoreStrategy — design tokens (:root) */\n:root {\n` +
    sortedCssEntries(cssVars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join("\n") +
    "\n}\n";

  const tailwindSnippet = buildTailwindExtend(state, cssVars);

  const aiThemeSpecification = JSON.stringify(buildAiThemeSpecificationObject(state, cssVars), null, 2);

  return { cssVariables, tailwindSnippet, aiThemeSpecification };
}
