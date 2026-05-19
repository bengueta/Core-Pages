import type { Tokens } from "./tokens";
import { fnum } from "./formatters";

/**
 * Benchmark indicator comparing myVal vs benchVal.
 */
export function Bench({
  tokens,
  myVal,
  benchVal,
  unit = "",
  invert = false,
  format,
}: {
  tokens: Tokens;
  myVal: number;
  benchVal: number;
  unit?: string;
  invert?: boolean;
  format?: (v: number) => string;
}) {
  if (!myVal || !benchVal || !Number.isFinite(myVal)) return null;

  const better = invert ? myVal < benchVal : myVal > benchVal;
  const eq = Math.abs(myVal - benchVal) / benchVal < 0.05;
  const color = eq ? tokens.yellow : better ? tokens.green : tokens.red;
  const fmt = format ? format(benchVal) : `${unit}${fnum(benchVal)}`;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        marginTop: 3,
        background: `${color}12`,
        border: `0.5px solid ${color}30`,
        borderRadius: 6,
        padding: "2px 7px",
      }}
    >
      <span style={{ fontSize: 9.5, fontWeight: 700, color: `${color}CC` }}>
        {better ? "▲" : "▼"} ענף: {fmt}
      </span>
    </div>
  );
}

