"use client";

/**
 * Remote signing without a server: the whole document is encoded into a
 * compressed URL fragment (#sign=...). The recipient opens the same static
 * site, which decodes the document, lets them sign, and produces a signed PDF
 * to send back. Nothing is uploaded — the payload lives only in the link.
 */

import type { AssetKind, InvoiceDoc } from "./engine";

export type SignPayload = {
  v: 1;
  doc: InvoiceDoc;
  assets: Array<{ id: string; kind: AssetKind; url: string }>; // url = downscaled dataURL
};

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
  const json = JSON.stringify(payload);
  if (hasCompression) return "1" + bytesToBase64Url(await gzip(json));
  return "0" + bytesToBase64Url(new TextEncoder().encode(json));
}

export async function decodeSignPayload(encoded: string): Promise<SignPayload> {
  const flag = encoded[0];
  const body = encoded.slice(1);
  const bytes = base64UrlToBytes(body);
  const json = flag === "1" ? await gunzip(bytes) : new TextDecoder().decode(bytes);
  return JSON.parse(json) as SignPayload;
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
