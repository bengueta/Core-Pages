import type { ReactNode } from "react";

import type { Tokens } from "./tokens";
import { usePress } from "./usePress";

/**
 * Grouped list row with label/sub + optional right slot and disclosure.
 */
export function ListRow({
  tokens,
  label,
  sub,
  right,
  onPress,
  last = false,
  disclosure = false,
}: {
  tokens: Tokens;
  label: string;
  sub?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  disclosure?: boolean;
}) {
  const { pressed, bind } = usePress();

  return (
    <div
      {...(onPress ? bind : {})}
      onClick={onPress}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "13px 20px",
        background: pressed && onPress ? tokens.fill3 : "transparent",
        cursor: onPress ? "pointer" : "default",
        transition: "background 0.12s",
        position: "relative",
        minHeight: 44,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: tokens.label1,
            letterSpacing: "-0.01em",
            display: "block",
          }}
        >
          {label}
        </span>
        {sub ? (
          <span style={{ fontSize: 12, color: tokens.label3, fontWeight: 500, display: "block", marginTop: 1 }}>{sub}</span>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {right}
        {disclosure ? (
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden>
            <path
              d="M1 1l5 5-5 5"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>

      {!last ? <div style={{ position: "absolute", bottom: 0, left: 20, right: 0, height: 0.5, background: tokens.sep }} /> : null}
    </div>
  );
}

