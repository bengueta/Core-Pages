import type { ReactNode } from "react";

import type { Tokens } from "./tokens";
import { glass } from "./tokens";
import { usePress } from "./usePress";

/**
 * iOS-style action button with subtle press animation.
 */
export function ActionButton({
  tokens,
  children,
  onPress,
  color,
  full = false,
  small = false,
  icon,
}: {
  tokens: Tokens;
  children: ReactNode;
  onPress: () => void;
  color: string;
  full?: boolean;
  small?: boolean;
  icon?: ReactNode;
}) {
  const { pressed, bind } = usePress();

  return (
    <button
      {...bind}
      type="button"
      onClick={onPress}
      style={{
        width: full ? "100%" : "auto",
        padding: small ? "9px 16px" : "13px 20px",
        borderRadius: tokens.r13,
        ...glass("thin"),
        border: `1px solid ${color}44`,
        background: `${color}16`,
        color,
        fontSize: small ? 13 : 15,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        minHeight: 44,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

