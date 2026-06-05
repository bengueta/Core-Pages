/**
 * Pure quote/invoice engine + document model — NO React, NO side effects.
 */

export type DocType = "quote" | "invoice" | "contract" | "proposal";

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  quote: "הצעת מחיר",
  invoice: "חשבונית עסקה",
  contract: "חוזה עבודה",
  proposal: "הצעה מעוצבת",
};
export type DiscountMode = "none" | "percent" | "amount";
export type Currency = "ILS" | "USD" | "EUR" | "GBP";

export type LineItem = {
  id: string;
  desc: string;
  qty: number;
  price: number;
};

/* ───────────────────────────── block model ───────────────────────────── */

export type BlockType =
  | "brand"
  | "meta"
  | "client"
  | "items"
  | "totals"
  | "signature"
  | "payment"
  | "notes"
  | "heading"
  | "bullets"
  | "terms"
  | "keyvalue"
  | "text"
  | "divider"
  | "spacer";

export type BlockSpan = 1 | 2;
export type BlockAlign = "right" | "center" | "left";

export type Block = {
  id: string;
  type: BlockType;
  span: BlockSpan;
  hidden?: boolean;
  // freeform / per-block content
  title?: string;
  body?: string;
  align?: BlockAlign;
  signatureAssetId?: string | null;
  signerName?: string;
  height?: number; // spacer, px
  // signature block: business (from library) vs client (captured + e-sign audit)
  sigMode?: "business" | "client";
  clientSignature?: string | null; // dataURL captured on this device
  signedAt?: string; // ISO timestamp
  intent?: string; // consent statement
  signedHash?: string; // SHA-256 of the document content at signing time
  amountInWords?: boolean; // totals block: show the total in Hebrew words
};

export type BlockMeta = {
  type: BlockType;
  label: string;
  defaultSpan: BlockSpan;
  unique: boolean; // structured blocks may appear once
};

export const BLOCK_META: Record<BlockType, BlockMeta> = {
  brand: { type: "brand", label: "מיתוג / לוגו", defaultSpan: 1, unique: true },
  meta: { type: "meta", label: "פרטי מסמך", defaultSpan: 1, unique: true },
  client: { type: "client", label: "פרטי לקוח", defaultSpan: 2, unique: true },
  items: { type: "items", label: "טבלת פריטים", defaultSpan: 2, unique: true },
  totals: { type: "totals", label: "סיכום ומע״מ", defaultSpan: 2, unique: true },
  signature: { type: "signature", label: "חתימה", defaultSpan: 1, unique: false },
  payment: { type: "payment", label: "פרטי תשלום", defaultSpan: 2, unique: true },
  notes: { type: "notes", label: "הערות ותנאים", defaultSpan: 2, unique: true },
  heading: { type: "heading", label: "כותרת מקטע", defaultSpan: 2, unique: false },
  bullets: { type: "bullets", label: "רשימת נקודות", defaultSpan: 2, unique: false },
  terms: { type: "terms", label: "סעיפים ממוספרים", defaultSpan: 2, unique: false },
  keyvalue: { type: "keyvalue", label: "טבלת מפרט", defaultSpan: 2, unique: false },
  text: { type: "text", label: "טקסט חופשי", defaultSpan: 2, unique: false },
  divider: { type: "divider", label: "קו מפריד", defaultSpan: 2, unique: false },
  spacer: { type: "spacer", label: "רווח", defaultSpan: 1, unique: false },
};

/** Order shown in the "add block" menu. */
export const ADDABLE_BLOCKS: BlockType[] = [
  "brand",
  "meta",
  "client",
  "items",
  "totals",
  "signature",
  "payment",
  "notes",
  "heading",
  "bullets",
  "terms",
  "keyvalue",
  "text",
  "divider",
  "spacer",
];

