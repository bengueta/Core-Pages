"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Palette, FileText, Library } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { TOOL_ROUTES } from "@/lib/routes/tools";

const THEMES = {
  dark: {
    text: "#A1A1AA",
    heading: "#D4AF37",
    gold: "#D4AF37",
    goldMuted: "rgba(212,175,55,0.4)",
    corner: "rgba(212,175,55,0.4)",
    diamond: "rgba(212,175,55,0.5)",
    grid: "rgba(212,175,55,0.08)",
    cardBorder: "#27272A",
    cardBorderHover: "rgba(212,175,55,0.5)",
    cardBg: "rgba(24,24,27,0.4)",
    cardGlass: "rgba(255,255,255,0.02)",
    cardShine: "rgba(255,255,255,0.03)",
    vignette: "radial-gradient(circle at 50% 0%, rgba(212,175,55,0.04) 0%, transparent 50%)",
    lineGradient: "linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)",
    logoGradient: "linear-gradient(to right, #E6C762, #D4AF37, #B38728)",
    iconAreaBg: "rgba(212,175,55,0.06)",
    iconAreaGlow: "rgba(212,175,55,0.08)",
  },
  light: {
    text: "#27272A",
    heading: "#8A6327",
    gold: "#8A6327",
    goldMuted: "rgba(138,99,39,0.5)",
    corner: "rgba(138,99,39,0.6)",
    diamond: "rgba(138,99,39,0.6)",
    grid: "rgba(138,99,39,0.06)",
    cardBorder: "rgba(161,161,170,0.4)",
    cardBorderHover: "rgba(138,99,39,0.6)",
    cardBg: "rgba(255,255,255,0.5)",
    cardGlass: "rgba(255,255,255,0.7)",
    cardShine: "rgba(255,255,255,0.9)",
    vignette: "radial-gradient(circle at 50% 0%, rgba(138,99,39,0.06) 0%, transparent 50%)",
    lineGradient: "linear-gradient(to right, transparent, rgba(138,99,39,0.5), transparent)",
    logoGradient: "linear-gradient(to right, #8A6327, #A67C00, #5C4112)",
    iconAreaBg: "rgba(138,99,39,0.05)",
    iconAreaGlow: "rgba(138,99,39,0.08)",
  },
} as const;

const CARDS = [
  {
    id: "business",
    title: "מחשבון עסק",
    description: "כלי לחישוב והערכת חבילות לפי גודל עסק, סוג שירות ורמת ליווי.",
    icon: Calculator,
  },
  {
    id: "brand",
    title: "חישוב צבעי מותג",
    description: "מערכת לבניית פלטת צבעים הרמונית למותג ולזהות ויזואלית.",
    icon: Palette,
  },
  {
    id: "quote",
    title: "הצעת מחיר / חשבונית",
    description: "מחולל הצעות מחיר וחשבוניות מעוצבות עם פריטים, הנחה ומע״מ והדפסה ל-PDF.",
    icon: FileText,
  },
  {
    id: "vault",
    title: "THE VAULT",
    description: "מערכת תוכן וקהילה: בונים עמודים מעוצבים עם בלוקים, מפרסמים דרך GitHub, ומשתתפים בפורום.",
    icon: Library,
  },
] as const;

