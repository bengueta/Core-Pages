"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { FileText, Home, Plus, Printer, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { useTheme } from "next-themes";

import {
  ActionButton,
  HebrewDatePicker,
  IOSInput,
  Section,
  SegmentedControl,
  getTokens,
  glass,
} from "../shared";
import type { Tokens } from "../shared";
import {
  calcTotals,
  defaultDoc,
  lineTotal,
  newItemId,
  type DiscountMode,
  type DocType,
  type InvoiceDoc,
  type LineItem,
} from "./engine";

const STORAGE_KEY = "tool_invoice_doc";
const MAX_LOGO_BYTES = 600 * 1024; // ~600KB cap for an inline dataURL logo

const DOC_TITLES: Record<DocType, string> = {
  quote: "הצעת מחיר",
  invoice: "חשבונית עסקה",
};

/** Currency with agorot — invoices need cents-level precision. */
function money(v: number): string {
  if (!Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function freshDoc(): InvoiceDoc {
  return {
    ...defaultDoc,
    issueDate: new Date().toISOString().slice(0, 10),
    items: [{ id: newItemId(), desc: "שירות / מוצר", qty: 1, price: 1000 }],
  };
}

/* ─────────────────────────── small editor fields ─────────────────────────── */

function TextField({
  tokens,
  label,
  value,
  onChange,
  placeholder,
  dir = "rtl",
  last = false,
}: {
  tokens: Tokens;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "rtl" | "ltr";
  last?: boolean;
}) {
  return (
    <div style={{ padding: "10px 16px", borderBottom: last ? undefined : `0.5px solid ${tokens.sep}` }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: tokens.label3,
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          color: tokens.label1,
          fontSize: 15,
          fontWeight: 500,
          fontFamily: "inherit",
          outline: "none",
        }}
      />
    </div>
  );
}

function AreaField({
  tokens,
  label,
  value,
  onChange,
  placeholder,
}: {
  tokens: Tokens;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ padding: "10px 16px" }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: tokens.label3,
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir="rtl"
        rows={3}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          color: tokens.label1,
          fontSize: 15,
          fontWeight: 500,
          fontFamily: "inherit",
          outline: "none",
          resize: "vertical",
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}

function ItemRow({
  tokens,
  item,
  onChange,
  onRemove,
  canRemove,
  last,
}: {
  tokens: Tokens;
  item: LineItem;
  onChange: (patch: Partial<LineItem>) => void;
  onRemove: () => void;
  canRemove: boolean;
  last: boolean;
}) {
  return (
    <div style={{ padding: "12px 14px", borderBottom: last ? undefined : `0.5px solid ${tokens.sep}` }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input
          value={item.desc}
          onChange={(e) => onChange({ desc: e.target.value })}
          placeholder="תיאור הפריט"
          dir="rtl"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            color: tokens.label1,
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="הסר פריט"
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: tokens.r10,
            border: "none",
            background: canRemove ? `${tokens.red}18` : tokens.fill4,
            color: canRemove ? tokens.red : tokens.label4,
            cursor: canRemove ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.label3 }}>כמות</span>
          <IOSInput tokens={tokens} value={item.qty} onChange={(v) => onChange({ qty: v })} small />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.label3 }}>מחיר</span>
          <IOSInput tokens={tokens} value={item.price} onChange={(v) => onChange({ price: v })} pre="₪" small />
        </div>
        <div style={{ marginInlineStart: "auto", textAlign: "end" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.label3, display: "block" }}>סה״כ</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: tokens.label1 }}>{money(lineTotal(item))}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── the printable paper ─────────────────────────── */

const PAPER_INK = "#1a1a22";
const PAPER_MUTED = "#6b7280";
const PAPER_LINE = "#e5e7eb";
const PAPER_ACCENT = "#8a6327";

