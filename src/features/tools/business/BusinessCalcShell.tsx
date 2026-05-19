"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, Equal, Home, Minus, Plus, Save } from "lucide-react";
import { useTheme } from "next-themes";

import { calcAll, defaultParams, type BusinessCalcParams } from "./engine";

const SAVES_KEY = "calc_business_saves";
const GROWTH_KEY = "calc_business_growth";
const MAX_SAVES = 10;

export type BusinessCalcSave = {
  id: string;
  name: string;
  savedAt: string;
  params: BusinessCalcParams;
  growth: { rg: number; cc: number };
};
import {
  ActionButton,
  Badge,
  Bench,
  CostLine,
  HebrewDatePicker,
  InputRow,
  KPICard,
  Section,
  SegmentedControl,
  SliderRow,
  WellDivider,
  clamp,
  fnum,
  getTokens,
  glass,
  ils,
  useSpring,
} from "../shared";

/**
 * Main orchestrator. Manages params, runs calcAll on change, handles tabs + localStorage.
 */
export function BusinessCalcShell() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark" || !mounted;
  const tokens = getTokens(isDark);

  const [p, setP] = useState<BusinessCalcParams>(defaultParams);
  const set = <K extends keyof BusinessCalcParams>(k: K, v: BusinessCalcParams[K]) => setP((prev) => ({ ...prev, [k]: v }));

  const [growthRg, setGrowthRg] = useState(20);
  const [growthCc, setGrowthCc] = useState(10);

  const [saves, setSaves] = useState<BusinessCalcSave[]>([]);
  const lastSavedRef = useRef<BusinessCalcParams>(defaultParams);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const rawParams = localStorage.getItem("calc_business_params");
      if (rawParams) {
        const parsed = JSON.parse(rawParams) as Partial<BusinessCalcParams>;
        const merged = { ...defaultParams, ...parsed };
        setP(merged);
        lastSavedRef.current = merged;
      }
      const rawGrowth = localStorage.getItem(GROWTH_KEY);
      if (rawGrowth) {
        const g = JSON.parse(rawGrowth) as { rg?: number; cc?: number };
        if (typeof g.rg === "number") setGrowthRg(g.rg);
        if (typeof g.cc === "number") setGrowthCc(g.cc);
      }
      const rawSaves = localStorage.getItem(SAVES_KEY);
      if (rawSaves) {
        const arr = JSON.parse(rawSaves) as BusinessCalcSave[];
        if (Array.isArray(arr)) setSaves(arr);
      }
    } catch {
      setP(defaultParams);
    }
  }, [mounted]);

  const calc = useMemo(() => calcAll(p), [p]);

  const [tab, setTab] = useState<"sim" | "reverse" | "timeline" | "growth" | "client" | "saves">("sim");

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(GROWTH_KEY, JSON.stringify({ rg: growthRg, cc: growthCc }));
    } catch {
      // ignore
    }
  }, [mounted, growthRg, growthCc]);

  const resetToSaved = () => setP(lastSavedRef.current);

  const persistWorkingState = (params: BusinessCalcParams, growth: { rg: number; cc: number }) => {
    try {
      localStorage.setItem("calc_business_params", JSON.stringify(params));
      localStorage.setItem(GROWTH_KEY, JSON.stringify(growth));
    } catch {
      // ignore
    }
  };

  const addSave = (name: string, savedAt: string) => {
    const save: BusinessCalcSave = {
      id: crypto.randomUUID(),
      name: name.trim() || new Date(savedAt).toLocaleDateString("he-IL"),
      savedAt,
      params: p,
      growth: { rg: growthRg, cc: growthCc },
    };
    setSaves((prev) => {
      const next = [save, ...prev].slice(0, MAX_SAVES);
      try {
        localStorage.setItem(SAVES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    lastSavedRef.current = p;
    persistWorkingState(p, { rg: growthRg, cc: growthCc });
  };

  const loadSave = (save: BusinessCalcSave, goTo?: "sim" | "client") => {
    setP(save.params);
    setGrowthRg(save.growth.rg);
    setGrowthCc(save.growth.cc);
    lastSavedRef.current = save.params;
    persistWorkingState(save.params, save.growth);
    setTab(goTo ?? "sim");
    if (goTo === "client") {
      setTimeout(() => window.print(), 600);
    }
  };

  const deleteSave = (id: string) => {
    setSaves((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(SAVES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (!mounted) {
    return <div className="min-h-screen w-full" style={{ backgroundColor: "var(--background)" }} aria-hidden />;
  }

  return (
    <div dir="rtl" id="tools-business" style={{ minHeight: "100vh", color: tokens.label1, overflowX: "hidden" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        #tools-business{
          font-family: var(--font-heebo), -apple-system, BlinkMacSystemFont, "SF Pro Display","SF Pro Text","Helvetica Neue", system-ui, sans-serif;
          -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
        }

        #bg{position:fixed;inset:0;z-index:0;
          background:
            radial-gradient(ellipse 120% 75% at 90% 0%,  rgba(10,132,255,.26) 0%,  transparent 52%),
            radial-gradient(ellipse  75% 65% at  0% 95%, rgba(50,215,75,.18)  0%,  transparent 52%),
            radial-gradient(ellipse  65% 58% at 55% 50%, rgba(94,92,230,.16)  0%,  transparent 60%),
            radial-gradient(ellipse  45% 38% at 98% 72%, rgba(255,159,10,.10) 0%,  transparent 48%),
            radial-gradient(ellipse  40% 34% at 20% 22%, rgba(191,90,242,.11) 0%,  transparent 50%),
            linear-gradient(158deg, #0c1322 0%, #080f1c 44%, #050b15 100%);
        }
        #bg::after{content:'';position:absolute;inset:0;pointer-events:none;opacity:.8;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.036'/%3E%3C/svg%3E");}

        #page{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:40px 16px 100px}
        @media(min-width:1040px){#page{padding:52px 40px 80px}}

        .two-col{display:grid;grid-template-columns:1fr;gap:0;align-items:start}
        @media(min-width:1040px){.two-col{grid-template-columns:1fr 420px;gap:32px}}
        .right-sticky{display:flex;flex-direction:column;gap:12;min-width:0}
        @media(min-width:1040px){.right-sticky{position:sticky;top:28px}}

        .hig-range{-webkit-appearance:none;display:block}
        .hig-range::-webkit-slider-thumb{
          -webkit-appearance:none;width:28px;height:28px;border-radius:50%;
          background:#ffffff;cursor:grab;
          transition:transform .18s cubic-bezier(.34,1.56,.64,1),box-shadow .14s;
          box-shadow:
            0 0 0 .5px rgba(0,0,0,0.09),
            0 2px 4px rgba(0,0,0,0.18),
            0 4px 14px rgba(0,0,0,0.24),
            0 8px 22px rgba(0,0,0,0.12);
        }
        .hig-range::-webkit-slider-thumb:active{
          cursor:grabbing;transform:scale(1.14);
          box-shadow:0 0 0 .5px rgba(0,0,0,0.09),0 2px 4px rgba(0,0,0,0.18),0 4px 14px rgba(0,0,0,0.28),0 0 0 5px rgba(10,132,255,0.22);
        }
        .hig-range:focus{outline:none}

        @keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.75)}}

        #tab-bar{
          position:fixed;bottom:0;left:0;right:0;z-index:100;
          height:49px;
          display:flex;align-items:center;justify-content:space-around;
          padding:0 4px;padding-bottom:env(safe-area-inset-bottom,0px);
          backdrop-filter:blur(40px) saturate(180%);
          -webkit-backdrop-filter:blur(40px) saturate(180%);
          background:rgba(22,22,26,0.82);
          border-top:0.5px solid rgba(255,255,255,0.10);
          box-shadow:inset 0 0.5px 0 rgba(255,255,255,0.08);
        }
        .tab-item{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:3px;padding:6px 8px;min-width:56px;
          border:none;background:transparent;cursor:pointer;
          transition:opacity .15s;font-family:inherit;
        }
        .tab-item:active{opacity:.6}
        .tab-icon{width:25px;height:25px;display:flex;align-items:center;justify-content:center}
        .tab-label{font-size:10px;font-weight:600;letter-spacing:.01em}
      `}</style>

      <div id="bg" />

      <div id="page">
        <header style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, ...glass("ultra"), borderRadius: 999, padding: "8px 14px 8px 16px" }}>
                  <Calculator size={24} style={{ color: tokens.label2, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", color: tokens.label2 }}>
                    Calculator
                  </span>
                </div>
                <Link
                  href="/"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    ...glass("ultra"),
                    borderRadius: 999,
                    padding: "8px 14px 8px 16px",
                    textDecoration: "none",
                    color: tokens.label2,
                    transition: "opacity 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = "0.85";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <Home size={24} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.02em" }}>חזרה לדף הבית</span>
                </Link>
              </div>
              <h1 style={{ fontSize: "clamp(34px,5.5vw,56px)", fontWeight: 800, letterSpacing: "-0.036em", lineHeight: 1.05, marginBottom: 10 }}>
                מחשבון עסק
              </h1>
              <p style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.68, color: tokens.label2, maxWidth: 520 }}>
                סימולטור רווחיות עם תצוגת רווח והפסד, מנוע תמחור הפוך, ציר זמן שנתי ותרחישי גדילה. שמירה בטאב שמירות.
              </p>
            </div>

          </div>
        </header>

        {tab === "sim" ? (
          <TabSim tokens={tokens} p={p} set={set} calc={calc} resetToSaved={resetToSaved} />
        ) : tab === "reverse" ? (
          <TabReverse tokens={tokens} p={p} calc={calc} initialTarget={clamp(Math.round(calc.net), 5000, 500000)} />
        ) : tab === "timeline" ? (
          <TabTimeline tokens={tokens} p={p} />
        ) : tab === "growth" ? (
          <TabGrowth tokens={tokens} p={p} calc={calc} growthRg={growthRg} growthCc={growthCc} setGrowthRg={setGrowthRg} setGrowthCc={setGrowthCc} />
        ) : tab === "saves" ? (
          <TabSaves
            tokens={tokens}
            saves={saves}
            onAddSave={addSave}
            onLoadSave={loadSave}
            onDeleteSave={deleteSave}
          />
        ) : (
          <TabClient tokens={tokens} p={p} calc={calc} />
        )}
      </div>

      <nav id="tab-bar" aria-label="כרטיסיות כלי עסק">
        {(
          [
            { id: "sim", label: "סימולטור", ico: "M3 3h18v18H3z" },
            { id: "reverse", label: "מנוע הפוך", ico: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" },
            { id: "timeline", label: "ציר זמן", ico: "M22 12 18 12 15 21 9 3 6 12 2 12" },
            { id: "growth", label: "גדילה", ico: "M23 6 13.5 15.5 8.5 10.5 1 18 M17 6h6v6" },
            { id: "client", label: "ללקוח", ico: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" },
            { id: "saves", label: "שמירות", ico: "M5 2a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2H5z" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            className="tab-item"
            type="button"
            onClick={() => setTab(t.id)}
            style={{ color: tab === t.id ? tokens.blue : tokens.label3 }}
          >
            <div className="tab-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={tab === t.id ? tokens.blue : "rgba(255,255,255,0.42)"}
                strokeWidth={tab === t.id ? 2.2 : 1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {t.ico
                  .split("M")
                  .filter(Boolean)
                  .map((s, j) => (
                    <path key={j} d={`M${s}`} />
                  ))}
              </svg>
            </div>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

const BENCH = { cac: 55, roas: 3.2, grossMgn: 42 };
const SEASON = [0.72, 0.78, 0.88, 0.95, 1.05, 0.8, 0.76, 0.85, 1.3, 1.42, 1.78, 1.2];
const MONTHS = ["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני", "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳"];

function TabSim({
  tokens,
  p,
  set,
  calc,
  resetToSaved,
}: {
  tokens: ReturnType<typeof getTokens>;
  p: BusinessCalcParams;
  set: <K extends keyof BusinessCalcParams>(k: K, v: BusinessCalcParams[K]) => void;
  calc: ReturnType<typeof calcAll>;
  resetToSaved: () => void;
}) {
  const [scen, setScen] = useState<"opt" | "real" | "pes" | null>(null);
  const [iconBounce, setIconBounce] = useState({ key: 0, last: null as "opt" | "real" | "pes" | null });

  const gA = useSpring(Math.round(calc.gross));
  const nA = useSpring(Math.round(calc.net));

  const {
    tot,
    gross,
    taxC,
    shipC,
    pkgC,
    cogsC,
    ccC,
    sysC,
    fixC,
    net,
    netPct,
    sysPct,
    expPct,
    cac,
    roas,
    grossMgn,
    beOrders,
  } = calc;

  const SCEN = {
    opt: {
      label: "אופטימיסטי",
      Icon: Plus,
      col: tokens.green,
      fn: () => {
        set("orgOrders", Math.round(p.orgOrders * 1.35));
        set("paidOrders", Math.round(p.paidOrders * 1.4));
        set("avgVal", Math.round(p.avgVal * 1.12));
        set("cogs", Math.max(p.cogs - 3, 5));
      },
    },
    real: { label: "ריאלי", Icon: Equal, col: tokens.blue, fn: resetToSaved },
    pes: {
      label: "פסימיסטי",
      Icon: Minus,
      col: tokens.red,
      fn: () => {
        set("orgOrders", Math.round(p.orgOrders * 0.7));
        set("paidOrders", Math.round(p.paidOrders * 0.65));
        set("avgVal", Math.round(p.avgVal * 0.9));
        set("cogs", p.cogs + 4);
      },
    },
  } as const;

  return (
    <div className="two-col">
      <div>
        <Section tokens={tokens} title="תחזית פעילות">
          <SliderRow
            tokens={tokens}
            label="הזמנות אורגניות / אתר"
            value={p.orgOrders}
            min={0}
            max={8000}
            step={50}
            onChange={(v) => set("orgOrders", v)}
            display={p.orgOrders.toLocaleString("he-IL")}
            color={tokens.blue}
          />
          <SliderRow
            tokens={tokens}
            label="הזמנות ממומנות (פרסום)"
            value={p.paidOrders}
            min={0}
            max={5000}
            step={50}
            onChange={(v) => set("paidOrders", v)}
            display={p.paidOrders.toLocaleString("he-IL")}
            color={tokens.blue}
          />
          <SliderRow
            tokens={tokens}
            label="ממוצע שווי הזמנה"
            value={p.avgVal}
            min={20}
            max={1200}
            step={5}
            onChange={(v) => set("avgVal", v)}
            display={ils(p.avgVal)}
            color={tokens.blue}
            last
          />
        </Section>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -16, marginBottom: tokens.s20 }}>
          <Badge tokens={tokens} label={`סה״כ ${tot.toLocaleString("he-IL")} הזמנות`} color={tokens.label2} bg={tokens.fill3} border={tokens.sep} />
        </div>

        <Section tokens={tokens} title="שיווק ורכישת לקוחות" titleColor={`${tokens.orange}AA`}>
          <InputRow
            tokens={tokens}
            label="תקציב שיווק חודשי"
            sub="Google / Meta / TikTok"
            pre="₪"
            value={p.mktBudget}
            onChange={(v) => set("mktBudget", v)}
            last
          />
        </Section>

        <div style={{ display: "flex", gap: 10, marginTop: -16, marginBottom: tokens.s20 }}>
          <KPICard
            tokens={tokens}
            label="עלות רכישה CAC"
            value={p.paidOrders > 0 ? ils(cac) : "—"}
            color={tokens.orange}
            tint="orange"
            bench={<Bench tokens={tokens} myVal={cac} benchVal={BENCH.cac} unit="₪" invert format={(v) => ils(v)} />}
          />
          <KPICard
            tokens={tokens}
            label="ROAS"
            value={p.mktBudget > 0 ? `×${fnum(roas)}` : "—"}
            color={roas >= 3 ? tokens.green : roas >= 1.5 ? tokens.orange : tokens.red}
            bench={<Bench tokens={tokens} myVal={roas} benchVal={BENCH.roas} />}
          />
          <KPICard
            tokens={tokens}
            label="גרוס מארג׳ין"
            value={`${grossMgn}%`}
            color={grossMgn >= 50 ? tokens.green : grossMgn >= 30 ? tokens.orange : tokens.red}
            bench={<Bench tokens={tokens} myVal={grossMgn} benchVal={BENCH.grossMgn} unit="%" />}
          />
        </div>

        <Section tokens={tokens} title="הוצאות משתנות לפי הזמנה">
          <InputRow tokens={tokens} label="עלות משלוח" sub="לכל הזמנה" pre="₪" value={p.ship} onChange={(v) => set("ship", v)} />
          <InputRow tokens={tokens} label="עלות אריזה" sub="קרטון + מדבקות" pre="₪" value={p.pkg} onChange={(v) => set("pkg", v)} />
          <InputRow tokens={tokens} label="חומרי גלם / COGS" sub="% מהמחזור נטו" suf="%" value={p.cogs} onChange={(v) => set("cogs", v)} />
          <InputRow tokens={tokens} label="עמלות סליקה" sub="Visa / PayPal / Bit" suf="%" value={p.cc} onChange={(v) => set("cc", v)} />
          <InputRow tokens={tokens} label="אחוז החזרות" sub="% מהמחזור הגולמי" suf="%" value={p.returns} onChange={(v) => set("returns", v)} last />
        </Section>

        <Section tokens={tokens} title="עלויות קבועות חודשיות" titleColor={`${tokens.purple}AA`}>
          <InputRow tokens={tokens} label="שכר עובדים / פרילנסרים" sub="כולל מיסי מעסיק" pre="₪" value={p.staff} onChange={(v) => set("staff", v)} />
          <InputRow tokens={tokens} label="מחסן ולוגיסטיקה" sub="שכר, ניהול מלאי, 3PL" pre="₪" value={p.wh} onChange={(v) => set("wh", v)} />
          <InputRow tokens={tokens} label="תוכנות וכלים" sub="ERP, Shopify, כלי שיווק" pre="₪" value={p.sw} onChange={(v) => set("sw", v)} last />
        </Section>

        <Section tokens={tokens} title="מיסים ומודל CoreStrategy">
          <InputRow tokens={tokens} label='מע"מ / מס הכנסה' sub="% מהמחזור נטו" suf="%" value={p.tax} onChange={(v) => set("tax", v)} />
          <InputRow tokens={tokens} label="ריטיינר חודשי" sub="תשלום קבוע" pre="₪" value={p.retainer} onChange={(v) => set("retainer", v)} />
          <InputRow tokens={tokens} label="עמלה מהמחזור" sub="% מהמחזור הגולמי" suf="%" value={p.fee} onChange={(v) => set("fee", v)} last />
        </Section>
      </div>

      <div className="right-sticky">
        <div style={{ ...glass("secondary"), borderRadius: tokens.r20, padding: "14px 16px", marginBottom: 12 }}>
          <p style={{ fontSize: tokens.typo.caption2.size, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 10 }}>
            סימולטור תרחישים
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {(Object.entries(SCEN) as Array<[keyof typeof SCEN, (typeof SCEN)["opt"]]>).map(([k, s]) => {
              const IconComp = s.Icon;
              return (
                <motion.button
                  key={k}
                  type="button"
                  onClick={() => {
                    s.fn();
                    setScen(k);
                    setIconBounce((p) => ({ key: p.key + 1, last: k }));
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    flex: 1,
                    padding: "12px 8px",
                    borderRadius: tokens.r13,
                    border: `1px solid ${scen === k ? `${s.col}66` : "rgba(255,255,255,0.09)"}`,
                    background: scen === k ? `${s.col}18` : tokens.fill4,
                    color: scen === k ? s.col : tokens.label2,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "border-color .18s, background .18s, color .18s",
                    lineHeight: 1.4,
                    minHeight: 52,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <motion.div
                    key={iconBounce.last === k ? `bounce-${iconBounce.key}` : k}
                    initial={iconBounce.last === k ? { scale: 0.4 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <IconComp size={26} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  </motion.div>
                  <span>{s.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div style={{ ...glass("primary"), borderRadius: tokens.r34, padding: "26px 22px", position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 180,
              background: "linear-gradient(180deg,rgba(10,132,255,0.07) 0%,transparent 100%)",
              borderRadius: `${tokens.r34}px ${tokens.r34}px 0 0`,
              pointerEvents: "none",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: `0.5px solid ${tokens.sep}`, position: "relative" }}>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.020em" }}>רווח והפסד</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5, ...glass("thin", "green"), borderRadius: 999, padding: "3px 10px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: tokens.green, boxShadow: `0 0 6px ${tokens.green}CC`, animation: "blink 2.2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10, fontWeight: 800, color: `${tokens.green}CC`, letterSpacing: "0.06em" }}>LIVE</span>
            </div>
          </div>

          <div style={{ marginBottom: 16, position: "relative", minWidth: 0, overflow: "hidden" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 6 }}>
              מחזור מכירות ברוטו
            </p>
            <p style={{ fontSize: "clamp(34px,4vw,46px)", fontWeight: 800, letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", lineHeight: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
              {ils(gA)}
            </p>
          </div>

          <div style={{ marginBottom: 18, minWidth: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: tokens.label3 }}>סה״כ הוצאות מהמחזור</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: tokens.label2, fontVariantNumeric: "tabular-nums" }}>{expPct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 999, background: tokens.fill3, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 999, background: `linear-gradient(to right,${tokens.blue},${tokens.teal})`, width: `${expPct}%`, transition: "width .5s cubic-bezier(.22,1,.36,1)" }} />
            </div>
          </div>

          <div style={{ background: "rgba(0,0,0,0.22)", border: `0.5px solid ${tokens.sep}`, boxShadow: "inset 0 3px 16px rgba(0,0,0,0.24)", borderRadius: tokens.r16, padding: "2px 16px", marginBottom: 14 }}>
            <WellDivider tokens={tokens} label="הוצאות משתנות" />
            <CostLine tokens={tokens} label={`מע"מ / מס (${p.tax}%)`} val={taxC} />
            <CostLine tokens={tokens} label={`משלוח (₪${p.ship} × ${tot.toLocaleString("he-IL")})`} val={shipC} />
            <CostLine tokens={tokens} label={`אריזה (₪${p.pkg} × ${tot.toLocaleString("he-IL")})`} val={pkgC} />
            <CostLine tokens={tokens} label={`חומרי גלם COGS (${p.cogs}%)`} val={cogsC} />
            <CostLine tokens={tokens} label={`עמלות סליקה (${p.cc}%)`} val={ccC} last />
            <WellDivider tokens={tokens} label="שיווק" />
            <CostLine tokens={tokens} label="תקציב שיווק" sub={`CAC: ${ils(cac)} | ROAS: ×${fnum(roas)}`} val={p.mktBudget} color={`${tokens.orange}DD`} last />
            <WellDivider tokens={tokens} label="קבועות" />
            <CostLine tokens={tokens} label="שכר + מחסן + כלים" val={fixC} color={`${tokens.purple}CC`} last />
            <WellDivider tokens={tokens} label="CoreStrategy" />
            <CostLine tokens={tokens} label={`ריטיינר + ${p.fee}% עמלה`} val={sysC} color={`${tokens.blue}EE`} last />
          </div>

          {beOrders != null ? (
            <div style={{ ...glass("thin", "orange"), borderRadius: tokens.r16, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: `${tokens.orange}EE` }}>נקודת איזון (Break-Even)</p>
                  <p style={{ fontSize: 10, color: tokens.label3, marginTop: 1 }}>מינימום הזמנות לכיסוי כל ההוצאות</p>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: tokens.orange, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                    {beOrders.toLocaleString("he-IL")}
                  </p>
                  <p style={{ fontSize: 10, color: tokens.label3, marginTop: 1 }}>הזמנות / חודש</p>
                </div>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: "rgba(0,0,0,0.20)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(to right,${tokens.orange}88,${tokens.orange})`,
                    width: `${clamp((tot / beOrders) * 100, 0, 100)}%`,
                    transition: "width .5s",
                  }}
                />
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, marginTop: 6, color: tot >= beOrders ? `${tokens.green}CC` : `${tokens.orange}99`, fontVariantNumeric: "tabular-nums" }}>
                {tot >= beOrders ? `✓ עוברים ב-${(tot - beOrders).toLocaleString("he-IL")} הזמנות` : `עוד ${(beOrders - tot).toLocaleString("he-IL")} הזמנות לאיזון`}
              </p>
            </div>
          ) : null}

          <div style={{ ...glass("thin", "green"), borderRadius: tokens.r20, padding: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", borderRadius: tokens.r20, background: `linear-gradient(135deg,${tokens.green}18 0%,transparent 55%)` }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: tokens.label2 }}>הרווח הנקי שלך</span>
                {gross > 0 ? <Badge tokens={tokens} label={`${netPct}% מהמחזור`} color={net >= 0 ? tokens.green : tokens.red} /> : null}
              </div>
              <p
                style={{
                  fontSize: "clamp(34px,4vw,46px)",
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                  marginBottom: 14,
                  color: net >= 0 ? tokens.label1 : tokens.red,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  minWidth: 0,
                }}
              >
                {ils(nA)}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  ["מערכת", `${sysPct}%`, tokens.blue],
                  ["מארג׳ין", `${grossMgn}%`, grossMgn >= 50 ? tokens.green : grossMgn >= 30 ? tokens.orange : tokens.red],
                  ["ROAS", p.mktBudget > 0 ? `×${fnum(roas)}` : "—", roas >= 3 ? tokens.green : tokens.orange],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ flex: 1, background: "rgba(0,0,0,0.18)", borderRadius: tokens.r10, padding: "8px 10px", border: `0.5px solid ${tokens.sep}` }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.label4, marginBottom: 3 }}>{l}</p>
                    <p style={{ fontSize: 13, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: c }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <ActionButton tokens={tokens} onPress={() => window.print()} full color={tokens.label2} icon={<span style={{ fontSize: 14 }}>🖨️</span>}>
              שלח ללקוח (הדפסה / PDF)
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabReverse({
  tokens,
  p,
  calc,
  initialTarget,
}: {
  tokens: ReturnType<typeof getTokens>;
  p: BusinessCalcParams;
  calc: ReturnType<typeof calcAll>;
  initialTarget: number;
}) {
  const [target, setTarget] = useState(initialTarget);
  const [mode, setMode] = useState<"orders" | "price">("orders");
  const { contrib, tot, net } = calc;
  const fixedTot = p.staff + p.wh + p.sw + p.retainer + p.mktBudget;
  const varRatio = p.cogs / 100 + p.cc / 100 + p.tax / 100 + p.returns / 100;
  const reqOrders = contrib > 0 ? Math.ceil((target + fixedTot) / contrib) : null;
  const perFixedPer = tot > 0 ? fixedTot / tot : 0;
  const reqAvg =
    tot > 0 && varRatio < 1
      ? Math.ceil((target / tot + perFixedPer + (p.ship + p.pkg)) / (1 - varRatio))
      : null;
  const tA = useSpring(Math.round(target));
  const isTargetNearNet = Math.abs(target - net) <= Math.max(Math.abs(net) * 0.05, 500);

  const varRatioInvalid = varRatio >= 1;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: tokens.s20 }}>
      <div style={{ ...glass("secondary"), borderRadius: tokens.r28, padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3 }}>
            יעד רווח נקי חודשי
          </p>
          {isTargetNearNet && (
            <span style={{ fontSize: 11, fontWeight: 600, color: tokens.label4 }}>(רווח נוכחי)</span>
          )}
        </div>
        <p style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.035em", color: tokens.green, fontVariantNumeric: "tabular-nums", lineHeight: 1, marginBottom: 16, overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
          {ils(tA)}
        </p>
        <SliderRow
          tokens={tokens}
          label="הזז כדי לקבוע יעד"
          value={target}
          min={5000}
          max={500000}
          step={5000}
          onChange={setTarget}
          display={ils(target)}
          color={tokens.green}
          last
        />
      </div>

      <SegmentedControl
        tokens={tokens}
        value={mode}
        onChange={setMode}
        options={[
          { value: "orders", label: "כמה הזמנות?", icon: "📦" },
          { value: "price", label: "באיזה מחיר?", icon: "💰" },
        ]}
      />

      {varRatioInvalid ? (
        <div style={{ ...glass("primary"), borderRadius: tokens.r28, padding: "28px" }}>
          <p style={{ fontSize: 15, color: tokens.red, fontWeight: 600, marginBottom: 8 }}>
            לא ניתן לחשב — הוצאות משתנות עולות על 100%
          </p>
          <p style={{ fontSize: 14, color: tokens.label2 }}>
            הקטן COGS, עמלות, מס או החזרות בסימולטור
          </p>
        </div>
      ) : mode === "orders" ? (
        <div style={{ ...glass("primary"), borderRadius: tokens.r28, padding: "28px", position: "relative", overflow: "hidden" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 8 }}>
            תצטרך להגיע ל
          </p>
          {reqOrders != null ? (
            <>
              <p style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", color: tokens.green, fontVariantNumeric: "tabular-nums", lineHeight: 1, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
                {fnum(reqOrders, 0)}
              </p>
              <p style={{ fontSize: 15, color: tokens.label2, marginBottom: tokens.s20 }}>הזמנות בחודש</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  ["נוכחי", tot.toLocaleString("he-IL"), tokens.label1],
                  ["יעד", reqOrders.toLocaleString("he-IL"), tokens.label1],
                  ["פער", tot >= reqOrders ? `+${(tot - reqOrders).toLocaleString("he-IL")}` : (reqOrders - tot).toLocaleString("he-IL"), tot >= reqOrders ? tokens.green : tokens.orange],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ ...glass("thin"), borderRadius: tokens.r13, padding: "12px 14px" }}>
                    <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.label4, marginBottom: 5 }}>{l}</p>
                    <p style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: c as string }}>{v}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 15, color: tokens.red, fontWeight: 600 }}>לא ניתן לחשב — תרומה להזמנה שלילית</p>
          )}
        </div>
      ) : (
        <div style={{ ...glass("primary"), borderRadius: tokens.r28, padding: "28px", position: "relative", overflow: "hidden" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 8 }}>
            מחיר הזמנה ממוצע נדרש
          </p>
          {reqAvg != null && reqAvg > 0 ? (
            <>
              <p style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", color: tokens.blue, fontVariantNumeric: "tabular-nums", lineHeight: 1, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
                {ils(reqAvg)}
              </p>
              <p style={{ fontSize: 15, color: tokens.label2, marginBottom: tokens.s20 }}>לכל הזמנה (עם {tot.toLocaleString("he-IL")} הזמנות)</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {(() => {
                  const currentAvg = p.avgVal;
                  const gap = reqAvg - currentAvg;
                  const sufficient = currentAvg >= reqAvg;
                  const gapLabel = sufficient ? "✓ מספיק" : `פער ${ils(Math.abs(gap))}`;
                  const gapColor = sufficient ? tokens.green : tokens.orange;
                  return [
                    ["מחיר נוכחי", ils(currentAvg), tokens.label1],
                    ["מחיר נדרש", ils(reqAvg), tokens.label1],
                    [sufficient ? "סטטוס" : "פער", gapLabel, gapColor],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ ...glass("thin"), borderRadius: tokens.r13, padding: "12px 14px" }}>
                      <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.label4, marginBottom: 5 }}>{l}</p>
                      <p style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: c as string }}>{v}</p>
                    </div>
                  ));
                })()}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 15, color: tokens.orange, fontWeight: 600 }}>הגדר כמות הזמנות בסימולטור תחילה</p>
          )}
        </div>
      )}
    </div>
  );
}

