import type { Tokens } from "./tokens";
import { glass } from "./tokens";

/**
 * iOS-like segmented control.
 */
export function SegmentedControl<T extends string>({
  tokens,
  options,
  value,
  onChange,
}: {
  tokens: Tokens;
  options: Array<{ value: T; label: string; icon?: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ ...glass("thin"), borderRadius: tokens.r10, padding: 2, display: "flex", gap: 0 }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          type="button"
          style={{
            flex: 1,
            padding: "7px 12px",
            borderRadius: 8,
            border: "none",
            background: value === o.value ? "rgba(255,255,255,0.14)" : "transparent",
            color: value === o.value ? tokens.label1 : tokens.label2,
            fontSize: 13,
            fontWeight: value === o.value ? 700 : 500,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            minHeight: 32,
            ...(value === o.value
              ? { boxShadow: "0 1px 3px rgba(0,0,0,0.22), inset 0 0.5px 0 rgba(255,255,255,0.12)" }
              : {}),
          }}
        >
          {o.icon ? <span style={{ fontSize: 13 }}>{o.icon}</span> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}