export function defaultBlocks(docType: DocType): Block[] {
  const mk = (type: BlockType, span?: BlockSpan, extra?: Partial<Block>): Block => ({
    id: newItemId(),
    type,
    span: span ?? BLOCK_META[type].defaultSpan,
    ...extra,
  });

  if (docType === "proposal") {
    return [
      mk("brand", 2),
      mk("heading", 2, { title: "הצעה עבורך", body: "פתרון מותאם אישית להצלחת הפרויקט", align: "center" }),
      mk("divider", 2),
      mk("client", 2),
      mk("text", 2, { title: "על ההצעה", body: "תיאור קצר של הפתרון, הערך והיתרונות עבור הלקוח." }),
      mk("bullets", 2, { title: "מה כלול", body: "אפיון ואסטרטגיה\nעיצוב ומיתוג\nליווי ותמיכה" }),
      mk("items", 2),
      mk("totals", 2),
      mk("signature", 1, { signerName: "", align: "right", signatureAssetId: null }),
      mk("notes", 2),
    ];
  }

  if (docType === "contract") {
    return [
      mk("brand", 1),
      mk("meta", 1),
      mk("client", 2),
      mk("text", 2, { title: "מבוא", body: "הסכם זה נערך ונחתם בין הצדדים, וקובע את תנאי ההתקשרות ביניהם." }),
      mk("terms", 2, { title: "תנאי ההתקשרות", body: "היקף העבודה: …\nלוח זמנים: …\nתמורה ותנאי תשלום: …" }),
      mk("signature", 1, { sigMode: "client", title: "חתימת הלקוח", align: "right", signatureAssetId: null }),
      mk("signature", 1, { sigMode: "business", title: "חתימת נותן השירות", align: "left", signatureAssetId: null }),
      mk("notes", 2),
    ];
  }

  const blocks: Block[] = [
    mk("brand", 1),
    mk("meta", 1),
    mk("client", 2),
    mk("items", 2),
    mk("totals", 2),
  ];
  if (docType === "invoice") blocks.push(mk("payment", 2));
  blocks.push(mk("signature", 1, { signerName: "", align: "right", signatureAssetId: null }));
  blocks.push(mk("notes", 2));
  return blocks;
}

/* ───────────────────────────── asset library ─────────────────────────── */

export type AssetKind = "logo" | "signature";
export type Asset = {
  id: string;
  kind: AssetKind;
  name: string;
  dataURL: string;
  createdAt: string;
};

export const ASSETS_KEY = "tool_invoice_assets";

/* ───────────────────── client book + service catalog ─────────────────── */

export type SavedClient = { id: string; name: string; clientId?: string; addr?: string };
export type SavedService = { id: string; desc: string; price: number };
export const CLIENTS_KEY = "tool_invoice_clients";
export const SERVICES_KEY = "tool_invoice_services";

/* ──────────────────────────────── templates ──────────────────────────── */

export type Template = {
  id: string;
  name: string;
  accentColor: string;
  order: BlockType[];
  spans?: Partial<Record<BlockType, BlockSpan>>;
};

export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "קלאסי",
    accentColor: "#8a6327",
    order: ["brand", "meta", "client", "items", "totals", "signature", "notes"],
    spans: { brand: 1, meta: 1, signature: 1 },
  },
  {
    id: "minimal",
    name: "מינימלי",
    accentColor: "#1a1a22",
    order: ["brand", "meta", "client", "items", "totals", "notes", "signature"],
    spans: { brand: 2, meta: 2, signature: 2 },
  },
  {
    id: "modern",
    name: "מודרני",
    accentColor: "#0a84ff",
    order: ["brand", "meta", "client", "items", "totals", "payment", "signature", "notes"],
    spans: { brand: 1, meta: 1, signature: 1 },
  },
  {
    id: "elegant",
    name: "אלגנט",
    accentColor: "#1f6f5c",
    order: ["brand", "meta", "client", "items", "totals", "signature", "notes"],
    spans: { brand: 2, meta: 2, signature: 2 },
  },
  {
    id: "vivid",
    name: "תוסס",
    accentColor: "#e0457b",
    order: ["brand", "meta", "client", "items", "totals", "signature", "notes"],
    spans: { brand: 1, meta: 1, signature: 1 },
  },
  {
    id: "ocean",
    name: "ים",
    accentColor: "#0e7490",
    order: ["brand", "meta", "client", "items", "totals", "signature", "notes"],
    spans: { brand: 1, meta: 1, signature: 2 },
  },
  {
    id: "noir",
    name: "נואר",
    accentColor: "#111827",
    order: ["brand", "meta", "client", "items", "totals", "notes", "signature"],
    spans: { brand: 2, meta: 1, signature: 1 },
  },
];