function TabTimeline({ tokens, p }: { tokens: ReturnType<typeof getTokens>; p: BusinessCalcParams }) {
  const monthly = SEASON.map((m, i) => {
    const pp = { ...p, orgOrders: Math.round(p.orgOrders * m), paidOrders: Math.round(p.paidOrders * m) };
    const c = calcAll(pp);
    return { month: MONTHS[i], mul: m, gross: c.gross, net: c.net, orders: c.tot };
  });
  const annGross = monthly.reduce((a, d) => a + d.gross, 0);
  const annNet = monthly.reduce((a, d) => a + d.net, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.s20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          ["מחזור שנתי", ils(annGross), tokens.label1],
          ["רווח שנתי", ils(annNet), annNet >= 0 ? tokens.green : tokens.red],
          ["חודש שיא", monthly.reduce((a, d) => (d.gross > a.gross ? d : a), monthly[0]).month, tokens.orange],
        ].map(([l, v, c]) => (
          <div key={l} style={{ ...glass("secondary"), borderRadius: tokens.r16, padding: "14px 16px" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 6 }}>{l}</p>
            <p style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.020em", fontVariantNumeric: "tabular-nums", color: c as string }}>{v}</p>
          </div>
        ))}
      </div>

      <div style={{ ...glass("secondary"), borderRadius: tokens.r20, overflow: "hidden" }}>
        {monthly.map((d, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "11px 20px",
              borderBottom: i < 11 ? `0.5px solid ${tokens.sep}` : "none",
              minHeight: 44,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: d.mul >= 1.3 ? tokens.orange : tokens.label2, width: 30 }}>{d.month}</span>
              {d.mul >= 1.3 ? <Badge tokens={tokens} label={`×${d.mul}`} color={tokens.orange} /> : null}
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: tokens.label2, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{ils(d.gross)}</span>
              <span style={{ fontSize: 13, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: d.net >= 0 ? tokens.green : tokens.red, minWidth: 75, textAlign: "left" }}>
                {ils(d.net)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabGrowth({
  tokens,
  p,
  calc,
  growthRg,
  growthCc,
  setGrowthRg,
  setGrowthCc,
}: {
  tokens: ReturnType<typeof getTokens>;
  p: BusinessCalcParams;
  calc: ReturnType<typeof calcAll>;
  growthRg: number;
  growthCc: number;
  setGrowthRg: (v: number) => void;
  setGrowthCc: (v: number) => void;
}) {
  const rg = growthRg;
  const setRG = setGrowthRg;
  const cc = growthCc;
  const setCC = setGrowthCc;
  const gp: BusinessCalcParams = {
    ...p,
    orgOrders: Math.round(p.orgOrders * (1 + rg / 100)),
    paidOrders: Math.round(p.paidOrders * (1 + rg / 100)),
    avgVal: Math.round(p.avgVal * (1 + (rg / 100) * 0.3)),
    ship: Math.round(p.ship * (1 - (cc / 100) * 0.7)),
    cogs: Number.parseFloat((p.cogs * (1 - (cc / 100) * 0.8)).toFixed(1)),
  };
  const gc = calcAll(gp);
  const dn = gc.net - calc.net;
  const dg = gc.gross - calc.gross;
  const nA = useSpring(Math.round(gc.net));
  const gA = useSpring(Math.round(gc.gross));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.s20 }}>
      <div style={{ ...glass("primary"), borderRadius: tokens.r28, padding: "28px" }}>
        <SliderRow
          tokens={tokens}
          label="צמיחת מחזור"
          sub="עלייה בהזמנות + שיפור AOV"
          value={rg}
          min={0}
          max={200}
          step={5}
          onChange={setRG}
          display={`+${rg}%`}
          color={tokens.green}
        />
        <SliderRow
          tokens={tokens}
          label="הפחתת עלויות"
          sub="אופטימיזציה משלוח + COGS"
          value={cc}
          min={0}
          max={40}
          step={1}
          onChange={setCC}
          display={`-${cc}%`}
          color={tokens.blue}
          last
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ ...glass("secondary"), borderRadius: tokens.r20, padding: "20px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 12 }}>היום</p>
          <p style={{ fontSize: 11, color: tokens.label3, marginBottom: 3 }}>מחזור</p>
          <p style={{ fontSize: 19, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em", color: tokens.label1, marginBottom: 12 }}>{ils(calc.gross)}</p>
          <p style={{ fontSize: 11, color: tokens.label3, marginBottom: 3 }}>רווח נקי</p>
          <p style={{ fontSize: 19, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em", color: calc.net >= 0 ? tokens.label1 : tokens.red }}>{ils(calc.net)}</p>
        </div>
        <div style={{ ...glass("thin", "green"), borderRadius: tokens.r20, padding: "20px", position: "relative", overflow: "hidden" }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: `${tokens.green}99`, marginBottom: 12 }}>אחרי גדילה</p>
          <p style={{ fontSize: 11, color: tokens.label3, marginBottom: 3 }}>מחזור</p>
          <p style={{ fontSize: 19, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em", color: tokens.label1, marginBottom: 12 }}>{ils(gA)}</p>
          <p style={{ fontSize: 11, color: tokens.label3, marginBottom: 3 }}>רווח נקי</p>
          <p style={{ fontSize: 19, fontWeight: 800, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em", color: tokens.green }}>{ils(nA)}</p>
        </div>
      </div>

      <div style={{ ...glass("secondary"), borderRadius: tokens.r20, padding: "22px 22px", border: `1px solid ${tokens.green}30` }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 14 }}>השפעה נטו</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: tokens.label3, marginBottom: 4 }}>תוספת מחזור</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: tokens.blue, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em" }}>+{ils(dg)}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: tokens.label3, marginBottom: 4 }}>תוספת רווח</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: tokens.green, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.022em" }}>+{ils(dn)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabSaves({
  tokens,
  saves,
  onAddSave,
  onLoadSave,
  onDeleteSave,
}: {
  tokens: ReturnType<typeof getTokens>;
  saves: BusinessCalcSave[];
  onAddSave: (name: string, savedAt: string) => void;
  onLoadSave: (save: BusinessCalcSave, goTo?: "sim" | "client") => void;
  onDeleteSave: (id: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [saveName, setSaveName] = useState("");
  const [saveDate, setSaveDate] = useState(today);
  const [saveToDelete, setSaveToDelete] = useState<BusinessCalcSave | null>(null);

  const handleSave = () => {
    onAddSave(saveName, saveDate);
    setSaveName("");
    setSaveDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: tokens.s20 }}>
      <div style={{ ...glass("primary"), borderRadius: tokens.r28, padding: "28px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 16 }}>
          שמור תרחיש נוכחי
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: tokens.label2, marginBottom: 6 }}>
              שם התרחיש
            </label>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="למשל: תרחיש בסיסי"
              dir="rtl"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: tokens.r13,
                border: `0.5px solid ${tokens.sep}`,
                background: "rgba(0,0,0,0.2)",
                color: tokens.label1,
                fontSize: 15,
                fontWeight: 500,
                fontFamily: "inherit",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: tokens.label2, marginBottom: 6 }}>
              תאריך
            </label>
            <HebrewDatePicker tokens={tokens} value={saveDate} onChange={setSaveDate} />
          </div>
          <ActionButton tokens={tokens} onPress={handleSave} full color={tokens.green} icon={<Save size={20} style={{ flexShrink: 0 }} />}>
            שמור
          </ActionButton>
        </div>
      </div>

      <div style={{ ...glass("secondary"), borderRadius: tokens.r28, padding: "24px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 16 }}>
          תרחישים שמורים ({saves.length})
        </p>
        {saves.length === 0 ? (
          <p style={{ fontSize: 14, color: tokens.label3 }}>אין עדיין תרחישים שמורים</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {saves.map((s) => {
              const sc = calcAll(s.params);
              const dateDisplay = new Date(s.savedAt).toLocaleDateString("he-IL", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              return (
                <div
                  key={s.id}
                  style={{
                    ...glass("thin"),
                    borderRadius: tokens.r16,
                    padding: "16px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: tokens.label1, marginBottom: 4 }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: tokens.label3 }}>{dateDisplay} · רווח {ils(sc.net)}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => onLoadSave(s)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: tokens.r10,
                        border: `1px solid ${tokens.blue}44`,
                        background: "rgba(10,132,255,0.16)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        color: tokens.blue,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                      }}
                    >
                      טען
                    </button>
                    <button
                      type="button"
                      onClick={() => onLoadSave(s, "client")}
                      style={{
                        padding: "10px 16px",
                        borderRadius: tokens.r10,
                        border: `1px solid ${tokens.sep}`,
                        background: "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        color: tokens.label2,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    >
                      ייצוא PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => setSaveToDelete(s)}
                      style={{
                        padding: "10px 16px",
                        borderRadius: tokens.r10,
                        border: `1px solid ${tokens.red}44`,
                        background: "rgba(255,69,58,0.14)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        color: tokens.red,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    >
                      מחק
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {saveToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 200,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                boxSizing: "border-box",
              }}
              onClick={() => setSaveToDelete(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  width: "100%",
                  maxWidth: 360,
                  ...glass("primary"),
                  borderRadius: tokens.r20,
                  padding: 24,
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
              <p style={{ fontSize: 15, fontWeight: 600, color: tokens.label1, marginBottom: 12, lineHeight: 1.5 }}>
                האם אתה בטוח שאתה רוצה למחוק את &quot;{saveToDelete.name}&quot;?
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setSaveToDelete(null)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: tokens.r10,
                    border: `1px solid ${tokens.sep}`,
                    background: tokens.fill3,
                    color: tokens.label2,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  לא, חזור
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteSave(saveToDelete.id);
                    setSaveToDelete(null);
                  }}
                  style={{
                    padding: "10px 18px",
                    borderRadius: tokens.r10,
                    border: "none",
                    background: "rgba(255,69,58,0.35)",
                    color: tokens.red,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  כן, מחק
                </button>
              </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabClient({
  tokens,
  p,
  calc,
}: {
  tokens: ReturnType<typeof getTokens>;
  p: BusinessCalcParams;
  calc: ReturnType<typeof calcAll>;
}) {
  const { gross, taxC, shipC, pkgC, cogsC, ccC, fixC, cac, roas, grossMgn, tot } = calc;
  const cNet = calc.net + calc.sysC;
  const cPct = gross > 0 ? Math.round((cNet / gross) * 100) : 0;
  const cExp = gross > 0 ? clamp(Math.round(((calc.totExp - calc.sysC) / gross) * 100), 0, 100) : 0;
  const gA = useSpring(Math.round(gross));
  const nA = useSpring(Math.round(cNet));

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: tokens.s16 }}>
      <div style={{ ...glass("thin", "yellow"), borderRadius: tokens.r13, padding: "10px 16px", display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: `${tokens.yellow}CC`, letterSpacing: "0.03em" }}>תצוגת לקוח — עמלת CoreStrategy מוסתרת</span>
      </div>

      <div style={{ ...glass("primary"), borderRadius: tokens.r34, padding: "26px 22px", position: "relative", overflow: "hidden" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tokens.label3, marginBottom: 6 }}>מחזור מכירות ברוטו</p>
        <p style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", lineHeight: 1, marginBottom: 14, overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{ils(gA)}</p>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: tokens.label3, fontWeight: 600 }}>סה״כ הוצאות</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: tokens.label2 }}>{cExp}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: tokens.fill3, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 999, background: `linear-gradient(to right,${tokens.blue},${tokens.teal})`, width: `${cExp}%`, transition: "width .5s" }} />
          </div>
        </div>

        <div style={{ background: "rgba(0,0,0,0.22)", border: `0.5px solid ${tokens.sep}`, borderRadius: tokens.r16, padding: "2px 16px", marginBottom: 14 }}>
          <WellDivider tokens={tokens} label="הוצאות משתנות" />
          <CostLine tokens={tokens} label={`מע"מ / מס (${p.tax}%)`} val={taxC} />
          <CostLine tokens={tokens} label={`משלוח + אריזה (× ${tot.toLocaleString("he-IL")})`} val={shipC + pkgC} />
          <CostLine tokens={tokens} label={`חומרי גלם COGS (${p.cogs}%)`} val={cogsC} />
          <CostLine tokens={tokens} label={`עמלות סליקה (${p.cc}%)`} val={ccC} last />
          <WellDivider tokens={tokens} label="שיווק" />
          <CostLine tokens={tokens} label="תקציב שיווק" val={p.mktBudget} color={`${tokens.orange}DD`} last />
          <WellDivider tokens={tokens} label="קבועות" />
          <CostLine tokens={tokens} label="שכר + מחסן + כלים" val={fixC} color={`${tokens.purple}CC`} last />
        </div>

        <div style={{ ...glass("thin", "green"), borderRadius: tokens.r20, padding: "20px", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: tokens.label2 }}>רווח נקי חודשי</span>
            {gross > 0 ? <Badge tokens={tokens} label={`${cPct}% מהמחזור`} color={cNet >= 0 ? tokens.green : tokens.red} /> : null}
          </div>
          <p style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", lineHeight: 1, marginBottom: 14, color: cNet >= 0 ? tokens.label1 : tokens.red, overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>
            {ils(nA)}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              ["CAC", p.paidOrders > 0 ? ils(cac) : "—", tokens.orange],
              ["ROAS", p.mktBudget > 0 ? `×${fnum(roas)}` : "—", roas >= 3 ? tokens.green : tokens.orange],
              ["מארג׳ין", `${grossMgn}%`, grossMgn >= 40 ? tokens.green : tokens.orange],
            ].map(([l, v, c]) => (
              <div key={l} style={{ flex: 1, background: "rgba(0,0,0,0.18)", borderRadius: tokens.r10, padding: "8px 10px", border: `0.5px solid ${tokens.sep}` }}>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tokens.label4, marginBottom: 3 }}>{l}</p>
                <p style={{ fontSize: 13, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: c as string }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <ActionButton tokens={tokens} onPress={() => window.print()} full color={tokens.label2} icon={<span style={{ fontSize: 14 }}>📄</span>}>
            שלח ללקוח (הדפסה / PDF)
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

