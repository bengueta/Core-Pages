import type { ReactNode } from "react";

import type { Tokens } from "./tokens";
import { glass } from "./tokens";

/**
 * Inset-grouped section wrapper with optional title + footer.
 */
export function Section({
  tokens,
  title,
  titleColor,
  titleIcon,
  children,
  footer,
}: {
  tokens: Tokens;
  title?: string;
  titleColor?: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  footer?: string;
}) {
  return (
    <div style={{ marginBottom: tokens.s24 }}>
      {title ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 6px", marginBottom: tokens.s8 }}>
          {titleIcon}
          <p
            style={{
              fontSize: tokens.typo.caption2.size,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: titleColor ?? tokens.label3,
            }}
          >
            {title}
          </p>
        </div>
      ) : null}

      <div style={{ ...glass("secondary"), borderRadius: tokens.r20, overflow: "hidden" }}>{children}</div>

      {footer ? (
        <p style={{ fontSize: tokens.typo.caption1.size, color: tokens.label3, padding: "6px 16px 0", lineHeight: 1.5 }}>
          {footer}
        </p>
      ) : null}
    </div>
  );
}

