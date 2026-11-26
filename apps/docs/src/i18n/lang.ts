/**
 * Site languages, the visitor's preference and browser detection. No React here:
 * the router imports this module to resolve the language of a URL.
 */
export type Lang = 'en' | 'ru';

/** Every site language, in switcher order. English is the default (unprefixed URLs). */
export const LANGS: readonly Lang[] = ['en', 'ru'];

/** A value in every site language. TypeScript reports a missing translation. */
export type L<T> = { readonly [K in Lang]: T };

/** The same (language-neutral) value for every language, e.g. a code identifier. */
export function same<T>(value: T): L<T> {
  return { en: value, ru: value };
}

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ru';
}

const STORAGE_KEY = 'jc-docs-lang';

/** Language picked with the switcher in this tab (also kept when storage is unavailable). */
let sessionChoice: Lang | null = null;

function readStored(): Lang | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isLang(value) ? value : null;
  } catch {
    return null;
  }
}

/** Remembers an explicit choice (language switcher) for this tab and future visits. */
export function rememberLang(lang: Lang): void {
  sessionChoice = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the choice then lasts for the tab.
  }
}

/** The language explicitly picked in this tab, if any. */
export function sessionLang(): Lang | null {
  return sessionChoice;
}

/**
 * Language from the browser settings: the first supported entry of
 * `navigator.languages`. Russian also serves Kazakh readers (`kk`), who read Russian.
 */
export function browserLang(): Lang {
  const list =
    typeof navigator === 'undefined'
      ? []
      : navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : [navigator.language];
  for (const tag of list) {
    const primary = (tag ?? '').toLowerCase().split('-')[0];
    if (primary === 'ru' || primary === 'kk') return 'ru';
    if (primary === 'en') return 'en';
  }
  return 'en';
}

/** Language for a URL that does not name one: explicit choice → stored choice → browser. */
export function preferredLang(): Lang {
  return sessionChoice ?? readStored() ?? browserLang();
}
