"use client";

import { RefCard, ReferenceButton } from "../core";
import type { ThemeBuilderState } from "../../types";

export function HeroBlock({ state }: { state: ThemeBuilderState }) {
  const portfolioVariant = state.mode === "dark" ? "secondary" : "outline";
  const portfolioTokenTarget = state.mode === "dark" ? "secondary" : "primary";

  return (
    <RefCard
      className="col-span-full"
      dataE="card"
      padding="none"
      style={{
        padding: "calc(40px * var(--spacing)) calc(16px * var(--spacing))",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: `calc(16px * ${state.typeScale} * ${state.typeScale} * ${state.typeScale})`,
          fontWeight: "var(--fw-heading)" as never,
          fontFamily: "var(--font-heading)",
          color: "var(--c-fg)",
          marginBottom: 12,
          lineHeight: 1.15,
        }}
      >
        Build brands that command attention
      </h1>
      <p style={{ fontSize: 14, color: "var(--c-muted-fg)", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
        Premium digital branding, high-performance websites, and business systems that scale.
      </p>
      <div className="flex gap-3 justify-center">
        <ReferenceButton variant="primary" size="lg" tokenTarget="primary">
          Start your project ⟶
        </ReferenceButton>
        <ReferenceButton variant={portfolioVariant} size="lg" tokenTarget={portfolioTokenTarget}>
          View portfolio
        </ReferenceButton>
      </div>
    </RefCard>
  );
}
