"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Copy, Download, FilePlus2, FileText, FolderOpen, Home, Images, Layers, Printer, RotateCcw, Save, Trash2, Upload, X } from "lucide-react";
import { useTheme } from "next-themes";

import { ActionButton, Section, SegmentedControl, getTokens, glass } from "../shared";
import { AssetManager } from "./AssetManager";
import { BlockBuilder } from "./BlockBuilder";
import { BlockEditor } from "./BlockEditor";
import { InvoiceDocument } from "./InvoiceDocument";
import {
  BLOCK_META,
  TEMPLATES,
  applyTemplate,
  calcTotals,
  defaultBlocks,
  defaultDoc,
  formatMoney,
  newItemId,
  nextDocNumber,
  type AssetKind,
  type Block,
  type BlockType,
  type DocType,
  type InvoiceDoc,
  type LineItem,
} from "./engine";
import {
  buildBackup,
  compressImageFile,
  dataUrlToBlob,
  idbDeleteAsset,
  idbGetAllAssets,
  idbPutAsset,
  migrateLegacyAssets,
  restoreAssets,
  toLive,
  type BackupFile,
  type LiveAsset,
  type StoredAsset,
} from "./storage";

const STORAGE_KEY = "tool_invoice_doc";
const LIBRARY_KEY = "tool_invoice_library";
const MAX_SAVES = 30;

const DOC_TITLES: Record<DocType, string> = { quote: "הצעת מחיר", invoice: "חשבונית עסקה" };
const ACCENT_PRESETS = ["#8a6327", "#1a1a22", "#0a84ff", "#2f8f4e", "#7c3aed", "#be123c"];

type SavedDoc = { id: string; name: string; savedAt: string; doc: InvoiceDoc };

function freshDoc(docType: DocType = "quote"): InvoiceDoc {
  return {
    ...defaultDoc,
    docType,
    issueDate: new Date().toISOString().slice(0, 10),
    items: [{ id: newItemId(), desc: "שירות / מוצר", qty: 1, price: 1000 }],
    blocks: defaultBlocks(docType),
  };
}

/** Tolerate older saved docs that predate the block/asset model. */
function migrate(parsed: Partial<InvoiceDoc> & { bizLogo?: string | null }): { doc: InvoiceDoc; logoDataUrl: string | null } {
  const doc: InvoiceDoc = { ...defaultDoc, ...parsed } as InvoiceDoc;
  if (!Array.isArray(doc.blocks) || !doc.blocks.length) doc.blocks = defaultBlocks(doc.docType);
  if (!Array.isArray(doc.items) || !doc.items.length) doc.items = defaultDoc.items;
  let logoDataUrl: string | null = null;
  if (parsed.bizLogo && !doc.logoAssetId) {
    logoDataUrl = parsed.bizLogo;
    doc.logoAssetId = newItemId();
  }
  return { doc, logoDataUrl };
}

