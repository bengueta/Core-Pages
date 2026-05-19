"use client";

import { Sparkles } from "lucide-react";

import type { ThemeBuilderState } from "../../types";
import { THEME_STYLES } from "../../config";
import { Section } from "../panelControls";

export function ThemesTab({
  state,
  openSections,
  toggleSection,
  applyThemePreset,
}: {
  state: ThemeBuilderState;
  openSections: Record<string, boolean | undefined>;
  toggleSection: (id: string) => void;
  applyThemePreset: (key: string) => void;
}) {
  return (
    <Section id="theme-style" title="Apply Global Theme" icon={Sparkles} openSections={openSections} toggleSection={toggleSection}>
      <div className="grid grid-cols-2 gap-1.5">
        {THEME_STYLES.map((t) => {
          const Icon = t.icon;
          const active = t.key === state.themeStyle;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => applyThemePreset(t.key)}
              className="relative p-2.5 rounded-lg text-center transition-all cursor-pointer hover:bg-white/10"
              style={{
                border: `1px solid ${active ? "rgba(201,169,110,.5)" : "rgba(255,255,255,.06)"}`,
                background: active ? "rgba(201,169,110,.06)" : "rgba(255,255,255,.02)",
              }}
            >
              {active ? (
                <div className="absolute top-1.5 right-2" style={{ fontSize: 9, color: "#c9a96e" }}>
                  ✓
                </div>
              ) : null}
              <Icon size={16} style={{ margin: "0 auto 3px", color: active ? "#c9a96e" : "rgba(228,228,231,.25)" }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: active ? "#e4e4e7" : "rgba(228,228,231,.45)" }}>{t.name}</div>
              <div style={{ fontSize: 8, color: "rgba(228,228,231,.2)", marginTop: 1 }}>{t.desc}</div>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
