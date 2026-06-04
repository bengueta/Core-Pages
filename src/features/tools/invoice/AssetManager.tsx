"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, PenLine, Plus, Trash2, Upload, X } from "lucide-react";

import { ActionButton, SegmentedControl, glass } from "../shared";
import type { Tokens } from "../shared";
import { newItemId, type Asset, type AssetKind } from "./engine";
import { SignaturePad } from "./SignaturePad";

const MAX_BYTES = 700 * 1024; // ~700KB per asset

const KIND_LABEL: Record<AssetKind, string> = { logo: "לוגו", signature: "חתימה" };

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("יש לבחור קובץ תמונה"));
    if (file.size > MAX_BYTES) return reject(new Error("הקובץ גדול מדי (עד 700KB)"));
    const r = new FileReader();
    r.onload = () => (typeof r.result === "string" ? resolve(r.result) : reject(new Error("שגיאה בקריאה")));
    r.onerror = () => reject(new Error("שגיאה בקריאה"));
    r.readAsDataURL(file);
  });
}

function Thumb({ asset, size = 56 }: { asset: Asset; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset.dataURL}
      alt={asset.name}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: 10,
        background: asset.kind === "signature" ? "rgba(255,255,255,0.9)" : "#fff",
        padding: 4,
      }}
    />
  );
}

/* ───────────────────────────── inline picker ─────────────────────────── */

export function AssetPicker({
  tokens,
  assets,
  kind,
  value,
  onChange,
  onManage,
}: {
  tokens: Tokens;
  assets: Asset[];
  kind: AssetKind;
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  onManage: () => void;
}) {
  const list = assets.filter((a) => a.kind === kind);
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      {list.map((a) => {
        const sel = a.id === value;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(sel ? null : a.id)}
            aria-label={`בחר ${a.name}`}
            style={{
              padding: 3,
              borderRadius: 12,
              border: `2px solid ${sel ? tokens.blue : "transparent"}`,
              background: sel ? `${tokens.blue}22` : tokens.fill4,
              cursor: "pointer",
            }}
          >
            <Thumb asset={a} size={48} />
          </button>
        );
      })}
      <button
        type="button"
        onClick={onManage}
        aria-label={`הוסף ${KIND_LABEL[kind]}`}
        style={{
          width: 54,
          height: 54,
          borderRadius: 12,
          border: `1px dashed ${tokens.sep}`,
          background: tokens.fill4,
          color: tokens.label2,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Plus size={18} />
      </button>
    </div>
  );
}

/* ───────────────────────────── manager modal ─────────────────────────── */

export function AssetManager({
  tokens,
  assets,
  initialKind = "logo",
  onAdd,
  onDelete,
  onClose,
}: {
  tokens: Tokens;
  assets: Asset[];
  initialKind?: AssetKind;
  onAdd: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<AssetKind>(initialKind);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const list = assets.filter((a) => a.kind === kind);

  const addAsset = (dataURL: string, name: string) =>
    onAdd({ id: newItemId(), kind, name, dataURL, createdAt: new Date().toISOString() });

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataURL = await readImage(file);
      setError(null);
      addAsset(dataURL, file.name.replace(/\.[^.]+$/, "").slice(0, 24) || KIND_LABEL[kind]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          maxHeight: "88vh",
          overflow: "auto",
          background: "rgba(20,20,26,0.96)",
          backdropFilter: "blur(48px) saturate(180%)",
          WebkitBackdropFilter: "blur(48px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: tokens.r28,
          padding: 22,
          color: tokens.label1,
          boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 19, fontWeight: 800 }}>ספריית נכסים</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            style={{ width: 34, height: 34, borderRadius: 999, border: "none", background: tokens.fill3, color: tokens.label1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: 12.5, color: tokens.label3, marginBottom: 14, lineHeight: 1.6 }}>
          מקור אמת אחד — מעלים פעם אחת, משתמשים בכל מסמך. נשמר בדפדפן בלבד.
        </p>

        <div style={{ marginBottom: 16 }}>
          <SegmentedControl<AssetKind>
            tokens={tokens}
            value={kind}
            onChange={(v) => {
              setKind(v);
              setDrawing(false);
              setError(null);
            }}
            options={[
              { value: "logo", label: "לוגואים" },
              { value: "signature", label: "חתימות" },
            ]}
          />
        </div>

        {drawing ? (
          <SignaturePad
            tokens={tokens}
            onSave={(dataURL) => {
              addAsset(dataURL, `חתימה ${list.length + 1}`);
              setDrawing(false);
            }}
            onCancel={() => setDrawing(false)}
          />
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
              <ActionButton tokens={tokens} color={tokens.blue} onPress={() => fileRef.current?.click()} icon={<Upload size={15} />} small>
                העלאת תמונה
              </ActionButton>
              {kind === "signature" ? (
                <ActionButton tokens={tokens} color={tokens.purple} onPress={() => setDrawing(true)} icon={<PenLine size={15} />} small>
                  ציור חתימה
                </ActionButton>
              ) : null}
            </div>

            {error ? <p style={{ fontSize: 12, color: tokens.red, marginBottom: 12 }}>{error}</p> : null}

            {list.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                {list.map((a) => (
                  <div key={a.id} style={{ ...glass("thin"), borderRadius: tokens.r16, padding: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <Thumb asset={a} />
                    <span style={{ fontSize: 11, color: tokens.label2, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                    <button
                      type="button"
                      onClick={() => onDelete(a.id)}
                      aria-label="מחק"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", color: tokens.red, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      <Trash2 size={13} /> מחק
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...glass("ultra"), borderRadius: tokens.r16, padding: "28px 16px", textAlign: "center", color: tokens.label3, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <ImagePlus size={26} style={{ opacity: 0.6 }} />
                אין {KIND_LABEL[kind]} עדיין
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
