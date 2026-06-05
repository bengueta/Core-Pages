"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Copy, Download, FilePlus2, FileText, FolderOpen, Home, Images, Layers, LayoutTemplate, MoreHorizontal, Plus, Printer, RotateCcw, Save, Send, Share2, SlidersHorizontal, Trash2, Upload, X } from "lucide-react";
import { useTheme } from "next-themes";

import { ActionButton, Section, getTokens, glass } from "../shared";
import { AssetManager } from "./AssetManager";
import { BlockBuilder } from "./BlockBuilder";
import { BlockEditor } from "./BlockEditor";
import { InvoiceDocument } from "./InvoiceDocument";
import { ClientSignModal } from "./ClientSignModal";
import { SigningView } from "./SigningView";
import { HomeView } from "./HomeView";
import { shareDocument } from "./share";
import { DEFAULT_INTENT, computeDocHash } from "./sign";
import { buildSignUrl, decodeSignPayload, encodeSignPayload, readSignFragment } from "./signlink";
import { PRESETS_KEY, applyPreset, capturePreset, type BlockPreset, type PresetStore } from "./presets";
import {
  ADDABLE_BLOCKS,
  BLOCK_META,
  CLIENTS_KEY,
  DOC_TYPE_LABEL,
  SERVICES_KEY,
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
  type SavedClient,
  type SavedService,
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

const DOC_TITLES = DOC_TYPE_LABEL;
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

  // Mobile experience: bottom-sheet editor + "more" modal.
  const [isMobile, setIsMobile] = useState(false);
  const [sheetState, setSheetState] = useState<"peek" | "half" | "full">("half");
  const cycleSheet = () => setSheetState((s) => (s === "peek" ? "half" : s === "half" ? "full" : "peek"));
  const [moreOpen, setMoreOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [signModal, setSignModal] = useState<{ open: boolean; blockId: string | null }>({ open: false, blockId: null });
  const [signingSession, setSigningSession] = useState<{ doc: InvoiceDoc; assets: LiveAsset[] } | null>(null);
  const [signingChecked, setSigningChecked] = useState(false);
  const [sending, setSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [saveDialog, setSaveDialog] = useState<{ open: boolean; name: string }>({ open: false, name: "" });
  const [exportOpen, setExportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [blockPresets, setBlockPresets] = useState<PresetStore>({});
  const [clients, setClients] = useState<SavedClient[]>([]);
  const [services, setServices] = useState<SavedService[]>([]);
  const [presetDialog, setPresetDialog] = useState<{ open: boolean; name: string; type: BlockType | null; data: Record<string, unknown> | null }>({ open: false, name: "", type: null, data: null });
  const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; onYes: (() => void) | null }>({ open: false, message: "", onYes: null });
  const askConfirm = (message: string, onYes: () => void) => setConfirmState({ open: true, message, onYes });
  const [view, setView] = useState<"home" | "builder">("home");

  const toast = (m: string) => {
    setToastMsg(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1900);
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia("(max-width: 860px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mounted]);

  // Remote signing: if opened via a #sign= link, decode the embedded document.
  useEffect(() => {
    if (!mounted) return;
    const frag = readSignFragment();
    if (!frag) {
      setSigningChecked(true);
      return;
    }
    (async () => {
      try {
        const payload = await decodeSignPayload(frag);
        const live: LiveAsset[] = payload.assets.map((a) => ({ id: a.id, kind: a.kind, name: "", url: a.url, createdAt: "" }));
        setSigningSession({ doc: payload.doc, assets: live });
      } catch {
        /* invalid link — fall back to the normal editor */
      } finally {
        setSigningChecked(true);
      }
    })();
  }, [mounted]);

  // Async load: doc + library from localStorage, assets from IndexedDB (with one-time migration).
  useEffect(() => {
    if (!mounted) return;
    if (readSignFragment()) return; // in remote-signing mode we don't touch local data
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

  // Block presets (load once, persist on change).
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      if (raw) setBlockPresets(JSON.parse(raw) as PresetStore);
    } catch {}
  }, [mounted]);
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(PRESETS_KEY, JSON.stringify(blockPresets));
    } catch {}
  }, [blockPresets, mounted]);

  // Client book + service catalog (load once, persist on change).
  useEffect(() => {
    if (!mounted) return;
    try {
      const rc = localStorage.getItem(CLIENTS_KEY);
      if (rc) setClients(JSON.parse(rc) as SavedClient[]);
      const rs = localStorage.getItem(SERVICES_KEY);
      if (rs) setServices(JSON.parse(rs) as SavedService[]);
    } catch {}
  }, [mounted]);
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    } catch {}
  }, [clients, mounted]);
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    } catch {}
  }, [services, mounted]);

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
  const deleteBlock = (id: string) =>
    askConfirm("למחוק את הבלוק מההצעה?", () => {
      setDoc((prev) => ({ ...prev, blocks: prev.blocks.filter((b) => b.id !== id) }));
      setSelectedId((cur) => (cur === id ? null : cur));
    });
  const addBlock = (type: BlockType) => {
    const nb: Block = {
      id: newItemId(),
      type,
      span: BLOCK_META[type].defaultSpan,
      ...(type === "signature" ? { align: "right", signerName: "", signatureAssetId: null } : {}),
      ...(type === "text" ? { title: "", body: "" } : {}),
      ...(type === "heading" ? { title: "כותרת מקטע", body: "", align: "right" as const } : {}),
      ...(type === "bullets" ? { title: "", body: "פריט ראשון\nפריט שני" } : {}),
      ...(type === "terms" ? { title: "תנאים", body: "סעיף ראשון\nסעיף שני" } : {}),
      ...(type === "keyvalue" ? { title: "", body: "שם: ערך" } : {}),
      ...(type === "footer" ? { body: "תודה על שיתוף הפעולה" } : {}),
      ...(type === "spacer" ? { height: 24 } : {}),
    };
    setDoc((prev) => ({ ...prev, blocks: [...prev.blocks, nb] }));
    setSelectedId(nb.id);
  };

  /* client e-signature */
  const openSign = (blockId: string) => setSignModal({ open: true, blockId });
  const completeSign = async (dataURL: string, name: string) => {
    const blockId = signModal.blockId;
    if (!blockId) return;
    const hash = await computeDocHash(doc);
    updateBlock(blockId, {
      sigMode: "client",
      clientSignature: dataURL,
      signerName: name,
      signedAt: new Date().toISOString(),
      signedHash: hash,
    });
    setSignModal({ open: false, blockId: null });
    toast("נחתם ✓");
  };

  /* duplicate a block + block presets */
  const duplicateBlock = (id: string) => {
    setDoc((prev) => {
      const idx = prev.blocks.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const copy: Block = { ...prev.blocks[idx], id: newItemId() };
      const blocks = [...prev.blocks];
      blocks.splice(idx + 1, 0, copy);
      return { ...prev, blocks };
    });
    toast("הבלוק שוכפל ✓");
  };
  const openPresetDialog = (block: Block) => setPresetDialog({ open: true, name: "", type: block.type, data: capturePreset(block, doc) });
  const confirmSavePreset = () => {
    const { type, data, name } = presetDialog;
    if (!type || !data) return;
    const nm = name.trim() || BLOCK_META[type].label;
    setBlockPresets((prev) => ({ ...prev, [type]: [{ id: newItemId(), name: nm, data }, ...(prev[type] ?? [])].slice(0, 20) }));
    setPresetDialog({ open: false, name: "", type: null, data: null });
    toast("פריסט נשמר ✓");
  };
  const applyPresetToBlock = (block: Block, preset: BlockPreset) => {
    const { blockPatch, docPatch } = applyPreset(block.type, preset.data);
    if (blockPatch) updateBlock(block.id, blockPatch);
    if (docPatch) onDocChange(docPatch);
    toast("פריסט נטען ✓");
  };
  const deletePreset = (type: BlockType, id: string) =>
    askConfirm("למחוק את הפריסט?", () => setBlockPresets((prev) => ({ ...prev, [type]: (prev[type] ?? []).filter((p) => p.id !== id) })));

  /* client book */
  const saveClient = () => {
    const name = doc.clientName.trim();
    if (!name) {
      toast("אין שם לקוח לשמירה");
      return;
    }
    if (clients.some((c) => c.name === name)) {
      toast("הלקוח כבר שמור");
      return;
    }
    setClients((prev) => [{ id: newItemId(), name, clientId: doc.clientId, addr: doc.clientAddr }, ...prev].slice(0, 100));
    toast("הלקוח נשמר ✓");
  };
  const applyClient = (c: SavedClient) => onDocChange({ clientName: c.name, clientId: c.clientId ?? "", clientAddr: c.addr ?? "" });
  const deleteClient = (id: string) => setClients((prev) => prev.filter((c) => c.id !== id));
  const addClientManual = (c: { name: string; clientId: string; addr: string }) => {
    const name = c.name.trim();
    if (!name) return;
    if (clients.some((x) => x.name === name)) {
      toast("הלקוח כבר שמור");
      return;
    }
    setClients((prev) => [{ id: newItemId(), name, clientId: c.clientId, addr: c.addr }, ...prev].slice(0, 100));
    toast("הלקוח נוסף ✓");
  };

  /* service catalog */
  const saveServices = () => {
    const fresh = doc.items.filter((it) => it.desc.trim() && !services.some((s) => s.desc === it.desc.trim()));
    if (!fresh.length) {
      toast("אין פריטים חדשים לשמירה");
      return;
    }
    setServices((prev) => [...fresh.map((it) => ({ id: newItemId(), desc: it.desc.trim(), price: it.price })), ...prev].slice(0, 200));
    toast("נשמר לקטלוג ✓");
  };
  const addService = (s: SavedService) => setDoc((prev) => ({ ...prev, items: [...prev.items, { id: newItemId(), desc: s.desc, qty: 1, price: s.price }] }));
  const deleteService = (id: string) => setServices((prev) => prev.filter((s) => s.id !== id));

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
  const deleteAsset = (id: string) =>
    askConfirm("למחוק את הנכס מהספרייה?", async () => {
      const target = assetsRef.current.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.url);
      await idbDeleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setDoc((prev) => ({
        ...prev,
        logoAssetId: prev.logoAssetId === id ? null : prev.logoAssetId,
        blocks: prev.blocks.map((b) => (b.signatureAssetId === id ? { ...b, signatureAssetId: null } : b)),
      }));
    });

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
  const openSaveDialog = () => setSaveDialog({ open: true, name: `${DOC_TITLES[doc.docType]} ${doc.docNumber || ""}`.trim() });
  const confirmSave = () => {
    const name = saveDialog.name.trim() || `${DOC_TITLES[doc.docType]} ${doc.docNumber || ""}`.trim();
    if (library.some((e) => e.name === name)) {
      toast("כבר קיים מסמך בשם הזה");
      return;
    }
    setLibrary((prev) => [{ id: newItemId(), name, savedAt: new Date().toISOString(), doc }, ...prev].slice(0, MAX_SAVES));
    setSaveDialog({ open: false, name: "" });
    toast("נשמר ✓");
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
    toast("מסמך חדש נוצר ✓");
  };
  const loadSaved = (entry: SavedDoc) => {
    setDoc({ ...defaultDoc, ...entry.doc });
    setSelectedId(null);
    toast("נטען ✓");
  };
  const createDoc = (d: InvoiceDoc) => {
    setDoc(d);
    setSelectedId(null);
    setSheetState("half");
    setView("builder");
  };
  const rawDeleteSaved = (id: string) => setLibrary((prev) => prev.filter((e) => e.id !== id));
  const openSavedFromHome = (entry: SavedDoc) => {
    setDoc({ ...defaultDoc, ...entry.doc });
    setSelectedId(null);
    setView("builder");
  };
  const duplicateSaved = (entry: SavedDoc) =>
    setLibrary((prev) => [{ ...entry, id: newItemId(), name: `${entry.name} (עותק)`, savedAt: new Date().toISOString() }, ...prev].slice(0, MAX_SAVES));
  const deleteSaved = (id: string) => askConfirm("למחוק את המסמך השמור?", () => setLibrary((prev) => prev.filter((e) => e.id !== id)));

  const doPrint = () => window.print();

  // Text-only link (no inlined images) so it stays small.
  const makeSignUrl = async () => buildSignUrl(await encodeSignPayload({ v: 1, doc, assets: [] }));

  const sendForSignature = async () => {
    if (sending) return;
    setSending(true);
    try {
      const url = await makeSignUrl();
      const text = `${DOC_TITLES[doc.docType]} ${doc.docNumber || ""} לחתימה`.trim();
      const nav = navigator as Navigator;
      if (typeof nav.share === "function") {
        try {
          await nav.share({ title: text, text, url });
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        toast("הקישור לחתימה הועתק — הדביקו בוואטסאפ");
      } catch {
        window.prompt("העתיקו את הקישור לחתימה:", url);
      }
    } finally {
      setSending(false);
    }
  };

  // Send as a tiny self-contained HTML file that opens the signing page —
  // avoids pasting a long link into chat entirely.
  const sendForSignatureFile = async () => {
    if (sending) return;
    setSending(true);
    try {
      const url = await makeSignUrl();
      const title = `${DOC_TITLES[doc.docType]} ${doc.docNumber || ""} לחתימה`.trim();
      const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta http-equiv="refresh" content="0;url=${url}"></head><body style="font-family:system-ui,sans-serif;background:#0c1018;color:#fff;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px"><div><h2 style="font-weight:800">${title}</h2><p style="color:#9aa">נפתח אוטומטית… אם לא, לחצו:</p><a href="${url}" style="display:inline-block;background:#2f8f4e;color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700">פתח מסמך לחתימה</a></div></body></html>`;
      const file = new File([html], `${title.replace(/[\\/:*?"<>|]/g, "")}.html`, { type: "text/html" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], title });
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }
      const dlUrl = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = file.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 1000);
      toast("נוצר קובץ לחתימה — שלחו בוואטסאפ");
    } finally {
      setSending(false);
    }
  };

  const doShare = async () => {
    if (sharing) return;
    const el = document.getElementById("invoice-doc");
    if (!el) return;
    setSharing(true);
    try {
      const base = doc.docType === "quote" ? "הצעת-מחיר" : "חשבונית";
      await shareDocument(el, `${base}-${doc.docNumber || ""}.pdf`, `${DOC_TITLES[doc.docType]} ${doc.docNumber}`.trim());
    } catch {
      window.alert("שגיאה ביצירת הקובץ לשיתוף");
    } finally {
      setSharing(false);
    }
  };
  const resetAll = () => {
    if (typeof window !== "undefined" && !window.confirm("לאפס את הטופס הנוכחי? (הנכסים והמסמכים השמורים יישארו)")) return;
    setDoc(freshDoc(doc.docType));
    setSelectedId(null);
  };

  if (!mounted || !signingChecked) return <div style={{ minHeight: "100vh", background: "#09090b" }} aria-hidden />;

  if (signingSession) return <SigningView isDark={isDark} doc={signingSession.doc} assets={signingSession.assets} />;

  if (view === "home")
    return (
      <HomeView
        isDark={isDark}
        library={library}
        presets={blockPresets}
        assets={assets}
        clients={clients}
        services={services}
        onCreate={createDoc}
        onContinue={() => setView("builder")}
        onOpenSaved={openSavedFromHome}
        onDeleteSaved={rawDeleteSaved}
        onDuplicateSaved={duplicateSaved}
        onDeleteClient={deleteClient}
        onDeleteService={deleteService}
        onAddClient={addClientManual}
      />
    );

  const selectedBlock = doc.blocks.find((b) => b.id === selectedId) ?? null;

  const builderEl = (
    <BlockBuilder
      tokens={tokens}
      blocks={doc.blocks}
      selectedId={selectedId}
      onReorder={reorderBlocks}
      onSelect={(id) => setSelectedId((cur) => (cur === id ? null : id))}
      onToggleSpan={toggleSpan}
      onToggleHidden={toggleHidden}
      onDelete={deleteBlock}
      onDuplicate={duplicateBlock}
      onAdd={addBlock}
    />
  );
  const blockEditorEl = selectedBlock ? (
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
      onSignClient={openSign}
      presets={blockPresets[selectedBlock.type] ?? []}
      onSavePreset={() => openPresetDialog(selectedBlock)}
      onApplyPreset={(preset) => applyPresetToBlock(selectedBlock, preset)}
      onDeletePreset={(id) => deletePreset(selectedBlock.type, id)}
      clients={clients}
      services={services}
      onPickClient={applyClient}
      onSaveClient={saveClient}
      onAddService={addService}
      onSaveServices={saveServices}
      toast={toast}
    />
  ) : null;

  const sheetAction = (label: string, icon: React.ReactNode, onClick: () => void, color = tokens.label2) => (
    <button
      type="button"
      onClick={onClick}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, border: "none", background: "transparent", color, cursor: "pointer", fontFamily: "inherit", padding: "2px 2px", minWidth: 50, flexShrink: 0 }}
    >
      <span style={{ width: 38, height: 38, borderRadius: 12, background: `${color}1c`, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      <span style={{ fontSize: 10.5, fontWeight: 600 }}>{label}</span>
    </button>
  );

  const mobileSheet = (
    <div className="inv-sheet inv-no-print" style={{ height: sheetState === "full" ? "90vh" : sheetState === "half" ? "56vh" : 60 }}>
      <div className="inv-grabber" onClick={cycleSheet} title="לחיצה: סגור / חצי / מלא">
        <span />
      </div>
      {sheetState === "peek" ? (
        <button type="button" onClick={() => setSheetState("half")} style={{ border: "none", background: "transparent", color: tokens.label2, fontSize: 13.5, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", padding: "0 0 10px", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          פתיחת עורך המסמך ↑
        </button>
      ) : (
      <>
      {selectedBlock ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 14px 10px", borderBottom: `0.5px solid ${tokens.sep}` }}>
          <button type="button" onClick={() => setSelectedId(null)} style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: tokens.fill3, color: tokens.label1, borderRadius: 999, padding: "7px 12px 7px 14px", fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            <ChevronRight size={16} /> בלוקים
          </button>
          <span style={{ fontSize: 15, fontWeight: 800, color: tokens.label1 }}>{BLOCK_META[selectedBlock.type].label}</span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, padding: "0 6px 8px", borderBottom: `0.5px solid ${tokens.sep}`, overflowX: "auto" }}>
          {sheetAction("בלוק", <Plus size={18} />, () => setAddOpen(true), tokens.blue)}
          {sheetAction("נכסים", <Images size={18} />, () => setAssetModal({ open: true, kind: "logo" }), tokens.blue)}
          {sheetAction(sending || sharing ? "מכין…" : "ייצא", <Share2 size={18} />, () => setExportOpen(true), tokens.green)}
          {sheetAction("עוד", <MoreHorizontal size={18} />, () => setMoreOpen(true), tokens.label2)}
        </div>
      )}
      <div className="inv-sheet-body">
        {selectedBlock ? (
          blockEditorEl
        ) : (
          <>
            <div style={{ margin: "12px 0 14px" }}>
              <ActionButton tokens={tokens} color={tokens.label2} onPress={() => setView("home")} icon={<LayoutTemplate size={16} />} small full>תבניות ושמירות</ActionButton>
            </div>
            {builderEl}
          </>
        )}
      </div>
      </>
      )}
    </div>
  );

  const moreModal = (
    <div className="inv-no-print" onMouseDown={() => setMoreOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end" }}>
      <div
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ width: "100%", maxHeight: "86vh", overflowY: "auto", background: isDark ? "rgba(18,18,24,0.98)" : "rgba(248,248,250,0.99)", borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `0.5px solid ${tokens.sep}`, padding: "14px 16px calc(20px + env(safe-area-inset-bottom,0px))", color: tokens.label1 }}
      >
        <div className="inv-grabber" onClick={() => setMoreOpen(false)}>
          <span />
        </div>
        <div style={{ padding: "0 2px 6px" }}>
          <ActionButton tokens={tokens} color={tokens.blue} onPress={() => { setMoreOpen(false); setView("home"); }} icon={<LayoutTemplate size={16} />} full>תבניות וכל השמירות</ActionButton>
        </div>
        <Section tokens={tokens} title="צבע מותג" titleIcon={<SlidersHorizontal size={13} style={{ color: tokens.label3 }} />}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", flexWrap: "wrap" }}>
            <input type="color" value={doc.accentColor} onChange={(e) => onDocChange({ accentColor: e.target.value })} aria-label="צבע מותג" style={{ width: 38, height: 38, border: "none", borderRadius: tokens.r10, background: "transparent", cursor: "pointer", padding: 0 }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ACCENT_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => onDocChange({ accentColor: c })} aria-label={`צבע ${c}`} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: doc.accentColor.toLowerCase() === c ? `2px solid ${tokens.label1}` : `1px solid ${tokens.sep}`, cursor: "pointer" }} />
              ))}
            </div>
          </div>
        </Section>
        <Section tokens={tokens} title="גיבוי ואיפוס">
          <div style={{ display: "flex", gap: 10, padding: "12px 14px" }}>
            <ActionButton tokens={tokens} color={tokens.label2} onPress={exportBackup} icon={<Download size={15} />} small full>גיבוי</ActionButton>
            <ActionButton tokens={tokens} color={tokens.label2} onPress={() => backupInputRef.current?.click()} icon={<Upload size={15} />} small full>שחזור</ActionButton>
            <ActionButton tokens={tokens} color={tokens.red} onPress={resetAll} icon={<RotateCcw size={15} />} small>איפוס</ActionButton>
          </div>
        </Section>
      </div>
    </div>
  );

  const bottomSheetWrap = (onClose: () => void, children: React.ReactNode) => (
    <div className="inv-no-print" onMouseDown={onClose} style={{ position: "fixed", inset: 0, zIndex: 96, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div dir="rtl" onMouseDown={(e) => e.stopPropagation()} style={{ width: "min(560px,100%)", maxHeight: "86vh", overflowY: "auto", background: isDark ? "rgba(18,18,24,0.98)" : "rgba(248,248,250,0.99)", borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTop: `0.5px solid ${tokens.sep}`, padding: "8px 16px calc(18px + env(safe-area-inset-bottom,0px))", color: tokens.label1 }}>
        <div className="inv-grabber" onClick={onClose}><span /></div>
        {children}
      </div>
    </div>
  );

  const exportItem = (label: string, icon: React.ReactNode, color: string, fn: () => void) => (
    <button type="button" onClick={() => { setExportOpen(false); fn(); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 14px", borderRadius: tokens.r13, border: `1px solid ${tokens.sep}`, background: tokens.fill3, color: tokens.label1, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", marginBottom: 8 }}>
      <span style={{ width: 34, height: 34, borderRadius: 10, background: `${color}1f`, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</span>
      {label}
    </button>
  );

  const exportSheet = bottomSheetWrap(() => setExportOpen(false), (
    <>
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "2px 2px 12px" }}>ייצוא ושיתוף</h3>
      {exportItem(sending ? "מכין…" : "שלח לחתימה (קישור)", <Send size={18} />, tokens.teal, sendForSignature)}
      {exportItem(sending ? "מכין…" : "שלח לחתימה (קובץ קצר)", <FileText size={18} />, tokens.teal, sendForSignatureFile)}
      {exportItem(sharing ? "מכין PDF…" : "שיתוף PDF (וואטסאפ)", <Share2 size={18} />, tokens.green, doShare)}
      {exportItem("הדפסה / שמירה כ-PDF", <Printer size={18} />, tokens.blue, doPrint)}
      {exportItem("שמירת מסמך בספרייה", <Save size={18} />, tokens.label2, openSaveDialog)}
      {exportItem("מסמך חדש", <FilePlus2 size={18} />, tokens.label2, newDocument)}
      {exportItem("גיבוי לקובץ", <Download size={18} />, tokens.label2, exportBackup)}
      {exportItem("שחזור מקובץ", <Upload size={18} />, tokens.label2, () => backupInputRef.current?.click())}
    </>
  ));

  const addSheet = bottomSheetWrap(() => setAddOpen(false), (
    <>
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: "2px 2px 12px" }}>הוספת בלוק</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {ADDABLE_BLOCKS.filter((t) => !(BLOCK_META[t].unique && doc.blocks.some((b) => b.type === t))).map((t) => (
          <button key={t} type="button" onClick={() => { setAddOpen(false); addBlock(t); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 12px", borderRadius: tokens.r13, border: `1px solid ${tokens.sep}`, background: tokens.fill3, color: tokens.label1, fontSize: 13.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            <Plus size={15} style={{ color: tokens.blue }} /> {BLOCK_META[t].label}
          </button>
        ))}
      </div>
    </>
  ));

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

        .inv-sheet{position:fixed;left:0;right:0;bottom:0;z-index:90;
          background:${isDark ? "rgba(18,18,24,0.96)" : "rgba(248,248,250,0.97)"};
          backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
          border-top:0.5px solid ${tokens.sep};
          border-top-left-radius:22px;border-top-right-radius:22px;
          box-shadow:0 -10px 40px rgba(0,0,0,0.32);
          display:flex;flex-direction:column;
          transition:height .32s cubic-bezier(.22,1,.36,1);
          padding-bottom:env(safe-area-inset-bottom,0px);}
        .inv-sheet-body{overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1;padding:0 12px 16px}
        .inv-grabber{display:flex;justify-content:center;padding:8px 0 6px;cursor:grab;flex-shrink:0}
        .inv-grabber span{width:40px;height:5px;border-radius:999px;background:${tokens.label4}}
        @media print{.inv-sheet{display:none !important}}
        @media print{
          @page{margin:12mm}
          html,body{background:#fff !important}
          #tools-invoice{color:#000 !important;min-height:0 !important}
          #tools-invoice #bg,.inv-no-print{display:none !important}
          #tools-invoice #page{padding:0 !important;max-width:none !important}
          .inv-grid{display:block !important}
          .inv-paper-scroll{position:static !important;overflow:visible !important}
          #invoice-doc{box-shadow:none !important;border-radius:0 !important;margin:0 !important;width:100% !important}
          #invoice-doc *{outline:none !important}
        }
      `}</style>

      <div id="bg" />

      <div id="page">
        <header className="inv-no-print" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setView("home")} title="תבניות ושמירות" style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass("ultra"), borderRadius: 999, padding: "8px 14px 8px 16px", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <FileText size={22} style={{ color: tokens.label2 }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", color: tokens.label2 }}>Document Builder</span>
            </button>
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

        {!isMobile ? (
        <div className="inv-grid">
          {/* ── Builder / editor ── */}
          <div className="inv-no-print" style={{ minWidth: 0 }}>
            <div style={{ marginBottom: 18 }}>
              <ActionButton tokens={tokens} color={tokens.label2} onPress={() => setView("home")} icon={<LayoutTemplate size={16} />} full>תבניות ושמירות</ActionButton>
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
              <div style={{ padding: 14 }}>{builderEl}</div>
            </Section>

            {selectedBlock ? (
              <Section tokens={tokens} title={`עריכת בלוק · ${BLOCK_META[selectedBlock.type].label}`}>
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 12px 0" }}>
                  <button type="button" onClick={() => setSelectedId(null)} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "none", background: "transparent", color: tokens.label3, fontSize: 12.5, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                    <X size={14} /> סגור
                  </button>
                </div>
                {blockEditorEl}
              </Section>
            ) : null}

            <Section tokens={tokens} title="מסמכים שמורים">
              <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderBottom: library.length ? `0.5px solid ${tokens.sep}` : undefined }}>
                <ActionButton tokens={tokens} color={tokens.green} onPress={openSaveDialog} icon={<Save size={16} />} small full>שמירת המסמך</ActionButton>
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
                <ActionButton tokens={tokens} color={tokens.label2} onPress={exportBackup} icon={<Download size={15} />} small full>גיבוי לקובץ</ActionButton>
                <ActionButton tokens={tokens} color={tokens.label2} onPress={() => backupInputRef.current?.click()} icon={<Upload size={15} />} small full>שחזור מקובץ</ActionButton>
              </div>
            </Section>

            <div style={{ display: "flex", gap: 10 }}>
              <ActionButton tokens={tokens} color={tokens.green} onPress={() => setExportOpen(true)} icon={<Share2 size={17} />} full>{sending || sharing ? "מכין…" : "ייצוא ושיתוף"}</ActionButton>
              <ActionButton tokens={tokens} color={tokens.red} onPress={resetAll} icon={<RotateCcw size={16} />} small>איפוס</ActionButton>
            </div>
          </div>

          {/* ── Live paper preview ── */}
          <div className="inv-paper-scroll">
            <div id="invoice-doc">
              <InvoiceDocument doc={doc} assets={assets} onBlockTap={(id) => setSelectedId(id)} selectedBlockId={selectedId} />
            </div>
            <p className="inv-no-print" style={{ fontSize: 12, color: tokens.label3, textAlign: "center", marginTop: 12 }}>
              בחלון ההדפסה בחרו “שמירה כ-PDF” · סה״כ לתשלום {formatMoney(totals.total, doc.currency)}
            </p>
          </div>
        </div>
        ) : (
          <div style={{ paddingBottom: "56vh" }}>
            <div id="invoice-doc">
              <InvoiceDocument doc={doc} assets={assets} onBlockTap={(id) => setSelectedId(id)} selectedBlockId={selectedId} />
            </div>
            <p className="inv-no-print" style={{ fontSize: 12, color: tokens.label3, textAlign: "center", margin: "12px 0 0" }}>
              סה״כ לתשלום {formatMoney(totals.total, doc.currency)}
            </p>
          </div>
        )}
      </div>

      {isMobile ? mobileSheet : null}
      {isMobile && moreOpen ? moreModal : null}
      {exportOpen ? exportSheet : null}
      {addOpen ? addSheet : null}

      <input ref={backupInputRef} type="file" accept="application/json,.json" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) importBackup(f); }} />

      {toastMsg ? (
        <div className="inv-no-print" style={{ position: "fixed", top: "max(76px, env(safe-area-inset-top,0px))", left: "50%", transform: "translateX(-50%)", zIndex: 10002, ...glass("primary"), background: "rgba(28,28,34,0.92)", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 14, fontWeight: 700, boxShadow: "0 8px 28px rgba(0,0,0,0.4)", pointerEvents: "none" }}>
          {toastMsg}
        </div>
      ) : null}

      {saveDialog.open ? (
        <div className="inv-no-print" onMouseDown={() => setSaveDialog({ open: false, name: "" })} style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div dir="rtl" onMouseDown={(e) => e.stopPropagation()} style={{ width: "min(420px,100%)", background: "rgba(20,20,26,0.98)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: tokens.r28, padding: 20, color: tokens.label1, boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>שמירת מסמך</h3>
            <p style={{ fontSize: 12.5, color: tokens.label3, marginBottom: 14 }}>בחרו שם לשמירה בספריית המסמכים</p>
            <input
              autoFocus
              value={saveDialog.name}
              onChange={(e) => setSaveDialog((s) => ({ ...s, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") confirmSave(); }}
              placeholder="שם המסמך"
              dir="rtl"
              style={{ width: "100%", marginBottom: 16, padding: "12px 14px", borderRadius: tokens.r13, border: `1px solid ${tokens.sep}`, background: "rgba(0,0,0,0.25)", color: tokens.label1, fontSize: 16, fontWeight: 600, fontFamily: "inherit", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <ActionButton tokens={tokens} color={tokens.green} onPress={confirmSave} icon={<Save size={16} />} small full>שמור</ActionButton>
              <ActionButton tokens={tokens} color={tokens.label3} onPress={() => setSaveDialog({ open: false, name: "" })} small full>ביטול</ActionButton>
            </div>
          </div>
        </div>
      ) : null}

      {confirmState.open ? (
        <div className="inv-no-print" onMouseDown={() => setConfirmState({ open: false, message: "", onYes: null })} style={{ position: "fixed", inset: 0, zIndex: 10003, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div dir="rtl" onMouseDown={(e) => e.stopPropagation()} style={{ width: "min(380px,100%)", background: "rgba(20,20,26,0.98)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: tokens.r28, padding: 22, color: tokens.label1, boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, textAlign: "center" }}>{confirmState.message}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <ActionButton tokens={tokens} color={tokens.red} onPress={() => { confirmState.onYes?.(); setConfirmState({ open: false, message: "", onYes: null }); }} icon={<Trash2 size={16} />} full>אישור מחיקה</ActionButton>
              <ActionButton tokens={tokens} color={tokens.label2} onPress={() => setConfirmState({ open: false, message: "", onYes: null })} full>ביטול</ActionButton>
            </div>
          </div>
        </div>
      ) : null}

      {presetDialog.open ? (
        <div className="inv-no-print" onMouseDown={() => setPresetDialog({ open: false, name: "", type: null, data: null })} style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div dir="rtl" onMouseDown={(e) => e.stopPropagation()} style={{ width: "min(420px,100%)", background: "rgba(20,20,26,0.98)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: tokens.r28, padding: 20, color: tokens.label1, boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>שמירת פריסט</h3>
            <p style={{ fontSize: 12.5, color: tokens.label3, marginBottom: 14 }}>שם לפריסט הבלוק — לטעינה מהירה בעתיד</p>
            <input
              autoFocus
              value={presetDialog.name}
              onChange={(e) => setPresetDialog((s) => ({ ...s, name: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") confirmSavePreset(); }}
              placeholder="שם הפריסט"
              dir="rtl"
              style={{ width: "100%", marginBottom: 16, padding: "12px 14px", borderRadius: tokens.r13, border: `1px solid ${tokens.sep}`, background: "rgba(0,0,0,0.25)", color: tokens.label1, fontSize: 16, fontWeight: 600, fontFamily: "inherit", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <ActionButton tokens={tokens} color={tokens.blue} onPress={confirmSavePreset} icon={<Save size={16} />} small full>שמור פריסט</ActionButton>
              <ActionButton tokens={tokens} color={tokens.label3} onPress={() => setPresetDialog({ open: false, name: "", type: null, data: null })} small full>ביטול</ActionButton>
            </div>
          </div>
        </div>
      ) : null}

      {signModal.open ? (() => {
        const b = doc.blocks.find((x) => x.id === signModal.blockId);
        return (
          <ClientSignModal
            tokens={tokens}
            summary={`${DOC_TITLES[doc.docType]} ${doc.docNumber || ""} · ${doc.bizName} · ${formatMoney(totals.total, doc.currency)}`.trim()}
            intent={b?.intent || DEFAULT_INTENT}
            initialName={b?.signerName || doc.clientName || ""}
            onComplete={completeSign}
            onCancel={() => setSignModal({ open: false, blockId: null })}
          />
        );
      })() : null}

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
