"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TOOL_ROUTES } from "@/lib/routes/tools";
import type { CanvasBlock } from "./builder";
import { buildPreviewSiteCanvasBlocks } from "./reference/preview/pageBlueprint";
import { ThemeBuilderScopeStyle } from "./shell/ThemeBuilderScopeStyle";
import { useThemeBuilderController } from "./shell/useThemeBuilderController";
import { PreviewContent, Sidebar, TopBar } from "./ThemeBuilderParts";
import { ExportModal } from "./ExportModal";

const REFERENCE_PAGE_BLOCKS: CanvasBlock[] = buildPreviewSiteCanvasBlocks();

export function ThemeBuilderShell() {
  const c = useThemeBuilderController();

  return (
    <div
      id="theme-builder"
      dir="ltr"
      suppressHydrationWarning
      style={{
        height: "100vh",
        width: "100vw",
        background: "#09090b",
        color: "#e4e4e7",
        fontFamily: "'DM Sans',sans-serif",
        fontSize: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          background: "rgba(7,7,10,.92)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Link
          href={TOOL_ROUTES.index}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(228,228,231,.55)",
            textDecoration: "none",
            fontSize: 11,
            fontWeight: 600,
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "rgba(228,228,231,.85)")}
          onMouseOut={(e) => (e.currentTarget.style.color = "rgba(228,228,231,.55)")}
        >
          <ArrowLeft size={14} />
          Back to Tools
        </Link>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "rgba(228,228,231,.35)" }}>{TOOL_ROUTES["brand-colors"]}</div>
      </div>

      <TopBar
        state={c.state}
        panelOpen={c.panelOpen}
        setPanelOpen={c.setPanelOpen}
        pickMode={c.pickMode}
        setPickMode={c.setPickMode}
        contrastOpen={c.contrastOpen}
        setContrastOpen={c.setContrastOpen}
        contrastStatus={c.contrastStatus}
        onAutoFg={c.onAutoFg}
        autoFgUndoAvailable={c.autoFgUndoAvailable}
        onUndoAutoFg={c.onUndoAutoFg}
        onOpenExportPack={c.onOpenExportPack}
        viewport={c.viewport}
        setViewport={c.setViewport}
        upd={c.upd}
      />

      {c.pickMode ? (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: "rgba(201,169,110,.95)", color: "#09090b", fontSize: 11, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,.4)" }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700 }}>Pick mode:</span> Click any element to edit its color{" "}
            <kbd style={{ background: "rgba(0,0,0,.15)", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>Esc</kbd>
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 overflow-hidden">
        {c.panelOpen ? (
          <Sidebar
            tab={c.tab}
            setTab={c.setTab}
            state={c.state}
            setColor={c.setColor}
            paletteHighlightKey={c.paletteHighlightKey}
            onPaletteHighlightConsumed={c.clearPaletteHighlight}
            upd={c.upd}
            openSections={c.openSections}
            toggleSection={c.toggleSection}
            applyPreset={c.applyPreset}
            activePreset={c.activePreset}
            applyThemePreset={c.applyThemePreset}
            userPresets={c.userPresets}
            onSaveCurrentPreset={c.saveCurrentPreset}
            onApplyUserPreset={c.applyUserPreset}
            onDeleteUserPreset={c.deleteUserPreset}
            onDuplicateUserPreset={c.duplicateUserPreset}
            onExportUserPreset={c.exportUserPreset}
            onImportFromJson={c.importFromJson}
            onCopyValue={c.onCopyValue}
            onExport={() => c.setShowExport(true)}
            onRandomize={c.randomizeAll}
            onReset={c.resetAll}
          />
        ) : null}

        <PreviewContent
          state={c.state}
          cssVars={c.cssVars}
          appBackgroundStyle={c.appBackgroundStyle}
          patternBg={c.patternBg}
          viewport={c.viewport}
          pickMode={c.pickMode}
          setTab={c.setTab}
          setPanelOpen={c.setPanelOpen}
          onPickPaletteKey={c.handlePreviewPalettePick}
          canvasBlocks={REFERENCE_PAGE_BLOCKS}
        />
      </div>

      <ExportModal
        open={c.showExport}
        onClose={() => c.setShowExport(false)}
        getExport={c.getExport}
        exportTab={c.exportTab}
        setExportTab={c.setExportTab}
        exportPack={c.exportPack}
        onNotify={c.notify}
      />

      {c.notice ? (
        <div
          className="fixed bottom-4 right-4 z-90 px-3 py-2 rounded-md border"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: c.notice.kind === "success" ? "#8bf5c7" : c.notice.kind === "error" ? "#ffb4b4" : "#d4d4d8",
            background: "rgba(9,9,11,.94)",
            borderColor:
              c.notice.kind === "success" ? "rgba(16,185,129,.4)" : c.notice.kind === "error" ? "rgba(239,68,68,.45)" : "rgba(161,161,170,.35)",
            boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          }}
        >
          {c.notice.text}
        </div>
      ) : null}

      <ThemeBuilderScopeStyle appBgStyle={c.state.appBgStyle} />
    </div>
  );
}
