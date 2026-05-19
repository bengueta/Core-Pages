import type { ThemeMode } from "../../types";
import { contrastRatio, relativeLuminance } from "./contrast";
import { CONTRAST_PAIRS, type ContrastRule } from "./contrastPairs";

export type ContrastStatusRow = ContrastRule & {
  bgHex: string | undefined;
  fgHex: string | undefined;
  ratio: number | null;
  minRatio: number;
  pass: boolean;
  severity: "ok" | "warn" | "critical";
};

export type ContrastStatus = {
  rows: ContrastStatusRow[];
  toneChecks: {
    id: string;
    label: string;
    colorKey: string;
    hex: string | undefined;
    luminance: number | null;
    minLuminance?: number;
    maxLuminance?: number;
    pass: boolean;
    severity: "ok" | "warn" | "critical";
  }[];
  issuesCount: number;
  criticalCount: number;
  worstRatio: number | null;
};

function isRuleActiveForMode(mode: ThemeMode, ruleMode: ContrastRule["mode"]): boolean {
  if (!ruleMode || ruleMode === "all") return true;
  return mode === ruleMode;
}

export function evaluateContrastStatus(
  colors: Record<string, string>,
  mode: ThemeMode,
  defaultMinRatio = 4.5
): ContrastStatus {
  const rows: ContrastStatusRow[] = CONTRAST_PAIRS
    .filter((rule) => isRuleActiveForMode(mode, rule.mode))
    .map((rule) => {
      const bgHex = colors[rule.bg];
      const fgHex = colors[rule.fg];
      const ratio = typeof bgHex === "string" && typeof fgHex === "string" ? contrastRatio(bgHex, fgHex) : null;
      const minRatio = rule.minRatio ?? defaultMinRatio;
      const pass = ratio !== null && ratio >= minRatio;
      const criticalFloor = rule.type === "ui" ? 2.5 : 3;
      const severity: ContrastStatusRow["severity"] = ratio === null || ratio < criticalFloor ? "critical" : pass ? "ok" : "warn";
      return { ...rule, bgHex, fgHex, ratio, minRatio, pass, severity };
    });

  const toneChecks: ContrastStatus["toneChecks"] = [];

  // Mode clarity guardrails: in Light mode both outer canvas and inner card surfaces should not be too dark.
  if (mode === "light") {
    const addToneCheck = (cfg: { id: string; label: string; colorKey: string; minLuminance: number; criticalFloor: number }) => {
      const hex = colors[cfg.colorKey];
      const luminance = typeof hex === "string" ? relativeLuminance(hex) : null;
      const pass = luminance !== null && luminance >= cfg.minLuminance;
      const severity = luminance === null || luminance < cfg.criticalFloor ? "critical" : pass ? "ok" : "warn";
      toneChecks.push({
        id: cfg.id,
        label: cfg.label,
        colorKey: cfg.colorKey,
        hex,
        luminance,
        minLuminance: cfg.minLuminance,
        pass,
        severity,
      });
    };

    addToneCheck({
      id: "light-outer-background-tone",
      label: "Light mode outer background tone",
      colorKey: "background",
      minLuminance: 0.35,
      criticalFloor: 0.2,
    });

    addToneCheck({
      id: "light-inner-background-tone",
      label: "Light mode inner background tone (card)",
      colorKey: "card",
      minLuminance: 0.3,
      criticalFloor: 0.18,
    });
  }

  const rowIssues = rows.filter((r) => !r.pass);
  const toneIssues = toneChecks.filter((t) => !t.pass);
  const issues = [...rowIssues, ...toneIssues];
  const critical = issues.filter((r) => r.severity === "critical");

  const validRatios = rows.map((r) => r.ratio).filter((v): v is number => typeof v === "number");
  const worstRatio = validRatios.length ? Math.min(...validRatios) : null;

  return {
    rows,
    toneChecks,
    issuesCount: rowIssues.length + toneIssues.length,
    criticalCount: critical.length,
    worstRatio,
  };
}

