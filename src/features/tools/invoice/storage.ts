"use client";

/**
 * Private, client-only asset storage.
 *
 * Binary assets (logos / signatures) live as Blobs in IndexedDB — large quota
 * (hundreds of MB+), nothing ever leaves the browser. The document JSON stays in
 * localStorage and only references asset ids. Legacy dataURL assets (localStorage)
 * are migrated on first load.
 */

import type { AssetKind } from "./engine";

const DB_NAME = "core_invoice";
const STORE = "assets";
const VERSION = 1;
const LEGACY_ASSETS_KEY = "tool_invoice_assets";

export type StoredAsset = {
  id: string;
  kind: AssetKind;
  name: string;
  blob: Blob;
  createdAt: string;
};

/** In-memory shape used by the UI: an object URL instead of the raw blob. */
export type LiveAsset = {
  id: string;
  kind: AssetKind;
  name: string;
  url: string;
  createdAt: string;
};

function hasIDB(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      })
  );
}

export async function idbGetAllAssets(): Promise<StoredAsset[]> {
  if (!hasIDB()) return [];
  try {
    const all = await tx<StoredAsset[]>("readonly", (s) => s.getAll() as IDBRequest<StoredAsset[]>);
    return Array.isArray(all) ? all : [];
  } catch {
    return [];
  }
}

export async function idbPutAsset(a: StoredAsset): Promise<void> {
  if (!hasIDB()) return;
  await tx("readwrite", (s) => s.put(a));
}

export async function idbDeleteAsset(id: string): Promise<void> {
  if (!hasIDB()) return;
  await tx("readwrite", (s) => s.delete(id));
}

export async function idbClearAssets(): Promise<void> {
  if (!hasIDB()) return;
  await tx("readwrite", (s) => s.clear());
}

/* ───────────────────────────── conversions ───────────────────────────── */

export function blobToUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function toLive(a: StoredAsset): LiveAsset {
  return { id: a.id, kind: a.kind, name: a.name, url: blobToUrl(a.blob), createdAt: a.createdAt };
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/**
 * Downscale an uploaded image to a sane document resolution and return a Blob.
 * Keeps PNG (alpha) for transparency; never upscales. Falls back to the raw file.
 */
export async function compressImageFile(file: File, maxDim = 1400): Promise<Blob> {
  try {
    const dataUrl = await blobToDataUrl(file);
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale >= 1 && file.size <= 500 * 1024) return file; // already small enough
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    return blob ?? file;
  } catch {
    return file;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * One-time migration of older localStorage dataURL assets into IndexedDB.
 * Returns the migrated StoredAssets (empty if nothing to migrate).
 */
export async function migrateLegacyAssets(): Promise<StoredAsset[]> {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(LEGACY_ASSETS_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Array<{ id: string; kind: AssetKind; name: string; dataURL: string; createdAt: string }>;
    const out: StoredAsset[] = [];
    for (const a of arr) {
      if (!a?.dataURL) continue;
      const blob = await dataUrlToBlob(a.dataURL);
      const stored: StoredAsset = { id: a.id, kind: a.kind, name: a.name, blob, createdAt: a.createdAt };
      await idbPutAsset(stored);
      out.push(stored);
    }
    localStorage.removeItem(LEGACY_ASSETS_KEY);
    return out;
  } catch {
    return [];
  }
}

/* ───────────────────────────── backup / restore ──────────────────────── */

export type BackupFile = {
  kind: "core-invoice-backup";
  version: 1;
  exportedAt: string;
  doc: unknown;
  library: unknown;
  assets: Array<{ id: string; kind: AssetKind; name: string; dataURL: string; createdAt: string }>;
};

export async function buildBackup(doc: unknown, library: unknown): Promise<BackupFile> {
  const stored = await idbGetAllAssets();
  const assets = await Promise.all(
    stored.map(async (a) => ({ id: a.id, kind: a.kind, name: a.name, dataURL: await blobToDataUrl(a.blob), createdAt: a.createdAt }))
  );
  return { kind: "core-invoice-backup", version: 1, exportedAt: new Date().toISOString(), doc, library, assets };
}

/** Restore assets from a backup into IndexedDB (replaces existing). Returns live assets. */
export async function restoreAssets(backup: BackupFile): Promise<LiveAsset[]> {
  await idbClearAssets();
  const live: LiveAsset[] = [];
  for (const a of backup.assets ?? []) {
    if (!a?.dataURL) continue;
    const blob = await dataUrlToBlob(a.dataURL);
    const stored: StoredAsset = { id: a.id, kind: a.kind, name: a.name, blob, createdAt: a.createdAt };
    await idbPutAsset(stored);
    live.push(toLive(stored));
  }
  return live;
}
