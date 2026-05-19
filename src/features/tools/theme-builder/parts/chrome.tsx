"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

export const ToolBtn = ({
  icon: Icon,
  active,
  onClick,
  title,
  pulse,
  tone = "default",
  buttonRef,
}: {
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
  title?: string;
  pulse?: boolean;
  tone?: "default" | "ok" | "warn";
  buttonRef?: React.Ref<HTMLButtonElement>;
}) => (
  <button
    suppressHydrationWarning
    ref={buttonRef}
    onClick={onClick}
    title={title}
    className="w-7 h-7 rounded-md grid place-items-center transition-all flex-shrink-0 cursor-pointer hover:bg-white/10"
    style={{
      color: active
        ? "#c9a96e"
        : tone === "ok"
          ? "rgba(34,197,94,.95)"
          : tone === "warn"
            ? "rgba(245,158,11,.95)"
            : "rgba(228,228,231,.4)",
      background: active ? "rgba(201,169,110,.12)" : "transparent",
      border: `1px solid ${active ? "rgba(201,169,110,.3)" : "transparent"}`,
      animation: pulse && active ? "pulse 2s ease infinite" : "none",
    }}
  >
    <Icon size={13} />
  </button>
);

export const Divider = () => <div style={{ width: 1, height: 18, background: "rgba(255,255,255,.08)" }} />;

export const SidebarBtn = ({
  icon: Icon,
  text,
  onClick,
  flex,
  title,
}: {
  icon: LucideIcon;
  text?: string;
  onClick?: () => void;
  flex?: boolean;
  title?: string;
}) => (
  <button
    suppressHydrationWarning
    onClick={onClick}
    title={title}
    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-colors cursor-pointer ${
      flex ? "flex-1 font-medium" : "px-3"
    }`}
    style={{
      fontSize: 11,
      border: text ? "1px solid #c9a96e" : "1px solid rgba(255,255,255,.06)",
      color: text ? "#c9a96e" : "rgba(228,228,231,.4)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = text ? "#c9a96e" : "rgba(255,255,255,.06)";
      e.currentTarget.style.color = text ? "#09090b" : "rgba(228,228,231,.8)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = text ? "#c9a96e" : "rgba(228,228,231,.4)";
    }}
  >
    <Icon size={text ? 12 : 14} /> {text}
  </button>
);
