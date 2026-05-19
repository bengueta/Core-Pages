"use client";

import React from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { loadFont } from "../lib";

export const Section = ({
  id,
  title,
  icon: Icon,
  children,
  openSections,
  toggleSection,
  defaultOpen = true,
}: {
  id: string;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  openSections: Record<string, boolean | undefined>;
  toggleSection: (id: string) => void;
  defaultOpen?: boolean;
}) => {
  const open = openSections[id] ?? defaultOpen;
  return (
    <div className="border-b" style={{ borderColor: "rgba(255,255,255,.04)" }}>
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer hover:bg-white/5"
        style={{ color: open ? "rgba(228,228,231,.7)" : "rgba(228,228,231,.3)" }}
      >
        {Icon ? <Icon size={11} style={{ opacity: 0.5 }} /> : null}
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          {title}
        </span>
        {open ? <ChevronDown size={10} style={{ opacity: 0.3 }} /> : <ChevronRight size={10} style={{ opacity: 0.3 }} />}
      </button>
      {open ? <div className="px-3 pb-3">{children}</div> : null}
    </div>
  );
};

export const ColorRow = ({
  label,
  value,
  onChange,
  onCopyValue,
  colorKey,
  highlighted,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onCopyValue?: (value: string, label: string) => void;
  /** Matches preview `data-e` / palette key for pick-mode scroll + highlight */
  colorKey?: string;
  highlighted?: boolean;
}) => (
  <div
    data-palette-key={colorKey}
    className="flex items-center gap-1.5 py-0.5 px-1 rounded transition-colors hover:bg-white/5"
    style={{
      fontSize: 10,
      outline: highlighted ? "1px solid rgba(201,169,110,.55)" : undefined,
      outlineOffset: highlighted ? 1 : undefined,
      borderRadius: highlighted ? 6 : undefined,
      background: highlighted ? "rgba(201,169,110,.06)" : undefined,
    }}
  >
    <div
      className="relative w-5 h-5 rounded flex-shrink-0 border overflow-hidden cursor-pointer transition-transform hover:scale-110"
      style={{ borderColor: "rgba(255,255,255,.1)", background: value }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        style={{ margin: "-4px", width: "calc(100% + 8px)", height: "calc(100% + 8px)" }}
      />
    </div>
    <span
      className="flex-1 truncate cursor-pointer hover:text-white"
      title="Copy Color"
      onClick={() => {
        if (onCopyValue) onCopyValue(value, label);
        else navigator.clipboard.writeText(value);
      }}
      style={{ color: "rgba(228,228,231,.45)" }}
    >
      {label}
    </span>
    <input
      value={value}
      maxLength={7}
      onChange={(e) => {
        if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value);
      }}
      className="w-14 px-1.5 py-0.5 rounded text-right outline-none transition-colors focus:border-[#c9a96e]/40 focus:text-white"
      style={{
        fontSize: 9,
        fontFamily: "'DM Mono',monospace",
        color: "rgba(228,228,231,.4)",
        background: "rgba(255,255,255,.03)",
        border: "1px solid transparent",
      }}
    />
  </div>
);

export const ChipGroup = ({
  options,
  value,
  onChange,
}: {
  options: Record<string, string>;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="flex flex-wrap gap-1">
    {Object.entries(options).map(([k, label]) => (
      <button
        key={k}
        onClick={() => onChange(k)}
        className="px-2 py-1 rounded text-xs transition-all cursor-pointer hover:bg-white/10"
        style={{
          fontSize: 10,
          fontWeight: 500,
          border: `1px solid ${k === value ? "rgba(201,169,110,.5)" : "rgba(255,255,255,.08)"}`,
          background: k === value ? "rgba(201,169,110,.08)" : "rgba(255,255,255,.03)",
          color: k === value ? "#c9a96e" : "rgba(228,228,231,.4)",
        }}
      >
        {label}
      </button>
    ))}
  </div>
);

export const Slider = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  display,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (val: number) => void;
  display?: string;
}) => (
  <div className="flex items-center gap-2 mb-1">
    <span style={{ fontSize: 9, color: "rgba(228,228,231,.3)", minWidth: 45, flexShrink: 0 }}>{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 h-1 rounded-full outline-none cursor-pointer"
      style={{ accentColor: "#c9a96e", background: "rgba(255,255,255,.06)" }}
    />
    <span
      style={{
        fontSize: 9,
        fontFamily: "'DM Mono',monospace",
        color: "rgba(228,228,231,.5)",
        minWidth: 32,
        textAlign: "right",
        flexShrink: 0,
      }}
    >
      {display ?? String(value)}
    </span>
  </div>
);

export const FontPicker = ({
  fonts,
  value,
  onChange,
}: {
  fonts: ReadonlyArray<{ name: string; value: string; url?: string }>;
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="flex flex-col gap-0.5">
    {fonts.map((f) => (
      <button
        key={f.name}
        onClick={() => {
          loadFont(f.url);
          onChange(f.value);
        }}
        className="w-full text-left px-2 py-1.5 rounded transition-all flex items-center gap-2 cursor-pointer hover:bg-white/5"
        style={{
          border: `1px solid ${f.value === value ? "rgba(201,169,110,.4)" : "rgba(255,255,255,.06)"}`,
          background: f.value === value ? "rgba(201,169,110,.06)" : "rgba(255,255,255,.02)",
          color: f.value === value ? "#e4e4e7" : "rgba(228,228,231,.4)",
        }}
      >
        <span style={{ fontSize: 11, fontFamily: f.value, flex: 1 }}>{f.name}</span>
        {f.value === value ? <Check size={10} style={{ color: "#c9a96e" }} /> : null}
      </button>
    ))}
  </div>
);
