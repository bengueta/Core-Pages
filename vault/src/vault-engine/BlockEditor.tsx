"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronUp, ChevronDown, Copy, Trash2 } from "lucide-react";
import {
  getBlockConfigByType,
  getFieldsByTab,
  BLOCK_TABS,
  BLOCK_TAB_LABELS,
  type BlockTab,
} from "./lib/blocks-config";
import type { PalettesState } from "./lib/paletteKeys";
import { labelForPaletteId } from "./lib/paletteKeys";

type VaultBlock = { type: string; props: Record<string, unknown> };

interface BlockEditorProps {
  block: VaultBlock;
  index: number;
  palettes?: PalettesState;
  paletteDisplayNames?: Record<string, string>;
  onUpdate: (index: number, block: VaultBlock) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
}

export default function BlockEditor({
  block,
  index,
  palettes = {},
  paletteDisplayNames = {},
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: BlockEditorProps) {
  const config = getBlockConfigByType(block.type);
  const [activeTab, setActiveTab] = useState<BlockTab>("content");

  const fieldsByTab = useMemo(() => getFieldsByTab(config?.fields ?? []), [config]);
  const visibleTabs = BLOCK_TABS.filter((tab) => fieldsByTab[tab].length > 0);
  const currentFields = fieldsByTab[activeTab];

  useEffect(() => {
    if (visibleTabs.length === 0) return;
    if (!visibleTabs.includes(activeTab) || currentFields.length === 0) {
      setActiveTab(visibleTabs[0]);
    }
  }, [block.type, activeTab, currentFields.length, visibleTabs]);

  if (!config) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
        <p className="text-red-400">בלוק לא מוכר: {block.type}</p>
      </div>
    );
  }

  const updateProp = (name: string, value: unknown) => {
    onUpdate(index, { ...block, props: { ...block.props, [name]: value } });
  };

  return (
    <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-900/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">בלוק {index + 1}: {config.label}</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => onMoveUp(index)} className="p-1.5 rounded hover:bg-neutral-800 transition-colors" title="העלה"><ChevronUp className="w-4 h-4 text-gray-400" /></button>
          <button onClick={() => onMoveDown(index)} className="p-1.5 rounded hover:bg-neutral-800 transition-colors" title="הורד"><ChevronDown className="w-4 h-4 text-gray-400" /></button>
          <button onClick={() => onDuplicate(index)} className="p-1.5 rounded hover:bg-neutral-800 transition-colors" title="שכפל"><Copy className="w-4 h-4 text-gray-400" /></button>
          <button onClick={() => onRemove(index)} className="p-1.5 rounded hover:bg-red-900/50 transition-colors" title="הסר"><Trash2 className="w-4 h-4 text-red-400" /></button>
        </div>
      </div>

      {visibleTabs.length > 1 && (
        <div className="flex gap-1 mb-4 p-1 rounded-lg bg-neutral-800/50" dir="rtl">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-orange-600 text-white" : "text-gray-400 hover:text-white hover:bg-neutral-700"
              }`}
            >
              {BLOCK_TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {currentFields.map((field) => {
          const raw = block.props[field.name] ?? config.defaultProps[field.name] ?? "";
          const value = String(raw);

          if (field.type === "textarea") {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">{field.label} {field.required && "*"}</label>
                <textarea value={value} onChange={(e) => updateProp(field.name, e.target.value)} rows={4}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden resize-none"
                  dir="rtl" required={field.required} />
              </div>
            );
          }

          if (field.type === "image") {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">{field.label} (קישור URL)</label>
                <input type="url" value={value} onChange={(e) => updateProp(field.name, e.target.value)}
                  placeholder="https://…/image.jpg"
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden" dir="ltr" />
              </div>
            );
          }

          if (field.type === "palette") {
            const paletteNames = Object.keys(palettes);
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <select value={value} onChange={(e) => updateProp(field.name, e.target.value)}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white focus:border-orange-500 focus:outline-hidden" dir="rtl">
                  <option value="">ללא (ברירת מחדל)</option>
                  {paletteNames.map((id) => <option key={id} value={id}>{labelForPaletteId(id, paletteDisplayNames)}</option>)}
                </select>
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">{field.label} {field.required && "*"}</label>
                <select value={value} onChange={(e) => updateProp(field.name, e.target.value)}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white focus:border-orange-500 focus:outline-hidden" dir="rtl" required={field.required}>
                  {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            );
          }

          return (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label} {field.required && "*"}</label>
              <input type="text" value={value} onChange={(e) => updateProp(field.name, e.target.value)}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden" dir="rtl" required={field.required} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
