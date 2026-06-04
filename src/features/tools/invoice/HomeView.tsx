"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, FileText, FolderOpen, Home, LayoutTemplate, PenLine, Save, Sparkles, Trash2, X } from "lucide-react";

import { ActionButton, getTokens, glass } from "../shared";
import { InvoiceDocument } from "./InvoiceDocument";
import { BLOCK_META, DOC_TYPE_LABEL, type DocType, type InvoiceDoc } from "./engine";
import type { LiveAsset } from "./storage";
import type { PresetStore } from "./presets";
import { STARTERS, STRUCTURES, buildConfigured, previewDoc } from "./starters";

type SavedDoc = { id: string; name: string; savedAt: string; doc: InvoiceDoc };

const BASE_W = 620;
const ACCENT_PRESETS = ["#8a6327", "#1a1a22", "#0a84ff", "#2f8f4e", "#7c3aed", "#be123c", "#0e7490", "#e0457b"];

function DocThumb({ doc, assets, height = 188 }: { doc: InvoiceDoc; assets: LiveAsset[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / BASE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", width: "100%", height, overflow: "hidden", background: "#fff", borderRadius: 10, pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: BASE_W, transform: `scale(${scale})`, transformOrigin: "top right" }}>
        <InvoiceDocument doc={doc} assets={assets} />
      </div>
    </div>
  );
}

export function HomeView({
  isDark,
  library,
  presets,
  assets,
  onCreate,
  onContinue,
  onOpenSaved,
  onDeleteSaved,
  onDuplicateSaved,
}: {
  isDark: boolean;
  library: SavedDoc[];
  presets: PresetStore;
  assets: LiveAsset[];
  onCreate: (doc: InvoiceDoc) => void;
  onContinue: () => void;
  onOpenSaved: (entry: SavedDoc) => void;
  onDeleteSaved: (id: string) => void;
  onDuplicateSaved: (entry: SavedDoc) => void;
}) {
  const tokens = getTokens(isDark);
  const [tab, setTab] = useState<"templates" | "saves">("templates");
  const [cfg, setCfg] = useState<{ docType: DocType; structureId: string; accent: string } | null>(null);
  const [delId, setDelId] = useState<string | null>(null);

  const logos = assets.filter((a) => a.kind === "logo");
  const signatures = assets.filter((a) => a.kind === "signature");
  const presetEntries = (Object.keys(presets) as Array<keyof PresetStore>).flatMap((t) =>
    (presets[t] ?? []).map((p) => ({ type: t as string, ...p }))
  );

  const tabBtn = (id: "templates" | "saves", label: string, icon: React.ReactNode) => (
    <button type="button" onClick={() => setTab(id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 12px", borderRadius: tokens.r13, border: "none", background: tab === id ? "rgba(255,255,255,0.14)" : "transparent", color: tab === id ? tokens.label1 : tokens.label2, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
      {icon} {label}
    </button>
  );

  const sectionTitle = (label: string, icon: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "26px 4px 12px" }}>
      {icon}
      <h3 style={{ fontSize: 14, fontWeight: 800, color: tokens.label1 }}>{label}</h3>
    </div>
  );

  return (
    <div dir="rtl" id="tools-invoice" style={{ minHeight: "100vh", color: tokens.label1, overflowX: "hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        html,body{overflow-x:hidden;max-width:100%}
        #tools-invoice{font-family: var(--font-heebo), -apple-system, system-ui, sans-serif; -webkit-font-smoothing:antialiased;max-width:100vw;overflow-x:hidden;}
        #tools-invoice #hbg{position:fixed;inset:0;z-index:0;background:
          radial-gradient(ellipse 120% 75% at 90% 0%, rgba(138,99,39,.18) 0%, transparent 52%),
          radial-gradient(ellipse 75% 65% at 0% 95%, rgba(10,132,255,.12) 0%, transparent 52%),
          linear-gradient(158deg, ${isDark ? "#0c1018 0%, #07090f 100%" : "#f4f4f6 0%, #ececef 100%"});}
        .tpl-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .tpl-grid>*{min-width:0;box-sizing:border-box}
        @media(min-width:760px){.tpl-grid{grid-template-columns:repeat(3,1fr)}}
        .saves-grid{display:grid;grid-template-columns:1fr;gap:14px}
        .saves-grid>*{min-width:0;box-sizing:border-box}
        @media(min-width:620px){.saves-grid{grid-template-columns:1fr 1fr}}
        #tools-invoice *{box-sizing:border-box}
      `}</style>
      <div id="hbg" />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1100, margin: "0 auto", padding: "28px 16px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setTab("templates")} style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass("ultra"), borderRadius: 999, padding: "8px 14px 8px 16px", border: "none", cursor: "pointer", fontFamily: "inherit", color: tokens.label2 }}>
            <FileText size={20} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em" }}>Document Builder</span>
          </button>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass("ultra"), borderRadius: 999, padding: "8px 14px 8px 16px", textDecoration: "none", color: tokens.label2 }}>
            <Home size={20} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>חזרה לדף הבית</span>
          </Link>
        </div>

        <h1 style={{ fontSize: "clamp(26px,6vw,42px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 16 }}>בחרו מסמך להתחלה</h1>

        <div style={{ display: "flex", gap: 4, ...glass("thin"), borderRadius: tokens.r16, padding: 4, marginBottom: 20, maxWidth: 360 }}>
          {tabBtn("templates", "תבניות", <LayoutTemplate size={17} />)}
          {tabBtn("saves", "שמירות", <Save size={17} />)}
        </div>

        {tab === "templates" ? (
          <>
            <button type="button" onClick={onContinue} style={{ width: "100%", maxWidth: 360, display: "flex", alignItems: "center", gap: 10, ...glass("secondary"), border: `1px solid ${tokens.blue}55`, borderRadius: tokens.r16, padding: "13px 16px", color: tokens.label1, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", marginBottom: 18 }}>
              <Sparkles size={18} style={{ color: tokens.blue }} /> המשך עריכת המסמך הנוכחי
            </button>
            <div className="tpl-grid">
              {STARTERS.map((s) => (
                <button key={s.id} type="button" onClick={() => setCfg({ docType: s.docType, structureId: "classic", accent: s.accentColor })} style={{ textAlign: "start", ...glass("secondary"), border: `1px solid rgba(255,255,255,0.12)`, borderRadius: tokens.r20, padding: 10, cursor: "pointer", fontFamily: "inherit", color: tokens.label1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <DocThumb doc={previewDoc(s.docType, "classic", s.accentColor)} assets={assets} />
                  <div style={{ padding: "0 4px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 11, height: 11, borderRadius: "50%", background: s.accentColor, flexShrink: 0 }} />
                      <span style={{ fontSize: 15, fontWeight: 800 }}>{s.name}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: tokens.label3, marginTop: 4, lineHeight: 1.5 }}>{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {sectionTitle("מסמכים שמורים", <FolderOpen size={16} style={{ color: tokens.blue }} />)}
            {library.length ? (
              <div className="saves-grid">
                {library.map((e) => (
                  <div key={e.id} style={{ ...glass("secondary"), border: `1px solid rgba(255,255,255,0.12)`, borderRadius: tokens.r20, padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    <button type="button" onClick={() => onOpenSaved(e)} style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                      <DocThumb doc={e.doc} assets={assets} height={172} />
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 2px 2px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: tokens.label3 }}>{DOC_TYPE_LABEL[e.doc.docType]} · {new Date(e.savedAt).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}</div>
                      </div>
                      {[
                        { lbl: "פתח", col: tokens.blue, fn: () => onOpenSaved(e), ic: <FolderOpen size={15} /> },
                        { lbl: "שכפל", col: tokens.green, fn: () => onDuplicateSaved(e), ic: <Copy size={15} /> },
                        { lbl: "מחק", col: tokens.red, fn: () => setDelId(e.id), ic: <Trash2 size={15} /> },
                      ].map((b) => (
                        <button key={b.lbl} type="button" onClick={b.fn} aria-label={b.lbl} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: `${b.col}1f`, color: b.col, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {b.ic}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: tokens.label3, padding: "4px 4px 8px" }}>אין מסמכים שמורים עדיין — שמרו מסמך מתוך הבילדר.</p>
            )}

            {sectionTitle("פריסטים של בלוקים", <LayoutTemplate size={16} style={{ color: tokens.purple }} />)}
            {presetEntries.length ? (
              <div className="saves-grid">
                {presetEntries.map((p) => (
                  <div key={p.id} style={{ ...glass("thin"), borderRadius: tokens.r13, border: `1px solid ${tokens.sep}`, padding: "10px 12px" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: tokens.label3 }}>{BLOCK_META[p.type as keyof typeof BLOCK_META]?.label ?? p.type}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: tokens.label3, padding: "4px 4px 8px" }}>אין פריסטים שמורים.</p>
            )}

            {sectionTitle("חתימות", <PenLine size={16} style={{ color: tokens.green }} />)}
            {signatures.length ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {signatures.map((a) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={a.id} src={a.url} alt="" style={{ height: 52, maxWidth: 140, objectFit: "contain", background: "#fff", borderRadius: 10, padding: 6 }} />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: tokens.label3, padding: "4px 4px 8px" }}>אין חתימות שמורות.</p>
            )}

            {sectionTitle("לוגואים", <Sparkles size={16} style={{ color: tokens.orange }} />)}
            {logos.length ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {logos.map((a) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={a.id} src={a.url} alt="" style={{ height: 52, maxWidth: 140, objectFit: "contain", background: "#fff", borderRadius: 10, padding: 6 }} />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: tokens.label3, padding: "4px 4px 8px" }}>אין לוגואים שמורים.</p>
            )}
          </>
        )}
      </div>

      {/* Template config */}
      {cfg ? (
        <div onMouseDown={() => setCfg(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
          <div dir="rtl" onMouseDown={(e) => e.stopPropagation()} style={{ width: "min(440px,100%)", background: isDark ? "rgba(20,20,26,0.98)" : "rgba(250,250,252,0.99)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: tokens.r28, padding: 18, color: tokens.label1, boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>הגדרת המסמך</h3>
              <button type="button" onClick={() => setCfg(null)} aria-label="סגור" style={{ width: 32, height: 32, borderRadius: 999, border: "none", background: tokens.fill3, color: tokens.label1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={17} /></button>
            </div>

            <DocThumb doc={previewDoc(cfg.docType, cfg.structureId, cfg.accent)} assets={assets} height={210} />

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: tokens.label3, margin: "14px 2px 7px" }}>סוג מסמך</label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["quote", "invoice", "contract"] as DocType[]).map((t) => (
                <button key={t} type="button" onClick={() => setCfg((c) => (c ? { ...c, docType: t } : c))} style={{ flex: 1, padding: "9px 6px", borderRadius: tokens.r10, border: `1px solid ${cfg.docType === t ? tokens.blue : tokens.sep}`, background: cfg.docType === t ? `${tokens.blue}22` : tokens.fill4, color: tokens.label1, fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                  {DOC_TYPE_LABEL[t]}
                </button>
              ))}
            </div>

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: tokens.label3, margin: "12px 2px 7px" }}>מבנה</label>
            <div style={{ display: "flex", gap: 6 }}>
              {STRUCTURES.map((st) => (
                <button key={st.id} type="button" onClick={() => setCfg((c) => (c ? { ...c, structureId: st.id } : c))} style={{ flex: 1, padding: "9px 6px", borderRadius: tokens.r10, border: `1px solid ${cfg.structureId === st.id ? tokens.blue : tokens.sep}`, background: cfg.structureId === st.id ? `${tokens.blue}22` : tokens.fill4, color: tokens.label1, fontSize: 12.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
                  {st.name}
                </button>
              ))}
            </div>

            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: tokens.label3, margin: "12px 2px 7px" }}>צבע מותג</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <input type="color" value={cfg.accent} onChange={(e) => setCfg((c) => (c ? { ...c, accent: e.target.value } : c))} aria-label="צבע" style={{ width: 36, height: 36, border: "none", borderRadius: tokens.r10, background: "transparent", cursor: "pointer", padding: 0 }} />
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {ACCENT_PRESETS.map((c) => (
                  <button key={c} type="button" onClick={() => setCfg((s) => (s ? { ...s, accent: c } : s))} aria-label={c} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: cfg.accent.toLowerCase() === c ? `2px solid ${tokens.label1}` : `1px solid ${tokens.sep}`, cursor: "pointer" }} />
                ))}
              </div>
            </div>

            <ActionButton tokens={tokens} color={tokens.green} onPress={() => { onCreate(buildConfigured(cfg.docType, cfg.structureId, cfg.accent)); setCfg(null); }} icon={<Sparkles size={16} />} full>צור מסמך</ActionButton>
          </div>
        </div>
      ) : null}

      {/* Delete confirm */}
      {delId ? (
        <div onMouseDown={() => setDelId(null)} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div dir="rtl" onMouseDown={(e) => e.stopPropagation()} style={{ width: "min(380px,100%)", background: "rgba(20,20,26,0.98)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: tokens.r28, padding: 22, color: tokens.label1, boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>למחוק את המסמך השמור?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <ActionButton tokens={tokens} color={tokens.red} onPress={() => { onDeleteSaved(delId); setDelId(null); }} icon={<Trash2 size={16} />} full>אישור מחיקה</ActionButton>
              <ActionButton tokens={tokens} color={tokens.label2} onPress={() => setDelId(null)} full>ביטול</ActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
