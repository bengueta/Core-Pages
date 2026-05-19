import { useState } from "react";

/**
 * iOS-style range slider (HIG-ish). Receives value/min/max/step/onChange + tint color.
 */
export function IOSSlider({
  value,
  min,
  max,
  step,
  onChange,
  color,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const [active, setActive] = useState(false);
  const p = max - min === 0 ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div style={{ position: "relative", width: "100%", height: 44, display: "flex", alignItems: "center" }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onMouseDown={() => setActive(true)}
        onTouchStart={() => setActive(true)}
        onMouseUp={() => setActive(false)}
        onTouchEnd={() => setActive(false)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          WebkitAppearance: "none",
          width: "100%",
          height: 4,
          borderRadius: 999,
          outline: "none",
          cursor: "pointer",
          background: `linear-gradient(to left,${color} ${p}%,rgba(255,255,255,0.10) ${p}%)`,
          // @ts-expect-error CSS var for thumb active state
          "--active": active ? 1 : 0,
        }}
        className="hig-range"
      />
    </div>
  );
}

