"use client";

/**
 * Hebrew amount-in-words for ILS (masculine for shekels, feminine for agorot).
 * Correct for the common invoice range (up to ~9,999,999.99).
 */

const ONES_M = ["", "אחד", "שניים", "שלושה", "ארבעה", "חמישה", "שישה", "שבעה", "שמונה", "תשעה"];
const ONES_F = ["", "אחת", "שתיים", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע"];
const TEENS_M = ["עשרה", "אחד עשר", "שנים עשר", "שלושה עשר", "ארבעה עשר", "חמישה עשר", "שישה עשר", "שבעה עשר", "שמונה עשר", "תשעה עשר"];
const TEENS_F = ["עשר", "אחת עשרה", "שתים עשרה", "שלוש עשרה", "ארבע עשרה", "חמש עשרה", "שש עשרה", "שבע עשרה", "שמונה עשרה", "תשע עשרה"];
const TENS = ["", "", "עשרים", "שלושים", "ארבעים", "חמישים", "שישים", "שבעים", "שמונים", "תשעים"];
const HUNDREDS = ["", "מאה", "מאתיים", "שלוש מאות", "ארבע מאות", "חמש מאות", "שש מאות", "שבע מאות", "שמונה מאות", "תשע מאות"];
const TH_CONSTRUCT = ["", "אלף", "אלפיים", "שלושת אלפים", "ארבעת אלפים", "חמשת אלפים", "ששת אלפים", "שבעת אלפים", "שמונת אלפים", "תשעת אלפים"];

/** Join atomic components with the conjunction "ו" only before the final one. */
function joinHe(parts: string[]): string {
  const p = parts.filter(Boolean);
  if (p.length === 0) return "";
  if (p.length === 1) return p[0];
  return p.slice(0, -1).join(" ") + " ו" + p[p.length - 1];
}

/** Flat atomic components for 0..999 (hundreds / tens / ones), no internal vav. */
function compsUnder1000(n: number, feminine = false): string[] {
  const ones = feminine ? ONES_F : ONES_M;
  const teens = feminine ? TEENS_F : TEENS_M;
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rem = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  const t = Math.floor(rem / 10);
  const u = rem % 10;
  if (t === 1) parts.push(teens[u]);
  else {
    if (t >= 2) parts.push(TENS[t]);
    if (u) parts.push(ones[u]);
  }
  return parts;
}

/** Flat atomic components for the whole number (so vav lands before the last). */
function intComps(n: number, feminine = false): string[] {
  if (n <= 0) return ["אפס"];
  const th = Math.floor(n / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (th) {
    if (th <= 9) parts.push(TH_CONSTRUCT[th]);
    else if (th === 10) parts.push("עשרת אלפים");
    else parts.push(joinHe(compsUnder1000(th)) + " אלף");
  }
  parts.push(...compsUnder1000(rest, feminine));
  return parts;
}

function intToWords(n: number, feminine = false): string {
  if (n <= 0) return "אפס";
  return joinHe(intComps(n, feminine));
}

/** "אלף מאתיים שקלים ושלושים אגורות" */
export function amountToHebrewWords(total: number): string {
  if (!Number.isFinite(total) || total < 0) return "";
  const rounded = Math.round(total * 100);
  const shekels = Math.floor(rounded / 100);
  const agorot = rounded % 100;

  const shekelWords =
    shekels === 0 ? "אפס שקלים" : shekels === 1 ? "שקל אחד" : shekels === 2 ? "שני שקלים" : `${intToWords(shekels)} שקלים`;

  if (agorot === 0) return shekelWords;

  const agorotWords =
    agorot === 1 ? "אגורה אחת" : agorot === 2 ? "שתי אגורות" : `${intToWords(agorot, true)} אגורות`;

  return `${shekelWords} ו${agorotWords}`;
}
