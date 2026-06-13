"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight, Smartphone, Tablet, Monitor, ArrowLeft, Info, Plus, Settings, Palette, Send,
} from "lucide-react";
import { getBlockConfigIcon } from "./lib/lucideBlockIcons";
import BlockEditor from "./BlockEditor";
import PaletteEditor from "./PaletteEditor";
import { getBlockConfigByType, getBlocksByGroup } from "./lib/blocks-config";
import {
  DEFAULT_PALETTE_KEY, DEFAULT_PALETTE_LABEL, type PalettesState,
} from "./lib/paletteKeys";
import { DEFAULT_PALETTE } from "./lib/palette";
import { VAULT_PREVIEW_MESSAGE_TYPE, VAULT_PREVIEW_REQUEST_TYPE } from "./lib/constants";

type VaultBlock = { type: string; props: Record<string, unknown> };
type DevicePreset = "mobile" | "tablet" | "desktop";
type TabId = "info" | "blocks" | "edit" | "palettes";

const DEVICE_WIDTHS: Record<DevicePreset, string> = { mobile: "375px", tablet: "768px", desktop: "100%" };
const DRAFT_KEY = "vault-studio-draft-v1";
const FENCE = "```";

interface StudioAppProps {
  /** URL of the preview iframe page (BASE_URL-aware) */
  previewSrc: string;
  /** GitHub repo URL for publishing (PUBLIC_GITHUB_REPO_URL) */
  repoUrl?: string;
  /** Vault home (for the back link) */
  homeHref: string;
}

