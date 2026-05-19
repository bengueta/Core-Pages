"use client";

import { refTypo, RefCard, ReferenceButton } from "../core";

export function PricingBlock() {
  return (
    <RefCard dataE="card" padding={20} style={{ textAlign: "center" }}>
      <span className="t-badge" style={{ background: "var(--c-accent)", color: "var(--c-accent-fg)", marginBottom: 8 }}>
        Popular
      </span>
      <div style={{ ...refTypo.sectionHeading, fontSize: 16, marginBottom: 2 }}>Pro Plan</div>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--c-fg)" }}>
        $299<span style={{ fontSize: 13, fontWeight: 500, color: "var(--c-muted-fg)" }}>/mo</span>
      </div>
      <div
        className="text-left mt-4 mb-5"
        style={{ fontSize: 12, color: "var(--c-muted-fg)", display: "flex", flexDirection: "column", gap: 6 }}
      >
        {["Unlimited projects", "Priority support", "Custom domain"].map((f) => (
          <div
            key={f}
            className="flex items-center gap-2 py-1"
            style={{ borderBottom: "1px solid color-mix(in srgb, var(--c-border) 40%, transparent)" }}
          >
            <span style={{ color: "var(--c-success)", fontWeight: 800 }}>✓</span>
            {f}
          </div>
        ))}
      </div>
      <ReferenceButton variant="primary" size="lg" tokenTarget="primary">
        Get started
      </ReferenceButton>
    </RefCard>
  );
}
