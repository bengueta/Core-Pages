"use client";

import { RefBlockTitle, ReferenceButton } from "../core";

export function ArticleTeaserBlock() {
  return (
    <article className="t-card overflow-hidden" data-e="card">
      <div
        className="h-28 w-full"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, var(--c-accent) 35%, var(--c-bg)), color-mix(in srgb, var(--c-primary) 25%, var(--c-bg)))`,
        }}
        data-e="accent"
      />
      <div className="p-4" style={{ padding: "calc(12px * var(--spacing))" }}>
        <RefBlockTitle>Article</RefBlockTitle>
        <h3
          className="mb-2"
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: "var(--fw-heading)",
            fontSize: "1.1rem",
            color: "var(--c-fg)",
            margin: 0,
            lineHeight: "var(--line-height)",
          }}
          data-e="foreground"
        >
          How teams ship consistent UI with design tokens
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--c-muted-fg)",
            marginBottom: "calc(10px * var(--spacing))",
            lineHeight: "var(--line-height)",
          }}
        >
          A short excerpt uses body font and muted foreground — same variables as your export.
        </p>
        <ReferenceButton variant="outline" size="sm" tokenTarget="primary">
          Read more
        </ReferenceButton>
      </div>
    </article>
  );
}
