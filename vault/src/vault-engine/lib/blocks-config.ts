/**
 * Blocks Config — field schema for every block type (drives the builder forms).
 * Vendored into the Astro vault; backend-free.
 */

import type { VaultBlockType } from "../vaultBlockComponents";
import { ANIMATION_PRESET_OPTIONS } from "./utils";
import type { PaletteRole } from "./palette";
import { TYPOGRAPHY_DEFAULTS } from "./typography-defaults";

export const BLOCK_TABS = ["content", "appearance", "typography"] as const;
export type BlockTab = (typeof BLOCK_TABS)[number];

export type BlockField = {
  name: string;
  label: string;
  type: "string" | "textarea" | "image" | "select" | "palette";
  required?: boolean;
  tab?: BlockTab;
  options?: { value: string; label: string }[];
};

export const PALETTE_FIELD: BlockField = {
  name: "paletteId",
  label: "פלטת צבעים",
  type: "palette",
  required: false,
  tab: "appearance",
};

export type BlockColorRoles = PaletteRole[];

const ANIMATION_FIELD: BlockField = {
  name: "animation",
  label: "אנימציה",
  type: "select",
  required: false,
  tab: "appearance",
  options: ANIMATION_PRESET_OPTIONS,
};

const TYPOGRAPHY_FIELDS: BlockField[] = [
  { name: "textSize", label: "גודל פונט (px)", type: "select", required: false, tab: "typography", options: [
    { value: "14", label: "14" }, { value: "16", label: "16" }, { value: "18", label: "18" }, { value: "20", label: "20" },
    { value: "22", label: "22" }, { value: "24", label: "24" }, { value: "28", label: "28" }, { value: "32", label: "32" },
  ] },
  { name: "lineHeight", label: "מרווח שורות", type: "select", required: false, tab: "typography", options: [
    { value: "1.4", label: "צמוד" }, { value: "1.5", label: "רגיל" }, { value: "1.75", label: "נוח" }, { value: "2", label: "מרחיב" },
  ] },
  { name: "letterSpacing", label: "ריווח אותיות", type: "select", required: false, tab: "typography", options: [
    { value: "-0.02em", label: "צמוד" }, { value: "0", label: "רגיל" }, { value: "0.02em", label: "מרווח" }, { value: "0.05em", label: "מרחיב" },
  ] },
  { name: "textAlign", label: "יישור", type: "select", required: false, tab: "typography", options: [
    { value: "start", label: "ימין" }, { value: "center", label: "מרכז" }, { value: "end", label: "שמאל" },
  ] },
  { name: "direction", label: "כיוון טקסט", type: "select", required: false, tab: "typography", options: [
    { value: "rtl", label: "RTL" }, { value: "ltr", label: "LTR" },
  ] },
];

export { TYPOGRAPHY_DEFAULTS };

export type BlockConfig = {
  label: string;
  group: string;
  icon: string;
  fields: BlockField[];
  defaultProps: Record<string, unknown>;
  colorRoles?: BlockColorRoles;
};

