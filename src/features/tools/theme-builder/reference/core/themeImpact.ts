import type { CSSProperties } from "react";

import type { CssVars } from "../../lib";

type RootStyleArgs = {
  cssVars: CssVars;
  appBackgroundStyle: string;
};

export function getReferenceRootStyle({ cssVars, appBackgroundStyle }: RootStyleArgs): CSSProperties {
  return {
    ...(cssVars as unknown as CSSProperties),
    background: appBackgroundStyle,
    color: "var(--c-fg)",
    fontFamily: "var(--font-body)",
    fontWeight: "var(--fw-body)" as unknown as CSSProperties["fontWeight"],
    lineHeight: "var(--line-height)",
    letterSpacing: "var(--letter-spacing)",
  };
}
