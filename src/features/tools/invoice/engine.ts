/**
 * Pure quote/invoice engine — NO React, NO side effects.
 * Input: InvoiceDoc. Output: InvoiceTotals.
 */

export type DocType = "quote" | "invoice";
export type DiscountMode = "none" | "percent" | "amount";
export type Currency = "ILS" | "USD" | "EUR" | "GBP";

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
  validDays: number; // quote: validity
  dueDays: number; // invoice: payment terms

  // Items
  items: LineItem[];

  // Settings
  currency: Currency;
  vatRate: number; // %
  pricesIncludeVat: boolean;
  discountMode: DiscountMode;
  discountValue: number; // % or money depending on mode
  accentColor: string; // document brand color

  // Free text
  payInfo: string; // payment / bank details (invoice)
  notes: string;
};

export type InvoiceTotals = {
  subtotal: number; // sum of lines, in entered terms
  discount: number;
  net: number; // pre-VAT base
  vat: number;
  total: number;
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  ILS: "₪",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const CURRENCY_LOCALE: Record<Currency, string> = {
  ILS: "he-IL",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export function formatMoney(v: number, currency: Currency): string {
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/** Stable-ish id for new line items / saved docs (no crypto dependency). */
export function newItemId(): string {
  return `it_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function lineTotal(it: LineItem): number {
  const q = Number.isFinite(it.qty) ? it.qty : 0;
  const p = Number.isFinite(it.price) ? it.price : 0;
  return q * p;
}

/** Readable ink (#fff / dark) for text placed on a hex background. */
export function readableOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1a1a22" : "#ffffff";
}

export function calcTotals(doc: InvoiceDoc): InvoiceTotals {
  const rate = clamp(doc.vatRate, 0, 100) / 100;
  const rawSum = doc.items.reduce((s, it) => s + lineTotal(it), 0);

  let discount = 0;
  if (doc.discountMode === "percent") {
    discount = rawSum * (clamp(doc.discountValue, 0, 100) / 100);
  } else if (doc.discountMode === "amount") {
    discount = clamp(doc.discountValue, 0, rawSum);
  }

  const afterDiscount = rawSum - discount;

  if (doc.pricesIncludeVat) {
    // Entered prices already contain VAT — back it out.
    const net = rate > 0 ? afterDiscount / (1 + rate) : afterDiscount;
    const vat = afterDiscount - net;
    return { subtotal: rawSum, discount, net, vat, total: afterDiscount };
  }

  const vat = afterDiscount * rate;
  return { subtotal: rawSum, discount, net: afterDiscount, vat, total: afterDiscount + vat };
}

/** Next sequential document number (numeric string → +1; otherwise unchanged). */
export function nextDocNumber(current: string): string {
  const m = /^(\D*)(\d+)(\D*)$/.exec(current.trim());
  if (!m) return current;
  const width = m[2].length;
  const next = String(Number(m[2]) + 1).padStart(width, "0");
  return `${m[1]}${next}${m[3]}`;
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
  dueDays: 30,

  items: [{ id: newItemId(), desc: "שירות / מוצר", qty: 1, price: 1000 }],

  currency: "ILS",
  vatRate: DEFAULT_VAT,
  pricesIncludeVat: false,
  discountMode: "none",
  discountValue: 0,
  accentColor: "#8a6327",

  payInfo: "",
  notes: "תוקף ההצעה 14 יום. המחירים אינם כוללים מע״מ אלא אם צוין אחרת.",
};
