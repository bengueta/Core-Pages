"use client";

import { Box, Flame, Gem, Grid3X3, Sparkles } from "lucide-react";

import type { ThemeBuilderState } from "../../types";
import { PATTERNS, SHADOWS } from "../../config";
import { ChipGroup, Section, Slider } from "../panelControls";

export function EffectsTab({
  state,
  upd,
  openSections,
  toggleSection,
}: {
  state: ThemeBuilderState;
  upd: (path: string, value: unknown) => void;
  openSections: Record<string, boolean | undefined>;
  toggleSection: (id: string) => void;
}) {
  return (
    <>
      <Section id="card-styles" title="Card & Shadow Style" icon={Box} openSections={openSections} toggleSection={toggleSection}>
        <div className="t-heading">Card Background</div>
        <ChipGroup options={{ flat: "Flat", glass: "Glass", gradient: "Gradient" }} value={state.cardStyle} onChange={(v) => upd("cardStyle", v)} />
        <div className="t-heading mt-3">Shadow Type</div>
        <ChipGroup
          options={{ soft: "Soft / Natural", hard: "Hard / Solid", neon: "Neon Glow" }}
          value={state.shadowType}
          onChange={(v) => upd("shadowType", v)}
        />
        {state.shadowType === "soft" ? (
          <div className="mt-2">
            <ChipGroup
              options={Object.fromEntries(Object.keys(SHADOWS).map((k) => [k, k.charAt(0).toUpperCase() + k.slice(1)]))}
              value={state.shadow}
              onChange={(v) => upd("shadow", v)}
            />
          </div>
        ) : null}
      </Section>

      {state.cardStyle === "glass" ? (
        <Section id="glass-fx" title="Glassmorphism settings" icon={Gem} openSections={openSections} toggleSection={toggleSection}>
          <Slider label="Blur" min={2} max={40} step={2} value={state.glass.blur} onChange={(v) => upd("glass.blur", v)} display={`${state.glass.blur}px`} />
          <Slider
            label="Opacity"
            min={0.02}
            max={0.4}
            step={0.01}
            value={state.glass.opacity}
            onChange={(v) => upd("glass.opacity", v)}
            display={`${Math.round(state.glass.opacity * 100)}%`}
          />
          <Slider label="Border" min={0.0} max={0.5} step={0.05} value={state.glass.border} onChange={(v) => upd("glass.border", v)} display={`${Math.round(state.glass.border * 100)}%`} />
          <Slider
            label="Saturation"
            min={0.5}
            max={2.5}
            step={0.1}
            value={state.glass.saturation}
            onChange={(v) => upd("glass.saturation", v)}
            display={`${state.glass.saturation.toFixed(1)}×`}
          />
        </Section>
      ) : null}

      {state.shadowType === "neon" ? (
        <Section id="neon-fx" title="Neon Glow Settings" icon={Flame} openSections={openSections} toggleSection={toggleSection}>
          <div className="t-heading">Glow Color</div>
          <div className="flex gap-1 mb-3">
            {["var(--c-accent)", "#00ff88", "#ff3366", "#00aaff", "#ffaa00", "#aa55ff"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => upd("glow.color", c)}
                className="w-5 h-5 rounded-full transition-transform hover:scale-110 cursor-pointer"
                style={{
                  background: c === "var(--c-accent)" ? state.colors.accent : c,
                  border: c === state.glow.color ? "2px solid #fff" : "2px solid transparent",
                }}
                title={c === "var(--c-accent)" ? "Auto (Accent)" : c}
              />
            ))}
          </div>
          <Slider
            label="Intensity"
            min={0.1}
            max={1.5}
            step={0.1}
            value={state.glow.intensity}
            onChange={(v) => upd("glow.intensity", v)}
            display={`${Math.round(state.glow.intensity * 100)}%`}
          />
        </Section>
      ) : null}

      <Section id="pattern-fx" title="Background Pattern" icon={Grid3X3} openSections={openSections} toggleSection={toggleSection} defaultOpen={false}>
        <ChipGroup options={PATTERNS} value={state.pattern} onChange={(v) => upd("pattern", v)} />
        <div className="mt-3">
          <Slider
            label="Opacity"
            min={0}
            max={0.5}
            step={0.02}
            value={state.patternOpacity}
            onChange={(v) => upd("patternOpacity", v)}
            display={`${Math.round(state.patternOpacity * 100)}%`}
          />
          <Slider label="Size" min={4} max={64} step={2} value={state.patternSize} onChange={(v) => upd("patternSize", v)} display={`${state.patternSize}px`} />
        </div>
      </Section>

      <Section id="misc-fx" title="Misc Settings" icon={Sparkles} openSections={openSections} toggleSection={toggleSection} defaultOpen={false}>
        <div className="t-heading">App Background</div>
        <ChipGroup options={{ solid: "Solid Color", mesh: "Mesh Gradient", grain: "Noise/Grain" }} value={state.appBgStyle} onChange={(v) => upd("appBgStyle", v)} />
        <div className="t-heading mt-3">Button Text</div>
        <ChipGroup options={{ none: "Normal", uppercase: "UPPERCASE" }} value={state.buttonTransform} onChange={(v) => upd("buttonTransform", v)} />
      </Section>
    </>
  );
}
