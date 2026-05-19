import type { CSSProperties } from "react";

import type { ThemeBuilderState } from "../types";

/** Preview canvas pattern overlay (grid, dots, …) from layout state. */
export function getPatternOverlayStyle(state: Pick<ThemeBuilderState, "pattern" | "patternOpacity" | "patternSize">): CSSProperties {
  const p = state.pattern;
  if (p === "none" || state.patternOpacity === 0) return {};
  const c = `color-mix(in srgb, var(--c-fg) ${state.patternOpacity * 100}%, transparent)`;
  const s = `${state.patternSize}px`;
  const map: Record<string, CSSProperties> = {
    grid: {
      backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
      backgroundSize: `${s} ${s}`,
    },
    dots: {
      backgroundImage: `radial-gradient(circle, ${c} ${Math.max(1, state.patternSize / 8)}px, transparent ${Math.max(1.5, state.patternSize / 8 + 0.5)}px)`,
      backgroundSize: `${s} ${s}`,
    },
    diagonal: {
      backgroundImage: `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent ${state.patternSize / 2}px)`,
    },
    cross: {
      backgroundImage: `radial-gradient(circle, ${c} 0.5px, transparent 0.5px), linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
      backgroundSize: `${s} ${s}`,
    },
  };
  return map[p] || {};
}
