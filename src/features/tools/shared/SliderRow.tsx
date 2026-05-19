import type { Tokens } from "./tokens";
import { IOSSlider } from "./IOSSlider";

/**
 * Labeled slider row for grouped sections.
 */
export function SliderRow({
  tokens,
  label,
  sub,
  value,
  min,
  max,
  step,
  onChange,
  display,
  color,
  last = false,
}: {
  tokens: Tokens;
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  color: string;
  last?: boolean;
}) {
  return (
    <div style={{ padding: "14px 20px 12px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 500, color: tokens.label1, display: "block" }}>{label}</span>
          {sub ? (
            <span style={{ fontSize: 11, color: tokens.label3, fontWeight: 500, display: "block", marginTop: 1 }}>{sub}</span>
          ) : null}
        </div>
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: "-0.022em",
            fontVariantNumeric: "tabular-nums",
            color,
          }}
        >
          {display}
        </span>
      </div>

      <IOSSlider value={value} min={min} max={max} step={step} onChange={onChange} color={color} />

      {!last ? <div style={{ position: "absolute", bottom: 0, left: 20, right: 0, height: 0.5, background: tokens.sep }} /> : null}
    </div>
  );
}

