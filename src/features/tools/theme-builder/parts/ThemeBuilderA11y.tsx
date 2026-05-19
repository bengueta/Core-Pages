"use client";

import { useEffect, useMemo, useRef } from "react";
import { RotateCcw, Wand2 } from "lucide-react";

import type { ContrastStatus, ContrastStatusRow } from "../tools/contrast/contrastStatus";

const sevOrder = (s: "ok" | "warn" | "critical") => (s === "critical" ? 0 : s === "warn" ? 1 : 2);

type ThemeBuilderA11yProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contrastStatus: ContrastStatus;
  onAutoFg: () => void;
  onUndoAutoFg: () => void;
  autoFgUndoAvailable: boolean;
};

/**
 * A11y for the theme builder: one place for the toolbar button and contrast/tone readout.
 * Focuses on a short, scannable list of easy-to-catch design issues (FG/BG ratio + light-mode tone).
 */
export function ThemeBuilderA11y({
  open,
  onOpenChange,
  contrastStatus,
  onAutoFg,
  onUndoAutoFg,
  autoFgUndoAvailable,
}: ThemeBuilderA11yProps) {
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  const hasIssues = contrastStatus.issuesCount > 0;
  const hasCritical = contrastStatus.criticalCount > 0;

  const contrastRows = useMemo(
    () => [...contrastStatus.rows].sort((a, b) => sevOrder(a.severity) - sevOrder(b.severity)),
    [contrastStatus.rows]
  );

  const toneRows = useMemo(
    () => [...contrastStatus.toneChecks].sort((a, b) => sevOrder(a.severity) - sevOrder(b.severity)),
    [contrastStatus.toneChecks]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (popRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [onOpenChange, open]);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        title={
          hasIssues
            ? `Contrast / tone: ${contrastStatus.issuesCount} issue(s)${hasCritical ? ` (${contrastStatus.criticalCount} critical)` : ""}`
            : "Contrast and tone look OK"
        }
        className="px-2.5 py-1 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors hover:bg-white/8"
        style={{
          border: `1px solid ${hasIssues ? "rgba(248,113,113,.35)" : "rgba(161,161,170,.25)"}`,
          background: hasIssues ? "rgba(248,113,113,.08)" : "rgba(161,161,170,.06)",
          color: hasIssues ? "rgba(254,202,202,.95)" : "rgba(212,212,216,.78)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".03em",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: hasIssues ? "rgba(248,113,113,.9)" : "rgba(161,161,170,.75)",
            boxShadow: hasIssues ? "0 0 0 2px rgba(248,113,113,.18)" : "none",
          }}
        />
        A11y
      </button>

      {open ? (
        <div
          ref={popRef}
          style={{
            position: "fixed",
            top: 54,
            right: 12,
            width: 300,
            zIndex: 80,
            background: "rgba(14,14,18,.97)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 12,
            boxShadow: "0 18px 60px rgba(0,0,0,.55)",
            backdropFilter: "blur(18px)",
            padding: 10,
            maxHeight: "min(70vh, 420px)",
            overflow: "auto",
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(228,228,231,.55)", margin: "0 0 8px" }}>
            Contrast & light balance
          </p>

          <div className="mb-2 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={onAutoFg}
              title="Auto-adjust foregrounds"
              className="w-8 h-8 rounded-md grid place-items-center cursor-pointer transition-colors"
              style={{
                border: "1px solid rgba(201,169,110,.4)",
                background: "rgba(201,169,110,.12)",
                color: "#e7d4ad",
              }}
            >
              <Wand2 size={14} />
            </button>
            <button
              type="button"
              onClick={onUndoAutoFg}
              disabled={!autoFgUndoAvailable}
              title="Undo last auto fix"
              className="w-8 h-8 rounded-md grid place-items-center transition-colors"
              style={{
                border: "1px solid rgba(255,255,255,.12)",
                background: autoFgUndoAvailable ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.02)",
                color: autoFgUndoAvailable ? "rgba(228,228,231,.82)" : "rgba(228,228,231,.32)",
                cursor: autoFgUndoAvailable ? "pointer" : "not-allowed",
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {contrastRows.map((r) => (
              <li key={r.label}>
                <ContrastLine row={r} />
              </li>
            ))}
          </ul>

          {toneRows.length > 0 ? (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,.08)" }}>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(228,228,231,.4)", margin: "0 0 6px" }}>
                Light mode tone
              </p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {toneRows.map((t) => (
                  <li key={t.id}>
                    <ToneLine check={t} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function ContrastLine({ row: r }: { row: ContrastStatusRow }) {
  const bad = !r.pass;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          width: 24,
          height: 16,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,.08)",
          flexShrink: 0,
        }}
      >
        <div style={{ background: r.bgHex }} />
        <div style={{ background: r.fgHex }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "rgba(228,228,231,.8)", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</div>
        <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "rgba(228,228,231,.3)", marginTop: 2 }}>
          {r.ratio === null ? "—" : r.ratio.toFixed(1)}:1
          {bad ? (
            <span style={{ color: r.severity === "critical" ? "rgba(248,113,113,.9)" : "rgba(245,158,11,.9)", fontWeight: 700, marginLeft: 6 }}>
              needs ≥ {r.minRatio.toFixed(1)}:1
            </span>
          ) : (
            <span style={{ color: "rgba(34,197,94,.9)", fontWeight: 600, marginLeft: 6 }}>OK</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ToneLine({ check: t }: { check: ContrastStatus["toneChecks"][number] }) {
  const bad = !t.pass;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 24,
          height: 16,
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,.08)",
          background: t.hex || "transparent",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "rgba(228,228,231,.8)", lineHeight: 1.25, overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</div>
        <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "rgba(228,228,231,.3)", marginTop: 2 }}>
          L {t.luminance === null ? "—" : t.luminance.toFixed(2)}
          {bad ? (
            <span style={{ color: t.severity === "critical" ? "rgba(248,113,113,.9)" : "rgba(245,158,11,.9)", fontWeight: 700, marginLeft: 6 }}>
              out of range
            </span>
          ) : (
            <span style={{ color: "rgba(34,197,94,.9)", fontWeight: 600, marginLeft: 6 }}>OK</span>
          )}
        </div>
      </div>
    </div>
  );
}
