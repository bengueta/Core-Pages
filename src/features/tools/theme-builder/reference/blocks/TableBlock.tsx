"use client";

import { RefCard } from "../core";

export function TableBlock() {
  return (
    <RefCard className="col-span-full" dataE="card" padding="none" style={{ overflow: "hidden" }}>
      <div className="t-heading" style={{ padding: "12px 16px 0" }}>
        Data Table
      </div>
      <table className="t-table">
        <thead>
          <tr>{["Client", "Package", "Value", "Status"].map((h) => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {[
            { n: "Amir Cohen", p: "Brand Identity", v: "$4,200", s: "Active", sc: "success" },
            { n: "Dana Levy", p: "Web + Brand", v: "$6,800", s: "Draft", sc: "secondary" },
            { n: "Yoni Bar", p: "Strategy", v: "$2,500", s: "Overdue", sc: "destructive" },
          ].map((r) => (
            <tr key={r.n}>
              <td>{r.n}</td>
              <td>{r.p}</td>
              <td style={{ fontWeight: 600 }}>{r.v}</td>
              <td>
                <span
                  className="t-badge"
                  style={{
                    background: `var(--c-${r.sc})`,
                    color: ["success", "accent", "destructive"].includes(r.sc) ? "#fff" : "var(--c-fg)",
                    border: r.sc === "secondary" ? "1px solid var(--c-border)" : "1px solid transparent",
                  }}
                >
                  {r.s}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </RefCard>
  );
}
