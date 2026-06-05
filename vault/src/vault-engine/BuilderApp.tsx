"use client";

import { useState } from "react";
import { Plus, Send, Eye, X } from "lucide-react";
import BlockEditor from "./BlockEditor";
import PaletteEditor from "./PaletteEditor";
import BlockRenderer from "./BlockRenderer";
import { getBlocksByGroup, getBlockConfigByType } from "./lib/blocks-config";
import {
  DEFAULT_PALETTE_KEY,
  DEFAULT_PALETTE_LABEL,
  type PalettesState,
} from "./lib/paletteKeys";
import { DEFAULT_PALETTE } from "./lib/palette";

type VaultBlock = { type: string; props: Record<string, unknown> };

const FENCE = "```";

export default function BuilderApp({ repoUrl = "" }: { repoUrl?: string }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [blocks, setBlocks] = useState<VaultBlock[]>([]);
  const [palettes, setPalettes] = useState<PalettesState>({ [DEFAULT_PALETTE_KEY]: DEFAULT_PALETTE });
  const [paletteDisplayNames, setPaletteDisplayNames] = useState<Record<string, string>>({ [DEFAULT_PALETTE_KEY]: DEFAULT_PALETTE_LABEL });
  const [showPicker, setShowPicker] = useState(false);
  const [showPalettes, setShowPalettes] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);

  const groups = getBlocksByGroup();

  const addBlock = (type: string) => {
    const cfg = getBlockConfigByType(type);
    setBlocks((b) => [...b, { type, props: { ...(cfg?.defaultProps ?? {}) } }]);
    setShowPicker(false);
  };
  const updateBlock = (i: number, b: VaultBlock) => setBlocks((arr) => arr.map((x, idx) => (idx === i ? b : x)));
  const removeBlock = (i: number) => setBlocks((arr) => arr.filter((_, idx) => idx !== i));
  const moveUp = (i: number) => setBlocks((arr) => { if (i <= 0) return arr; const n = [...arr]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n; });
  const moveDown = (i: number) => setBlocks((arr) => { if (i >= arr.length - 1) return arr; const n = [...arr]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; return n; });
  const duplicate = (i: number) => setBlocks((arr) => { const n = [...arr]; n.splice(i + 1, 0, { type: arr[i].type, props: { ...arr[i].props } }); return n; });

  const publish = () => {
    if (!repoUrl) { alert("פרסום לא מוגדר (חסר PUBLIC_GITHUB_REPO_URL)."); return; }
    if (!title.trim()) { alert("הוסיפו כותרת לעמוד."); return; }
    if (blocks.length === 0) { alert("הוסיפו לפחות בלוק אחד."); return; }
    const payload = { title: title.trim(), summary: summary.trim() || undefined, blocks, palettes };
    const json = JSON.stringify(payload, null, 2);
    const body = `עמוד שנבנה בבילדר הציבורי של ה-Vault. אל תמחקו את גוש ה-JSON — מערכת אוטומטית הופכת אותו לעמוד.\n\n${FENCE}json\n${json}\n${FENCE}\n`;
    const base = repoUrl.replace(/\/+$/, "");
    const url = `${base}/discussions/new?category=pages&title=${encodeURIComponent(title.trim())}&body=${encodeURIComponent(body)}`;
    if (url.length > 7000) {
      if (!confirm("העמוד גדול וייתכן שהקישור ייחתך. כדאי לקצר טקסטים/להפחית בלוקים. לפרסם בכל זאת?")) return;
    }
    window.open(url, "_blank", "noopener");
  };

  return (
    <div dir="rtl" className="vault-builder">
      {/* top bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-neutral-700">
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת העמוד *"
          className="flex-1 min-w-[12rem] rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white text-lg font-semibold placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden"
        />
        <button onClick={() => setShowPreviewMobile((v) => !v)} className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-600 text-gray-200 text-sm">
          <Eye className="w-4 h-4" /> תצוגה
        </button>
        <button onClick={publish} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors">
          <Send className="w-4 h-4" /> פרסם דרך GitHub
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* editor column */}
        <div className="space-y-5">
          <input
            type="text" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="תיאור קצר (אופציונלי)"
            className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white placeholder:text-gray-500 focus:border-orange-500 focus:outline-hidden"
          />

          <div className="rounded-lg border border-neutral-700 bg-neutral-900/40 p-4">
            <button onClick={() => setShowPalettes((v) => !v)} className="text-sm font-semibold text-orange-400">
              {showPalettes ? "▾" : "▸"} פלטות צבעים ({Object.keys(palettes).length})
            </button>
            {showPalettes && (
              <div className="mt-4">
                <PaletteEditor palettes={palettes} paletteDisplayNames={paletteDisplayNames}
                  onChange={(p, n) => { setPalettes(p); setPaletteDisplayNames(n); }} />
              </div>
            )}
          </div>

          {blocks.map((block, i) => (
            <BlockEditor key={i} block={block} index={i} palettes={palettes} paletteDisplayNames={paletteDisplayNames}
              onUpdate={updateBlock} onRemove={removeBlock} onMoveUp={moveUp} onMoveDown={moveDown} onDuplicate={duplicate} />
          ))}

          {/* add block */}
          <div className="relative">
            <button onClick={() => setShowPicker((v) => !v)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-neutral-600 text-gray-300 hover:border-orange-500/60 hover:text-white transition-colors">
              <Plus className="w-5 h-5" /> הוסף בלוק
            </button>
            {showPicker && (
              <div className="mt-2 rounded-lg border border-neutral-700 bg-neutral-900 p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">בחרו בלוק</span>
                  <button onClick={() => setShowPicker(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                {groups.map((g) => (
                  <div key={g.group}>
                    <p className="text-xs text-gray-500 mb-2">{g.group}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {g.types.map((t) => (
                        <button key={t} onClick={() => addBlock(t)} className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-orange-600 text-sm text-gray-200 hover:text-white transition-colors text-right">
                          {getBlockConfigByType(t)?.label ?? t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* preview column */}
        <div className={`${showPreviewMobile ? "block" : "hidden"} lg:block lg:sticky lg:top-6`}>
          <div className="rounded-xl border border-neutral-700 bg-neutral-950 overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-800 text-xs text-gray-500 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" /> תצוגה מקדימה חיה
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              {blocks.length === 0
                ? <p className="text-gray-600 text-center py-16 text-sm">הוסיפו בלוקים כדי לראות תצוגה</p>
                : <BlockRenderer blocks={blocks} palettes={palettes} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