export default function ToolsPageContent() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark" || !mounted;
  const t = isDark ? THEMES.dark : THEMES.light;

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ backgroundColor: "var(--background)" }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.5] pointer-events-none z-0 transition-opacity duration-700"
        style={{
          backgroundImage: `linear-gradient(to right, ${t.grid} 1px, transparent 1px),
            linear-gradient(to bottom, ${t.grid} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: t.vignette }}
      />

      {/* Corner accents */}
      <div
        className="hidden md:block absolute top-6 right-6 w-3 h-3 border-t border-r z-10 transition-colors duration-700"
        style={{ borderColor: t.corner }}
      />
      <div
        className="hidden md:block absolute top-6 left-6 w-3 h-3 border-t border-l z-10 transition-colors duration-700"
        style={{ borderColor: t.corner }}
      />
      <div
        className="hidden md:block absolute bottom-24 right-6 w-3 h-3 border-b border-r z-10 transition-colors duration-700"
        style={{ borderColor: t.corner }}
      />
      <div
        className="hidden md:block absolute bottom-24 left-6 w-3 h-3 border-b border-l z-10 transition-colors duration-700"
        style={{ borderColor: t.corner }}
      />

      <div className="container mx-auto px-6 lg:px-12 max-w-[1100px] relative z-10 pt-16 pb-24" dir="rtl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="mb-16 text-center"
        >
          <h1
            className="font-league text-3xl lg:text-4xl font-normal tracking-[0.02em] uppercase"
            style={{
              backgroundImage: t.logoGradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            כלים ומערכות
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3 opacity-80">
            <div
              className="w-12 h-[1px] transition-colors duration-700"
              style={{ background: `linear-gradient(to right, transparent, ${t.gold})` }}
            />
            <p
              className="font-heebo text-[10px] tracking-[0.35em] uppercase transition-colors duration-700"
              style={{ color: t.gold }}
            >
              Tools & Systems
            </p>
            <div
              className="w-12 h-[1px] transition-colors duration-700"
              style={{ background: `linear-gradient(to left, transparent, ${t.gold})` }}
            />
          </div>
        </motion.header>

        {/* 3 Cards – Glass Effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {CARDS.map((card, idx) => (
            <motion.article
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="group relative flex flex-col overflow-hidden rounded-[3px] border transition-all duration-500"
              style={{
                borderColor: t.cardBorder,
                backgroundColor: t.cardBg,
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                boxShadow: `inset 0 1px 0 ${t.cardShine}, inset 0 -1px 0 rgba(0,0,0,${isDark ? "0.1" : "0.03"}), 0 8px 32px rgba(0,0,0,${isDark ? "0.2" : "0.08"})`,
              }}
            >
              {card.id === "business" ? (
                <Link href={TOOL_ROUTES.business} aria-label="פתח כלי עסק" className="absolute inset-0 z-20">
                  <span className="sr-only">פתח כלי עסק</span>
                </Link>
              ) : card.id === "brand" ? (
                <Link
                  href={TOOL_ROUTES["brand-colors"]}
                  aria-label="פתח כלי צבעים וטוקני עיצוב"
                  className="absolute inset-0 z-20"
                >
                  <span className="sr-only">פתח כלי צבעים וטוקני עיצוב</span>
                </Link>
              ) : card.id === "quote" ? (
                <Link
                  href={TOOL_ROUTES.quote}
                  aria-label="פתח מחולל הצעת מחיר וחשבונית"
                  className="absolute inset-0 z-20"
                >
                  <span className="sr-only">פתח מחולל הצעת מחיר וחשבונית</span>
                </Link>
              ) : card.id === "vault" ? (
                <a
                  href="/Core-Pages/vault/"
                  aria-label="פתח את THE VAULT"
                  className="absolute inset-0 z-20"
                >
                  <span className="sr-only">פתח את THE VAULT</span>
                </a>
              ) : null}
              {/* Glass overlay – inner highlight */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[3px]"
                style={{
                  background: `linear-gradient(135deg, ${t.cardGlass} 0%, transparent 50%)`,
                }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none rounded-[3px] transition-opacity duration-500"
                style={{
                  border: `1px solid ${t.cardBorderHover}`,
                  boxShadow: `0 0 0 1px ${t.cardBorderHover}20`,
                }}
              />

              {/* Image area */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    background: isDark ? "#18181B" : "rgba(250,250,250,0.5)",
                    backgroundImage: `radial-gradient(circle at 30% 50%, ${t.iconAreaGlow} 0%, transparent 60%)`,
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${t.iconAreaBg} 0%, transparent 50%)`,
                  }}
                >
                  <card.icon
                    className="w-16 h-16 opacity-50 transition-all duration-500 group-hover:opacity-80"
                    style={{ color: t.gold }}
                  />
                </div>
                {/* Diamond accent */}
                <div
                  className="absolute top-3 right-3 w-2 h-2 rotate-45 border-[1px] transition-colors duration-700"
                  style={{
                    borderColor: t.diamond,
                    backgroundColor: isDark ? "rgba(13,13,13,0.7)" : "rgba(255,255,255,0.8)",
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative flex flex-1 flex-col p-6">
                <div className="flex items-center gap-2 mb-3">
                  <card.icon className="w-4 h-4 shrink-0" style={{ color: t.gold }} />
                  <h2
                    className="font-heebo text-[11px] font-medium uppercase tracking-[0.25em] transition-colors duration-700"
                    style={{ color: t.gold }}
                  >
                    {card.title}
                  </h2>
                </div>
                <p
                  className="text-sm font-heebo leading-[1.7] flex-1 transition-colors duration-700"
                  style={{ color: t.text }}
                >
                  {card.description}
                </p>
                <div
                  className="mt-4 w-8 h-[1px] transition-all duration-300 group-hover:w-12"
                  style={{ background: `linear-gradient(to left, ${t.gold}60, transparent)` }}
                />
              </div>
            </motion.article>
          ))}
        </div>

        {/* Premium separator – diamond */}
        <div className="mt-20 flex justify-center items-center">
          <div
            className="relative w-full max-w-xl h-px opacity-60"
            style={{ background: t.lineGradient }}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border-[1px]"
              style={{
                borderColor: t.diamond,
                backgroundColor: "var(--background)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
