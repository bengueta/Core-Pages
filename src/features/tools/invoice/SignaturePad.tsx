"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Eraser } from "lucide-react";

import { ActionButton, glass } from "../shared";
import type { Tokens } from "../shared";

const W = 520;
const H = 200;
const INK = "#15151c";

/**
 * Lightweight signature canvas (pointer-based, no deps).
 * Draws dark ink on a transparent background; exports a trimmed PNG dataURL.
 */
export function SignaturePad({
  tokens,
  onSave,
  onCancel,
}: {
  tokens: Tokens;
  onSave: (dataURL: string) => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK;
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasInk) setHasInk(true);
  };
  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, W, H);
    setHasInk(false);
  };

  const save = () => {
    const c = canvasRef.current;
    if (!c || !hasInk) return;
    onSave(c.toDataURL("image/png"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ ...glass("thin"), borderRadius: tokens.r16, padding: 6, background: "rgba(255,255,255,0.92)" }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          style={{ width: "100%", height: "auto", aspectRatio: `${W} / ${H}`, touchAction: "none", cursor: "crosshair", display: "block", borderRadius: tokens.r13 }}
        />
      </div>
      <p style={{ fontSize: 12, color: tokens.label3, textAlign: "center" }}>חתמו עם העכבר או האצבע באזור הלבן</p>
      <div style={{ display: "flex", gap: 10 }}>
        <ActionButton tokens={tokens} color={tokens.label2} onPress={clear} icon={<Eraser size={15} />} small>
          ניקוי
        </ActionButton>
        <ActionButton tokens={tokens} color={tokens.label3} onPress={onCancel} small>
          ביטול
        </ActionButton>
        <ActionButton tokens={tokens} color={hasInk ? tokens.green : tokens.label4} onPress={save} icon={<Check size={16} />} small full>
          שמירת חתימה
        </ActionButton>
      </div>
    </div>
  );
}
