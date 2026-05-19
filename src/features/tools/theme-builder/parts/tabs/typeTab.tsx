"use client";

import { ArrowUpDown, SlidersHorizontal, Type } from "lucide-react";

import type { ThemeBuilderState } from "../../types";
import { FONT_STACKS, TYPE_SCALES } from "../../config";
import { ChipGroup, FontPicker, Section, Slider } from "../panelControls";

export function TypeTab({
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
      <Section id="fonts-head" title="Heading Font" icon={Type} openSections={openSections} toggleSection={toggleSection}>
        <FontPicker fonts={FONT_STACKS.heading} value={state.fontHeading} onChange={(v) => upd("fontHeading", v)} />
        <div className="mt-2">
          <Slider label="Weight" min={400} max={900} step={100} value={state.fontWeight.heading} onChange={(v) => upd("fontWeight.heading", v)} />
        </div>
      </Section>
      <Section id="fonts-body" title="Body Font" icon={Type} defaultOpen={false} openSections={openSections} toggleSection={toggleSection}>
        <FontPicker fonts={FONT_STACKS.body} value={state.fontBody} onChange={(v) => upd("fontBody", v)} />
        <div className="mt-2">
          <Slider label="Weight" min={300} max={600} step={100} value={state.fontWeight.body} onChange={(v) => upd("fontWeight.body", v)} />
        </div>
      </Section>
      <Section id="fonts-mono" title="Mono Font" icon={Type} defaultOpen={false} openSections={openSections} toggleSection={toggleSection}>
        <FontPicker fonts={FONT_STACKS.mono} value={state.fontMono} onChange={(v) => upd("fontMono", v)} />
      </Section>
      <Section id="type-scale" title="Type Scale" icon={ArrowUpDown} openSections={openSections} toggleSection={toggleSection}>
        <ChipGroup options={TYPE_SCALES} value={state.typeScale} onChange={(v) => upd("typeScale", v)} />
      </Section>
      <Section id="type-props" title="Text Properties" icon={SlidersHorizontal} defaultOpen={false} openSections={openSections} toggleSection={toggleSection}>
        <Slider
          label="Line Height"
          min={1.1}
          max={2}
          step={0.05}
          value={state.lineHeight}
          onChange={(v) => upd("lineHeight", v)}
          display={state.lineHeight.toFixed(2)}
        />
        <Slider
          label="Tracking"
          min={-0.03}
          max={0.08}
          step={0.005}
          value={state.letterSpacing}
          onChange={(v) => upd("letterSpacing", v)}
          display={`${state.letterSpacing.toFixed(3)}em`}
        />
      </Section>
    </>
  );
}
