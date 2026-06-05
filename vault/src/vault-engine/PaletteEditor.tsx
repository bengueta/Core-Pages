"use client";

import { useState } from "react";
import { Palette as PaletteIcon, Plus, Trash2 } from "lucide-react";
import {
  PALETTE_ROLES,
  COLOR_HEX,
  COLOR_OPTIONS,
  type Palette,
  type PaletteRole,
  type ColorKey,
} from "./lib/palette";
import {
  newCustomPaletteId,
  labelForPaletteId,
  DEFAULT_PALETTE_KEY,
  type PalettesState,
} from "./lib/paletteKeys";

function getColorHex(key: ColorKey): string {
  return COLOR_HEX[key] ?? COLOR_HEX.default;
}

interface PaletteEditorProps {
  palettes: PalettesState;
  paletteDisplayNames: Record<string, string>;
  onChange: (palettes: PalettesState, displayNames: Record<string, string>) => void;
}

export default function PaletteEditor({ palettes, paletteDisplayNames, onChange }: PaletteEditorProps) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const paletteNames = Object.keys(palettes);
  const pushChange = (next: PalettesState, names: Record<string, string>) => onChange(next, names);
  const updatePalette = (id: string, palette: Palette) => pushChange({ ...palettes, [id]: palette }, paletteDisplayNames);
  const setDisplay = (id: string, display: string) => pushChange(palettes, { ...paletteDisplayNames, [id]: display });

  const handleAddPalette = () => {
    const label = newPaletteName.trim();
    if (!label) return;
    const id = newCustomPaletteId();
    pushChange({ ...palettes, [id]: { accent: "default" } }, { ...paletteDisplayNames, [id]: label });
    setShowAddForm(false);
    setNewPaletteName("");
    setEditingName(id);
  };

  const handleDeletePalette = (id: string) => {
    const shown = labelForPaletteId(id, paletteDisplayNames);
    if (id === DEFAULT_PALETTE_KEY) { alert("לא ניתן למחוק את פלטת ברירת המחדל."); return; }
    if (!confirm(`למחוק את הפלטה "${shown}"?`)) return;
    const next = { ...palettes }; delete next[id];
    const nextNames = { ...paletteDisplayNames }; delete nextNames[id];
    pushChange(next, nextNames);
    if (editingName === id) setEditingName(null);
  };

  const setColorInPalette = (paletteId: string, role: PaletteRole, color: ColorKey) => {
    const p = palettes[paletteId] ?? {};
    updatePalette(paletteId, { ...p, [role]: color });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <PaletteIcon className="w-4 h-4 text-orange-400" />
          פלטות צבעים
        </h3>
        {!showAddForm ? (
          <button type="button" onClick={() => setShowAddForm(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/80 hover:bg-orange-600 text-white text-sm transition-colors">
            <Plus className="w-4 h-4" /> הוסף פלטה
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input type="text" value={newPaletteName} onChange={(e) => setNewPaletteName(e.target.value)} placeholder="שם הפלטה"
              className="rounded border border-neutral-600 bg-neutral-800 px-2 py-1.5 text-sm text-white placeholder:text-gray-500 w-32 focus:border-orange-500 focus:outline-hidden"
              dir="rtl" onKeyDown={(e) => e.key === "Enter" && handleAddPalette()} />
            <button type="button" onClick={handleAddPalette} className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm">שמור</button>
            <button type="button" onClick={() => { setShowAddForm(false); setNewPaletteName(""); }} className="px-2 py-1.5 rounded text-gray-400 hover:text-white text-sm">ביטול</button>
          </div>
        )}
      </div>

      {paletteNames.length === 0 && !showAddForm && (
        <p className="text-gray-500 text-sm">אין פלטות. לחץ &quot;הוסף פלטה&quot; כדי להתחיל.</p>
      )}

      <div className="space-y-4">
        {paletteNames.map((id) => {
          const title = labelForPaletteId(id, paletteDisplayNames);
          return (
            <div key={id} className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4">
              <div className="flex items-center justify-between mb-3 gap-2">
                {editingName === id ? (
                  <input type="text" value={paletteDisplayNames[id] ?? title} onChange={(e) => setDisplay(id, e.target.value)}
                    className="flex-1 rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-sm text-white" dir="rtl" aria-label="שם פלטה" />
                ) : (
                  <span className="font-medium text-white">{title}</span>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={() => setEditingName(editingName === id ? null : id)} className="text-xs text-orange-400 hover:text-orange-300">
                    {editingName === id ? "סגור" : "ערוך"}
                  </button>
                  {id !== DEFAULT_PALETTE_KEY && (
                    <button type="button" onClick={() => handleDeletePalette(id)} className="p-1 rounded text-red-400 hover:bg-red-900/30 transition-colors" title="מחק">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {editingName === id && (
                <div className="space-y-3 pt-2 border-t border-neutral-700">
                  {PALETTE_ROLES.map(({ role, label }) => (
                    <div key={role} className="flex items-center justify-between gap-4">
                      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
                      <div className="flex gap-2 flex-wrap">
                        {COLOR_OPTIONS.map((opt) => {
                          const isSelected = (palettes[id]?.[role] ?? "default") === opt.value;
                          return (
                            <button key={opt.value} type="button" onClick={() => setColorInPalette(id, role, opt.value)}
                              className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${isSelected ? "ring-2 ring-white scale-110" : ""}`}
                              style={{ backgroundColor: getColorHex(opt.value) }} title={opt.label} />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
