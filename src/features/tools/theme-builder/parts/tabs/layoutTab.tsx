"use client";

import { useMemo } from "react";
import { Layout, Move, Square, Zap } from "lucide-react";

import type { ThemeBuilderState } from "../../types";
import { RADII, TRANSITIONS } from "../../config";
import { ChipGroup, Section, Slider } from "../panelControls";

const FULL = "9999px";
const MAX_PX = 64;

export function LayoutTab({
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
  const radiusPresets = useMemo(() => Object.keys(RADII), []);
  const radiusPx = useMemo(() => {
    const r = state.radius;
    if (!r) return 0;
    if (r === FULL) return MAX_PX;
    if (r === "0") return 0;
    if (r.endsWith("px")) return Number(r.slice(0, -2)) || 0;
    if (r.endsWith("rem")) {
      const rem = Number(r.slice(0, -3)) || 0;
      return Math.round(rem * 16);
    }
    return 0;
  }, [state.radius]);

  const setRadiusPx = (px: number) => {
    const clamped = Math.max(0, Math.min(MAX_PX, Math.round(px)));
    if (clamped >= MAX_PX) upd("radius", FULL);
    else upd("radius", `${clamped}px`);
  };

  return (
    <>
      <Section id="radius" title="Border Radius" icon={Square} openSections={openSections} toggleSection={toggleSection}>
        <Slider
          label="Radius"
          min={0}
          max={MAX_PX}
          step={1}
          value={radiusPx}
          onChange={(v) => setRadiusPx(v)}
          display={state.radius === FULL ? "Full" : `${radiusPx}px`}
        />
        <div className="mt-1">
          <div className="flex flex-wrap gap-1.5">
            {radiusPresets
              .filter((k) => k !== FULL)
              .map((k) => {
                const active = state.radius === k;
                return (
                  <button
                    key={k}
                    onClick={() => upd("radius", k)}
                    className="px-2 py-1 rounded-md transition-colors cursor-pointer"
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      border: `1px solid ${active ? "rgba(201,169,110,.5)" : "rgba(255,255,255,.06)"}`,
                      background: active ? "rgba(201,169,110,.10)" : "rgba(255,255,255,.02)",
                      color: active ? "#e4e4e7" : "rgba(228,228,231,.55)",
                    }}
                    title={k}
                  >
                    {RADII[k] ?? k}
                  </button>
                );
              })}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "rgba(228,228,231,.25)" }}>Full radius is available via the slider only.</div>
        </div>
      </Section>
      <Section id="spacing" title="Spacing Scale" icon={Move} openSections={openSections} toggleSection={toggleSection}>
        <Slider
          label="Multiplier"
          min={0.7}
          max={1.5}
          step={0.05}
          value={state.spacing}
          onChange={(v) => upd("spacing", v)}
          display={`${state.spacing.toFixed(2)}×`}
        />
        <Slider
          label="Container"
          min={960}
          max={1536}
          step={64}
          value={state.containerWidth}
          onChange={(v) => upd("containerWidth", v)}
          display={`${state.containerWidth}px`}
        />
      </Section>
      <Section id="borders" title="Borders" icon={Square} defaultOpen={false} openSections={openSections} toggleSection={toggleSection}>
        <Slider label="Width" min={0} max={6} step={1} value={state.borderWidth} onChange={(v) => upd("borderWidth", v)} display={`${state.borderWidth}px`} />
        <div className="mt-1">
          <ChipGroup
            options={{ solid: "Solid", dashed: "Dashed", dotted: "Dotted", double: "Double", none: "None" }}
            value={state.borderStyle}
            onChange={(v) => upd("borderStyle", v)}
          />
        </div>
      </Section>
      <Section id="container-style" title="App Container Style" icon={Layout} defaultOpen={false} openSections={openSections} toggleSection={toggleSection}>
        <ChipGroup options={{ none: "None", floating: "Floating Shadow", card: "Card Wrapper" }} value={state.wrapperStyle} onChange={(v) => upd("wrapperStyle", v)} />
      </Section>
      <Section id="motion" title="Motion & Transitions" icon={Zap} defaultOpen={false} openSections={openSections} toggleSection={toggleSection}>
        <ChipGroup options={TRANSITIONS} value={state.transition} onChange={(v) => upd("transition", v)} />
      </Section>
    </>
  );
}
