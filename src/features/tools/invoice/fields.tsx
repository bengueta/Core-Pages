"use client";

import { Trash2 } from "lucide-react";

import { IOSInput } from "../shared";
import type { Tokens } from "../shared";
import { formatMoney, lineTotal, type Currency, type LineItem } from "./engine";

export function TextField({
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
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: tokens.label3, marginBottom: 5 }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        style={{ width: "100%", border: "none", background: "transparent", color: tokens.label1, fontSize: 15, fontWeight: 500, fontFamily: "inherit", outline: "none" }}
      />
    </div>
  );
}

export function AreaField({
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
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", color: tokens.label3, marginBottom: 5 }}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir="rtl"
        rows={3}
        style={{ width: "100%", border: "none", background: "transparent", color: tokens.label1, fontSize: 15, fontWeight: 500, fontFamily: "inherit", outline: "none", resize: "vertical", lineHeight: 1.6 }}
      />
    </div>
  );
}

export function ItemRow({
  tokens,
  item,
  symbol,
  currency,
  onChange,
  onRemove,
  canRemove,
  last,
}: {
  tokens: Tokens;
  item: LineItem;
  symbol: string;
  currency: Currency;
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
          style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", color: tokens.label1, fontSize: 15, fontWeight: 600, fontFamily: "inherit", outline: "none" }}
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="הסר פריט"
          style={{ flexShrink: 0, width: 32, height: 32, borderRadius: tokens.r10, border: "none", background: canRemove ? `${tokens.red}18` : tokens.fill4, color: canRemove ? tokens.red : tokens.label4, cursor: canRemove ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}
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
          <IOSInput tokens={tokens} value={item.price} onChange={(v) => onChange({ price: v })} pre={symbol} small />
        </div>
        <div style={{ marginInlineStart: "auto", textAlign: "end" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: tokens.label3, display: "block" }}>סה״כ</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: tokens.label1 }}>{formatMoney(lineTotal(item), currency)}</span>
        </div>
      </div>
    </div>
  );
}
