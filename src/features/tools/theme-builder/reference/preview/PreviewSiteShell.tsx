"use client";

import type { ReactNode } from "react";

import type { ViewportMode } from "../../types";

type PreviewSiteShellProps = {
  viewport: ViewportMode;
  /** Shown under the “Site preview” label (e.g. theme style · mode · max width). */
  metaLine?: string;
  children: ReactNode;
};

/**
 * Mini responsive “site” frame: header + main + footer — all colors from theme CSS variables
 * so the preview matches export tokens. Does not include dev-only audit UI.
 */
export function PreviewSiteShell({ viewport, metaLine, children }: PreviewSiteShellProps) {
  const padX = viewport === "mobile" ? "calc(10px * var(--spacing))" : "calc(14px * var(--spacing))";
  const padY = viewport === "mobile" ? "calc(10px * var(--spacing))" : "calc(12px * var(--spacing))";
  const mainPadX = viewport === "mobile" ? "calc(10px * var(--spacing))" : "calc(16px * var(--spacing))";

  return (
    <div
      className="preview-site-root flex flex-col w-full min-h-0"
      data-viewport={viewport}
      style={{
        borderRadius: "var(--radius)",
        overflow: "hidden",
        border: "1px solid color-mix(in srgb, var(--c-border) 55%, transparent)",
        boxShadow: "var(--shadow-actual)",
        background: "color-mix(in srgb, var(--c-card) 25%, transparent)",
      }}
    >
      <header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: `${padY} ${padX}`,
          background: "var(--c-bg)",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 2,
            minWidth: 0,
            flex: 1,
            fontFamily: "var(--font-heading)",
            fontWeight: "var(--fw-heading)",
            fontSize: viewport === "mobile" ? 13 : 15,
            color: "var(--c-fg)",
            letterSpacing: "var(--letter-spacing)",
          }}
          data-e="foreground"
        >
          <span>Site preview</span>
          {metaLine ? (
            <span
              style={{
                fontSize: 8,
                fontWeight: 500,
                fontFamily: "'DM Mono',ui-monospace,monospace",
                color: "var(--c-muted-fg)",
                lineHeight: 1.2,
                letterSpacing: 0,
              }}
            >
              {metaLine}
            </span>
          ) : null}
        </div>
        <nav
          aria-label="Sample navigation"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: viewport === "mobile" ? 10 : 16,
            fontSize: 11,
            fontFamily: "var(--font-body)",
            fontWeight: "var(--fw-body)",
          }}
        >
          <span style={{ color: "var(--c-muted-fg)", cursor: "default" }} data-e="mutedFg">
            Product
          </span>
          <span style={{ color: "var(--c-accent)", cursor: "default" }} data-e="accent">
            Pricing
          </span>
          <span style={{ color: "var(--c-primary)", cursor: "default" }} data-e="primary">
            Contact
          </span>
        </nav>
      </header>

      <main
        className="flex flex-col flex-1 min-h-0"
        style={{
          padding: `${padY} ${mainPadX}`,
          gap: "calc(10px * var(--spacing))",
          background: "transparent",
        }}
      >
        {children}
      </main>

      <footer
        style={{
          flexShrink: 0,
          padding: `${viewport === "mobile" ? 8 : 10}px ${padX}`,
          background: "color-mix(in srgb, var(--c-muted) 18%, var(--c-bg))",
          borderTop: "1px solid var(--c-border)",
          textAlign: "center",
          fontSize: 10,
          color: "var(--c-muted-fg)",
          fontFamily: "var(--font-body)",
          lineHeight: "var(--line-height)",
        }}
        data-e="muted"
      >
        Responsive preview · {viewport} — tokens drive header, content, and footer
      </footer>
    </div>
  );
}
