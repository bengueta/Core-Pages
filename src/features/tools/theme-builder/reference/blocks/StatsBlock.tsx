"use client";

import { refTypo, RefBlockTitle, RefCard } from "../core";

export function StatsBlock() {
  return (
    <div>
      <RefBlockTitle>Stats</RefBlockTitle>
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Revenue", v: "$48k", d: "+12.5%", up: true },
          { l: "Clients", v: "84", d: "+3", up: true },
          { l: "Churn", v: "2.1%", d: "+0.4%", up: false },
        ].map((s) => (
          <RefCard key={s.l} padding={10} dataE="card">
            <div style={refTypo.statLabel} data-e="mutedFg">
              {s.l}
            </div>
            <div style={refTypo.statValue} data-e="foreground">
              {s.v}
            </div>
            <div
              style={{ fontSize: 10, fontWeight: 500, marginTop: 4, color: s.up ? "var(--c-success)" : "var(--c-destructive)" }}
              data-e={s.up ? "success" : "destructive"}
            >
              {s.d}
            </div>
          </RefCard>
        ))}
      </div>
    </div>
  );
}
