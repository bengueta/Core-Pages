/** Vault utilities: animations, typography, video-embed (render-only, no backend) */

import { TYPOGRAPHY_DEFAULTS } from "./typography-defaults";

// ─── Animations ───────────────────────────────────────────────────────────────

export type AnimationPresetName =
  | "none" | "fadeUp" | "fadeDown" | "slideRight" | "slideLeft"
  | "scale" | "fadeScale" | "slideUpFast" | "fade" | "slideDown";

const VIEWPORT = { once: true, margin: "-50px 0px", amount: 0.1 } as const;
type AnimPreset = { initial: Record<string, number>; whileInView: Record<string, number>; viewport: typeof VIEWPORT; transition: { duration: number; ease: "easeOut" } };

export const ANIMATION_PRESETS: Record<AnimationPresetName, AnimPreset> = {
  none:        { initial: { opacity: 1 },                 whileInView: { opacity: 1 },            viewport: VIEWPORT, transition: { duration: 0,    ease: "easeOut" } },
  fadeUp:      { initial: { opacity: 0, y: 20 },          whileInView: { opacity: 1, y: 0 },       viewport: VIEWPORT, transition: { duration: 0.5,  ease: "easeOut" } },
  fadeDown:    { initial: { opacity: 0, y: -20 },         whileInView: { opacity: 1, y: 0 },       viewport: VIEWPORT, transition: { duration: 0.5,  ease: "easeOut" } },
  slideRight:  { initial: { opacity: 0, x: -30 },         whileInView: { opacity: 1, x: 0 },       viewport: VIEWPORT, transition: { duration: 0.5,  ease: "easeOut" } },
  slideLeft:   { initial: { opacity: 0, x: 30 },          whileInView: { opacity: 1, x: 0 },       viewport: VIEWPORT, transition: { duration: 0.5,  ease: "easeOut" } },
  scale:       { initial: { opacity: 0, scale: 0.95 },    whileInView: { opacity: 1, scale: 1 },   viewport: VIEWPORT, transition: { duration: 0.4,  ease: "easeOut" } },
  fadeScale:   { initial: { opacity: 0, scale: 0.98 },    whileInView: { opacity: 1, scale: 1 },   viewport: VIEWPORT, transition: { duration: 0.5,  ease: "easeOut" } },
  slideUpFast: { initial: { opacity: 0, y: 15 },          whileInView: { opacity: 1, y: 0 },       viewport: VIEWPORT, transition: { duration: 0.35, ease: "easeOut" } },
  fade:        { initial: { opacity: 0 },                 whileInView: { opacity: 1 },             viewport: VIEWPORT, transition: { duration: 0.5,  ease: "easeOut" } },
  slideDown:   { initial: { opacity: 0, y: -15 },         whileInView: { opacity: 1, y: 0 },       viewport: VIEWPORT, transition: { duration: 0.5,  ease: "easeOut" } },
};

export const ANIMATION_PRESET_OPTIONS: { value: AnimationPresetName; label: string }[] = [
  { value: "none",        label: "ללא" },
  { value: "fadeUp",      label: "פאד למעלה" },
  { value: "fadeDown",    label: "פאד למטה" },
  { value: "slideRight",  label: "הזזה מימין" },
  { value: "slideLeft",   label: "הזזה משמאל" },
  { value: "scale",       label: "הגדלה" },
  { value: "fadeScale",   label: "פאד + הגדלה" },
  { value: "slideUpFast", label: "פאד למעלה (מהיר)" },
  { value: "fade",        label: "פאד בלבד" },
  { value: "slideDown",   label: "הופעה מלמעלה" },
];

export function getScrollPreset(name?: string | null): AnimPreset {
  if (!name || !(name in ANIMATION_PRESETS)) return ANIMATION_PRESETS.fadeUp;
  return ANIMATION_PRESETS[name as AnimationPresetName];
}

// ─── Typography ───────────────────────────────────────────────────────────────

export interface TypographyProps {
  textSize?: string; lineHeight?: string; letterSpacing?: string;
  textAlign?: string; direction?: string;
  /** תאימות לאחור */
  typography?: string;
}

function orDefault<T>(val: T | undefined | null | "", fallback: T): T {
  return (val !== undefined && val !== null && val !== "") ? (val as T) : fallback;
}

function mapLegacyTypography(preset: string) {
  const map: Record<string, { textSize: string; lineHeight: string; letterSpacing: string }> = {
    compact:     { textSize: "14", lineHeight: "1.4",  letterSpacing: "-0.02em" },
    default:     { textSize: "16", lineHeight: "1.75", letterSpacing: "0" },
    comfortable: { textSize: "18", lineHeight: "1.75", letterSpacing: "0" },
    spacious:    { textSize: "20", lineHeight: "2",    letterSpacing: "0.02em" },
    emphasis:    { textSize: "22", lineHeight: "1.5",  letterSpacing: "0" },
  };
  return map[preset] ?? map.default;
}

export function getTypographyProps(p: TypographyProps) {
  const d = TYPOGRAPHY_DEFAULTS;
  const legacy = p.typography ? mapLegacyTypography(p.typography) : null;
  const textSize    = orDefault(p.textSize,     legacy?.textSize     ?? d.textSize);
  const lineHeight  = orDefault(p.lineHeight,   legacy?.lineHeight   ?? d.lineHeight);
  const letterSpacing = orDefault(p.letterSpacing, legacy?.letterSpacing ?? d.letterSpacing);
  const textAlign   = orDefault(p.textAlign,    d.textAlign);
  const direction   = orDefault(p.direction as "rtl" | "ltr" | undefined, d.direction);
  return {
    style: { fontSize: `${textSize}px`, lineHeight, letterSpacing } as React.CSSProperties,
    dir: direction,
    alignClass: textAlign === "center" ? "text-center" : textAlign === "end" ? "text-end" : "text-start",
  };
}

// ─── Video embed ──────────────────────────────────────────────────────────────

export type VideoProvider = "youtube" | "vimeo" | "loom" | null;
export interface VideoEmbedResult { provider: VideoProvider; embedUrl: string | null }

export function getVideoEmbedUrl(url: string): VideoEmbedResult {
  const trimmed = url?.trim();
  if (!trimmed) return { provider: null, embedUrl: null };

  const ytWatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytWatch) return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${ytWatch[1]}` };

  const ytEmbed = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (ytEmbed) return { provider: "youtube", embedUrl: trimmed };

  const vimeo = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeo) return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeo[1]}` };

  const loom = trimmed.match(/(?:loom\.com\/share)\/([a-zA-Z0-9_-]+)/);
  if (loom) return { provider: "loom", embedUrl: `https://www.loom.com/embed/${loom[1]}` };

  return { provider: null, embedUrl: null };
}
