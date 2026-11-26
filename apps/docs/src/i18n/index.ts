import { useLocation } from '../lib/router';
import { en, type Messages } from './en';
import type { L, Lang } from './lang';
import { ru } from './ru';

export { browserLang, isLang, LANGS, preferredLang, same, type L, type Lang } from './lang';
export type { Messages } from './en';

const MESSAGES: L<Messages> = { en, ru };

/** UI strings for a language (outside React). */
export function messagesFor(lang: Lang): Messages {
  return MESSAGES[lang];
}

/** Current page language (from the URL). */
export function useLang(): Lang {
  return useLocation().lang;
}

/** Shared UI strings in the current language. */
export function useT(): Messages {
  return MESSAGES[useLang()];
}

/** Picks the current language's version of page-local content: `useText(TEXT)`. */
export function useText<T>(text: L<T>): T {
  return text[useLang()];
}

/**
 * Russian plural form for `n`: `ruPlural(5, ['тип', 'типа', 'типов'])` → `типов`.
 */
export function ruPlural(n: number, [one, few, many]: readonly [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}
