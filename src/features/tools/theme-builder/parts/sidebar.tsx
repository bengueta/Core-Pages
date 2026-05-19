"use client";

import type { Dispatch, SetStateAction } from "react";
import { Dices, Download, RotateCcw } from "lucide-react";

import type { ThemeBuilderState, ThemeBuilderTab, UserPreset } from "../types";
import { TABS } from "../config";
import { SidebarBtn } from "./chrome";
import { EffectsTab, LayoutTab, PaletteTab, PresetsTab, ThemesTab, TypeTab } from "./tabs";

export function Sidebar({
  tab,
  setTab,
  state,
  setColor,
  upd,
  openSections,
  toggleSection,
  applyPreset,
  activePreset,
  applyThemePreset,
  userPresets,
  onSaveCurrentPreset,
  onApplyUserPreset,
  onDeleteUserPreset,
  onDuplicateUserPreset,
  onExportUserPreset,
  onImportFromJson,
  onCopyValue,
  onExport,
  onRandomize,
  onReset,
  paletteHighlightKey,
  onPaletteHighlightConsumed,
}: {
  tab: ThemeBuilderTab;
  setTab: Dispatch<SetStateAction<ThemeBuilderTab>>;
  state: ThemeBuilderState;
  setColor: (key: string, value: string) => void;
  paletteHighlightKey?: string | null;
  onPaletteHighlightConsumed?: () => void;
  upd: (path: string, value: unknown) => void;
  openSections: Record<string, boolean | undefined>;
  toggleSection: (id: string) => void;
  applyPreset: (name: string) => void;
  activePreset: string;
  applyThemePreset: (key: string) => void;
  userPresets: UserPreset[];
  onSaveCurrentPreset: (name: string) => void;
  onApplyUserPreset: (id: string) => void;
  onDeleteUserPreset: (id: string) => void;
  onDuplicateUserPreset: (id: string) => void;
  onExportUserPreset: (id: string) => void;
  onImportFromJson: (raw: string) => boolean;
  onCopyValue: (value: string, label: string) => void;
  onExport: () => void;
  onRandomize: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col flex-shrink-0 overflow-hidden" style={{ width: 272, background: "rgba(12,12,15,.96)", backdropFilter: "blur(20px)", borderRight: "1px solid rgba(255,255,255,.06)" }}>
      <div className="flex px-2 pt-2 gap-0.5 flex-shrink-0">
        {TABS.map((t) => {
          const active = tab === (t.key as ThemeBuilderTab);
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as ThemeBuilderTab)}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md transition-all cursor-pointer hover:bg-white/5"
              style={{
                background: active ? "rgba(201,169,110,.06)" : "transparent",
                border: `1px solid ${active ? "rgba(201,169,110,.15)" : "transparent"}`,
                color: active ? "#c9a96e" : "rgba(228,228,231,.25)",
              }}
            >
              <Icon size={12} />
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: ".06em" }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-3 py-1.5 flex-shrink-0" style={{ fontSize: 9, color: "rgba(228,228,231,.28)", lineHeight: 1.35 }}>
        The center panel is a responsive site preview (header, sections, footer) — all driven by your tokens. Use viewport buttons to check
        mobile/tablet/desktop. Export → Pack → <strong style={{ color: "rgba(228,228,231,.45)" }}>AI theme spec</strong> for LLMs.
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,.08) transparent" }}>
        {tab === "presets" ? (
          <PresetsTab
            userPresets={userPresets}
            onSaveCurrent={onSaveCurrentPreset}
            onApplyUserPreset={onApplyUserPreset}
            onDeleteUserPreset={onDeleteUserPreset}
            onDuplicateUserPreset={onDuplicateUserPreset}
            onExportUserPreset={onExportUserPreset}
            onImportFromJson={onImportFromJson}
            applyBuiltInPreset={applyPreset}
            activePreset={activePreset}
          />
        ) : tab === "palette" ? (
          <PaletteTab
            state={state}
            setColor={setColor}
            onCopyValue={onCopyValue}
            openSections={openSections}
            toggleSection={toggleSection}
            paletteHighlightKey={paletteHighlightKey}
            onPaletteHighlightConsumed={onPaletteHighlightConsumed}
          />
        ) : tab === "type" ? (
          <TypeTab state={state} upd={upd} openSections={openSections} toggleSection={toggleSection} />
        ) : tab === "layout" ? (
          <LayoutTab state={state} upd={upd} openSections={openSections} toggleSection={toggleSection} />
        ) : tab === "effects" ? (
          <EffectsTab state={state} upd={upd} openSections={openSections} toggleSection={toggleSection} />
        ) : (
          <ThemesTab state={state} openSections={openSections} toggleSection={toggleSection} applyThemePreset={applyThemePreset} />
        )}
      </div>

      <div className="flex gap-1.5 px-3 py-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,.06)", background: "rgba(9,9,11,.5)" }}>
        <SidebarBtn icon={Download} text="Export" onClick={onExport} flex />
        <SidebarBtn icon={Dices} onClick={onRandomize} title="Smart Randomizer" />
        <SidebarBtn icon={RotateCcw} onClick={onReset} title="Reset Settings" />
      </div>
    </div>
  );
}
