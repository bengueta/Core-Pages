"use client";

import { refTypo, RefCard, ReferenceButton } from "../core";

export function OfferCardBlock() {
  return (
    <RefCard className="flex flex-col justify-between" padding={16} dataE="card">
      <div>
        <div style={{ ...refTypo.sectionHeading, marginBottom: 6 }}>Brand Identity Package</div>
        <div style={{ fontSize: 12, color: "var(--c-muted-fg)", marginBottom: 12 }}>
          Complete visual identity system with logos, colors, typography, and brand guidelines.
        </div>
      </div>
      <div className="flex gap-2 mt-auto">
        <ReferenceButton variant="primary" tokenTarget="primary">
          Get started
        </ReferenceButton>
        <ReferenceButton variant="ghost">Learn more</ReferenceButton>
      </div>
    </RefCard>
  );
}
