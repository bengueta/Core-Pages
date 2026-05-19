"use client";

import { refFlexCol, RefCard, ReferenceProgress } from "../core";

export function ProgressMetricsBlock() {
  const rows = [
    { label: "Quarter goal", value: 66, hint: "On track" },
    { label: "Migration", value: 33, hint: "Phase 2" },
  ];

  return (
    <RefCard title="Progress metrics" padding={14}>
      <div style={refFlexCol(14)}>
        {rows.map((r, i) => (
          <div key={r.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 6,
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: "var(--c-fg)",
                }}
                data-e="foreground"
              >
                {r.label}
              </span>
              <span style={{ fontSize: 11, color: "var(--c-muted-fg)", fontWeight: 500 }} data-e="mutedFg">
                {r.hint}
              </span>
            </div>
            <div style={{ width: "min(100%, 280px)" }}>
              <ReferenceProgress value={r.value} fillKey={i === 0 ? "primary" : "secondary"} />
            </div>
            <div
              style={{ fontSize: 10, marginTop: 4, color: "var(--c-muted-fg)", fontFamily: "var(--font-mono)" }}
              data-e="mutedFg"
            >
              {r.value}%
            </div>
          </div>
        ))}
      </div>
    </RefCard>
  );
}
