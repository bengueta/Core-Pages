"use client";

import type { Dispatch, SetStateAction } from "react";
import React from "react";

import type { ThemeBuilderState, ThemeBuilderTab, ViewportMode } from "../types";
import type { CssVars } from "../lib";
import type { CanvasBlock } from "../builder/types";
import { ReferencePreview } from "../reference/ReferencePreview";

export function PreviewContent({
  state,
  cssVars,
  appBackgroundStyle,
  patternBg,
  viewport,
  pickMode,
  setTab,
  setPanelOpen,
  onPickPaletteKey,
  canvasBlocks,
}: {
  state: ThemeBuilderState;
  cssVars: CssVars;
  appBackgroundStyle: string;
  patternBg: React.CSSProperties;
  viewport: ViewportMode;
  pickMode: boolean;
  setTab: Dispatch<SetStateAction<ThemeBuilderTab>>;
  setPanelOpen: Dispatch<SetStateAction<boolean>>;
  onPickPaletteKey?: (paletteKey: string | null) => void;
  canvasBlocks: CanvasBlock[];
}) {
  return (
    <ReferencePreview
      state={state}
      cssVars={cssVars}
      appBackgroundStyle={appBackgroundStyle}
      patternBg={patternBg}
      viewport={viewport}
      pickMode={pickMode}
      setTab={setTab}
      setPanelOpen={setPanelOpen}
      onPickPaletteKey={onPickPaletteKey}
      canvasBlocks={canvasBlocks}
    />
  );
}
