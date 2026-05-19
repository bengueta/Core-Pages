"use client";

import { useMemo, useState } from "react";
import { Copy, Download, Palette, Play, PlusSquare, Trash2 } from "lucide-react";

import type { UserPreset } from "../../types";
import { PRESETS } from "../../config";
import { Section } from "../panelControls";

export function PresetsTab({
  userPresets,
  onSaveCurrent,
  onApplyUserPreset,
  onDeleteUserPreset,
  onDuplicateUserPreset,
  onExportUserPreset,
  onImportFromJson,
  applyBuiltInPreset,
  activePreset,
}: {
  userPresets: UserPreset[];
  onSaveCurrent: (name: string) => void;
  onApplyUserPreset: (id: string) => void;
  onDeleteUserPreset: (id: string) => void;
  onDuplicateUserPreset: (id: string) => void;
  onExportUserPreset: (id: string) => void;
  onImportFromJson: (raw: string) => boolean;
  applyBuiltInPreset: (name: string) => void;
  activePreset: string;
}) {
  const [name, setName] = useState("");
  const canSave = name.trim().length > 0;
  const sortedUserPresets = useMemo(() => [...userPresets].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1)), [userPresets]);
  const [importRaw, setImportRaw] = useState("");
  const [pendingDelete, setPendingDelete] = useState<null | { id: string; name: string }>(null);

  return (
    <>
      <Section id="presets-actions" title="Preset Library" icon={Palette} openSections={{}} toggleSection={() => {}} defaultOpen>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Preset name..."
              className="flex-1 px-2 py-2 rounded-md outline-none"
              style={{
                fontSize: 11,
                fontFamily: "'DM Mono',monospace",
                color: "rgba(228,228,231,.75)",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            />
            <button
              onClick={() => {
                if (!canSave) return;
                onSaveCurrent(name);
                setName("");
              }}
              className="px-3 py-2 rounded-md cursor-pointer"
              style={{
                fontSize: 11,
                fontWeight: 700,
                border: "1px solid #c9a96e",
                color: canSave ? "#09090b" : "rgba(228,228,231,.35)",
                background: canSave ? "#c9a96e" : "transparent",
                opacity: canSave ? 1 : 0.7,
              }}
              title="Save current preset"
            >
              Save
            </button>
          </div>
          <div style={{ fontSize: 10, color: "rgba(228,228,231,.25)" }}>Save your current theme as a named preset. It will appear below.</div>
        </div>
      </Section>

      <Section id="presets-import" title="Import / Export" icon={Download} openSections={{}} toggleSection={() => {}} defaultOpen={false}>
        <div style={{ fontSize: 10, color: "rgba(228,228,231,.25)", marginBottom: 8 }}>
          Paste preset JSON here to import (single preset, array, or versioned export).
        </div>
        <textarea
          value={importRaw}
          onChange={(e) => setImportRaw(e.target.value)}
          placeholder='{"version":1,"presets":[...]}'
          className="w-full px-2 py-2 rounded-md outline-none"
          style={{
            minHeight: 80,
            fontSize: 10,
            fontFamily: "'DM Mono',monospace",
            color: "rgba(228,228,231,.75)",
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.06)",
            resize: "vertical",
          }}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => {
              const raw = importRaw.trim();
              if (!raw) return;
              const imported = onImportFromJson(raw);
              if (imported) setImportRaw("");
            }}
            className="flex-1 px-3 py-2 rounded-md cursor-pointer"
            style={{
              fontSize: 11,
              fontWeight: 700,
              border: "1px solid rgba(255,255,255,.08)",
              background: "rgba(255,255,255,.03)",
              color: "rgba(228,228,231,.75)",
            }}
            title="Import presets"
          >
            Import
          </button>
        </div>
      </Section>

      <Section id="presets-built-in" title="Built-in Presets" icon={Palette} openSections={{}} toggleSection={() => {}} defaultOpen>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(PRESETS).map(([k, p]) => (
            <button
              key={k}
              onClick={() => applyBuiltInPreset(k)}
              className="p-1.5 rounded-md text-center transition-all cursor-pointer hover:bg-white/10"
              style={{
                border: `1px solid ${k === activePreset ? "rgba(201,169,110,.5)" : "rgba(255,255,255,.06)"}`,
                background: k === activePreset ? "rgba(201,169,110,.06)" : "rgba(255,255,255,.02)",
              }}
            >
              <div className="flex justify-center gap-0.5 mb-1">
                {(p as (typeof PRESETS)[keyof typeof PRESETS]).dots.map((c, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
                ))}
              </div>
              <div
                style={{
                  fontSize: 7,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  color: k === activePreset ? "#c9a96e" : "rgba(228,228,231,.25)",
                }}
              >
                {k}
              </div>
            </button>
          ))}
        </div>
      </Section>

      <Section id="presets-saved" title="Saved Presets" icon={Palette} openSections={{}} toggleSection={() => {}} defaultOpen>
        {userPresets.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(228,228,231,.35)" }}>No saved presets yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedUserPresets.map((p) => (
              <div
                key={p.id}
                className="rounded-lg overflow-hidden"
                style={{
                  border: activePreset === `user:${p.id}` ? "1px solid rgba(201,169,110,.55)" : "1px solid rgba(255,255,255,.06)",
                  background: "rgba(255,255,255,.02)",
                }}
              >
                <div className="grid grid-cols-3" style={{ height: 26 }}>
                  {[p.state.colors.primary, p.state.colors.accent ?? p.state.colors.primary, p.state.colors.secondary ?? p.state.colors.background].map(
                    (c, i) => (
                      <div key={i} style={{ background: c }} />
                    )
                  )}
                </div>
                <div className="px-3 py-2">
                  <div className="truncate" style={{ fontSize: 12, fontWeight: 700, color: "rgba(228,228,231,.85)" }}>
                    {p.name}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 10, color: "rgba(228,228,231,.25)", fontFamily: "'DM Mono',monospace" }}>
                    {new Date(p.savedAt).toLocaleString()}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onApplyUserPreset(p.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md cursor-pointer"
                      style={{
                        border: "1px solid rgba(201,169,110,.45)",
                        background: "rgba(201,169,110,.08)",
                        color: "#c9a96e",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                      title="Apply preset"
                    >
                      <Play size={14} />
                      Apply
                    </button>
                    <button
                      onClick={() => onDuplicateUserPreset(p.id)}
                      className="px-3 py-2 rounded-md cursor-pointer"
                      style={{ border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.03)", color: "rgba(228,228,231,.55)" }}
                      title="Duplicate preset"
                    >
                      <PlusSquare size={16} />
                    </button>
                    <button
                      onClick={() => onExportUserPreset(p.id)}
                      className="px-3 py-2 rounded-md cursor-pointer"
                      style={{ border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.03)", color: "rgba(228,228,231,.55)" }}
                      title="Copy preset JSON"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => setPendingDelete({ id: p.id, name: p.name })}
                      className="px-3 py-2 rounded-md cursor-pointer"
                      style={{ border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.03)", color: "rgba(228,228,231,.55)" }}
                      title="Delete preset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {pendingDelete ? (
        <div
          className="fixed inset-0 z-[85] grid place-items-center p-4"
          style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(3px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setPendingDelete(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-xl"
            style={{
              background: "rgba(14,14,18,.98)",
              border: "1px solid rgba(255,255,255,.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,.55)",
            }}
          >
            <div className="px-4 pt-4 pb-2" style={{ color: "#e4e4e7", fontSize: 14, fontWeight: 700 }}>
              Delete preset?
            </div>
            <div className="px-4 pb-4" style={{ color: "rgba(228,228,231,.68)", fontSize: 12, lineHeight: 1.5 }}>
              Are you sure you want to delete the preset &quot;{pendingDelete.name}&quot;?
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2 rounded-md cursor-pointer"
                style={{
                  border: "1px solid rgba(255,255,255,.14)",
                  background: "rgba(255,255,255,.02)",
                  color: "rgba(228,228,231,.8)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteUserPreset(pendingDelete.id);
                  setPendingDelete(null);
                }}
                className="flex-1 py-2 rounded-md cursor-pointer"
                style={{
                  border: "1px solid rgba(239,68,68,.55)",
                  background: "rgba(239,68,68,.14)",
                  color: "#fecaca",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
