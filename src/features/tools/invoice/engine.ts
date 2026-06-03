/**
 * Pure quote/invoice engine — NO React, NO side effects.
 * Input: InvoiceDoc. Output: InvoiceTotals.
 */

export type DocType = "quote" | "invoice";
export type DiscountMode = "none" | "percent" | "amount";

export type LineItem = {
  id: string;
  desc: string;
  qty: number;
  price: number;
};

export type InvoiceDoc = {
  docType: DocType;

  // Business (issuer)
  bizName: string;
  bizId: string;
  bizAddr: string;
  bizPhone: string;
  bizEmail: string;
  bizLogo: string | null; // dataURL

  // Client (recipient)
  clientName: string;
  clientId: string;
  clientAddr: string;

  // Meta
  docNumber: string;
  issueDate: string; // YYYY-MM-DD
  validDays: number;

  // Items
  items: LineItem[];

  // Settings
  vatRate: number; // %
  discountMode: DiscountMode;
  discountValue: number; // % or ₪ depending on mode

  notes: string;
};

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  net: number;
  vat: number;
  total: number;
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/** Stable-ish id for new line items (no crypto dependency). */
export function newItemId(): string {
  return `it_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function lineTotal(it: LineItem): number {
  const q = Number.isFinite(it.qty) ? it.qty : 0;
  const p = Number.isFinite(it.price) ? it.price : 0;
  return q * p;
}

export function calcTotals(doc: InvoiceDoc): InvoiceTotals {
  const subtotal = doc.items.reduce((s, it) => s + lineTotal(it), 0);

  let discount = 0;
  if (doc.discountMode === "percent") {
    discount = subtotal * (clamp(doc.discountValue, 0, 100) / 100);
  } else if (doc.discountMode === "amount") {
    discount = clamp(doc.discountValue, 0, subtotal);
  }

  const net = subtotal - discount;
  const vat = net * (clamp(doc.vatRate, 0, 100) / 100);
  const total = net + vat;

  return { subtotal, discount, net, vat, total };
}

/** ₪18 — current Israeli VAT (since Jan 2025). */
export const DEFAULT_VAT = 18;

export const defaultDoc: InvoiceDoc = {
  docType: "quote",

  bizName: "שם העסק שלך",
  bizId: "",
  bizAddr: "",
  bizPhone: "",
  bizEmail: "",
  bizLogo: null,

  clientName: "",
  clientId: "",
  clientAddr: "",

  docNumber: "1001",
  issueDate: new Date().toISOString().slice(0, 10),
  validDays: 14,

  items: [
    { id: newItemId(), desc: "שירות / מוצר", qty: 1, price: 1000 },
  ],

  vatRate: DEFAULT_VAT,
  discountMode: "none",
  discountValue: 0,

  notes: "תוקף ההצעה 14 יום. המחירים אינם כוללים מע״מ אלא אם צוין אחרת.",
};
