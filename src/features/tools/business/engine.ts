/**
 * Pure calc engine — NO React, NO side effects.
 * Input: BusinessCalcParams. Output: BusinessCalcResult.
 */

export type BusinessCalcParams = {
  orgOrders: number;
  paidOrders: number;
  avgVal: number;
  mktBudget: number;

  ship: number;
  pkg: number;
  cogs: number;
  cc: number;
  returns: number;

  staff: number;
  wh: number;
  sw: number;

  tax: number;
  retainer: number;
  fee: number;
};

export type BusinessCalcResult = {
  tot: number;
  gross: number;
  netRev: number;
  taxC: number;
  shipC: number;
  pkgC: number;
  cogsC: number;
  ccC: number;
  sysC: number;
  fixC: number;
  totExp: number;
  net: number;
  netPct: number;
  sysPct: string | number;
  expPct: number;
  cac: number;
  roas: number;
  grossMgn: number;
  retC: number;
  beOrders: number | null;
  contrib: number;
};

export const defaultParams: BusinessCalcParams = {
  orgOrders: 900,
  paidOrders: 600,
  avgVal: 180,
  mktBudget: 12000,
  ship: 25,
  pkg: 8,
  cogs: 30,
  cc: 2.2,
  returns: 4,
  staff: 8000,
  wh: 3000,
  sw: 1200,
  tax: 17,
  retainer: 1500,
  fee: 3.0,
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export function calcAll(p: BusinessCalcParams): BusinessCalcResult {
  const tot = p.orgOrders + p.paidOrders;
  const gross = tot * p.avgVal;
  const retC = gross * (p.returns / 100);
  const netRev = gross - retC;

  const taxC = netRev * (p.tax / 100);
  const shipC = tot * p.ship;
  const pkgC = tot * p.pkg;
  const cogsC = netRev * (p.cogs / 100);
  const ccC = netRev * (p.cc / 100);
  const sysC = p.retainer + gross * (p.fee / 100);
  const fixC = p.staff + p.wh + p.sw;

  const totExp = taxC + shipC + pkgC + cogsC + ccC + p.mktBudget + fixC + sysC;
  const net = netRev - (taxC + shipC + pkgC + cogsC + ccC + p.mktBudget + fixC + sysC);

  const netPct = gross > 0 ? Math.round((net / gross) * 100) : 0;
  const sysPct = gross > 0 ? ((sysC / gross) * 100).toFixed(1) : 0;
  const expPct = gross > 0 ? clamp(Math.round((totExp / gross) * 100), 0, 100) : 0;

  const cac = p.paidOrders > 0 ? p.mktBudget / p.paidOrders : 0;
  const roas = p.mktBudget > 0 ? (p.paidOrders * p.avgVal) / p.mktBudget : 0;
  const grossMgn = netRev > 0 ? Math.round(((netRev - cogsC) / netRev) * 100) : 0;

  const varPer =
    p.ship +
    p.pkg +
    p.avgVal * (p.cogs / 100) +
    p.avgVal * (p.cc / 100) +
    p.avgVal * (p.tax / 100) +
    p.avgVal * (p.returns / 100);
  const contrib = p.avgVal - varPer;
  const fixedTot = fixC + p.retainer + p.mktBudget;
  const beOrders = contrib > 0 ? Math.ceil(fixedTot / contrib) : null;

  return {
    tot,
    gross,
    netRev,
    taxC,
    shipC,
    pkgC,
    cogsC,
    ccC,
    sysC,
    fixC,
    totExp,
    net,
    netPct,
    sysPct,
    expPct,
    cac,
    roas,
    grossMgn,
    retC,
    beOrders,
    contrib,
  };
}

