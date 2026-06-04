"use client";

/**
 * Electronic-signature helpers — fully client-side, no server, no external services.
 * Provides a stable content hash (SHA-256) so a signed document is tamper-evident,
 * plus the default consent statement and audit formatting.
 */

import type { InvoiceDoc } from "./engine";

export const DEFAULT_INTENT =
  "אני מאשר/ת את תוכן המסמך ומסכים/ה לתנאים המפורטים בו, וחותם/ת עליו בחתימה אלקטרונית.";

/** Canonical, stable string of the document's meaningful content (order-fixed). */
export function canonicalDocString(doc: InvoiceDoc): string {
  const payload = {
    docType: doc.docType,
    docNumber: doc.docNumber,
    issueDate: doc.issueDate,
    biz: { name: doc.bizName, id: doc.bizId, addr: doc.bizAddr, phone: doc.bizPhone, email: doc.bizEmail },
    client: { name: doc.clientName, id: doc.clientId, addr: doc.clientAddr },
    items: doc.items.map((it) => ({ d: it.desc, q: it.qty, p: it.price })),
    currency: doc.currency,
    vatRate: doc.vatRate,
    pricesIncludeVat: doc.pricesIncludeVat,
    discountMode: doc.discountMode,
    discountValue: doc.discountValue,
    payInfo: doc.payInfo,
    notes: doc.notes,
  };
  return JSON.stringify(payload);
}

export async function sha256Hex(text: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    // Extremely defensive fallback (non-crypto) — should never run in a modern browser.
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
    return `nofallback${(h >>> 0).toString(16)}`;
  }
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeDocHash(doc: InvoiceDoc): Promise<string> {
  return sha256Hex(canonicalDocString(doc));
}

/** Short, human-readable hash for display in the audit line. */
export function shortHash(h: string): string {
  if (!h) return "";
  return h.length > 18 ? `${h.slice(0, 8)}…${h.slice(-8)}` : h;
}

export function formatSignedAt(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("he-IL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