/* ─────────────────────────────── the document ────────────────────────── */

export type InvoiceDoc = {
  docType: DocType;

  // Business (issuer)
  bizName: string;
  bizId: string;
  bizAddr: string;
  bizPhone: string;
  bizEmail: string;
  logoAssetId: string | null;

  // Client (recipient)
  clientName: string;
  clientId: string;
  clientAddr: string;

  // Meta
  docNumber: string;
  issueDate: string; // YYYY-MM-DD
  validDays: number;
  dueDays: number;

  // Items
  items: LineItem[];

  // Settings
  currency: Currency;
  vatRate: number;
  pricesIncludeVat: boolean;
  vatExempt?: boolean; // עוסק פטור — no VAT line, total = net
  discountMode: DiscountMode;
  discountValue: number;
  accentColor: string;

  // Free text
  payInfo: string;
  notes: string;

  // Layout
  blocks: Block[];
};

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  net: number;
  vat: number;
  total: number;
};

export const CURRENCY_SYMBOL: Record<Currency, string> = { ILS: "₪", USD: "$", EUR: "€", GBP: "£" };
const CURRENCY_LOCALE: Record<Currency, string> = { ILS: "he-IL", USD: "en-US", EUR: "de-DE", GBP: "en-GB" };

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

/** Stable-ish id (no crypto dependency). */
export function newItemId(): string {
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
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
  if (doc.discountMode === "percent") discount = rawSum * (clamp(doc.discountValue, 0, 100) / 100);
  else if (doc.discountMode === "amount") discount = clamp(doc.discountValue, 0, rawSum);

  const afterDiscount = rawSum - discount;

  if (doc.vatExempt) {
    return { subtotal: rawSum, discount, net: afterDiscount, vat: 0, total: afterDiscount };
  }

  if (doc.pricesIncludeVat) {
    const net = rate > 0 ? afterDiscount / (1 + rate) : afterDiscount;
    const vat = afterDiscount - net;
    return { subtotal: rawSum, discount, net, vat, total: afterDiscount };
  }
  const vat = afterDiscount * rate;
  return { subtotal: rawSum, discount, net: afterDiscount, vat, total: afterDiscount + vat };
}

/** Next sequential document number (numeric run → +1). */
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
  logoAssetId: null,

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

  blocks: defaultBlocks("quote"),
};

/** Apply a template: accent + reorder/respan unique blocks, keep extras at end. */
export function applyTemplate(blocks: Block[], tpl: Template): Block[] {
  const pool = [...blocks];
  const ordered: Block[] = [];
  for (const type of tpl.order) {
    const idx = pool.findIndex((b) => b.type === type);
    if (idx >= 0) {
      const [b] = pool.splice(idx, 1);
      ordered.push({ ...b, span: tpl.spans?.[type] ?? b.span, hidden: false });
    } else if (BLOCK_META[type].unique) {
      ordered.push({ id: newItemId(), type, span: tpl.spans?.[type] ?? BLOCK_META[type].defaultSpan });
    }
  }
  // keep any remaining (repeatable) blocks after the templated order
  return [...ordered, ...pool];
}
