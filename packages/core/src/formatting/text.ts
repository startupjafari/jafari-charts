/**
 * Deterministic text width estimation for layout decisions (axis margins, label
 * thinning, truncation). It never touches the DOM, so server and client compute
 * identical layouts (no hydration mismatch) and no forced reflow happens.
 * Widths are in em for a typical UI sans-serif and deliberately err slightly wide.
 */
const NARROW = new Set("iljtfrI.,:;'!|()[]{} ");
const WIDE = new Set('mwMWЖШЩЮМшщжюм@%');

function charWidth(ch: string): number {
  const code = ch.charCodeAt(0);
  if (ch === ' ') return 0.28;
  if (NARROW.has(ch)) return 0.3;
  if (WIDE.has(ch)) return 0.88;
  if (code >= 0x30 && code <= 0x39) return 0.6; // digits (tabular)
  if (code >= 0x2e80) return 1; // CJK and wider scripts
  if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) return 0.68;
  if (ch === '−' || ch === '-' || ch === '–') return 0.45;
  return 0.56;
}

export function estimateTextWidth(text: string, fontSize = 12): number {
  let em = 0;
  for (const ch of text) em += charWidth(ch);
  return em * fontSize;
}

/** Shortens `text` with an ellipsis so its estimated width fits `maxWidth`. */
export function truncateText(text: string, maxWidth: number, fontSize = 12): string {
  if (estimateTextWidth(text, fontSize) <= maxWidth) return text;
  const ellipsis = '…';
  const budget = maxWidth - estimateTextWidth(ellipsis, fontSize);
  if (budget <= 0) return '';
  let width = 0;
  let out = '';
  for (const ch of text) {
    const w = charWidth(ch) * fontSize;
    if (width + w > budget) break;
    width += w;
    out += ch;
  }
  return out.trimEnd() + ellipsis;
}
