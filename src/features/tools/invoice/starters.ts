"use client";

import { TEMPLATES, applyTemplate, defaultBlocks, defaultDoc, newItemId, type DocType, type InvoiceDoc } from "./engine";

export type Starter = {
  id: string;
  name: string;
  description: string;
  docType: DocType;
  accentColor: string;
  kind: "business" | "proposal"; // business = pick type+structure in config; proposal = distinct layout
};

/** Two genuinely-different starting points; type/structure/color chosen in config. */
export const STARTERS: Starter[] = [
  { id: "business", name: "מסמך עסקי", description: "הצעת מחיר · חשבונית · חוזה — בחירת סוג, מבנה וצבע.", docType: "quote", accentColor: "#8a6327", kind: "business" },
  { id: "proposal", name: "הצעה מעוצבת", description: "דף הצעה עם כותרת גדולה, רשימת ערך ותמחור.", docType: "proposal", accentColor: "#7c3aed", kind: "proposal" },
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
  // Proposal has its own purpose-built layout — don't reflow it with generic structures.
  if (docType !== "proposal") {
    const st = STRUCTURES.find((s) => s.id === structureId);
    if (st?.templateId) {
      const tpl = TEMPLATES.find((t) => t.id === st.templateId);
      if (tpl) doc = { ...doc, blocks: applyTemplate(doc.blocks, tpl) };
    }
  }
  doc.accentColor = accent;
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
