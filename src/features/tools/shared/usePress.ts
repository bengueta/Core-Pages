import { useState } from "react";

/**
 * Press-state helper for subtle iOS-like interaction feedback.
 */
export function usePress() {
  const [pressed, setPressed] = useState(false);
  return {
    pressed,
    bind: {
      onMouseDown: () => setPressed(true),
      onMouseUp: () => setPressed(false),
      onMouseLeave: () => setPressed(false),
      onTouchStart: () => setPressed(true),
      onTouchEnd: () => setPressed(false),
    },
  } as const;
}

