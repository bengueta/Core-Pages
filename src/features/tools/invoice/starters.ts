"use client";

import { TEMPLATES, applyTemplate, defaultBlocks, defaultDoc, newItemId, type DocType, type InvoiceDoc } from "./engine";

export type Starter = {
  id: string;
  name: string;
  description: string;
  docType: DocType;
  accentColor: string;
};

/** Genuinely distinct base documents. Color & structure are chosen in the config step. */
export const STARTERS: Starter[] = [
  { id: "quote", name: "הצעת מחיר", description: "פריטים, הנחה ומע״מ עם סכום לתשלום ברור.", docType: "quote", accentColor: "#8a6327" },
  { id: "invoice", name: "חשבונית עסקה", description: "חשבונית עם פרטי תשלום ותאריך לתשלום.", docType: "invoice", accentColor: "#0a84ff" },
  { id: "contract", name: "חוזה עבודה", description: "סעיפי התקשרות וחתימת שני הצדדים.", docType: "contract", accentColor: "#1f6f5c" },
];

/** Structure options (layout), independent of color. */
export type Structure = { id: string; name: string; templateId?: string };
export const STRUCTURES: Structure[] = [
  { id: "classic", name: "קלאסי", templateId: "classic" },
  { id: "centered", name: "ממורכז", templateId: "minimal" },
  { id: "detailed", name: "מפורט", templateId: "modern" },
];

function baseDoc(docType: DocType, accent: string): InvoiceDoc {
  return {
    ...defaultDoc,
    docType,
    accentColor: accent,
    issueDate: new Date().toISOString().slice(0, 10),
    items: docType === "contract" ? [] : [{ id: newItemId(), desc: "שירות / מוצר", qty: 1, price: 1000 }],
    notes: docType === "contract" ? "הסכם זה כפוף לתנאים המפורטים לעיל." : defaultDoc.notes,
    blocks: defaultBlocks(docType),
  };
}

export function buildStarter(s: Starter): InvoiceDoc {
  return baseDoc(s.docType, s.accentColor);
}

/** Build a document from the config step (type + structure + color). */
export function buildConfigured(docType: DocType, structureId: string, accent: string): InvoiceDoc {
  let doc = baseDoc(docType, accent);
  const st = STRUCTURES.find((s) => s.id === structureId);
  if (st?.templateId) {
    const tpl = TEMPLATES.find((t) => t.id === st.templateId);
    if (tpl) doc = { ...doc, blocks: applyTemplate(doc.blocks, tpl) };
  }
  doc.accentColor = accent; // keep the chosen color (templates carry their own)
  return doc;
}

/** A representative sample for gallery / config previews. */
export function previewDoc(docType: DocType, structureId: string, accent: string): InvoiceDoc {
  const d = buildConfigured(docType, structureId, accent);
  return {
    ...d,
    bizName: "שם העסק",
    bizId: "",
    clientName: "לקוח לדוגמה",
    docNumber: "1001",
    items:
      docType === "contract"
        ? []
        : [
            { id: "p1", desc: "שירות לדוגמה", qty: 2, price: 1500 },
            { id: "p2", desc: "פריט נוסף", qty: 1, price: 900 },
          ],
  };
}
