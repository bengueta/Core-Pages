import type { Tokens } from "./tokens";

/**
 * Divider inside breakdown well.
 */
export function WellDivider({ tokens, label }: { tokens: Tokens; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0 2px" }}>
      <div style={{ flex: 1, height: 0.5, background: "rgba(255,255,255,0.06)" }} />
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.label4 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 0.5, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