export const BLOCKS_CONFIG = {
  hero: {
    label: "Hero", group: "פריסה", icon: "Layout",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת", type: "string", required: true },
      { name: "subtitle", label: "תת-כותרת", type: "string", required: false },
      { name: "imageUrl", label: "תמונה", type: "image", required: false },
    ],
    defaultProps: { animation: "fadeUp", title: "", subtitle: "", imageUrl: "" },
  },
  imageText: {
    label: "תמונה וטקסט", group: "מדיה", icon: "ImagePlus",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת", type: "string", required: true },
      { name: "body", label: "טקסט", type: "textarea", required: true },
      { name: "imageUrl", label: "תמונה", type: "image", required: false },
      { name: "layout", label: "כיוון", type: "select", required: false, tab: "appearance", options: [
        { value: "right", label: "ימין" }, { value: "left", label: "שמאל" } ] },
      ...TYPOGRAPHY_FIELDS,
    ],
    defaultProps: { animation: "fadeUp", title: "", body: "", imageUrl: "", layout: "right", ...TYPOGRAPHY_DEFAULTS },
  },
  quote: {
    label: "ציטוט", group: "טקסטים", icon: "Quote", colorRoles: ["accent"],
    fields: [
      ANIMATION_FIELD, PALETTE_FIELD,
      { name: "text", label: "טקסט הציטוט", type: "textarea", required: true },
      { name: "author", label: "מקור", type: "string", required: false },
    ],
    defaultProps: { animation: "fadeUp", text: "", author: "", paletteId: "" },
  },
  cta: {
    label: "קורא לפעולה (CTA)", group: "פעולה", icon: "MousePointerClick", colorRoles: ["accent", "buttonBg", "buttonText"],
    fields: [
      ANIMATION_FIELD, PALETTE_FIELD,
      { name: "title", label: "כותרת", type: "string", required: true },
      { name: "buttonText", label: "טקסט כפתור", type: "string", required: true },
      { name: "buttonHref", label: "קישור", type: "string", required: true },
    ],
    defaultProps: { animation: "fadeUp", title: "", buttonText: "", buttonHref: "", paletteId: "" },
  },
  spacer: {
    label: "מרווח", group: "פריסה", icon: "Space",
    fields: [
      ANIMATION_FIELD,
      { name: "size", label: "גודל", type: "select", required: false, tab: "appearance", options: [
        { value: "small", label: "קטן" }, { value: "medium", label: "בינוני" }, { value: "large", label: "גדול" } ] },
    ],
    defaultProps: { animation: "fade", size: "medium" },
  },
  divider: {
    label: "קו מפריד", group: "פריסה", icon: "Minus", colorRoles: ["accent"],
    fields: [
      ANIMATION_FIELD, PALETTE_FIELD,
      { name: "style", label: "סגנון", type: "select", required: false, tab: "appearance", options: [
        { value: "solid", label: "קו מלא" }, { value: "dotted", label: "מנוקד" }, { value: "gradient", label: "גרדיאנט" } ] },
    ],
    defaultProps: { animation: "scale", style: "solid", paletteId: "" },
  },
  heading: {
    label: "כותרת", group: "טקסטים", icon: "Heading",
    fields: [
      ANIMATION_FIELD,
      { name: "level", label: "רמה", type: "select", required: false, tab: "appearance", options: [
        { value: "h2", label: "כותרת 2" }, { value: "h3", label: "כותרת 3" } ] },
      { name: "text", label: "טקסט", type: "string", required: true },
    ],
    defaultProps: { animation: "fadeUp", level: "h2", text: "" },
  },
  text: {
    label: "פסקת טקסט", group: "טקסטים", icon: "AlignRight",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת (אופציונלי)", type: "string", required: false },
      { name: "body", label: "תוכן", type: "textarea", required: true },
      ...TYPOGRAPHY_FIELDS,
    ],
    defaultProps: { animation: "fadeUp", title: "", body: "", ...TYPOGRAPHY_DEFAULTS },
  },
  stats: {
    label: "סטטיסטיקות", group: "פעולה", icon: "BarChart3", colorRoles: ["accent"],
    fields: [
      ANIMATION_FIELD, PALETTE_FIELD,
      { name: "layout", label: "מערך", type: "select", required: false, tab: "appearance", options: [
        { value: "row", label: "שורה" }, { value: "cards", label: "כרטיסים" }, { value: "compact", label: "קומפקטי" } ] },
      { name: "columns", label: "מספר עמודות", type: "select", required: false, tab: "appearance", options: [
        { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" } ] },
      { name: "style", label: "סגנון כרטיסים", type: "select", required: false, tab: "appearance", options: [
        { value: "minimal", label: "מינימלי" }, { value: "bordered", label: "מסגרת" }, { value: "filled", label: "רקע מלא" } ] },
      { name: "valueSize", label: "גודל ערך", type: "select", required: false, tab: "appearance", options: [
        { value: "small", label: "קטן" }, { value: "default", label: "רגיל" }, { value: "large", label: "גדול" } ] },
      { name: "align", label: "יישור", type: "select", required: false, tab: "appearance", options: [
        { value: "start", label: "ימין" }, { value: "center", label: "מרכז" }, { value: "end", label: "שמאל" } ] },
      { name: "variant", label: "סידור תווית", type: "select", required: false, tab: "appearance", options: [
        { value: "below", label: "מתחת לערך" }, { value: "above", label: "מעל הערך" }, { value: "inline", label: "בשורה אחת" } ] },
      { name: "divider", label: "מפריד בין פריטים", type: "select", required: false, tab: "appearance", options: [
        { value: "no", label: "לא" }, { value: "yes", label: "כן" } ] },
      { name: "gap", label: "רווח בין פריטים", type: "select", required: false, tab: "appearance", options: [
        { value: "tight", label: "צמוד" }, { value: "default", label: "רגיל" }, { value: "loose", label: "מרווח" } ] },
      { name: "value1", label: "ערך 1", type: "string", required: false },
      { name: "label1", label: "תווית 1", type: "string", required: false },
      { name: "value2", label: "ערך 2", type: "string", required: false },
      { name: "label2", label: "תווית 2", type: "string", required: false },
      { name: "value3", label: "ערך 3", type: "string", required: false },
      { name: "label3", label: "תווית 3", type: "string", required: false },
      { name: "value4", label: "ערך 4", type: "string", required: false },
      { name: "label4", label: "תווית 4", type: "string", required: false },
    ],
    defaultProps: { animation: "fadeUp", layout: "row", columns: "4", style: "minimal", paletteId: "", valueSize: "default", align: "center", variant: "below", divider: "no", gap: "default", value1: "", label1: "", value2: "", label2: "", value3: "", label3: "", value4: "", label4: "" },
  },
  alert: {
    label: "הדגשה", group: "טקסטים", icon: "AlertCircle",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת (אופציונלי)", type: "string", required: false },
      { name: "body", label: "תוכן", type: "textarea", required: true },
      ...TYPOGRAPHY_FIELDS,
      { name: "variant", label: "סוג", type: "select", required: false, tab: "appearance", options: [
        { value: "info", label: "מידע" }, { value: "success", label: "הצלחה" }, { value: "warning", label: "אזהרה" } ] },
    ],
    defaultProps: { animation: "fadeUp", title: "", body: "", variant: "info", ...TYPOGRAPHY_DEFAULTS },
  },
  list: {
    label: "רשימה", group: "טקסטים", icon: "List",
    fields: [
      ANIMATION_FIELD,
      { name: "body", label: "פריטים (שורה אחת לכל פריט)", type: "textarea", required: true },
      { name: "ordered", label: "מסודרת", type: "select", required: false, tab: "appearance", options: [
        { value: "no", label: "לא (נקודות)" }, { value: "yes", label: "כן (מספרים)" } ] },
    ],
    defaultProps: { animation: "fadeUp", body: "", ordered: "no" },
  },
  video: {
    label: "סרטון", group: "מדיה", icon: "Video",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת (אופציונלי)", type: "string", required: false },
      { name: "videoUrl", label: "קישור YouTube או Vimeo", type: "string", required: true },
    ],
    defaultProps: { animation: "fadeUp", title: "", videoUrl: "" },
  },
  twoCta: {
    label: "שני כפתורים", group: "פעולה", icon: "LayoutGrid",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת", type: "string", required: true },
      { name: "button1Text", label: "טקסט כפתור 1", type: "string", required: true },
      { name: "button1Href", label: "קישור כפתור 1", type: "string", required: true },
      { name: "button2Text", label: "טקסט כפתור 2", type: "string", required: true },
      { name: "button2Href", label: "קישור כפתור 2", type: "string", required: true },
    ],
    defaultProps: { animation: "fadeUp", title: "", button1Text: "", button1Href: "", button2Text: "", button2Href: "" },
  },
  faq: {
    label: "שאלות נפוצות", group: "טקסטים", icon: "HelpCircle",
    fields: [
      ANIMATION_FIELD,
      { name: "body", label: "פריטים (שאלה::תשובה בכל שורה)", type: "textarea", required: true },
      { name: "defaultOpen", label: "פתיחה התחלתית", type: "select", required: false, tab: "appearance", options: [
        { value: "first", label: "פריט ראשון פתוח" }, { value: "none", label: "הכל סגור" } ] },
    ],
    defaultProps: { animation: "fadeUp", body: "", defaultOpen: "first" },
  },
  iconFeature: {
    label: "אייקון וטקסט", group: "טקסטים", icon: "Zap", colorRoles: ["accent"],
    fields: [
      ANIMATION_FIELD, PALETTE_FIELD,
      { name: "icon", label: "אייקון", type: "select", required: false, tab: "appearance", options: [
        { value: "zap", label: "ברק" }, { value: "target", label: "מטרה" }, { value: "trendingUp", label: "עלייה" },
        { value: "shield", label: "מגן" }, { value: "clock", label: "שעון" }, { value: "users", label: "משתמשים" } ] },
      { name: "title", label: "כותרת", type: "string", required: true },
      { name: "body", label: "תוכן", type: "textarea", required: true },
      { name: "layout", label: "כיוון", type: "select", required: false, tab: "appearance", options: [
        { value: "right", label: "ימין" }, { value: "left", label: "שמאל" } ] },
      ...TYPOGRAPHY_FIELDS,
    ],
    defaultProps: { animation: "fadeUp", icon: "zap", title: "", body: "", layout: "right", paletteId: "", ...TYPOGRAPHY_DEFAULTS },
  },
  checklist: {
    label: "רשימת סימון", group: "טקסטים", icon: "CheckSquare",
    fields: [
      ANIMATION_FIELD,
      { name: "body", label: "פריטים (שורה אחת לכל פריט)", type: "textarea", required: true },
      { name: "style", label: "סגנון", type: "select", required: false, tab: "appearance", options: [
        { value: "check", label: "סימון" }, { value: "minimal", label: "מינימלי" } ] },
    ],
    defaultProps: { animation: "fadeUp", body: "", style: "check" },
  },
  pricing: {
    label: "כרטיס מחיר", group: "פעולה", icon: "CreditCard",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת", type: "string", required: true },
      { name: "price", label: "מחיר", type: "string", required: true },
      { name: "period", label: "תדירות", type: "select", required: false, tab: "appearance", options: [
        { value: "monthly", label: "חודשי" }, { value: "yearly", label: "שנתי" }, { value: "once", label: "חד־פעמי" } ] },
      { name: "features", label: "יתרונות (שורה לכל פריט)", type: "textarea", required: false },
      { name: "buttonText", label: "טקסט כפתור", type: "string", required: false },
      { name: "buttonHref", label: "קישור כפתור", type: "string", required: false },
      { name: "highlighted", label: "הדגשה", type: "select", required: false, tab: "appearance", options: [
        { value: "no", label: "לא" }, { value: "yes", label: "כן" } ] },
    ],
    defaultProps: { animation: "fadeUp", title: "", price: "", period: "monthly", features: "", buttonText: "", buttonHref: "", highlighted: "no" },
  },
  timeline: {
    label: "ציר זמן", group: "טקסטים", icon: "GitBranch",
    fields: [
      ANIMATION_FIELD,
      { name: "step1Title", label: "שלב 1 – כותרת", type: "string", required: false },
      { name: "step1Desc", label: "שלב 1 – תיאור", type: "string", required: false },
      { name: "step2Title", label: "שלב 2 – כותרת", type: "string", required: false },
      { name: "step2Desc", label: "שלב 2 – תיאור", type: "string", required: false },
      { name: "step3Title", label: "שלב 3 – כותרת", type: "string", required: false },
      { name: "step3Desc", label: "שלב 3 – תיאור", type: "string", required: false },
      { name: "step4Title", label: "שלב 4 – כותרת", type: "string", required: false },
      { name: "step4Desc", label: "שלב 4 – תיאור", type: "string", required: false },
    ],
    defaultProps: { animation: "fadeUp", step1Title: "", step1Desc: "", step2Title: "", step2Desc: "", step3Title: "", step3Desc: "", step4Title: "", step4Desc: "" },
  },
  embed: {
    label: "הטמעה", group: "מדיה", icon: "Code2",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת (אופציונלי)", type: "string", required: false },
      { name: "embedUrl", label: "קישור (YouTube, Vimeo, Loom)", type: "string", required: true },
    ],
    defaultProps: { animation: "fadeUp", title: "", embedUrl: "" },
  },
  callout: {
    label: "טיפ/הערה", group: "טקסטים", icon: "Lightbulb",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת", type: "string", required: false },
      { name: "body", label: "תוכן", type: "textarea", required: true },
      ...TYPOGRAPHY_FIELDS,
      { name: "variant", label: "סוג", type: "select", required: false, tab: "appearance", options: [
        { value: "tip", label: "טיפ" }, { value: "important", label: "חשוב" }, { value: "note", label: "הערה" } ] },
      { name: "size", label: "גודל", type: "select", required: false, tab: "appearance", options: [
        { value: "default", label: "רגיל" }, { value: "compact", label: "קומפקטי" } ] },
    ],
    defaultProps: { animation: "fadeUp", title: "", body: "", variant: "tip", size: "default", ...TYPOGRAPHY_DEFAULTS },
  },
  personCard: {
    label: "כרטיס איש", group: "מדיה", icon: "User",
    fields: [
      ANIMATION_FIELD,
      { name: "imageUrl", label: "תמונה", type: "image", required: false },
      { name: "name", label: "שם", type: "string", required: true },
      { name: "role", label: "תפקיד", type: "string", required: false },
      { name: "bio", label: "תיאור קצר", type: "textarea", required: false },
      { name: "layout", label: "פריסה", type: "select", required: false, tab: "appearance", options: [
        { value: "horizontal", label: "אופקי" }, { value: "vertical", label: "אנכי" } ] },
    ],
    defaultProps: { animation: "fadeUp", imageUrl: "", name: "", role: "", bio: "", layout: "horizontal" },
  },
  codeSnippet: {
    label: "קטע קוד", group: "טקסטים", icon: "FileCode",
    fields: [
      ANIMATION_FIELD,
      { name: "title", label: "כותרת (אופציונלי)", type: "string", required: false },
      { name: "code", label: "קוד", type: "textarea", required: true },
      { name: "language", label: "שפה", type: "select", required: false, tab: "appearance", options: [
        { value: "text", label: "טקסט" }, { value: "javascript", label: "JavaScript" }, { value: "typescript", label: "TypeScript" },
        { value: "html", label: "HTML" }, { value: "css", label: "CSS" } ] },
      { name: "wrap", label: "גלישת שורות", type: "select", required: false, tab: "appearance", options: [
        { value: "no", label: "לא" }, { value: "yes", label: "כן" } ] },
    ],
    defaultProps: { animation: "fadeUp", title: "", code: "", language: "text", wrap: "no" },
  },
  progressBar: {
    label: "סרגל התקדמות", group: "פעולה", icon: "Gauge",
    fields: [
      ANIMATION_FIELD,
      { name: "label", label: "תווית", type: "string", required: true },
      { name: "value", label: "ערך (0-100)", type: "string", required: true },
      { name: "variant", label: "סגנון", type: "select", required: false, tab: "appearance", options: [
        { value: "bar", label: "סרגל" }, { value: "compact", label: "קומפקטי" } ] },
    ],
    defaultProps: { animation: "fadeUp", label: "", value: "50", variant: "bar" },
  },
} as const satisfies Record<VaultBlockType, BlockConfig>;

