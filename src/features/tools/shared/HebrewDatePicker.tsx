"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { Tokens } from "./tokens";

const CALENDAR_Z = 9999;
const STRONG_GLASS = {
  background: "rgba(18,18,22,0.92)",
  backdropFilter: "blur(48px) saturate(180%)",
  WebkitBackdropFilter: "blur(48px) saturate(180%)",
} as const;

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

const HEBREW_WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYYYYMMDD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function getMonthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = first.getDay();
  const days = last.getDate();
  const grid: (number | null)[][] = [];
  let row: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) row.push(null);
  for (let d = 1; d <= days; d++) {
    row.push(d);
    if (row.length === 7) {
      grid.push(row);
      row = [];
    }
  }
  if (row.length) {
    while (row.length < 7) row.push(null);
    grid.push(row);
  }
  return grid;
}

export function HebrewDatePicker({
  value,
  onChange,
  tokens,
}: {
  value: string;
  onChange: (v: string) => void;
  tokens: Tokens;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseYYYYMMDD(value));
  const ref = useRef<HTMLDivElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setViewDate(parseYYYYMMDD(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (ref.current?.contains(target)) return;
      if (target.closest("[data-hebrew-calendar]")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  useEffect(() => {
    if (open && ref.current) {
      const updateRect = () => ref.current && setAnchorRect(ref.current.getBoundingClientRect());
      updateRect();
      window.addEventListener("resize", updateRect);
      window.addEventListener("scroll", updateRect, true);
      return () => {
        window.removeEventListener("resize", updateRect);
        window.removeEventListener("scroll", updateRect, true);
      };
    } else {
      setAnchorRect(null);
    }
  }, [open]);

  const displayDate = new Date(parseYYYYMMDD(value)).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const grid = getMonthGrid(viewDate.getFullYear(), viewDate.getMonth());
  const todayStr = toYYYYMMDD(new Date());

  const prevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };
  const setToday = () => {
    const t = new Date();
    onChange(toYYYYMMDD(t));
    setViewDate(t);
  };

  const selectDay = (day: number | null) => {
    if (day == null) return;
    const str = toYYYYMMDD(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
    onChange(str);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          borderRadius: tokens.r13,
          border: `1px solid ${tokens.sep}`,
          background: "rgba(0,0,0,0.2)",
          color: tokens.label1,
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
          textAlign: "right",
        }}
      >
        <Calendar size={22} style={{ color: tokens.label3, flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{displayDate}</span>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.div
              data-hebrew-calendar
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "fixed",
                top: anchorRect ? anchorRect.bottom + 8 : 0,
                right: anchorRect ? window.innerWidth - anchorRect.right : 0,
                left: anchorRect ? anchorRect.left : 0,
                zIndex: CALENDAR_Z,
                ...STRONG_GLASS,
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: tokens.r20,
                padding: 20,
                boxShadow: "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  padding: "12px 14px",
                  borderRadius: tokens.r13,
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(40px) saturate(160%)",
                  WebkitBackdropFilter: "blur(40px) saturate(160%)",
                }}
              >
                <button
                  type="button"
                  onClick={prevMonth}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: tokens.r10,
                    border: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: tokens.label2,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 20 }}>‹</span>
                </button>
                <span style={{ fontSize: 18, fontWeight: 700, color: tokens.label1 }}>
                  {HEBREW_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: tokens.r10,
                    border: "none",
                    background: "rgba(255,255,255,0.1)",
                    color: tokens.label2,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 20 }}>›</span>
                </button>
              </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 12 }}>
              {HEBREW_WEEKDAYS.map((w) => (
                <div
                  key={w}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: tokens.label3,
                    textAlign: "center",
                    padding: "6px 0",
                  }}
                >
                  {w}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {grid.map((row, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                  {row.map((day, di) => {
                    const isNull = day == null;
                    const dateStr = !isNull
                      ? toYYYYMMDD(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))
                      : "";
                    const isSelected = dateStr === value;
                    const isToday = dateStr === todayStr;
                    return (
                      <motion.button
                        key={di}
                        type="button"
                        disabled={isNull}
                        onClick={() => selectDay(day)}
                        whileHover={!isNull ? { scale: 1.08, backgroundColor: "rgba(10,132,255,0.25)" } : {}}
                        whileTap={!isNull ? { scale: 0.96 } : {}}
                        style={{
                          width: "100%",
                          aspectRatio: 1,
                          maxWidth: 48,
                          borderRadius: tokens.r10,
                          border: "none",
                          background: isSelected
                            ? tokens.blue
                            : isToday
                              ? `${tokens.blue}33`
                              : "transparent",
                          color: isSelected ? "#fff" : isNull ? tokens.label4 : tokens.label1,
                          fontSize: 16,
                          fontWeight: isSelected || isToday ? 700 : 500,
                          cursor: isNull ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                        }}
                      >
                        {isNull ? "" : day}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${tokens.sep}` }}>
              <button
                type="button"
                onClick={setToday}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: tokens.r10,
                  border: `1px solid ${tokens.sep}`,
                  background: tokens.fill3,
                  color: tokens.label2,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                היום
              </button>
            </div>
          </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
