/**
 * Interface languages of the playground, the visitor's preference and browser detection.
 * No React here, so the pure parts are easy to unit-test.
 */
export type Lang = 'en' | 'ru' | 'kk';

/** Every interface language, in switcher order. English is the fallback. */
export const LANGS: readonly Lang[] = ['en', 'ru', 'kk'];

/** Short switcher labels and native names (shown as the button tooltip). */
export const LANG_LABELS: { readonly [K in Lang]: { short: string; native: string } } = {
  en: { short: 'EN', native: 'English' },
  ru: { short: 'RU', native: 'Русский' },
  kk: { short: 'ҚАЗ', native: 'Қазақша' },
};

/** A value in every interface language. TypeScript reports a missing translation. */
export type L<T> = { readonly [K in Lang]: T };

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ru' || value === 'kk';
}

export const LANG_STORAGE_KEY = 'jc-playground-lang';

/** Language of one BCP 47 tag, or `null` when the playground has no such language. */
export function langOfTag(tag: string | null | undefined): Lang | null {
  const primary = (tag ?? '').trim().toLowerCase().split(/[-_]/)[0];
  if (primary === 'ru') return 'ru';
  // `kz` is not a language code, but some systems and users write it for Kazakh.
  if (primary === 'kk' || primary === 'kz') return 'kk';
  if (primary === 'en') return 'en';
  return null;
}

/**
 * Language from the browser settings: the first entry of `navigator.languages` the
 * playground supports (`ru*` → ru, `kk*`/`kz*` → kk, `en*` → en); English otherwise.
 */
export function browserLang(
  languages: readonly string[] = typeof navigator === 'undefined'
    ? []
    : navigator.languages?.length
      ? navigator.languages
      : [navigator.language],
): Lang {
  for (const tag of languages) {
    const lang = langOfTag(tag);
    if (lang) return lang;
  }
  return 'en';
}

export function storedLang(): Lang | null {
  try {
    const value = localStorage.getItem(LANG_STORAGE_KEY);
    return isLang(value) ? value : null;
  } catch {
    return null;
  }
}

/** Remembers an explicit choice made with the switcher. */
export function rememberLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage unavailable (private mode, blocked cookies): the choice lasts for this page.
  }
}

/** `?lang=` (like `?theme=`) wins over the saved choice, which wins over the browser. */
export function initialLang(search = typeof location === 'undefined' ? '' : location.search): Lang {
  return langOfTag(new URLSearchParams(search).get('lang')) ?? storedLang() ?? browserLang();
}
