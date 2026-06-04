"use client";

/**
 * Remote signing without a server: the whole document is encoded into a
 * compressed URL fragment (#sign=...). The recipient opens the same static
 * site, which decodes the document, lets them sign, and produces a signed PDF
 * to send back. Nothing is uploaded — the payload lives only in the link.
 */

import { defaultDoc, newItemId, type AssetKind, type Block, type DocType, type InvoiceDoc } from "./engine";

export type SignPayload = {
  v: 1;
  doc: InvoiceDoc;
  assets: Array<{ id: string; kind: AssetKind; url: string }>; // url = downscaled dataURL
};

/* ── compact codec: shrink the document before compression ──
   Drops ids, omits default values, and uses short keys. Reconstructed on the
   other side by merging defaults. Text content still travels (it must), so a
   very long contract still yields a longer link — but typical docs get tiny. */

function compactBlock(b: Block): Record<string, unknown> {
  const o: Record<string, unknown> = { t: b.type, s: b.span };
  if (b.hidden) o.h = 1;
  if (b.title) o.ti = b.title;
  if (b.body) o.bo = b.body;
  if (b.align && b.align !== "right") o.al = b.align;
  if (b.signatureAssetId) o.sa = b.signatureAssetId;
  if (b.signerName) o.sn = b.signerName;
  if (b.sigMode && b.sigMode !== "business") o.sm = b.sigMode;
  if (b.intent) o.in = b.intent;
  if (b.height && b.height !== 24) o.he = b.height;
  return o;
}

function expandBlock(o: Record<string, unknown>): Block {
  return {
    id: newItemId(),
    type: o.t as Block["type"],
    span: (o.s as Block["span"]) ?? 2,
    ...(o.h ? { hidden: true } : {}),
    ...(o.ti ? { title: String(o.ti) } : {}),
    ...(o.bo ? { body: String(o.bo) } : {}),
    ...(o.al ? { align: o.al as Block["align"] } : {}),
    ...(o.sa ? { signatureAssetId: String(o.sa) } : {}),
    ...(o.sn ? { signerName: String(o.sn) } : {}),
    ...(o.sm ? { sigMode: o.sm as Block["sigMode"] } : {}),
    ...(o.in ? { intent: String(o.in) } : {}),
    ...(o.he ? { height: Number(o.he) } : {}),
  };
}

function compactDoc(doc: InvoiceDoc): Record<string, unknown> {
  const o: Record<string, unknown> = { dt: doc.issueDate };
  if (doc.docType !== "quote") o.ty = doc.docType;
  if (doc.docNumber) o.n = doc.docNumber;
  if (doc.bizName) o.b = doc.bizName;
  if (doc.bizId) o.bi = doc.bizId;
  if (doc.bizAddr) o.ba = doc.bizAddr;
  if (doc.bizPhone) o.bp = doc.bizPhone;
  if (doc.bizEmail) o.be = doc.bizEmail;
  if (doc.clientName) o.c = doc.clientName;
  if (doc.clientId) o.ci = doc.clientId;
  if (doc.clientAddr) o.ca = doc.clientAddr;
  if (doc.currency !== "ILS") o.cu = doc.currency;
  if (doc.vatRate !== 18) o.vr = doc.vatRate;
  if (doc.pricesIncludeVat) o.iv = 1;
  if (doc.discountMode !== "none") {
    o.dm = doc.discountMode;
    o.dv = doc.discountValue;
  }
  if (doc.accentColor && doc.accentColor !== "#8a6327") o.ac = doc.accentColor;
  if (doc.validDays !== 14) o.vd = doc.validDays;
  if (doc.dueDays !== 30) o.du = doc.dueDays;
  if (doc.payInfo) o.pi = doc.payInfo;
  if (doc.notes) o.no = doc.notes;
  o.it = doc.items.map((i) => [i.desc, i.qty, i.price]);
  o.bl = doc.blocks.map(compactBlock);
  return o;
}

