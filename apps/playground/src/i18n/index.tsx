/**
 * Interface languages of the playground (en / ru / kk).
 *
 * - Shared strings (shell, navigation, scene titles, filters): `useT()`; English in `en.ts`
 *   defines the `Messages` shape, `ru.ts` and `kk.ts` must match it or the build fails.
 * - Scene-local texts sit next to the scene: `const TEXT: L<…> = { en, ru, kk }` read with
 *   `useText(TEXT)`, and chart cards with `defineCards({ en, ru, kk })` + `useCards(CARDS)`,
 *   which keeps the English title as the card's `data-testid` for the e2e and visual suites.
 * - Plurals: `ruPlural` (one/few/many), `kkPlural` (`Intl.PluralRules('kk')`), `enPlural`.
 * - What is drawn inside a chart (series names, categories, axis titles) is demo data and is
 *   not translated; the charts' own texts and number/date formats follow the chart locale,
 *   which is the interface language unless `?locale=` (the sidebar select) says otherwise.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { en, type Messages } from './en';
import { kk } from './kk';
import { initialLang, rememberLang, type L, type Lang } from './lang';
import { ru } from './ru';

export {
  browserLang,
  initialLang,
  isLang,
  LANG_LABELS,
  LANG_STORAGE_KEY,
  LANGS,
  langOfTag,
  type L,
  type Lang,
} from './lang';
export { enPlural, formatNum, kkPlural, kkPluralCategory, ruPlural } from './plural';
export type { Messages } from './en';

export const MESSAGES: L<Messages> = { en, ru, kk };

/** Interface strings for a language (outside React). */
export function messagesFor(lang: Lang): Messages {
  return MESSAGES[lang];
}

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangState>({ lang: 'en', setLang: () => {} });

/** The interface language: `?lang=` → saved choice → browser; switching saves the choice. */
export function useLangState(): LangState {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    rememberLang(next);
    // An explicit choice replaces the `?lang=` override in the address (like `?theme=`).
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.delete('lang');
      history.replaceState(history.state, '', url);
    }
  }, []);
  return useMemo(() => ({ lang, setLang }), [lang, setLang]);
}

export function LangProvider({ value, children }: { value: LangState; children: ReactNode }) {
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/** Current interface language and the switch. */
export function useLang(): LangState {
  return useContext(LangContext);
}

/** Shared interface strings in the current language. */
export function useT(): Messages {
  return MESSAGES[useContext(LangContext).lang];
}

/** The current language's version of scene-local texts: `const t = useText(TEXT)`. */
export function useText<T>(text: L<T>): T {
  return text[useContext(LangContext).lang];
}

/** Title and one-line explanation of a chart card. */
export interface CardCopy {
  title: string;
  description: ReactNode;
}

/**
 * Card texts of one scene in every language. English defines the keys; another language
 * that misses or adds a card fails to compile.
 */
export function defineCards<K extends string>(
  cards: { en: Record<K, CardCopy> } & { [P in Exclude<Lang, 'en'>]: Record<NoInfer<K>, CardCopy> },
): L<Record<K, CardCopy>> {
  return cards;
}

/**
 * `card('area')` → `{ id, title, description }` for `<ChartCard {...card('area')}>`. The
 * `id` (`data-testid`) is always the English title, which the e2e and visual suites use.
 */
export function useCards<K extends string>(cards: L<Record<K, CardCopy>>) {
  const { lang } = useLang();
  return (key: K) => ({
    id: cards.en[key].title,
    title: cards[lang][key].title,
    description: cards[lang][key].description,
  });
}