function InvoiceDocument({ doc }: { doc: InvoiceDoc }) {
  const totals = calcTotals(doc);
  const title = DOC_TITLES[doc.docType];
  const validUntil = addDays(doc.issueDate, doc.validDays);

  const cellHead: React.CSSProperties = {
    padding: "9px 12px",
    fontSize: 11.5,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "0.02em",
  };
  const cell: React.CSSProperties = {
    padding: "11px 12px",
    fontSize: 13,
    color: PAPER_INK,
    borderBottom: `1px solid ${PAPER_LINE}`,
    verticalAlign: "top",
  };

  return (
    <div
      dir="rtl"
      style={{
        background: "#ffffff",
        color: PAPER_INK,
        padding: "40px 40px 32px",
        fontFamily: "inherit",
        lineHeight: 1.5,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", minWidth: 0 }}>
          {doc.bizLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.bizLogo}
              alt=""
              style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8, flexShrink: 0 }}
            />
          ) : null}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: PAPER_INK, letterSpacing: "-0.01em" }}>
              {doc.bizName || "שם העסק"}
            </div>
            {doc.bizId ? (
              <div style={{ fontSize: 12, color: PAPER_MUTED, marginTop: 2 }}>ח.פ / עוסק: {doc.bizId}</div>
            ) : null}
            {doc.bizAddr ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>{doc.bizAddr}</div> : null}
            {doc.bizPhone ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>טל׳ {doc.bizPhone}</div> : null}
            {doc.bizEmail ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>{doc.bizEmail}</div> : null}
          </div>
        </div>

        <div style={{ textAlign: "start", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: PAPER_ACCENT,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 12, color: PAPER_MUTED, marginTop: 6 }}>
            מספר: <span style={{ color: PAPER_INK, fontWeight: 600 }}>{doc.docNumber || "—"}</span>
          </div>
          <div style={{ fontSize: 12, color: PAPER_MUTED }}>
            תאריך: <span style={{ color: PAPER_INK, fontWeight: 600 }}>{formatDate(doc.issueDate)}</span>
          </div>
          {doc.docType === "quote" ? (
            <div style={{ fontSize: 12, color: PAPER_MUTED }}>
              בתוקף עד: <span style={{ color: PAPER_INK, fontWeight: 600 }}>{formatDate(validUntil)}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ height: 3, background: PAPER_ACCENT, borderRadius: 3, margin: "20px 0 0" }} />

      {/* Client */}
      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: PAPER_ACCENT, letterSpacing: "0.06em" }}>לכבוד</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: PAPER_INK, marginTop: 3 }}>
          {doc.clientName || "שם הלקוח"}
        </div>
        {doc.clientId ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>ח.פ / ת.ז: {doc.clientId}</div> : null}
        {doc.clientAddr ? <div style={{ fontSize: 12, color: PAPER_MUTED }}>{doc.clientAddr}</div> : null}
      </div>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 22 }}>
        <thead>
          <tr style={{ background: PAPER_ACCENT }}>
            <th style={{ ...cellHead, textAlign: "right", borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>
              תיאור
            </th>
            <th style={{ ...cellHead, textAlign: "center", width: 70 }}>כמות</th>
            <th style={{ ...cellHead, textAlign: "start", width: 110 }}>מחיר יחידה</th>
            <th style={{ ...cellHead, textAlign: "start", width: 120, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>
              סה״כ
            </th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((it) => (
            <tr key={it.id}>
              <td style={{ ...cell, fontWeight: 600 }}>{it.desc || "—"}</td>
              <td style={{ ...cell, textAlign: "center" }}>{Number.isFinite(it.qty) ? it.qty : 0}</td>
              <td style={{ ...cell, textAlign: "start" }}>{money(it.price)}</td>
              <td style={{ ...cell, textAlign: "start", fontWeight: 700 }}>{money(lineTotal(it))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 18 }}>
        <div style={{ width: 280, maxWidth: "100%" }}>
          <TotalRow label="סכום ביניים" value={money(totals.subtotal)} />
          {totals.discount > 0 ? (
            <TotalRow label="הנחה" value={`- ${money(totals.discount)}`} />
          ) : null}
          {totals.discount > 0 ? <TotalRow label="סה״כ לפני מע״מ" value={money(totals.net)} /> : null}
          <TotalRow label={`מע״מ ${doc.vatRate}%`} value={money(totals.vat)} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              padding: "11px 14px",
              background: PAPER_ACCENT,
              borderRadius: 10,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>סה״כ לתשלום</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{money(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {doc.notes.trim() ? (
        <div style={{ marginTop: 26, paddingTop: 16, borderTop: `1px solid ${PAPER_LINE}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: PAPER_ACCENT, letterSpacing: "0.06em", marginBottom: 5 }}>
            הערות ותנאים
          </div>
          <div style={{ fontSize: 12, color: PAPER_MUTED, whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{doc.notes}</div>
        </div>
      ) : null}

      <div style={{ marginTop: 26, textAlign: "center", fontSize: 11, color: PAPER_MUTED }}>
        תודה על שיתוף הפעולה · {doc.bizName || ""}
      </div>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 14px",
        fontSize: 13,
      }}
    >
      <span style={{ color: PAPER_MUTED }}>{label}</span>
      <span style={{ color: PAPER_INK, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────────── main shell ─────────────────────────────── */

export function InvoiceShell() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark" || !mounted;
  const tokens = getTokens(isDark);

  const [doc, setDoc] = useState<InvoiceDoc>(defaultDoc);
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Load once mounted.
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<InvoiceDoc>;
        setDoc((prev) => ({
          ...prev,
          ...parsed,
          items: Array.isArray(parsed.items) && parsed.items.length ? parsed.items : prev.items,
        }));
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, [mounted]);

  // Persist on change.
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [doc, mounted]);

  const set = <K extends keyof InvoiceDoc>(k: K, v: InvoiceDoc[K]) =>
    setDoc((prev) => ({ ...prev, [k]: v }));

  const totals = useMemo(() => calcTotals(doc), [doc]);

  const addItem = () =>
    setDoc((prev) => ({
      ...prev,
      items: [...prev.items, { id: newItemId(), desc: "", qty: 1, price: 0 }],
    }));

  const patchItem = (id: string, patch: Partial<LineItem>) =>
    setDoc((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));

  const removeItem = (id: string) =>
    setDoc((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((it) => it.id !== id) : prev.items,
    }));

  const onLogoPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("יש לבחור קובץ תמונה");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("הלוגו גדול מדי (עד 600KB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoError(null);
      set("bizLogo", typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const doPrint = () => window.print();

  const resetAll = () => {
    if (typeof window !== "undefined" && !window.confirm("לאפס את כל הטופס?")) return;
    setDoc(freshDoc());
    setLogoError(null);
  };

  if (!mounted) {
    return <div style={{ minHeight: "100vh", background: "#09090b" }} aria-hidden />;
  }

  const discountOptions: Array<{ value: DiscountMode; label: string }> = [
    { value: "none", label: "ללא" },
    { value: "percent", label: "אחוז" },
    { value: "amount", label: "סכום" },
  ];

  return (
    <div dir="rtl" id="tools-invoice" style={{ minHeight: "100vh", color: tokens.label1, overflowX: "hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box}
        #tools-invoice{
          font-family: var(--font-heebo), -apple-system, BlinkMacSystemFont, "SF Pro Display","SF Pro Text","Helvetica Neue", system-ui, sans-serif;
          -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
        }
        #tools-invoice #bg{position:fixed;inset:0;z-index:0;
          background:
            radial-gradient(ellipse 120% 75% at 90% 0%, rgba(138,99,39,.20) 0%, transparent 52%),
            radial-gradient(ellipse 75% 65% at 0% 95%, rgba(10,132,255,.14) 0%, transparent 52%),
            radial-gradient(ellipse 60% 55% at 50% 50%, rgba(94,92,230,.10) 0%, transparent 60%),
            linear-gradient(158deg, ${isDark ? "#0c1018 0%, #0a0d15 50%, #07090f 100%" : "#f4f4f6 0%, #ececef 100%"});
        }
        #tools-invoice #page{position:relative;z-index:1;max-width:1280px;margin:0 auto;padding:40px 16px 80px}
        @media(min-width:1040px){#tools-invoice #page{padding:52px 40px 80px}}

        .inv-grid{display:grid;grid-template-columns:1fr;gap:28px;align-items:start}
        @media(min-width:1040px){.inv-grid{grid-template-columns:minmax(0,1fr) minmax(440px,1fr);gap:36px}}

        .inv-paper-scroll{overflow:auto}
        @media(min-width:1040px){.inv-paper-scroll{position:sticky;top:24px}}

        #invoice-doc{
          background:#fff;border-radius:14px;overflow:hidden;
          box-shadow:0 1px 2px rgba(0,0,0,.18),0 18px 50px rgba(0,0,0,.32);
        }

        #tools-invoice input::placeholder,
        #tools-invoice textarea::placeholder{color:${tokens.label4}}

        @media print{
          @page{margin:12mm}
          html,body{background:#fff !important}
          #tools-invoice{color:#000 !important;min-height:0 !important}
          #tools-invoice #bg,.inv-no-print{display:none !important}
          #tools-invoice #page{padding:0 !important;max-width:none !important}
          .inv-grid{display:block !important}
          .inv-paper-scroll{position:static !important;overflow:visible !important}
          #invoice-doc{box-shadow:none !important;border-radius:0 !important;margin:0 !important;width:100% !important}
        }
      `}</style>

      <div id="bg" />

      <div id="page">
        <header className="inv-no-print" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                ...glass("ultra"),
                borderRadius: 999,
                padding: "8px 14px 8px 16px",
              }}
            >
              <FileText size={22} style={{ color: tokens.label2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", color: tokens.label2 }}>
                Quote / Invoice
              </span>
            </div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                ...glass("ultra"),
                borderRadius: 999,
                padding: "8px 14px 8px 16px",
                textDecoration: "none",
                color: tokens.label2,
              }}
            >
              <Home size={22} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.02em" }}>חזרה לדף הבית</span>
            </Link>
          </div>
          <h1 style={{ fontSize: "clamp(34px,5.5vw,52px)", fontWeight: 800, letterSpacing: "-0.036em", lineHeight: 1.05, marginBottom: 10 }}>
            הצעת מחיר / חשבונית
          </h1>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.68, color: tokens.label2, maxWidth: 560 }}>
            בנו מסמך עסקי מעוצב עם פריטים, הנחה ומע״מ, צפו בתצוגה חיה והדפיסו ל-PDF בקליק. הכול נשמר בדפדפן — ללא שרת.
          </p>
        </header>

        <div className="inv-grid">
          {/* ── Editor ── */}
          <div className="inv-no-print" style={{ minWidth: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <SegmentedControl<DocType>
                tokens={tokens}
                value={doc.docType}
                onChange={(v) => set("docType", v)}
                options={[
                  { value: "quote", label: "הצעת מחיר" },
                  { value: "invoice", label: "חשבונית עסקה" },
                ]}
              />
            </div>

            <Section tokens={tokens} title="פרטי העסק">
              <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${tokens.sep}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {doc.bizLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doc.bizLogo}
                      alt=""
                      style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8, background: "#fff" }}
                    />
                  ) : null}
                  <input ref={fileRef} type="file" accept="image/*" onChange={onLogoPick} style={{ display: "none" }} />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      ...glass("thin"),
                      border: `1px solid ${tokens.blue}44`,
                      background: `${tokens.blue}16`,
                      color: tokens.blue,
                      borderRadius: tokens.r10,
                      padding: "8px 13px",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <Upload size={14} />
                    {doc.bizLogo ? "החלף לוגו" : "העלאת לוגו"}
                  </button>
                  {doc.bizLogo ? (
                    <button
                      type="button"
                      onClick={() => set("bizLogo", null)}
                      aria-label="הסר לוגו"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        border: "none",
                        background: "transparent",
                        color: tokens.label3,
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} />
                      הסר
                    </button>
                  ) : null}
                </div>
                {logoError ? (
                  <p style={{ fontSize: 12, color: tokens.red, marginTop: 8 }}>{logoError}</p>
                ) : null}
              </div>
              <TextField tokens={tokens} label="שם העסק" value={doc.bizName} onChange={(v) => set("bizName", v)} placeholder="שם העסק שלך" />
              <TextField tokens={tokens} label="ח.פ / עוסק מורשה" value={doc.bizId} onChange={(v) => set("bizId", v)} placeholder="מספר עוסק" dir="ltr" />
              <TextField tokens={tokens} label="כתובת" value={doc.bizAddr} onChange={(v) => set("bizAddr", v)} placeholder="רחוב, עיר" />
              <TextField tokens={tokens} label="טלפון" value={doc.bizPhone} onChange={(v) => set("bizPhone", v)} placeholder="050-0000000" dir="ltr" />
              <TextField tokens={tokens} label="אימייל" value={doc.bizEmail} onChange={(v) => set("bizEmail", v)} placeholder="name@email.com" dir="ltr" last />
            </Section>

            <Section tokens={tokens} title="פרטי הלקוח">
              <TextField tokens={tokens} label="שם הלקוח" value={doc.clientName} onChange={(v) => set("clientName", v)} placeholder="שם הלקוח / החברה" />
              <TextField tokens={tokens} label="ח.פ / ת.ז" value={doc.clientId} onChange={(v) => set("clientId", v)} placeholder="מספר מזהה" dir="ltr" />
              <TextField tokens={tokens} label="כתובת" value={doc.clientAddr} onChange={(v) => set("clientAddr", v)} placeholder="רחוב, עיר" last />
            </Section>

            <Section tokens={tokens} title="פרטי המסמך">
              <TextField tokens={tokens} label="מספר מסמך" value={doc.docNumber} onChange={(v) => set("docNumber", v)} placeholder="1001" dir="ltr" />
              <div style={{ padding: "10px 16px", borderBottom: `0.5px solid ${tokens.sep}` }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: tokens.label3, marginBottom: 6 }}>
                  תאריך הנפקה
                </label>
                <HebrewDatePicker tokens={tokens} value={doc.issueDate} onChange={(v) => set("issueDate", v)} />
              </div>
              {doc.docType === "quote" ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: tokens.label1 }}>תוקף (ימים)</span>
                  <IOSInput tokens={tokens} value={doc.validDays} onChange={(v) => set("validDays", v)} suf="ימים" />
                </div>
              ) : null}
            </Section>

            <Section tokens={tokens} title="פריטים">
              {doc.items.map((it, i) => (
                <ItemRow
                  key={it.id}
                  tokens={tokens}
                  item={it}
                  onChange={(patch) => patchItem(it.id, patch)}
                  onRemove={() => removeItem(it.id)}
                  canRemove={doc.items.length > 1}
                  last={i === doc.items.length - 1}
                />
              ))}
              <div style={{ padding: "12px 14px", borderTop: `0.5px solid ${tokens.sep}` }}>
                <ActionButton tokens={tokens} color={tokens.blue} onPress={addItem} icon={<Plus size={16} />} small full>
                  הוסף פריט
                </ActionButton>
              </div>
            </Section>

            <Section tokens={tokens} title="הנחה ומע״מ">
              <div style={{ padding: "12px 16px", borderBottom: `0.5px solid ${tokens.sep}` }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: tokens.label3, marginBottom: 8 }}>
                  הנחה
                </label>
                <SegmentedControl<DiscountMode>
                  tokens={tokens}
                  value={doc.discountMode}
                  onChange={(v) => set("discountMode", v)}
                  options={discountOptions}
                />
                {doc.discountMode !== "none" ? (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                    <IOSInput
                      tokens={tokens}
                      value={doc.discountValue}
                      onChange={(v) => set("discountValue", v)}
                      pre={doc.discountMode === "amount" ? "₪" : undefined}
                      suf={doc.discountMode === "percent" ? "%" : undefined}
                    />
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: tokens.label1 }}>מע״מ</span>
                <IOSInput tokens={tokens} value={doc.vatRate} onChange={(v) => set("vatRate", v)} suf="%" />
              </div>
            </Section>

            <Section tokens={tokens} title="הערות ותנאים">
              <AreaField tokens={tokens} label="טקסט חופשי" value={doc.notes} onChange={(v) => set("notes", v)} placeholder="תנאי תשלום, תוקף, הערות…" />
            </Section>

            <div style={{ display: "flex", gap: 10 }}>
              <ActionButton tokens={tokens} color={tokens.green} onPress={doPrint} icon={<Printer size={17} />} full>
                הדפסה / שמירה כ-PDF
              </ActionButton>
              <ActionButton tokens={tokens} color={tokens.red} onPress={resetAll} icon={<RotateCcw size={16} />} small>
                איפוס
              </ActionButton>
            </div>
          </div>

          {/* ── Live paper preview ── */}
          <div className="inv-paper-scroll">
            <div id="invoice-doc">
              <InvoiceDocument doc={doc} />
            </div>
            <p className="inv-no-print" style={{ fontSize: 12, color: tokens.label3, textAlign: "center", marginTop: 12 }}>
              בחלון ההדפסה בחרו “שמירה כ-PDF” · סה״כ לתשלום {money(totals.total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
