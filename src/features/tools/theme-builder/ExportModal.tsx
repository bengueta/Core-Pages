"use client";

import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";

import type { ExportFormat } from "./types";
import type { ExportPack } from "./tools/export-pack/exportPack";

export function ExportModal({
  open,
  onClose,
  getExport,
  exportTab,
  setExportTab,
  exportPack,
  onNotify,
}: {
  open: boolean;
  onClose: () => void;
  getExport: (format: ExportFormat) => string;
  exportTab: ExportFormat;
  setExportTab: (tab: ExportFormat) => void;
  exportPack: ExportPack;
  onNotify: (kind: "success" | "error" | "info", text: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<null | keyof ExportPack>(null);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setCopiedKey(null);
    }
  }, [open]);

  if (!open) return null;

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onNotify("success", "Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1500);
      return true;
    } catch {
      onNotify("error", "Copy failed. Clipboard permission blocked.");
      return false;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "85vh",
          background: "rgba(14,14,18,.97)",
          backdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 14,
          boxShadow: "0 24px 80px rgba(0,0,0,.6)",
        }}
      >
        <div className="flex justify-between items-start px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: "#e4e4e7" }}>Export theme</div>
            <div style={{ fontSize: 10, color: "rgba(228,228,231,.35)", marginTop: 2 }}>CSS, Tailwind fragment, and AI-ready JSON spec</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg grid place-items-center transition-colors cursor-pointer hover:bg-white/5 text-zinc-400">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 flex-1 overflow-y-auto">
          <div className="flex gap-0.5 p-0.5 mb-3 rounded-lg" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}>
            {(["css", "tailwind", "json", "pack"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setExportTab(t)}
                className="flex-1 py-1.5 rounded-md text-center transition-colors cursor-pointer"
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  background: t === exportTab ? "rgba(255,255,255,.08)" : "transparent",
                  color: t === exportTab ? "#e4e4e7" : "rgba(228,228,231,.3)",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          {exportTab === "pack" ? (
            <div className="grid gap-2">
              {(
                [
                  { key: "cssVariables", title: "CSS variables (:root)" },
                  { key: "tailwindSnippet", title: "Tailwind extend" },
                  { key: "aiThemeSpecification", title: "AI theme spec (JSON)" },
                ] as const
              ).map((b) => (
                <div
                  key={b.key}
                  className="rounded-lg overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,.06)", background: "rgba(0,0,0,.4)" }}
                >
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(228,228,231,.45)", fontWeight: 700 }}>
                      {b.title}
                    </div>
                    <button
                      onClick={async () => {
                        const copiedOk = await copyText(exportPack[b.key]);
                        if (!copiedOk) return;
                        setCopiedKey(b.key);
                        window.setTimeout(() => setCopiedKey(null), 1500);
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border border-white/10 text-zinc-400 hover:bg-white/5 flex items-center gap-1.5"
                      title="Copy"
                    >
                      {copiedKey === b.key ? <Check size={13} /> : <Copy size={13} />}
                      {copiedKey === b.key ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre
                    className="p-3 overflow-auto"
                    style={{
                      fontSize: 10,
                      lineHeight: 1.65,
                      fontFamily: "'DM Mono',monospace",
                      color: "#9da5b4",
                      maxHeight: 240,
                      whiteSpace: "pre",
                      tabSize: 2,
                    }}
                    dir="ltr"
                  >
                    {exportPack[b.key]}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <pre
              className="p-3 rounded-lg overflow-auto"
              style={{
                background: "rgba(0,0,0,.5)",
                border: "1px solid rgba(255,255,255,.06)",
                fontSize: 10,
                lineHeight: 1.65,
                fontFamily: "'DM Mono',monospace",
                color: "#9da5b4",
                maxHeight: 320,
                whiteSpace: "pre",
                tabSize: 2,
              }}
              dir="ltr"
            >
              {getExport(exportTab)}
            </pre>
          )}
        </div>

        <div className="flex gap-2 px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <button
            onClick={() => {
              void copyText(exportTab === "pack" ? exportPack.aiThemeSpecification : getExport(exportTab));
            }}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            style={{
              border: "1px solid #c9a96e",
              color: copied ? "#09090b" : "#c9a96e",
              background: copied ? "#c9a96e" : "transparent",
            }}
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer border border-white/10 text-zinc-400 hover:bg-white/5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

