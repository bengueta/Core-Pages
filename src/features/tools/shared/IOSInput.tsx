import { useEffect, useState } from "react";

import type { Tokens } from "./tokens";
import { glass } from "./tokens";

/**
 * iOS-style number input — always editable, auto-width.
 */
export function IOSInput({
  value,
  onChange,
  tokens,
  pre,
  suf,
  small = false,
}: {
  value: number;
  onChange: (v: number) => void;
  tokens: Tokens;
  pre?: string;
  suf?: string;
  small?: boolean;
}) {
  const [loc, setLoc] = useState(String(value));
  const [foc, setFoc] = useState(false);

  useEffect(() => {
    if (!foc) setLoc(String(value));
  }, [value, foc]);

  const chars = Math.max(3, Math.min(8, loc.length || 1));

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        ...glass("thin"),
        borderRadius: tokens.r10,
        padding: `${small ? 5 : 7}px ${small ? 10 : 13}px`,
        transition: "all 0.18s ease",
        ...(foc
          ? {
              background: "rgba(255,255,255,0.09)",
              border: `1px solid ${tokens.blue}88`,
              boxShadow: `0 0 0 3.5px ${tokens.blue}28, inset 0 1px 0 rgba(255,255,255,0.12)`,
            }
          : {}),
      }}
    >
      {pre ? (
        <span style={{ fontSize: small ? 12 : 14, fontWeight: 500, color: tokens.label3, userSelect: "none" }}>
          {pre}
        </span>
      ) : null}
      <input
        type="text"
        inputMode="decimal"
        dir="ltr"
        value={loc === "0" && !foc ? "" : loc}
        placeholder="0"
        onFocus={() => setFoc(true)}
        onBlur={() => {
          setFoc(false);
          if (loc === "" || Number.isNaN(Number.parseFloat(loc))) setLoc(String(value));
        }}
        onChange={(e) => {
          const next = e.target.value;
          setLoc(next);
          const n = Number.parseFloat(next);
          if (!Number.isNaN(n)) onChange(n);
          else if (next === "") onChange(0);
        }}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily: "inherit",
          fontSize: small ? 13 : 15,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.01em",
          color: tokens.label1,
          textAlign: "center",
          width: `${chars}ch`,
          minWidth: "3ch",
          maxWidth: "9ch",
        }}
      />
      {suf ? (
        <span style={{ fontSize: small ? 12 : 14, fontWeight: 500, color: tokens.label3, userSelect: "none" }}>
          {suf}
        </span>
      ) : null}
    </div>
  );
}

