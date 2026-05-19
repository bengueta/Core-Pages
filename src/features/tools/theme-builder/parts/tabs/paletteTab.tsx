"use client";

import { useEffect } from "react";
import { Paintbrush } from "lucide-react";

import type { ThemeBuilderState } from "../../types";
import { SEMANTIC_COLORS } from "../../config";
import { ColorRow, Section } from "../panelControls";

export function PaletteTab({
  state,
  setColor,
  onCopyValue,
  openSections,
  toggleSection,
  paletteHighlightKey,
  onPaletteHighlightConsumed,
}: {
  state: ThemeBuilderState;
  setColor: (key: string, value: string) => void;
  onCopyValue: (value: string, label: string) => void;
  openSections: Record<string, boolean | undefined>;
  toggleSection: (id: string) => void;
  paletteHighlightKey?: string | null;
  onPaletteHighlightConsumed?: () => void;
}) {
  useEffect(() => {
    if (!paletteHighlightKey) return;
    const safe = typeof CSS !== "undefined" && "escape" in CSS ? CSS.escape(paletteHighlightKey) : paletteHighlightKey.replace(/"/g, "");
    const row = document.querySelector(`#theme-builder [data-palette-key="${safe}"]`);
    row?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [paletteHighlightKey]);

  useEffect(() => {
    if (!paletteHighlightKey || !onPaletteHighlightConsumed) return;
    const t = window.setTimeout(() => onPaletteHighlightConsumed(), 3200);
    return () => window.clearTimeout(t);
  }, [paletteHighlightKey, onPaletteHighlightConsumed]);

  return (
    <div>
      <Section id="semantic" title="Semantic Colors" icon={Paintbrush} openSections={openSections} toggleSection={toggleSection}>
        {SEMANTIC_COLORS.map((c) => (
          <ColorRow
            key={c.key}
            colorKey={c.key}
            highlighted={paletteHighlightKey === c.key}
            label={c.label}
            value={state.colors[c.key]}
            onChange={(val) => setColor(c.key, val)}
            onCopyValue={onCopyValue}
          />
        ))}
      </Section>
    </div>
  );
}