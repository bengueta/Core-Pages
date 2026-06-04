"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, X } from "lucide-react";

import { glass } from "../shared";
import type { Tokens } from "../shared";
import { SignaturePad } from "./SignaturePad";

/**
 * Full-screen client signing flow: shows the consent statement, captures the
 * signer's name + drawn signature, and returns them. Used for in-person signing
 * (hand the device to the client). Everything stays on the device.
 */
export function ClientSignModal({
  tokens,
  summary,
  intent,
  initialName = "",
  onComplete,
  onCancel,
}: {
  tokens: Tokens;
  summary: string;
  intent: string;
  initialName?: string;
  onComplete: (dataURL: string, name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [consent, setConsent] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  const handleSave = (dataURL: string) => {
    if (!name.trim()) {
      setWarn("נא להזין שם מלא");
      return;
    }
    if (!consent) {
      setWarn("נא לאשר את ההצהרה");
      return;
    }
    onComplete(dataURL, name.trim());
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      dir="rtl"
      style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(8,8,12,0.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}
    >
      <div style={{ width: "min(560px,100%)", background: "rgba(20,20,26,0.98)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: tokens.r28, padding: 22, color: tokens.label1, boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={20} style={{ color: tokens.green }} />
            <h3 style={{ fontSize: 19, fontWeight: 800 }}>חתימת לקוח</h3>
          </div>
          <button type="button" onClick={onCancel} aria-label="סגור" style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: tokens.fill3, color: tokens.label1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>
        </div>

        {summary ? <p style={{ fontSize: 13, color: tokens.label2, marginBottom: 14, fontWeight: 600 }}>{summary}</p> : null}

        <div style={{ ...glass("ultra"), borderRadius: tokens.r16, padding: "12px 14px", marginBottom: 14 }}>
          <p style={{ fontSize: 13, color: tokens.label2, lineHeight: 1.6 }}>{intent}</p>
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: tokens.label3, marginBottom: 6 }}>שם מלא</label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setWarn(null); }}
          placeholder="שם החותם/ת"
          dir="rtl"
          style={{ width: "100%", marginBottom: 14, padding: "12px 14px", borderRadius: tokens.r13, border: `1px solid ${tokens.sep}`, background: "rgba(0,0,0,0.25)", color: tokens.label1, fontSize: 16, fontWeight: 600, fontFamily: "inherit", outline: "none" }}
        />

        <button
          type="button"
          onClick={() => { setConsent((c) => !c); setWarn(null); }}
          style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "right", background: "transparent", border: "none", cursor: "pointer", marginBottom: 14, padding: 0, fontFamily: "inherit" }}
        >
          <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `1.5px solid ${consent ? tokens.green : tokens.label3}`, background: consent ? tokens.green : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>
            {consent ? "✓" : ""}
          </span>
          <span style={{ fontSize: 13.5, color: tokens.label1, fontWeight: 600 }}>קראתי ואני מאשר/ת את ההצהרה</span>
        </button>

        <SignaturePad tokens={tokens} onSave={handleSave} onCancel={onCancel} />

        {warn ? <p style={{ fontSize: 13, color: tokens.red, marginTop: 10, textAlign: "center" }}>{warn}</p> : null}
      </div>
    </div>,
    document.body
  );
}
