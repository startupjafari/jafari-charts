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

export interface WrappedText {
  lines: string[];
  /** Index of the first line shortened with an ellipsis; -1 when the text fits. */
  cut: number;
}

const isLetter = (ch: string | undefined): boolean =>
  ch !== undefined && ch.toLowerCase() !== ch.toUpperCase();

/**
 * Breaks `text` into at most `maxLines` lines whose estimated width fits `maxWidth`, at
 * spaces and after hyphens inside words ("аль-Фараби"). Lines are balanced (the narrowest
 * width that needs no extra line). Text that still does not fit ends the last line with an
 * ellipsis; a single word wider than a line is shortened with one. Shortened lines fill
 * their width completely: `cutWidth` lets them stop short of it (e.g. to keep neighbouring
 * labels apart).
 */
export function wrapText(
  text: string,
  maxWidth: number,
  maxLines = 2,
  fontSize = 12,
  cutWidth = maxWidth,
): WrappedText {
  const measure = (s: string) => estimateTextWidth(s, fontSize);
  if (measure(text) <= maxWidth) return { lines: [text], cut: -1 };
  if (maxLines <= 1 || maxWidth <= 0)
    return { lines: [truncateText(text, Math.min(maxWidth, cutWidth), fontSize)], cut: 0 };
  // Break opportunities: [part, preceded by a space].
  const parts: [string, boolean][] = [];
  let widest = 0;
  for (const word of text.trim().split(/\s+/)) {
    let start = 0;
    for (let i = 1; i <= word.length; i++) {
      const end = i === word.length;
      if (end || (word[i - 1] === '-' && isLetter(word[i - 2]) && isLetter(word[i]))) {
        const part = word.slice(start, i);
        parts.push([part, start === 0]);
        widest = Math.max(widest, measure(part));
        start = i;
      }
    }
  }
  // Greedy lines at width `w`; the `limit`-th line takes the rest of the text.
  const fill = (w: number, limit = Infinity): string[] => {
    const lines: string[] = [];
    let line = '';
    for (const [part, space] of parts) {
      const joined = line ? `${line}${space ? ' ' : ''}${part}` : part;
      if (line && lines.length < limit - 1 && measure(joined) > w) {
        lines.push(line);
        line = part;
      } else line = joined;
    }
    lines.push(line);
    return lines;
  };
  const count = fill(maxWidth).length;
  if (count <= maxLines && widest <= maxWidth) {
    let lo = widest;
    let hi = maxWidth;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      if (fill(mid).length > count) lo = mid;
      else hi = mid;
    }
    return { lines: fill(hi), cut: -1 };
  }
  let cut = -1;
  const lines = fill(maxWidth, maxLines).map((line, i) => {
    if (measure(line) <= maxWidth) return line;
    if (cut < 0) cut = i;
    return truncateText(line, Math.min(maxWidth, cutWidth), fontSize);
  });
  return { lines, cut };
}
