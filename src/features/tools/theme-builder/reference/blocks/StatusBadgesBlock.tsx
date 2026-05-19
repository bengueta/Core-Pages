"use client";

import { BadgeCheck } from "lucide-react";

import { refFlexCol, refFlexRowWrap, RefCard, ReferenceBadge } from "../core";

export function StatusBadgesBlock() {
  const row = refFlexRowWrap(8);
  const col = refFlexCol(8);

  return (
    <RefCard title="Status badges" padding={14}>
      <div style={col}>
        <div style={row}>
          <ReferenceBadge dataE="primary">Badge</ReferenceBadge>
          <ReferenceBadge variant="secondary" dataE="secondary">
            Secondary
          </ReferenceBadge>
          <ReferenceBadge variant="destructive" dataE="destructive">
            Destructive
          </ReferenceBadge>
          <ReferenceBadge variant="outline" dataE="foreground">
            Outline
          </ReferenceBadge>
        </div>
        <div style={row}>
          <ReferenceBadge variant="secondary" dataE="accent">
            <BadgeCheck aria-hidden size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
            Verified
          </ReferenceBadge>
          <ReferenceBadge pill mono dataE="primary">
            8
          </ReferenceBadge>
          <ReferenceBadge pill mono variant="destructive" dataE="destructive">
            99
          </ReferenceBadge>
          <ReferenceBadge pill mono variant="outline" dataE="foreground">
            20+
          </ReferenceBadge>
        </div>
      </div>
    </RefCard>
  );
}
