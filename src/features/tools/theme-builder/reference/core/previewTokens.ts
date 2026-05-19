import type { CSSProperties } from "react";

/** Reusable flex stacks — pure data, safe for any importer. */
export function refFlexCol(gap: number, extra?: CSSProperties): CSSProperties {
  return { display: "flex", flexDirection: "column", gap, width: "100%", ...extra };
}

export function refFlexRowWrap(gap: number, extra?: CSSProperties): CSSProperties {
  return { display: "flex", flexWrap: "wrap", gap, width: "100%", ...extra };
}

/** Shared token text styles (stats, product titles). */
export const refTypo = {
  statLabel: { fontSize: 11, color: "var(--c-muted-fg)", marginBottom: 4 } satisfies CSSProperties,
  statValue: {
    fontSize: 22,
    fontWeight: "var(--fw-heading)" as never,
    fontFamily: "var(--font-heading)",
    color: "var(--c-fg)",
  } satisfies CSSProperties,
  sectionHeading: {
    fontSize: 15,
    fontWeight: "var(--fw-heading)" as never,
    fontFamily: "var(--font-heading)",
    color: "var(--c-fg)",
  } satisfies CSSProperties,
} as const;
