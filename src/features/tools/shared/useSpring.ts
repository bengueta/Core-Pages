import { useEffect, useRef, useState } from "react";

/**
 * Lightweight spring-ish number animation for KPI values.
 */
export function useSpring(target: number) {
  const [val, setVal] = useState(target);
  const raf = useRef<number | null>(null);
  const cur = useRef(target);
  const dst = useRef(target);

  useEffect(() => {
    dst.current = target;
    if (raf.current != null) cancelAnimationFrame(raf.current);

    const run = () => {
      const d = dst.current - cur.current;
      if (Math.abs(d) < 1) {
        cur.current = dst.current;
        setVal(dst.current);
        return;
      }
      cur.current += d * 0.15;
      setVal(Math.round(cur.current));
      raf.current = requestAnimationFrame(run);
    };

    raf.current = requestAnimationFrame(run);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [target]);

  return val;
}

