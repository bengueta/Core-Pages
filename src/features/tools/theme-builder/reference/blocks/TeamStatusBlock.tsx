"use client";

import {
  ReferenceAvatar,
  ReferenceBadge,
  refFlexCol,
  refFlexRowWrap,
  RefCard,
  ReferenceSeparator,
} from "../core";

const AVATAR_SRC = [
  "https://github.com/shadcn.png",
  "https://github.com/maxleiter.png",
  "https://github.com/evilrabbit.png",
];

export function TeamStatusBlock() {
  const links = ["Blog", "Docs", "Source"];

  return (
    <RefCard title="Team status" padding={14}>
      <div style={refFlexCol(12)}>
        <div style={refFlexRowWrap(12, { alignItems: "center" })}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {AVATAR_SRC.map((src, index) => (
              <div key={src} style={{ marginLeft: index === 0 ? 0 : -10 }}>
                <ReferenceAvatar
                  src={src}
                  alt={`Team member ${index + 1}`}
                  fallback={`T${index + 1}`}
                  size={36}
                  withRing
                  dataE="muted"
                />
              </div>
            ))}
          </div>
          <ReferenceSeparator orientation="vertical" style={{ minHeight: 28, margin: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: "var(--fw-heading)" as never,
                fontFamily: "var(--font-heading)",
                color: "var(--c-fg)",
                lineHeight: 1.2,
              }}
              data-e="foreground"
            >
              Core squad
            </div>
            <div style={{ fontSize: 11, color: "var(--c-muted-fg)", marginTop: 2 }} data-e="mutedFg">
              3 designers · Active
            </div>
          </div>
          <ReferenceBadge variant="secondary" dataE="secondary">
            Online
          </ReferenceBadge>
        </div>

        <ReferenceSeparator orientation="horizontal" style={{ margin: "4px 0" }} />

        <div style={refFlexRowWrap(10, { alignItems: "center", fontSize: 12, color: "var(--c-fg)" })}>
          {links.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {i > 0 ? <ReferenceSeparator orientation="vertical" style={{ minHeight: 14, margin: 0 }} /> : null}
              <span style={{ fontWeight: 500, fontFamily: "var(--font-body)" }} data-e="foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </RefCard>
  );
}
