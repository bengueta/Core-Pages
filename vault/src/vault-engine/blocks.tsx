"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Info, CheckCircle, AlertTriangle,
  Lightbulb, StickyNote,
  Zap, Target, TrendingUp, Shield, Clock, Users,
  Check, ChevronDown,
} from "lucide-react";
import { cn } from "./lib/cn";
import { getTypographyProps, getVideoEmbedUrl } from "./lib/utils";

// ─── Shared empty-state placeholder ──────────────────────────────────────────

function EmptyPlaceholder({ text }: { text: string }) {
  return (
    <div className="my-8 p-4 rounded-lg bg-neutral-800/30 border border-dashed border-neutral-600 text-gray-500 text-center text-sm">
      {text}
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface HeroBlockProps { title: string; subtitle?: string; imageUrl?: string }
export function HeroBlock({ title, subtitle, imageUrl }: HeroBlockProps) {
  const [imageError, setImageError] = useState(false);
  return (
    <div className="relative w-full min-h-[400px] md:min-h-[500px] rounded-2xl overflow-hidden mb-12" dir="rtl">
      {imageUrl && !imageError && (
        <div className="absolute inset-0">
          <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" onError={() => setImageError(true)} />
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] p-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black palette-heading mb-4">{title}</h1>
        {subtitle && <p className="text-xl md:text-2xl palette-body max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  );
}

interface ImageTextBlockProps {
  title: string; body: string; imageUrl?: string; layout?: "right" | "left";
  textSize?: string; lineHeight?: string; letterSpacing?: string;
  textAlign?: string; direction?: string; typography?: string;
}
export function ImageTextBlock({ title, body, imageUrl, layout = "right", ...typoProps }: ImageTextBlockProps) {
  const [imageError, setImageError] = useState(false);
  const isRight = layout === "right";
  const typo = getTypographyProps(typoProps);
  return (
    <div className={cn("flex flex-col md:flex-row gap-8 mb-12", isRight ? "md:flex-row-reverse" : "md:flex-row")} dir={typo.dir}>
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-black palette-heading mb-4">{title}</h2>
        <div style={typo.style} className={cn("prose prose-invert max-w-none prose-p-palette", typo.alignClass)}>
          {body.split("\n").map((p, i) => <p key={i} className="mb-4">{p}</p>)}
        </div>
      </div>
      {imageUrl && (
        <div className="flex-1 relative min-h-[300px] rounded-xl overflow-hidden">
          {!imageError
            ? <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" onError={() => setImageError(true)} />
            : <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><p className="text-gray-500">תמונה לא זמינה</p></div>}
        </div>
      )}
    </div>
  );
}

// ─── Text ─────────────────────────────────────────────────────────────────────

interface HeadingBlockProps { level?: "h2" | "h3"; text: string }
export function HeadingBlock({ level = "h2", text }: HeadingBlockProps) {
  if (!text.trim()) return null;
  const Tag = level;
  return (
    <div className="my-10" dir="rtl">
      <Tag className={cn("font-black palette-heading", level === "h2" && "text-3xl md:text-4xl", level === "h3" && "text-2xl md:text-3xl")}>
        {text}
      </Tag>
    </div>
  );
}

interface TextBlockProps {
  title?: string; body: string;
  textSize?: string; lineHeight?: string; letterSpacing?: string;
  textAlign?: string; direction?: string; typography?: string;
}
export function TextBlock({ title, body, ...typoProps }: TextBlockProps) {
  const typo = getTypographyProps(typoProps);
  if (!body.trim()) return <EmptyPlaceholder text="אין תוכן" />;
  return (
    <div className="my-12" dir={typo.dir}>
      {title && <h3 className="text-xl md:text-2xl font-bold palette-heading mb-4">{title}</h3>}
      <div style={typo.style} className={cn("prose prose-invert max-w-none prose-p-palette", typo.alignClass)}>
        {body.split("\n").map((p, i) => <p key={i} className="mb-4">{p}</p>)}
      </div>
    </div>
  );
}

interface QuoteBlockProps { text: string; author?: string }
export function QuoteBlock({ text, author }: QuoteBlockProps) {
  return (
    <div className="my-12 p-8 bg-white/5 rounded-lg palette-border-r border-r-4 border-orange-500/50" dir="rtl">
      <p className="text-2xl md:text-3xl italic leading-relaxed palette-body mb-4">{text}</p>
      {author && <p className="text-sm text-gray-400">— {author}</p>}
    </div>
  );
}

// ─── Callouts & Alerts ────────────────────────────────────────────────────────

type AlertVariant = "info" | "success" | "warning";
const ALERT_CONFIGS: Record<AlertVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  info:    { bg: "bg-blue-500/10",   border: "border-blue-500/40",   icon: <Info className="w-5 h-5 shrink-0 text-blue-400" /> },
  success: { bg: "bg-green-500/10",  border: "border-green-500/40",  icon: <CheckCircle className="w-5 h-5 shrink-0 text-green-400" /> },
  warning: { bg: "bg-amber-500/10",  border: "border-amber-500/40",  icon: <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" /> },
};

interface AlertBlockProps {
  title?: string; body: string; variant?: AlertVariant;
  textSize?: string; lineHeight?: string; letterSpacing?: string;
  textAlign?: string; direction?: string; typography?: string;
}
export function AlertBlock({ title, body, variant = "info", ...typoProps }: AlertBlockProps) {
  const config = ALERT_CONFIGS[variant];
  const typo = getTypographyProps(typoProps);
  if (!body.trim()) return <EmptyPlaceholder text="הוסף תוכן להדגשה" />;
  return (
    <div className={cn("my-12 p-6 md:p-8 rounded-xl border", config.bg, config.border)} dir={typo.dir}>
      <div className="flex gap-4">
        <div className="shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          {title && <h3 className="text-lg font-bold text-white mb-2">{title}</h3>}
          <div style={typo.style} className={cn("prose prose-invert max-w-none prose-p:text-gray-300", typo.alignClass)}>
            {body.split("\n").map((p, i) => <p key={i} className="mb-2 last:mb-0">{p}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

type CalloutVariant = "tip" | "important" | "note";
const CALLOUT_CONFIGS: Record<CalloutVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  tip:       { bg: "bg-amber-500/10",   border: "border-amber-500/40",   icon: <Lightbulb className="w-5 h-5 shrink-0 text-amber-400" /> },
  important: { bg: "bg-orange-500/10",  border: "border-orange-500/40",  icon: <AlertTriangle className="w-5 h-5 shrink-0 text-orange-400" /> },
  note:      { bg: "bg-neutral-700/30", border: "border-neutral-600",    icon: <StickyNote className="w-5 h-5 shrink-0 text-gray-400" /> },
};

interface CalloutBlockProps {
  title?: string; body: string; variant?: CalloutVariant; size?: "default" | "compact";
  textSize?: string; lineHeight?: string; letterSpacing?: string;
  textAlign?: string; direction?: string; typography?: string;
}
export function CalloutBlock({ title, body, variant = "tip", size = "default", ...typoProps }: CalloutBlockProps) {
  const config = CALLOUT_CONFIGS[variant];
  const typo = getTypographyProps(typoProps);
  if (!body.trim()) return <EmptyPlaceholder text="הוסף תוכן להערה" />;
  return (
    <div className={cn("my-12 rounded-xl border", size === "compact" ? "p-4 md:p-5" : "p-6 md:p-8", config.bg, config.border)} dir={typo.dir}>
      <div className="flex gap-4">
        <div className="shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          {title && <h3 className="text-lg font-bold text-white mb-2">{title}</h3>}
          <div style={typo.style} className={cn("prose prose-invert max-w-none prose-p:text-gray-300", typo.alignClass)}>
            {body.split("\n").map((p, i) => <p key={i} className="mb-2 last:mb-0">{p}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lists ────────────────────────────────────────────────────────────────────

interface ListBlockProps { body: string; ordered?: "yes" | "no" }
export function ListBlock({ body, ordered = "no" }: ListBlockProps) {
  const items = body.split("\n").map((l) => l.trim()).filter(Boolean);
  if (items.length === 0) return <EmptyPlaceholder text="הוסף פריטים (שורה אחת לכל פריט)" />;
  const Tag = ordered === "yes" ? "ol" : "ul";
  return (
    <div className="my-12" dir="rtl">
      <Tag className={cn("space-y-3 text-gray-200", ordered === "yes" ? "list-decimal list-inside" : "list-disc list-inside")}>
        {items.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
      </Tag>
    </div>
  );
}

interface ChecklistBlockProps { body: string; style?: "check" | "minimal" }
export function ChecklistBlock({ body, style = "check" }: ChecklistBlockProps) {
  const items = body.split("\n").map((l) => l.trim()).filter(Boolean);
  if (items.length === 0) return <EmptyPlaceholder text="הוסף פריטים (שורה אחת לכל פריט)" />;
  return (
    <div className="my-12" dir="rtl">
      <ul className={cn("space-y-3", style === "minimal" && "space-y-2")}>
        {items.map((item, i) => (
          <li key={i} className={cn("flex items-start gap-3", style === "minimal" ? "text-gray-300" : "text-gray-200")}>
            {style === "check"
              ? <span className="shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-orange-500/20 text-orange-400"><Check className="w-3 h-3" strokeWidth={3} /></span>
              : <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-orange-500/60" />}
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface FAQBlockProps { body: string; defaultOpen?: "first" | "none" }
interface FAQItem { question: string; answer: string }
function parseFAQItems(body: string): FAQItem[] {
  return body.split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
    const idx = line.indexOf("::");
    return idx >= 0 ? { question: line.slice(0, idx).trim(), answer: line.slice(idx + 2).trim() } : { question: line, answer: "" };
  }).filter((item) => item.question);
}
export function FAQBlock({ body, defaultOpen = "first" }: FAQBlockProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen === "first" ? 0 : null);
  const items = parseFAQItems(body);
  if (items.length === 0) return <EmptyPlaceholder text="הוסף פריטים (שאלה::תשובה בכל שורה)" />;
  return (
    <div className="my-12" dir="rtl">
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={cn("rounded-lg border overflow-hidden transition-colors", openIndex === i ? "border-orange-500/40 bg-neutral-800/50" : "border-neutral-700 bg-neutral-900/30")}>
            <button type="button" onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right hover:bg-neutral-800/30 transition-colors">
              <span className="font-semibold text-white">{item.question}</span>
              <ChevronDown className={cn("w-5 h-5 shrink-0 text-gray-400 transition-transform", openIndex === i && "rotate-180")} />
            </button>
            {openIndex === i && item.answer && <div className="px-5 pb-4 pt-0"><p className="text-gray-300 leading-relaxed">{item.answer}</p></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TimelineBlockProps {
  step1Title?: string; step1Desc?: string;
  step2Title?: string; step2Desc?: string;
  step3Title?: string; step3Desc?: string;
  step4Title?: string; step4Desc?: string;
}
export function TimelineBlock({ step1Title = "", step1Desc = "", step2Title = "", step2Desc = "", step3Title = "", step3Desc = "", step4Title = "", step4Desc = "" }: TimelineBlockProps) {
  const steps = [
    { title: step1Title, desc: step1Desc },
    { title: step2Title, desc: step2Desc },
    { title: step3Title, desc: step3Desc },
    { title: step4Title, desc: step4Desc },
  ].filter((s) => s.title.trim() || s.desc.trim());
  if (steps.length === 0) return <EmptyPlaceholder text="הוסף שלבים (כותרת ותיאור לכל שלב)" />;
  return (
    <div className="my-12" dir="rtl">
      <div className="relative">
        <div className="absolute top-0 bottom-0 right-[11px] w-0.5 bg-neutral-700" />
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="relative flex gap-6">
              <div className="shrink-0 w-6 h-6 rounded-full bg-orange-500/80 border-2 border-orange-400 flex items-center justify-center z-10 text-[10px] font-bold text-white">{i + 1}</div>
              <div className="flex-1 pb-4">
                {step.title && <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>}
                {step.desc && <p className="text-gray-300 leading-relaxed">{step.desc}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Data / Stats ─────────────────────────────────────────────────────────────

type StatsLayout = "row" | "cards" | "compact";
type StatsStyle = "minimal" | "bordered" | "filled";
type ValueSize = "small" | "default" | "large";
type Align = "start" | "center" | "end";
type Variant = "below" | "above" | "inline";
type Gap = "tight" | "default" | "loose";

interface StatItem { value: string; label: string }
interface StatsBlockProps {
  value1?: string; label1?: string; value2?: string; label2?: string;
  value3?: string; label3?: string; value4?: string; label4?: string;
  layout?: StatsLayout; columns?: string; style?: StatsStyle;
  valueSize?: ValueSize; align?: Align; variant?: Variant; divider?: "no" | "yes"; gap?: Gap;
}

const VALUE_SIZE: Record<ValueSize, string> = { small: "text-xl md:text-2xl", default: "text-3xl md:text-4xl", large: "text-4xl md:text-5xl" };
const COMPACT_SIZE: Record<ValueSize, string> = { small: "text-xl md:text-2xl", default: "text-2xl md:text-3xl", large: "text-3xl md:text-4xl" };
const ALIGN_CLS: Record<Align, string> = { start: "justify-start text-start", center: "justify-center text-center", end: "justify-end text-end" };
const GAP_CLS: Record<Gap, string> = { tight: "gap-4", default: "gap-6", loose: "gap-8" };

export function StatsBlock({ value1, label1, value2, label2, value3, label3, value4, label4, layout = "row", columns = "4", style = "minimal", valueSize = "default", align = "center", variant = "below", divider = "no", gap = "default" }: StatsBlockProps) {
  const items: StatItem[] = [
    { value: value1?.trim() || "", label: label1?.trim() || "" },
    { value: value2?.trim() || "", label: label2?.trim() || "" },
    { value: value3?.trim() || "", label: label3?.trim() || "" },
    { value: value4?.trim() || "", label: label4?.trim() || "" },
  ].filter((s) => s.value || s.label).map((s) => ({ value: s.value || "—", label: s.label }));

  if (items.length === 0) return <EmptyPlaceholder text="הוסף לפחות סטטיסטיקה אחת" />;

  const cols = layout === "row" ? parseInt(columns || "4", 10) : 2;
  const gridCols = cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  const vSizeClass = layout === "compact" ? COMPACT_SIZE[valueSize] : VALUE_SIZE[valueSize];
  const showDivider = layout === "row" && divider === "yes";

  return (
    <div
      className={cn("my-12",
        layout === "row" && ["grid grid-cols-1", gridCols, GAP_CLS[gap], ALIGN_CLS[align]],
        layout === "cards" && ["grid grid-cols-1 sm:grid-cols-2", GAP_CLS[gap], ALIGN_CLS[align]],
        layout === "compact" && ["flex flex-wrap", align === "start" && "justify-start", align === "center" && "justify-center", align === "end" && "justify-end", "gap-x-12 gap-y-4"]
      )}
      dir="rtl"
    >
      {items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
          className={cn(
            layout === "row" && (align === "start" ? "text-start" : align === "end" ? "text-end" : "text-center"),
            layout === "cards" && cn("p-6 rounded-xl", style === "minimal" && "bg-white/5", style === "bordered" && "border border-neutral-700 bg-neutral-800/30", style === "filled" && "bg-neutral-800/50 border border-neutral-700"),
            layout === "compact" && "inline-block",
            showDivider && "border-r border-neutral-600 pr-6 first:border-r-0 first:pr-0"
          )}
        >
          {variant === "above" ? (
            <>
              {item.label && <span className="text-sm md:text-base text-gray-400">{item.label}</span>}
              <span className={cn("font-black palette-accent mt-1 block", vSizeClass)}>{item.value}</span>
            </>
          ) : variant === "inline" ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={cn("font-black palette-accent", vSizeClass, "ml-1")}>{item.value}</span>
              {item.label && <span className="text-sm md:text-base text-gray-400">{item.label}</span>}
            </div>
          ) : (
            <>
              <span className={cn("font-black palette-accent block mb-1", vSizeClass)}>{item.value}</span>
              {item.label && <span className="text-sm md:text-base text-gray-400">{item.label}</span>}
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}

interface ProgressBarBlockProps { label: string; value: string; variant?: "bar" | "compact" }
export function ProgressBarBlock({ label, value, variant = "bar" }: ProgressBarBlockProps) {
  const num = Math.min(100, Math.max(0, parseInt(value, 10) || 0));
  if (variant === "compact") {
    return (
      <div className="my-8" dir="rtl">
        <div className="flex justify-between items-center gap-4 mb-2">
          <span className="text-gray-300 text-sm">{label}</span>
          <span className="text-orange-400 font-semibold">{num}%</span>
        </div>
        <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
          <div className="h-full bg-orange-500/80 rounded-full transition-all duration-500" style={{ width: `${num}%` }} />
        </div>
      </div>
    );
  }
  return (
    <div className="my-12 p-6 rounded-xl border border-neutral-700 bg-neutral-900/50" dir="rtl">
      <div className="flex justify-between items-center gap-4 mb-3">
        <span className="font-medium text-white">{label}</span>
        <span className="text-orange-400 font-bold text-lg">{num}%</span>
      </div>
      <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
        <div className="h-full bg-linear-to-l from-orange-600 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${num}%` }} />
      </div>
    </div>
  );
}

// ─── Cards / People ───────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap, target: Target, trendingUp: TrendingUp, shield: Shield, clock: Clock, users: Users,
};

interface IconFeatureBlockProps {
  icon?: string; title: string; body: string; layout?: "right" | "left";
  textSize?: string; lineHeight?: string; letterSpacing?: string;
  textAlign?: string; direction?: string; typography?: string;
}
export function IconFeatureBlock({ icon = "zap", title, body, layout = "right", ...typoProps }: IconFeatureBlockProps) {
  const IconComponent = ICON_MAP[icon] || Zap;
  const isRight = layout === "right";
  const typo = getTypographyProps(typoProps);
  return (
    <div className={cn("flex flex-col md:flex-row gap-6 mb-12", isRight ? "md:flex-row-reverse" : "md:flex-row")} dir={typo.dir}>
      <div className="shrink-0">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl border palette-accent-bg-muted bg-orange-500/20 border-orange-500/30">
          <IconComponent className="w-7 h-7 palette-accent text-orange-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xl md:text-2xl font-bold palette-heading mb-3">{title}</h3>
        <div style={typo.style} className={cn("prose prose-invert max-w-none prose-p-palette", typo.alignClass)}>
          {body.split("\n").map((p, i) => <p key={i} className="mb-3">{p}</p>)}
        </div>
      </div>
    </div>
  );
}

interface PersonCardBlockProps { imageUrl?: string; name: string; role?: string; bio?: string; layout?: "horizontal" | "vertical" }
export function PersonCardBlock({ imageUrl, name, role = "", bio = "", layout = "horizontal" }: PersonCardBlockProps) {
  const [imageError, setImageError] = useState(false);
  const isVertical = layout === "vertical";
  return (
    <div className={`my-12 flex gap-6 p-6 rounded-xl border border-neutral-700 bg-neutral-900/50 ${isVertical ? "flex-col items-center text-center" : "flex-col sm:flex-row"}`} dir="rtl">
      {imageUrl && !imageError
        ? <div className="shrink-0 w-24 h-24 rounded-full overflow-hidden relative"><img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover" onError={() => setImageError(true)} /></div>
        : imageUrl && imageError
          ? <div className="shrink-0 w-24 h-24 rounded-full bg-neutral-700 flex items-center justify-center text-gray-500 text-xs">?</div>
          : <div className="shrink-0 w-24 h-24 rounded-full bg-neutral-700 flex items-center justify-center text-4xl text-gray-500">{name.charAt(0)}</div>}
      <div className={isVertical ? "w-full" : "flex-1 min-w-0"}>
        <h3 className="text-xl font-bold text-white">{name}</h3>
        {role && <p className="text-orange-400 text-sm font-medium mt-0.5">{role}</p>}
        {bio && <p className="text-gray-300 mt-2 leading-relaxed">{bio.split("\n").map((line, i, arr) => <span key={i}>{line}{i < arr.length - 1 && <br />}</span>)}</p>}
      </div>
    </div>
  );
}

// ─── Media ────────────────────────────────────────────────────────────────────

interface VideoBlockProps { title?: string; videoUrl: string }
export function VideoBlock({ title, videoUrl }: VideoBlockProps) {
  const { embedUrl } = getVideoEmbedUrl(videoUrl || "");
  if (!embedUrl) {
    return (
      <div className="my-12 p-8 rounded-xl bg-neutral-800/30 border border-dashed border-neutral-600 text-center">
        <p className="text-gray-500 text-sm mb-2">הוסף קישור YouTube או Vimeo</p>
        <p className="text-gray-600 text-xs">דוגמאות: youtube.com/watch?v=XXX או vimeo.com/123456</p>
      </div>
    );
  }
  return (
    <div className="my-12" dir="rtl">
      {title && <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h3>}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-900">
        <iframe src={embedUrl} title={title || "סרטון"} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    </div>
  );
}

interface EmbedBlockProps { title?: string; embedUrl: string }
export function EmbedBlock({ title, embedUrl }: EmbedBlockProps) {
  const { embedUrl: resolvedUrl } = getVideoEmbedUrl(embedUrl || "");
  if (!resolvedUrl) {
    return (
      <div className="my-12 p-8 rounded-xl bg-neutral-800/30 border border-dashed border-neutral-600 text-center">
        <p className="text-gray-500 text-sm mb-2">הוסף קישור YouTube, Vimeo או Loom</p>
        <p className="text-gray-600 text-xs">דוגמאות: youtube.com/watch?v=XXX • vimeo.com/123456 • loom.com/share/xxx</p>
      </div>
    );
  }
  return (
    <div className="my-12" dir="rtl">
      {title && <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h3>}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-neutral-900">
        <iframe src={resolvedUrl} title={title || "הטמעה"} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    </div>
  );
}

interface CodeSnippetBlockProps { title?: string; code: string; language?: string; wrap?: "no" | "yes" }
export function CodeSnippetBlock({ title, code, language = "text", wrap = "no" }: CodeSnippetBlockProps) {
  if (!code.trim()) return <EmptyPlaceholder text="הוסף קוד" />;
  return (
    <div className="my-12" dir="ltr">
      {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
      <pre className={`p-4 md:p-6 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-gray-300 font-mono ${wrap === "yes" ? "overflow-x-auto whitespace-pre-wrap wrap-break-word" : "overflow-x-auto"}`} dir="ltr">
        <code data-language={language}>{code}</code>
      </pre>
    </div>
  );
}

// ─── CTAs / Commerce ──────────────────────────────────────────────────────────

interface CtaBlockProps { title: string; buttonText: string; buttonHref: string }
export function CtaBlock({ title, buttonText, buttonHref }: CtaBlockProps) {
  return (
    <div className="my-12 p-8 md:p-12 rounded-2xl text-center border palette-accent-border border-orange-500/30 bg-linear-to-l from-orange-600/20 to-orange-500/10" dir="rtl">
      <h2 className="text-2xl md:text-3xl font-black palette-heading mb-4">{title}</h2>
      <a href={buttonHref} className="inline-block mt-6 px-8 py-4 palette-button-bg palette-button-text font-semibold rounded-lg transition-colors hover:opacity-90">{buttonText}</a>
    </div>
  );
}

interface TwoCtaBlockProps { title: string; button1Text: string; button1Href: string; button2Text: string; button2Href: string }
export function TwoCtaBlock({ title, button1Text, button1Href, button2Text, button2Href }: TwoCtaBlockProps) {
  const has1 = button1Text?.trim() && button1Href?.trim();
  const has2 = button2Text?.trim() && button2Href?.trim();
  if (!title?.trim() && !has1 && !has2) return <EmptyPlaceholder text="הוסף כותרת וכפתורים" />;
  return (
    <div className="my-12 p-8 md:p-12 bg-linear-to-l from-orange-600/20 to-orange-500/10 rounded-2xl border border-orange-500/30 text-center" dir="rtl">
      {title && <h2 className="text-2xl md:text-3xl font-black text-white mb-6">{title}</h2>}
      <div className="flex flex-wrap justify-center gap-4">
        {has1 && <a href={button1Href} className="inline-block px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg transition-colors">{button1Text}</a>}
        {has2 && <a href={button2Href} className="inline-block px-8 py-4 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold rounded-lg transition-colors border border-neutral-600">{button2Text}</a>}
      </div>
    </div>
  );
}

const PERIOD_LABELS: Record<string, string> = { monthly: "/חודש", yearly: "/שנה", once: " חד־פעמי" };
interface PricingBlockProps { title: string; price: string; period?: string; features?: string; buttonText?: string; buttonHref?: string; highlighted?: "yes" | "no" }
export function PricingBlock({ title, price, period = "monthly", features = "", buttonText, buttonHref, highlighted = "no" }: PricingBlockProps) {
  const featureItems = features.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <div className={cn("my-12 p-8 md:p-10 rounded-2xl border", highlighted === "yes" ? "border-orange-500/50 bg-linear-to-b from-orange-600/20 to-neutral-900/50" : "border-neutral-700 bg-neutral-900/50")} dir="rtl">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl md:text-5xl font-black text-orange-400">{price}</span>
        <span className="text-gray-400">{PERIOD_LABELS[period] ?? ""}</span>
      </div>
      {featureItems.length > 0 && (
        <ul className="space-y-3 mb-6">
          {featureItems.map((item, i) => <li key={i} className="flex items-center gap-2 text-gray-300"><span className="text-orange-400">✓</span>{item}</li>)}
        </ul>
      )}
      {buttonText && buttonHref && (
        <a href={buttonHref} className={cn("inline-block px-6 py-3 font-semibold rounded-lg transition-colors", highlighted === "yes" ? "bg-orange-600 hover:bg-orange-500 text-white" : "bg-neutral-700 hover:bg-neutral-600 text-white")}>{buttonText}</a>
      )}
    </div>
  );
}

// ─── Structural ───────────────────────────────────────────────────────────────

type DividerStyle = "solid" | "dotted" | "gradient";
interface DividerBlockProps { style?: DividerStyle }
export function DividerBlock({ style = "solid" }: DividerBlockProps) {
  return (
    <div
      className={cn("my-12 w-full",
        style === "solid" && "border-t border-neutral-600 palette-border-t",
        style === "dotted" && "border-t-2 border-dotted border-neutral-500",
        style === "gradient" && "palette-gradient-line"
      )}
      aria-hidden
    />
  );
}

interface SpacerBlockProps { size?: "small" | "medium" | "large" }
export function SpacerBlock({ size = "medium" }: SpacerBlockProps) {
  const cls = { small: "h-8", medium: "h-16", large: "h-24" }[size];
  return <div className={cls} aria-hidden />;
}
