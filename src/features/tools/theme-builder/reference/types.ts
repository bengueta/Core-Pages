import type { CSSProperties, Dispatch, SetStateAction } from "react";

import type { CssVars } from "../lib";
import type { ThemeBuilderState, ThemeBuilderTab, ViewportMode } from "../types";
import type { CanvasBlock } from "../builder/types";

export type ReferencePreviewProps = {
  state: ThemeBuilderState;
  cssVars: CssVars;
  appBackgroundStyle: string;
  patternBg: CSSProperties;
  viewport: ViewportMode;
  pickMode: boolean;
  setTab: Dispatch<SetStateAction<ThemeBuilderTab>>;
  setPanelOpen: Dispatch<SetStateAction<boolean>>;
  /** Called on pick-mode click: resolved palette key, or `null` if `data-e` is missing / not a palette token. */
  onPickPaletteKey?: (paletteKey: string | null) => void;
  canvasBlocks: CanvasBlock[];
};
