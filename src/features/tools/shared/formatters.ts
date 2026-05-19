const COMPACT_THRESHOLD = 1e9; // מיליון ומעלה → קיצור (מיליארד, טריליון...)
const SCIENTIFIC_THRESHOLD = 1e15; // קוודריליון ומעלה → סימון מדעי

export function ils(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= SCIENTIFIC_THRESHOLD) {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      notation: "scientific",
      maximumFractionDigits: 2,
    }).format(v);
  }
  if (abs >= COMPACT_THRESHOLD) {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      notation: "compact",
      compactDisplay: "long",
      maximumFractionDigits: 1,
    }).format(v);
  }
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(v);
}

export function fnum(v: number, maximumFractionDigits = 1): string {
  if (!Number.isFinite(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= SCIENTIFIC_THRESHOLD) {
    return v.toLocaleString("he-IL", { notation: "scientific", maximumFractionDigits: 2 });
  }
  if (abs >= COMPACT_THRESHOLD) {
    return v.toLocaleString("he-IL", {
      notation: "compact",
      compactDisplay: "long",
      maximumFractionDigits: 1,
    });
  }
  return v.toLocaleString("he-IL", { maximumFractionDigits });
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

