"use client";

import { TEMPLATES, applyTemplate, defaultBlocks, defaultDoc, newItemId, type DocType, type InvoiceDoc } from "./engine";

export type Starter = {
  id: string;
  name: string;
  description: string;
  docType: DocType;
  accentColor: string;
  templateId?: string; // optional style template from engine TEMPLATES
};

export const STARTERS: Starter[] = [
  { id: "quote", name: "הצעת מחיר", description: "פריטים, הנחה ומע״מ עם סכום לתשלום ברור.", docType: "quote", accentColor: "#8a6327" },
  { id: "invoice", name: "חשבונית עסקה", description: "חשבונית עם פרטי תשלום ותאריך לתשלום.", docType: "invoice", accentColor: "#0a84ff" },
  { id: "contract", name: "חוזה עבודה", description: "סעיפי התקשרות וחתימת שני הצדדים.", docType: "contract", accentColor: "#1f6f5c" },
  { id: "quote-elegant", name: "הצעת מחיר · אלגנט", description: "פריסה ממורכזת ונקייה, מיתוג מודגש.", docType: "quote", accentColor: "#111827", templateId: "elegant" },
  { id: "invoice-vivid", name: "חשבונית · תוסס", description: "חשבונית עם צבע מותג חי ובולט.", docType: "invoice", accentColor: "#e0457b", templateId: "vivid" },
  { id: "quote-ocean", name: "הצעת מחיר · ים", description: "גוון טורקיז רענן עם חתימה רחבה.", docType: "quote", accentColor: "#0e7490", templateId: "ocean" },
];

export function buildStarter(s: Starter): InvoiceDoc {
  let doc: InvoiceDoc = {
    ...defaultDoc,
    docType: s.docType,
    accentColor: s.accentColor,
    issueDate: new Date().toISOString().slice(0, 10),
    items: s.docType === "contract" ? [] : [{ id: newItemId(), desc: "שירות / מוצר", qty: 1, price: 1000 }],
    notes: s.docType === "contract" ? "הסכם זה כפוף לתנאים המפורטים לעיל." : defaultDoc.notes,
    blocks: defaultBlocks(s.docType),
  };
  if (s.templateId) {
    const tpl = TEMPLATES.find((t) => t.id === s.templateId);
    if (tpl) doc = { ...doc, accentColor: tpl.accentColor, blocks: applyTemplate(doc.blocks, tpl) };
  }
  return doc;
}

/** A representative sample for the gallery preview. */
export function previewDoc(s: Starter): InvoiceDoc {
  const d = buildStarter(s);
  return {
    ...d,
    bizName: "שם העסק",
    bizId: "",
    clientName: "לקוח לדוגמה",
    docNumber: "1001",
    items:
      s.docType === "contract"
        ? []
        : [
            { id: "p1", desc: "שירות לדוגמה", qty: 2, price: 1500 },
            { id: "p2", desc: "פריט נוסף", qty: 1, price: 900 },
          ],
  };
}
