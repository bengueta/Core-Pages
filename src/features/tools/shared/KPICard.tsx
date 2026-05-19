import type { ReactNode } from "react";

import type { Tokens } from "./tokens";
import { glass } from "./tokens";

/**
 * KPI display card.
 */
export function KPICard({
  tokens,
  label,
  value,
  color,
  tint,
  sub,
  bench,
}: {
  tokens: Tokens;
  label: string;
  value: string;
  color?: string;
  tint?: "blue" | "green" | "orange" | "purple" | "red" | "yellow";
  sub?: string;
  bench?: ReactNode;
}) {
  return (
    <div style={{ flex: 1, ...glass("thin", tint ?? null), borderRadius: tokens.r16, padding: "12px 14px" }}>
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: tokens.label3,
          marginBottom: 5,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: "-0.015em",
          fontVariantNumeric: "tabular-nums",
          color: color ?? tokens.label1,
        }}
      >
        {value}
      </p>
      {sub ? <p style={{ fontSize: 11, color: tokens.label3, fontWeight: 500, marginTop: 2 }}>{sub}</p> : null}
      {bench}
    </div>
  );
}