export function InvoiceShell() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark" || !mounted;
  const tokens = getTokens(isDark);

  const [doc, setDoc] = useState<InvoiceDoc>(defaultDoc);
  const [assets, setAssets] = useState<LiveAsset[]>([]);
  const [library, setLibrary] = useState<SavedDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assetModal, setAssetModal] = useState<{ open: boolean; kind: AssetKind }>({ open: false, kind: "logo" });
  const backupInputRef = useRef<HTMLInputElement>(null);
  const assetsRef = useRef<LiveAsset[]>([]);
  assetsRef.current = assets;

  useEffect(() => setMounted(true), []);

  // Async load: doc + library from localStorage, assets from IndexedDB (with one-time migration).
  useEffect(() => {
    if (!mounted) return;
    let alive = true;
    (async () => {
      let logoDataUrl: string | null = null;
      let logoId: string | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { doc: migrated, logoDataUrl: logo } = migrate(JSON.parse(raw));
          if (alive) setDoc(migrated);
          logoDataUrl = logo;
          logoId = logo ? migrated.logoAssetId : null;
        }
        const rawLib = localStorage.getItem(LIBRARY_KEY);
        if (rawLib) {
          const arr = JSON.parse(rawLib) as SavedDoc[];
          if (alive && Array.isArray(arr)) setLibrary(arr);
        }
      } catch {
        /* ignore corrupt storage */
      }
      try {
        await migrateLegacyAssets();
        // Migrate an inline legacy logo (from the very first doc model) into IndexedDB.
        if (logoDataUrl && logoId) {
          const blob = await dataUrlToBlob(logoDataUrl);
          await idbPutAsset({ id: logoId, kind: "logo", name: "לוגו", blob, createdAt: new Date().toISOString() });
        }
        const stored = await idbGetAllAssets();
        if (alive) setAssets(stored.map(toLive));
      } catch {
        /* IndexedDB unavailable — assets simply stay empty */
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Revoke object URLs on unmount.
  useEffect(() => {
    return () => {
      for (const a of assetsRef.current) URL.revokeObjectURL(a.url);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {}
  }, [doc, mounted]);
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    } catch {}
  }, [library, mounted]);

  const totals = useMemo(() => calcTotals(doc), [doc]);

  /* doc + block helpers */
  const onDocChange = (patch: Partial<InvoiceDoc>) => setDoc((prev) => ({ ...prev, ...patch }));
  const updateBlock = (id: string, patch: Partial<Block>) =>
    setDoc((prev) => ({ ...prev, blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const reorderBlocks = (next: Block[]) => setDoc((prev) => ({ ...prev, blocks: next }));
  const toggleSpan = (id: string) => setDoc((prev) => ({ ...prev, blocks: prev.blocks.map((b) => (b.id === id ? { ...b, span: b.span === 2 ? 1 : 2 } : b)) }));
  const toggleHidden = (id: string) => setDoc((prev) => ({ ...prev, blocks: prev.blocks.map((b) => (b.id === id ? { ...b, hidden: !b.hidden } : b)) }));
  const deleteBlock = (id: string) => {
    setDoc((prev) => ({ ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }));
    setSelectedId((cur) => (cur === id ? null : cur));
  };
  const addBlock = (type: BlockType) => {
    const nb: Block = {
      id: newItemId(),
      type,
      span: BLOCK_META[type].defaultSpan,
      ...(type === "signature" ? { align: "right", signerName: "", signatureAssetId: null } : {}),
      ...(type === "text" ? { title: "", body: "" } : {}),
      ...(type === "spacer" ? { height: 24 } : {}),
    };
    setDoc((prev) => ({ ...prev, blocks: [...prev.blocks, nb] }));
    setSelectedId(nb.id);
  };

  /* items */
  const addItem = () => setDoc((prev) => ({ ...prev, items: [...prev.items, { id: newItemId(), desc: "", qty: 1, price: 0 }] }));
  const patchItem = (id: string, patch: Partial<LineItem>) => setDoc((prev) => ({ ...prev, items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  const removeItem = (id: string) => setDoc((prev) => ({ ...prev, items: prev.items.length > 1 ? prev.items.filter((it) => it.id !== id) : prev.items }));

  /* assets (IndexedDB blobs + object URLs) */
  const storeAsset = async (kind: AssetKind, name: string, blob: Blob) => {
    const stored: StoredAsset = { id: newItemId(), kind, name, blob, createdAt: new Date().toISOString() };
    await idbPutAsset(stored);
    setAssets((prev) => [toLive(stored), ...prev]);
  };
  const onAddImage = async (kind: AssetKind, file: File) => {
    const blob = await compressImageFile(file);
    const name = file.name.replace(/\.[^.]+$/, "").slice(0, 24) || (kind === "logo" ? "לוגו" : "חתימה");
    await storeAsset(kind, name, blob);
  };
  const onAddSignature = async (dataURL: string) => {
    const blob = await dataUrlToBlob(dataURL);
    await storeAsset("signature", `חתימה ${assets.filter((a) => a.kind === "signature").length + 1}`, blob);
  };
  const deleteAsset = async (id: string) => {
    const target = assetsRef.current.find((a) => a.id === id);
    if (target) URL.revokeObjectURL(target.url);
    await idbDeleteAsset(id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setDoc((prev) => ({
      ...prev,
      logoAssetId: prev.logoAssetId === id ? null : prev.logoAssetId,
      blocks: prev.blocks.map((b) => (b.signatureAssetId === id ? { ...b, signatureAssetId: null } : b)),
    }));
  };

  /* backup / restore (full local snapshot — never leaves the device) */
  const exportBackup = async () => {
    const backup = await buildBackup(doc, library);
    const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `core-invoice-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importBackup = async (file: File) => {
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as BackupFile;
      if (backup.kind !== "core-invoice-backup") {
        window.alert("קובץ גיבוי לא תקין");
        return;
      }
      for (const a of assetsRef.current) URL.revokeObjectURL(a.url);
      const live = await restoreAssets(backup);
      setAssets(live);
      if (backup.doc) setDoc({ ...defaultDoc, ...(backup.doc as InvoiceDoc) });
      if (Array.isArray(backup.library)) setLibrary(backup.library as SavedDoc[]);
      setSelectedId(null);
    } catch {
      window.alert("שגיאה בקריאת הגיבוי");
    }
  };

  /* templates */
  const useTemplate = (tplId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setDoc((prev) => ({ ...prev, accentColor: tpl.accentColor, blocks: applyTemplate(prev.blocks, tpl) }));
  };

  /* saved-docs library */
  const saveCurrent = () => {
    const entry: SavedDoc = { id: newItemId(), name: `${DOC_TITLES[doc.docType]} ${doc.docNumber || ""}`.trim(), savedAt: new Date().toISOString(), doc };
    setLibrary((prev) => [entry, ...prev].slice(0, MAX_SAVES));
  };
  const newDocument = () => {
    setDoc((prev) => ({
      ...freshDoc(prev.docType),
      bizName: prev.bizName,
      bizId: prev.bizId,
      bizAddr: prev.bizAddr,
      bizPhone: prev.bizPhone,
      bizEmail: prev.bizEmail,
      logoAssetId: prev.logoAssetId,
      currency: prev.currency,
      vatRate: prev.vatRate,
      pricesIncludeVat: prev.pricesIncludeVat,
      accentColor: prev.accentColor,
      payInfo: prev.payInfo,
      notes: prev.notes,
      blocks: prev.blocks.map((b) => ({ ...b, id: newItemId() })),
      docNumber: nextDocNumber(prev.docNumber),
    }));
    setSelectedId(null);
  };
  const loadSaved = (entry: SavedDoc) => {
    setDoc({ ...defaultDoc, ...entry.doc });
    setSelectedId(null);
  };
  const duplicateSaved = (entry: SavedDoc) =>
    setLibrary((prev) => [{ ...entry, id: newItemId(), name: `${entry.name} (עותק)`, savedAt: new Date().toISOString() }, ...prev].slice(0, MAX_SAVES));
  const deleteSaved = (id: string) => setLibrary((prev) => prev.filter((e) => e.id !== id));

  const doPrint = () => window.print();
  const resetAll = () => {
    if (typeof window !== "undefined" && !window.confirm("לאפס את הטופס הנוכחי? (הנכסים והמסמכים השמורים יישארו)")) return;
    setDoc(freshDoc(doc.docType));
    setSelectedId(null);
  };

  if (!mounted) return <div style={{ minHeight: "100vh", background: "#09090b" }} aria-hidden />;

  const selectedBlock = doc.blocks.find((b) => b.id === selectedId) ?? null;

  return (
    <div dir="rtl" id="tools-invoice" style={{ minHeight: "100vh", color: tokens.label1, overflowX: "hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        #tools-invoice{font-family: var(--font-heebo), -apple-system, BlinkMacSystemFont, "SF Pro Display","SF Pro Text","Helvetica Neue", system-ui, sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
        #tools-invoice #bg{position:fixed;inset:0;z-index:0;background:
          radial-gradient(ellipse 120% 75% at 90% 0%, rgba(138,99,39,.20) 0%, transparent 52%),
          radial-gradient(ellipse 75% 65% at 0% 95%, rgba(10,132,255,.14) 0%, transparent 52%),
          radial-gradient(ellipse 60% 55% at 50% 50%, rgba(94,92,230,.10) 0%, transparent 60%),
          linear-gradient(158deg, ${isDark ? "#0c1018 0%, #0a0d15 50%, #07090f 100%" : "#f4f4f6 0%, #ececef 100%"});}
        #tools-invoice #page{position:relative;z-index:1;max-width:1320px;margin:0 auto;padding:40px 16px 80px}
        @media(min-width:1040px){#tools-invoice #page{padding:52px 40px 80px}}
        .inv-grid{display:grid;grid-template-columns:1fr;gap:28px;align-items:start}
        @media(min-width:1040px){.inv-grid{grid-template-columns:minmax(0,1fr) minmax(440px,1fr);gap:36px}}
        .inv-paper-scroll{overflow:auto}
        @media(min-width:1040px){.inv-paper-scroll{position:sticky;top:24px}}
        #invoice-doc{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.18),0 18px 50px rgba(0,0,0,.32);}
        #tools-invoice input::placeholder,#tools-invoice textarea::placeholder{color:${tokens.label4}}
        @media print{
          @page{margin:12mm}
          html,body{background:#fff !important}
          #tools-invoice{color:#000 !important;min-height:0 !important}
          #tools-invoice #bg,.inv-no-print{display:none !important}
          #tools-invoice #page{padding:0 !important;max-width:none !important}
          .inv-grid{display:block !important}
          .inv-paper-scroll{position:static !important;overflow:visible !important}
          #invoice-doc{box-shadow:none !important;border-radius:0 !important;margin:0 !important;width:100% !important}
        }
      `}</style>

      <div id="bg" />

      <div id="page">
        <header className="inv-no-print" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass("ultra"), borderRadius: 999, padding: "8px 14px 8px 16px" }}>
              <FileText size={22} style={{ color: tokens.label2 }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", color: tokens.label2 }}>Document Builder</span>
            </div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass("ultra"), borderRadius: 999, padding: "8px 14px 8px 16px", textDecoration: "none", color: tokens.label2 }}>
              <Home size={22} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>חזרה לדף הבית</span>
            </Link>
          </div>
          <h1 style={{ fontSize: "clamp(32px,5vw,50px)", fontWeight: 800, letterSpacing: "-0.036em", lineHeight: 1.05, marginBottom: 10 }}>בונה הצעות מחיר וחשבוניות</h1>
          <p style={{ fontSize: 16, lineHeight: 1.68, color: tokens.label2, maxWidth: 580 }}>
            גוררים בלוקים לסידור המסמך (לחיצה ארוכה לגרירה, לחיצה לעריכה), מעלים לוגו וחתימה לספריית נכסים אחת, בוחרים תבנית — ומדפיסים ל-PDF. הכול בדפדפן, ללא שרת.
          </p>
        </header>

        <div className="inv-grid">
          {/* ── Builder / editor ── */}
          <div className="inv-no-print" style={{ minWidth: 0 }}>
            <div style={{ marginBottom: 18 }}>
              <SegmentedControl<DocType>
                tokens={tokens}
                value={doc.docType}
                onChange={(v) => onDocChange({ docType: v })}
                options={[
                  { value: "quote", label: "הצעת מחיר" },
                  { value: "invoice", label: "חשבונית עסקה" },
                ]}
              />
            </div>

            <Section tokens={tokens} title="תבנית ועיצוב">
              <div style={{ display: "flex", gap: 8, padding: "12px 14px", borderBottom: `0.5px solid ${tokens.sep}`, flexWrap: "wrap" }}>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => useTemplate(t.id)}
                    style={{ flex: "1 1 90px", ...glass("thin"), borderRadius: tokens.r13, border: `1px solid ${tokens.sep}`, padding: "10px 12px", color: tokens.label1, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: t.accentColor, flexShrink: 0 }} />
                    {t.name}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", flexWrap: "wrap", borderBottom: `0.5px solid ${tokens.sep}` }}>
                <input type="color" value={doc.accentColor} onChange={(e) => onDocChange({ accentColor: e.target.value })} aria-label="צבע מותג" style={{ width: 38, height: 38, border: "none", borderRadius: tokens.r10, background: "transparent", cursor: "pointer", padding: 0 }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ACCENT_PRESETS.map((c) => (
                    <button key={c} type="button" onClick={() => onDocChange({ accentColor: c })} aria-label={`צבע ${c}`} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: doc.accentColor.toLowerCase() === c ? `2px solid ${tokens.label1}` : `1px solid ${tokens.sep}`, cursor: "pointer" }} />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssetModal({ open: true, kind: "logo" })}
                style={{ width: "100%", border: "none", background: "transparent", color: tokens.blue, padding: "13px 16px", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 9 }}
              >
                <Images size={17} /> ספריית נכסים (לוגואים וחתימות)
              </button>
            </Section>

            <Section tokens={tokens} title="מבנה המסמך — גררו לסידור, לחצו לעריכה" titleIcon={<Layers size={13} style={{ color: tokens.label3 }} />}>
              <div style={{ padding: 14 }}>
                <BlockBuilder
                  tokens={tokens}
                  blocks={doc.blocks}
                  selectedId={selectedId}
                  onReorder={reorderBlocks}
                  onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
                  onToggleSpan={toggleSpan}
                  onToggleHidden={toggleHidden}
                  onDelete={deleteBlock}
                  onAdd={addBlock}
                />
              </div>
            </Section>

            {selectedBlock ? (
              <Section tokens={tokens} title={`עריכת בלוק · ${BLOCK_META[selectedBlock.type].label}`}>
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px 0" }}>
                  <button type="button" onClick={() => setSelectedId(null)} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "transparent", color: tokens.label3, fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                    <X size={14} /> סגור
                  </button>
                </div>
                <BlockEditor
                  tokens={tokens}
                  doc={doc}
                  block={selectedBlock}
                  assets={assets}
                  onDocChange={onDocChange}
                  updateBlock={(patch) => updateBlock(selectedBlock.id, patch)}
                  addItem={addItem}
                  patchItem={patchItem}
                  removeItem={removeItem}
                  onManageAssets={(kind) => setAssetModal({ open: true, kind })}
                />
              </Section>
            ) : null}

            <Section tokens={tokens} title="מסמכים שמורים">
              <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderBottom: library.length ? `0.5px solid ${tokens.sep}` : undefined }}>
                <ActionButton tokens={tokens} color={tokens.green} onPress={saveCurrent} icon={<Save size={16} />} small full>שמירת המסמך</ActionButton>
                <ActionButton tokens={tokens} color={tokens.blue} onPress={newDocument} icon={<FilePlus2 size={16} />} small full>מסמך חדש</ActionButton>
              </div>
              {library.length ? (
                library.map((e, i) => (
                  <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderBottom: i === library.length - 1 ? undefined : `0.5px solid ${tokens.sep}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: tokens.label1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: tokens.label3 }}>{new Date(e.savedAt).toLocaleDateString("he-IL", { day: "numeric", month: "short" })}</div>
                    </div>
                    {[
                      { lbl: "טען", col: tokens.blue, fn: () => loadSaved(e), ic: <FolderOpen size={15} /> },
                      { lbl: "שכפל", col: tokens.green, fn: () => duplicateSaved(e), ic: <Copy size={15} /> },
                      { lbl: "מחק", col: tokens.red, fn: () => deleteSaved(e.id), ic: <Trash2 size={15} /> },
                    ].map((b) => (
                      <button key={b.lbl} type="button" onClick={b.fn} aria-label={b.lbl} style={{ width: 32, height: 32, borderRadius: tokens.r10, border: "none", background: `${b.col}18`, color: b.col, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {b.ic}
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 12, color: tokens.label3, padding: "12px 16px" }}>אין מסמכים שמורים עדיין.</p>
              )}
              <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderTop: `0.5px solid ${tokens.sep}` }}>
                <input ref={backupInputRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importBackup(f); }} />
                <ActionButton tokens={tokens} color={tokens.label2} onPress={exportBackup} icon={<Download size={15} />} small full>גיבוי לקובץ</ActionButton>
                <ActionButton tokens={tokens} color={tokens.label2} onPress={() => backupInputRef.current?.click()} icon={<Upload size={15} />} small full>שחזור מקובץ</ActionButton>
              </div>
            </Section>

            <div style={{ display: "flex", gap: 10 }}>
              <ActionButton tokens={tokens} color={tokens.green} onPress={doPrint} icon={<Printer size={17} />} full>הדפסה / שמירה כ-PDF</ActionButton>
              <ActionButton tokens={tokens} color={tokens.red} onPress={resetAll} icon={<RotateCcw size={16} />} small>איפוס</ActionButton>
            </div>
          </div>

          {/* ── Live paper preview ── */}
          <div className="inv-paper-scroll">
            <div id="invoice-doc">
              <InvoiceDocument doc={doc} assets={assets} />
            </div>
            <p className="inv-no-print" style={{ fontSize: 12, color: tokens.label3, textAlign: "center", marginTop: 12 }}>
              בחלון ההדפסה בחרו “שמירה כ-PDF” · סה״כ לתשלום {formatMoney(totals.total, doc.currency)}
            </p>
          </div>
        </div>
      </div>

      {assetModal.open ? (
        <AssetManager
          tokens={tokens}
          assets={assets}
          initialKind={assetModal.kind}
          onAddImage={onAddImage}
          onAddSignature={onAddSignature}
          onDelete={deleteAsset}
          onClose={() => setAssetModal((m) => ({ ...m, open: false }))}
        />
      ) : null}
    </div>
  );
}
