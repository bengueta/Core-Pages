"use client";

import { RefCard, ReferenceSkeleton } from "../core";

export function LoadingStateBlock() {
  return (
    <RefCard title="Loading state" padding={14}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ReferenceSkeleton width={48} height={48} borderRadius="50%" dataE="muted" />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <ReferenceSkeleton height={14} width="min(100%, 220px)" dataE="muted" />
          <ReferenceSkeleton height={14} width="min(100%, 180px)" dataE="muted" />
        </div>
      </div>
    </RefCard>
  );
}
