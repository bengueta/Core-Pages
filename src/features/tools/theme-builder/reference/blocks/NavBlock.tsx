"use client";

import { Wand2 } from "lucide-react";

import { RefCard, ReferenceButton } from "../core";
import type { ViewportMode } from "../../types";

export function NavBlock({ viewport }: { viewport: ViewportMode }) {
  return (
    <RefCard
      className="col-span-full flex flex-wrap items-center justify-between gap-4"
      dataE="card"
      padding="none"
      style={{ padding: "calc(8px * var(--spacing)) calc(12px * var(--spacing))" }}
    >
      <span
        style={{
          fontSize: 16,
          fontWeight: "var(--fw-heading)" as never,
          fontFamily: "var(--font-heading)",
          color: "var(--c-fg)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Wand2 size={16} color="var(--c-primary)" /> Brand
      </span>
      {viewport !== "mobile" ? (
        <div className="flex gap-4 flex-1 justify-center" style={{ fontSize: 13, color: "var(--c-muted-fg)" }}>
          <span style={{ color: "var(--c-fg)", fontWeight: 600 }}>Home</span>
          <span>Services</span>
          <span>Work</span>
          <span>Contact</span>
        </div>
      ) : null}
      <div className="flex gap-2 items-center">
        <ReferenceButton variant="ghost" size="sm" tokenTarget="mutedFg">
          Login
        </ReferenceButton>
        <ReferenceButton variant="primary" size="sm" tokenTarget="primary">
          Get Started
        </ReferenceButton>
      </div>
    </RefCard>
  );
}