function expandDoc(o: Record<string, unknown>): InvoiceDoc {
  const items = Array.isArray(o.it)
    ? (o.it as Array<[string, number, number]>).map(([desc, qty, price]) => ({ id: newItemId(), desc: String(desc ?? ""), qty: Number(qty) || 0, price: Number(price) || 0 }))
    : defaultDoc.items;
  const blocks = Array.isArray(o.bl) ? (o.bl as Array<Record<string, unknown>>).map(expandBlock) : defaultDoc.blocks;
  return {
    ...defaultDoc,
    docType: (o.ty as DocType) ?? "quote",
    docNumber: o.n ? String(o.n) : "",
    issueDate: o.dt ? String(o.dt) : defaultDoc.issueDate,
    bizName: o.b ? String(o.b) : "",
    bizId: o.bi ? String(o.bi) : "",
    bizAddr: o.ba ? String(o.ba) : "",
    bizPhone: o.bp ? String(o.bp) : "",
    bizEmail: o.be ? String(o.be) : "",
    logoAssetId: null,
    clientName: o.c ? String(o.c) : "",
    clientId: o.ci ? String(o.ci) : "",
    clientAddr: o.ca ? String(o.ca) : "",
    currency: (o.cu as InvoiceDoc["currency"]) ?? "ILS",
    vatRate: o.vr != null ? Number(o.vr) : 18,
    pricesIncludeVat: !!o.iv,
    discountMode: (o.dm as InvoiceDoc["discountMode"]) ?? "none",
    discountValue: o.dv != null ? Number(o.dv) : 0,
    accentColor: o.ac ? String(o.ac) : "#8a6327",
    validDays: o.vd != null ? Number(o.vd) : 14,
    dueDays: o.du != null ? Number(o.du) : 30,
    payInfo: o.pi ? String(o.pi) : "",
    notes: o.no ? String(o.no) : "",
    items,
    blocks,
  };
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function gzip(str: string): Promise<Uint8Array> {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  void writer.write(new TextEncoder().encode(str) as unknown as BufferSource);
  void writer.close();
  const buf = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(buf);
}

async function gunzip(bytes: Uint8Array): Promise<string> {
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  void writer.write(bytes as unknown as BufferSource);
  void writer.close();
  const buf = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder().decode(buf);
}

const hasCompression = typeof CompressionStream !== "undefined";

export async function encodeSignPayload(payload: SignPayload): Promise<string> {
  const compact = { v: 1, d: compactDoc(payload.doc), a: payload.assets };
  const json = JSON.stringify(compact);
  if (hasCompression) return "1" + bytesToBase64Url(await gzip(json));
  return "0" + bytesToBase64Url(new TextEncoder().encode(json));
}

export async function decodeSignPayload(encoded: string): Promise<SignPayload> {
  const flag = encoded[0];
  const body = encoded.slice(1);
  const bytes = base64UrlToBytes(body);
  const json = flag === "1" ? await gunzip(bytes) : new TextDecoder().decode(bytes);
  const parsed = JSON.parse(json) as { v: number; d: Record<string, unknown>; a?: SignPayload["assets"] };
  return { v: 1, doc: expandDoc(parsed.d), assets: parsed.a ?? [] };
}

export function buildSignUrl(encoded: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#sign=${encoded}`;
}

/** Read & clear the #sign= fragment (so a reload doesn't re-trigger it). */
export function readSignFragment(): string | null {
  if (typeof window === "undefined") return null;
  const m = /[#&]sign=([^&]+)/.exec(window.location.hash);
  return m ? m[1] : null;
}

/** Downscale a dataURL image for compact transport in the link. */
export function downscaleDataUrl(dataUrl: string, maxDim = 500, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      // Keep PNG for signatures (alpha); JPEG for everything else (smaller).
      const isPng = dataUrl.startsWith("data:image/png");
      resolve(canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export async function blobUrlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