export function getBlockConfigByType(type: string): BlockConfig | undefined {
  if (type in BLOCKS_CONFIG) return BLOCKS_CONFIG[type as VaultBlockType];
  return undefined;
}

export const BLOCK_TYPES = Object.keys(BLOCKS_CONFIG) as Array<keyof typeof BLOCKS_CONFIG>;

export const BLOCK_TAB_LABELS: Record<BlockTab, string> = {
  content: "תוכן",
  appearance: "מראה",
  typography: "טיפוגרפיה",
};

export function getFieldTab(field: BlockField): BlockTab {
  return field.tab ?? "content";
}

export function getFieldsByTab(fields: BlockField[]): Record<BlockTab, BlockField[]> {
  const result: Record<BlockTab, BlockField[]> = { content: [], appearance: [], typography: [] };
  for (const field of fields) result[getFieldTab(field)].push(field);
  return result;
}

export const BLOCK_GROUP_ORDER = ["פריסה", "טקסטים", "מדיה", "פעולה"] as const;

export function getBlocksByGroup(): { group: string; types: string[] }[] {
  const byGroup: Record<string, string[]> = {};
  for (const type of BLOCK_TYPES) {
    const group = BLOCKS_CONFIG[type].group;
    (byGroup[group] ||= []).push(type);
  }
  return BLOCK_GROUP_ORDER.filter((g) => byGroup[g]).map((group) => ({ group, types: byGroup[group] || [] }));
}
