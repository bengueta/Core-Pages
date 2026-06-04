"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Copy, FileText, FolderOpen, Home, LayoutTemplate, PenLine, Save, Sparkles, Trash2 } from "lucide-react";

import { getTokens, glass } from "../shared";
import { InvoiceDocument } from "./InvoiceDocument";
import { BLOCK_META, DOC_TYPE_LABEL, type InvoiceDoc } from "./engine";
import type { LiveAsset } from "./storage";
import type { PresetStore } from "./presets";
import { STARTERS, previewDoc, type Starter } from "./starters";

type SavedDoc = { id: string; name: string; savedAt: string; doc: InvoiceDoc };

const BASE_W = 620;

/** Live, scaled-down preview of a real document (no images needed). */
function DocThumb({ doc, assets, height = 188 }: { doc: InvoiceDoc; assets: LiveAsset[]; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.34);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / BASE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", height, overflow: "hidden", background: "#fff", borderRadius: 10, pointerEvents: "none" }}>
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
  onPickStarter,
  onContinue,
  onOpenSaved,
  onDeleteSaved,
  onDuplicateSaved,
}: {
  isDark: boolean;
  library: SavedDoc[];
  presets: PresetStore;
  assets: LiveAsset[];
  onPickStarter: (s: Starter) => void;
  onContinue: () => void;
  onOpenSaved: (entry: SavedDoc) => void;
  onDeleteSaved: (id: string) => void;
  onDuplicateSaved: (entry: SavedDoc) => void;
}) {
  const tokens = getTokens(isDark);
  const [tab, setTab] = useState<"templates" | "saves">("templates");

  const logos = assets.filter((a) => a.kind === "logo");
  const signatures = assets.filter((a) => a.kind === "signature");
  const presetEntries = (Object.keys(presets) as Array<keyof PresetStore>).flatMap((t) =>
    (presets[t] ?? []).map((p) => ({ type: t as string, ...p }))
  );

  const tabBtn = (id: "templates" | "saves", label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 12px", borderRadius: tokens.r13, border: "none", background: tab === id ? "rgba(255,255,255,0.14)" : "transparent", color: tab === id ? tokens.label1 : tokens.label2, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}
    >
      {icon} {label}
    </button>
  );

  const sectionTitle = (label: string, icon: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "26px 4px 12px" }}>
      {icon}
      <h3 style={{ fontSize: 14, fontWeight: 800, color: tokens.label1, letterSpacing: "0.02em" }}>{label}</h3>
    </div>
  );

  return (
    <div dir="rtl" id="tools-invoice" style={{ minHeight: "100vh", color: tokens.label1 }}>
      <style>{`
        #tools-invoice{font-family: var(--font-heebo), -apple-system, system-ui, sans-serif; -webkit-font-smoothing:antialiased;}
        #tools-invoice #hbg{position:fixed;inset:0;z-index:0;background:
          radial-gradient(ellipse 120% 75% at 90% 0%, rgba(138,99,39,.18) 0%, transparent 52%),
          radial-gradient(ellipse 75% 65% at 0% 95%, rgba(10,132,255,.12) 0%, transparent 52%),
          linear-gradient(158deg, ${isDark ? "#0c1018 0%, #07090f 100%" : "#f4f4f6 0%, #ececef 100%"});}
        .home-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        @media(min-width:760px){.home-grid{grid-template-columns:repeat(3,1fr)}}
      `}</style>
      <div id="hbg" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 16px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass("ultra"), borderRadius: 999, padding: "8px 14px 8px 16px" }}>
            <FileText size={22} style={{ color: tokens.label2 }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", color: tokens.label2 }}>Document Builder</span>
          </div>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass("ultra"), borderRadius: 999, padding: "8px 14px 8px 16px", textDecoration: "none", color: tokens.label2 }}>
            <Home size={22} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>חזרה לדף הבית</span>
          </Link>
        </div>

        <h1 style={{ fontSize: "clamp(30px,5vw,46px)", fontWeight: 800, letterSpacing: "-0.036em", lineHeight: 1.05, marginBottom: 18 }}>בחרו מסמך להתחלה</h1>

        <div style={{ display: "flex", gap: 4, ...glass("thin"), borderRadius: tokens.r16, padding: 4, marginBottom: 22, maxWidth: 420 }}>
          {tabBtn("templates", "תבניות", <LayoutTemplate size={17} />)}
          {tabBtn("saves", "שמירות", <Save size={17} />)}
        </div>

        {tab === "templates" ? (
          <>
            {library.length || true ? (
              <button type="button" onClick={onContinue} style={{ width: "100%", maxWidth: 420, display: "flex", alignItems: "center", gap: 10, ...glass("secondary"), border: `1px solid ${tokens.blue}55`, borderRadius: tokens.r16, padding: "13px 16px", color: tokens.label1, fontSize: 14.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", marginBottom: 20 }}>
                <Sparkles size={18} style={{ color: tokens.blue }} /> המשך עריכת המסמך הנוכחי
              </button>
            ) : null}
            <div className="home-grid">
              {STARTERS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onPickStarter(s)}
                  style={{ textAlign: "start", ...glass("secondary"), border: `1px solid rgba(255,255,255,0.12)`, borderRadius: tokens.r20, padding: 10, cursor: "pointer", fontFamily: "inherit", color: tokens.label1, display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <DocThumb doc={previewDoc(s)} assets={assets} />
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
              <div className="home-grid">
                {library.map((e) => (
                  <div key={e.id} style={{ ...glass("secondary"), border: `1px solid rgba(255,255,255,0.12)`, borderRadius: tokens.r20, padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    <button type="button" onClick={() => onOpenSaved(e)} style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "inherit" }}>
                      <DocThumb doc={e.doc} assets={assets} height={170} />
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 2px 2px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: tokens.label1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: tokens.label3 }}>{DOC_TYPE_LABEL[e.doc.docType]} · {new Date(e.savedAt).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}</div>
                      </div>
                      {[
                        { lbl: "פתח", col: tokens.blue, fn: () => onOpenSaved(e), ic: <FolderOpen size={15} /> },
                        { lbl: "שכפל", col: tokens.green, fn: () => onDuplicateSaved(e), ic: <Copy size={15} /> },
                        { lbl: "מחק", col: tokens.red, fn: () => onDeleteSaved(e.id), ic: <Trash2 size={15} /> },
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {presetEntries.map((p) => (
                  <div key={p.id} style={{ ...glass("thin"), borderRadius: tokens.r13, border: `1px solid ${tokens.sep}`, padding: "10px 12px" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: tokens.label1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
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
                  <img key={a.id} src={a.url} alt="" style={{ height: 56, maxWidth: 150, objectFit: "contain", background: "#fff", borderRadius: 10, padding: 6 }} />
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
                  <img key={a.id} src={a.url} alt="" style={{ height: 56, maxWidth: 150, objectFit: "contain", background: "#fff", borderRadius: 10, padding: 6 }} />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: tokens.label3, padding: "4px 4px 8px" }}>אין לוגואים שמורים.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
