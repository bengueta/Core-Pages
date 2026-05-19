"use client";

import { normalizeDataEToPaletteKey } from "../lib";
import { getReferenceRootStyle } from "./core";
import { PreviewSiteShell } from "./preview";
import { StaticReferenceBlock } from "./StaticReferenceBlock";
import type { ReferencePreviewProps } from "./types";

export function ReferencePreview({
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
}: ReferencePreviewProps) {
  const ordered = [...canvasBlocks].sort((a, b) => a.order - b.order);
  const renderProps = { state, viewport, pickMode, setTab, setPanelOpen };

  const vwLabel = viewport === "mobile" ? "375px" : viewport === "tablet" ? "768px" : `${state.containerWidth}px`;
  const metaLine = `${state.themeStyle} · ${state.mode} · max ${vwLabel}`;

  return (
    <div className="flex-1 overflow-y-auto preview-wrapper relative" style={{ background: "#09090b" }}>
      <div className="p-3 sm:p-5 relative min-h-full flex flex-col" dir="ltr" style={getReferenceRootStyle({ cssVars, appBackgroundStyle })}>
        <div className="absolute inset-0 pointer-events-none z-0" style={{ ...patternBg, borderRadius: "inherit" }} />

        <div
          className="mx-auto w-full flex flex-col max-w-full flex-1 min-h-0"
          style={{
            maxWidth: viewport === "mobile" ? 375 : viewport === "tablet" ? 768 : state.containerWidth,
            padding: "calc(12px * var(--spacing))",
          }}
          onClick={(e) => {
            if (!pickMode) return;
            const target = e.target as HTMLElement | null;
            const el = target?.closest?.("[data-e]") as HTMLElement | null;
            if (!el) return;
            const raw = el.getAttribute("data-e");
            const key = normalizeDataEToPaletteKey(raw);
            onPickPaletteKey?.(key);
            setTab("palette");
            setPanelOpen(true);
          }}
        >
          <PreviewSiteShell viewport={viewport} metaLine={metaLine}>
            {ordered.map((block) => (
              <StaticReferenceBlock key={block.id} block={block} renderProps={renderProps} visible={block.visible} />
            ))}
          </PreviewSiteShell>
        </div>
      </div>
    </div>
  );
}
