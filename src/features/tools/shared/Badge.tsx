import type { Tokens } from "./tokens";

/**
 * Small status chip/badge.
 */
export function Badge({
  tokens,
  label,
  color,
  bg,
  border,
}: {
  tokens: Tokens;
  label: string;
  color: string;
  bg?: string;
  border?: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: bg ?? `${color}18`,
        border: `0.5px solid ${border ?? `${color}44`}`,
        borderRadius: 999,
        padding: "3px 9px",
      }}
    >
      <span
        style={{
          fontSize: tokens.typo.caption1.size,
          fontWeight: 800,
          color,
          letterSpacing: "0.01em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {label}
      </span>
    </div>
  );
}

