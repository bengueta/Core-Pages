import type { Tokens } from "./tokens";
import { ils } from "./formatters";
import { useSpring } from "./useSpring";

/**
 * Line item for cost breakdown well.
 */
export function CostLine({
  tokens,
  label,
  sub,
  val,
  color,
  last = false,
}: {
  tokens: Tokens;
  label: string;
  sub?: string;
  val: number;
  color?: string;
  last?: boolean;
}) {
  const c = color ?? "rgba(255,69,58,0.88)";
  const a = useSpring(Math.round(val || 0));

  return (
    <div style={{ position: "relative", padding: "11px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: c, display: "block", lineHeight: 1.3 }}>{label}</span>
          {sub ? (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: tokens.label4,
                display: "block",
                marginTop: 1.5,
              }}
            >
              {sub}
            </span>
          ) : null}
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: tokens.label2, fontVariantNumeric: "tabular-nums" }}>
          − {ils(a)}
        </span>
      </div>

      {!last ? <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 0.5, background: tokens.sep }} /> : null}
    </div>
  );
}

