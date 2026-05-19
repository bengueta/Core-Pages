"use client";

import { Check } from "lucide-react";

import { RefCard } from "../core";

const ITEMS = ["Shared token source in :root", "Preview matches export CSS", "Pick mode for quick edits"];

export function FeatureListBlock() {
  return (
    <RefCard title="Feature list" padding={14}>
      <ul
        style={{
          margin: 0,
          paddingLeft: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "calc(8px * var(--spacing))",
        }}
      >
        {ITEMS.map((text) => (
          <li key={text} className="flex items-start gap-2" style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--c-fg)" }}>
            <span
              className="grid place-items-center shrink-0 rounded-full"
              data-e="success"
              style={{
                width: 22,
                height: 22,
                background: "color-mix(in srgb, var(--c-success) 18%, transparent)",
                color: "var(--c-success)",
              }}
              aria-hidden
            >
              <Check size={12} strokeWidth={2.5} />
            </span>
            <span data-e="foreground">{text}</span>
          </li>
        ))}
      </ul>
    </RefCard>
  );
}