export default function StudioApp({ previewSrc, repoUrl = "", homeHref }: StudioAppProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [heroImage, setHeroImage] = useState<string>("");
  const [blocks, setBlocks] = useState<VaultBlock[]>([]);
  const [palettes, setPalettes] = useState<PalettesState>({ [DEFAULT_PALETTE_KEY]: DEFAULT_PALETTE });
  const [paletteDisplayNames, setPaletteDisplayNames] = useState<Record<string, string>>({ [DEFAULT_PALETTE_KEY]: DEFAULT_PALETTE_LABEL });
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [device, setDevice] = useState<DevicePreset>("desktop");
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");

  // restore local draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.title) setTitle(d.title);
        if (d.excerpt) setExcerpt(d.excerpt);
        if (d.heroImage) setHeroImage(d.heroImage);
        if (Array.isArray(d.blocks)) setBlocks(d.blocks);
        if (d.palettes) setPalettes(d.palettes);
        if (d.paletteDisplayNames) setPaletteDisplayNames(d.paletteDisplayNames);
      }
    } catch { /* ignore */ }
  }, []);

  // click-a-block-in-preview → edit it
  useEffect(() => {
    const handler = () => {
      const match = window.location.hash?.match(/^#block-(\d+)$/);
      if (match) { setSelectedBlockIndex(parseInt(match[1], 10)); setActiveTab("edit"); }
    };
    window.addEventListener("hashchange", handler);
    handler();
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const handleBackToBlocks = () => {
    setSelectedBlockIndex(null);
    setActiveTab("edit");
    window.history.replaceState(null, "", window.location.pathname);
  };

  const isExclusiveView = selectedBlockIndex !== null && selectedBlockIndex >= 0 && selectedBlockIndex < blocks.length;

  const sendPreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: VAULT_PREVIEW_MESSAGE_TYPE, payload: { blocks, palettes, paletteDisplayNames, title: title || "עמוד חדש" } },
      window.location.origin
    );
  }, [blocks, palettes, paletteDisplayNames, title]);

  const sendPreviewRef = useRef(sendPreview);
  useEffect(() => { sendPreviewRef.current = sendPreview; }, [sendPreview]);
  useEffect(() => {
    const t = window.setTimeout(() => sendPreviewRef.current(), 100);
    return () => clearTimeout(t);
  }, [blocks, palettes, paletteDisplayNames, title]);
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === VAULT_PREVIEW_REQUEST_TYPE) sendPreview();
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [sendPreview]);

  const handleAddBlock = (blockType: string) => {
    const config = getBlockConfigByType(blockType);
    if (!config) return;
    const newBlocks = [...blocks, { type: blockType, props: { ...config.defaultProps } }];
    setBlocks(newBlocks);
    const newIndex = newBlocks.length - 1;
    setSelectedBlockIndex(newIndex);
    setActiveTab("edit");
    window.history.replaceState(null, "", `${window.location.pathname}#block-${newIndex}`);
  };
  const handleUpdateBlock = (index: number, block: VaultBlock) => { const n = [...blocks]; n[index] = block; setBlocks(n); };
  const handleRemoveBlock = (index: number) => { if (confirm("האם למחוק את הבלוק?")) { setBlocks(blocks.filter((_, i) => i !== index)); if (selectedBlockIndex !== null) handleBackToBlocks(); } };
  const handleMoveBlockUp = (index: number) => { if (index === 0) return; const n = [...blocks]; [n[index - 1], n[index]] = [n[index], n[index - 1]]; setBlocks(n); };
  const handleMoveBlockDown = (index: number) => { if (index === blocks.length - 1) return; const n = [...blocks]; [n[index], n[index + 1]] = [n[index + 1], n[index]]; setBlocks(n); };
  const handleDuplicateBlock = (index: number) => { const n = [...blocks]; n.splice(index + 1, 0, { ...blocks[index], props: { ...blocks[index].props } }); setBlocks(n); setSelectedBlockIndex(index + 1); window.history.replaceState(null, "", `${window.location.pathname}#block-${index + 1}`); };

  const flash = (msg: string) => { setStatus(msg); window.setTimeout(() => setStatus(""), 2500); };

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, excerpt, heroImage, blocks, palettes, paletteDisplayNames }));
      flash("נשמר כטיוטה (מקומי)");
    } catch { flash("שמירת הטיוטה נכשלה"); }
  };

  const publish = () => {
    if (!repoUrl) { alert("פרסום לא מוגדר (חסר PUBLIC_GITHUB_REPO_URL)."); return; }
    if (!title.trim() || !excerpt.trim()) { alert("נא למלא כותרת ותקציר (טאב 'מידע בסיסי')."); setActiveTab("info"); return; }
    if (blocks.length === 0) { alert("הוסיפו לפחות בלוק אחד."); return; }
    const payload = { title: title.trim(), summary: excerpt.trim(), heroImage: heroImage || undefined, blocks, palettes };
    const json = JSON.stringify(payload, null, 2);
    const body = `עמוד שנבנה בסטודיו של ה-Vault. אל תמחקו את גוש ה-JSON — מערכת אוטומטית הופכת אותו לעמוד.\n\n${FENCE}json\n${json}\n${FENCE}\n`;
    const url = `${repoUrl.replace(/\/+$/, "")}/discussions/new?category=pages&title=${encodeURIComponent(title.trim())}&body=${encodeURIComponent(body)}`;
    if (url.length > 7000 && !confirm("העמוד גדול וייתכן שהקישור ייחתך. כדאי לקצר. לפרסם בכל זאת?")) return;
    saveDraft();
    window.open(url, "_blank", "noopener");
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "מידע בסיסי", icon: <Info className="w-4 h-4" /> },
    { id: "blocks", label: "הוספת בלוקים", icon: <Plus className="w-4 h-4" /> },
    { id: "edit", label: "עריכת בלוקים", icon: <Settings className="w-4 h-4" /> },
    { id: "palettes", label: "פלטות צבעים", icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-white" dir="rtl">
      <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 border-b border-neutral-800 bg-neutral-900/80">
        <a href={homeHref} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4" /> חזרה ל-Vault
        </a>
        <div className="flex items-center gap-2">
          {status && <span className="text-xs text-green-400">{status}</span>}
          <button onClick={saveDraft} className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors text-sm">
            שמור טיוטה
          </button>
          <button onClick={publish} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 transition-colors text-sm font-semibold">
            <Send className="w-4 h-4" /> פרסם דרך GitHub
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-[420px] shrink-0 flex flex-col border-l border-neutral-800 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            {isExclusiveView ? (
              <div className="flex-1 overflow-y-auto p-4">
                <button onClick={handleBackToBlocks} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4">
                  <ArrowLeft className="w-4 h-4" /> חזרה לכל הבלוקים
                </button>
                <BlockEditor block={blocks[selectedBlockIndex!]} index={selectedBlockIndex!} palettes={palettes} paletteDisplayNames={paletteDisplayNames}
                  onUpdate={handleUpdateBlock} onRemove={handleRemoveBlock} onMoveUp={handleMoveBlockUp} onMoveDown={handleMoveBlockDown} onDuplicate={handleDuplicateBlock} />
              </div>
            ) : (
              <>
                <div className="shrink-0 flex border-b border-neutral-800">
                  {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm transition-colors ${
                        activeTab === tab.id
                          ? "text-orange-400 border-b-2 border-orange-500 bg-neutral-900/50"
                          : "text-gray-500 hover:text-gray-300 hover:bg-neutral-800/50"
                      }`}>
                      {tab.icon}{tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {activeTab === "info" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">כותרת *</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                          className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:border-orange-500 focus:outline-hidden" dir="rtl" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">תקציר *</label>
                        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
                          className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:border-orange-500 focus:outline-hidden resize-none" dir="rtl" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">תמונת כרטיס (קישור URL)</label>
                        <input type="url" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://…/cover.jpg"
                          className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-white text-sm placeholder:text-gray-600 focus:border-orange-500 focus:outline-hidden" dir="ltr" />
                      </div>
                      <p className="text-xs text-gray-600 pt-2">המזהה (slug) ייווצר אוטומטית בעת הפרסום.</p>
                    </div>
                  )}

                  {activeTab === "blocks" && (
                    <div className="space-y-6">
                      {getBlocksByGroup().map(({ group, types }) => (
                        <div key={group}>
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-1 border-b border-neutral-700">{group}</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {types.map((type) => {
                              const config = getBlockConfigByType(type);
                              if (!config) return null;
                              const IconComponent = getBlockConfigIcon(config.icon);
                              return (
                                <button key={type} type="button" onClick={() => handleAddBlock(type)}
                                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-orange-500/50 transition-all">
                                  <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-neutral-600 bg-neutral-800 text-orange-400">
                                    <IconComponent className="w-6 h-6" />
                                  </div>
                                  <span className="text-xs font-medium text-white text-center leading-tight">{config.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "edit" && (
                    <div className="space-y-3">
                      {blocks.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">אין בלוקים. עבור ללשונית &quot;הוספת בלוקים&quot;.</p>
                      ) : (
                        blocks.map((block, index) => (
                          <BlockEditor key={index} block={block} index={index} palettes={palettes} paletteDisplayNames={paletteDisplayNames}
                            onUpdate={handleUpdateBlock} onRemove={handleRemoveBlock} onMoveUp={handleMoveBlockUp} onMoveDown={handleMoveBlockDown} onDuplicate={handleDuplicateBlock} />
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "palettes" && (
                    <PaletteEditor palettes={palettes} paletteDisplayNames={paletteDisplayNames}
                      onChange={(next, display) => { setPalettes(next); setPaletteDisplayNames(display); }} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-neutral-900/30">
          <div className="shrink-0 flex items-center justify-center gap-2 py-2 border-b border-neutral-800">
            {(["mobile", "tablet", "desktop"] as DevicePreset[]).map((d) => {
              const Icon = d === "mobile" ? Smartphone : d === "tablet" ? Tablet : Monitor;
              const label = d === "mobile" ? "מובייל" : d === "tablet" ? "טאבלט" : "דסקטופ";
              return (
                <button key={d} onClick={() => setDevice(d)}
                  className={`p-2 rounded transition-colors ${device === d ? "bg-orange-600 text-white" : "text-gray-500 hover:text-white hover:bg-neutral-800"}`} title={label}>
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
          <div className="flex-1 flex items-start justify-center overflow-auto p-4 bg-neutral-950/50">
            <div className="bg-neutral-950 rounded-lg overflow-hidden shadow-2xl transition-all duration-200"
              style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", minHeight: "500px" }}>
              <iframe ref={iframeRef} src={previewSrc} title="תצוגה מקדימה" className="w-full h-full border-0 rounded-lg"
                style={{ minHeight: "600px", width: DEVICE_WIDTHS[device] === "100%" ? "100%" : DEVICE_WIDTHS[device] }} onLoad={sendPreview} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
