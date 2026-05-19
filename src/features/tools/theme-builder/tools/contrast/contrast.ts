function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const R = srgbToLinear(rgb.r);
  const G = srgbToLinear(rgb.g);
  const B = srgbToLinear(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(hexA: string, hexB: string): number | null {
  const L1 = relativeLuminance(hexA);
  const L2 = relativeLuminance(hexB);
  if (L1 === null || L2 === null) return null;
  const [lighter, darker] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (lighter + 0.05) / (darker + 0.05);
}

