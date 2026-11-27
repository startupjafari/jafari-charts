import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { LANGS, preferredLang, rememberLang, sessionLang, type Lang } from '../i18n/lang';

/**
 * Tiny hash router: `#/charts/line-chart` (optionally `#/charts/line-chart#props`
 * for a section). Links are plain anchors, so opening in a new tab, copying and
 * history all work natively.
 *
 * Languages: English pages are unprefixed (`#/charts/line-chart`), Russian and Kazakh
 * pages live under `#/ru` and `#/kk` (`#/kk/charts/line-chart`). A URL without a prefix
 * follows the visitor's preference (switcher choice → stored choice → browser language)
 * and is rewritten in place when that preference is not English, so existing English
 * links keep working and Russian or Kazakh readers still land on pages in their language. After the visitor switches
 * language, back/forward show the history entries in the chosen language.
 *
 * Scroll restoration: entries created by clicking a link have no `history.state`;
 * we tag them with a key on arrival. Back/forward lands on an entry that already
 * has a key, so its saved scroll position is restored instead of scrolling to top.
 */
export interface Location {
  /** Page language (from the URL prefix). */
  lang: Lang;
  /** Language-neutral path, e.g. `/charts/line-chart`. */
  path: string;
  /** Section id after a second `#`, if any. */
  section: string | null;
}

interface ParsedHash {
  /** Language named by the URL prefix, or null for an unprefixed URL. */
  lang: Lang | null;
  path: string;
  section: string | null;
}

interface EntryState {
  jcKey: string;
}

function parse(hash: string): ParsedHash {
  const raw = hash.replace(/^#/, '');
  const [pathPart = '', section = ''] = raw.split('#');
  let path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  let lang: Lang | null = null;
  for (const l of LANGS) {
    const prefix = `/${l}`;
    if (l !== 'en' && (path === prefix || path.startsWith(`${prefix}/`))) {
      lang = l;
      path = path.slice(prefix.length) || '/';
      break;
    }
  }
  return { lang, path, section: section ? decodeURIComponent(section) : null };
}

/** The page's language: the URL prefix, or the preference for unprefixed URLs. */
function resolve(parsed: ParsedHash, traversal: boolean): Location {
  const choice = sessionLang();
  const lang = traversal && choice ? choice : (parsed.lang ?? preferredLang());
  return { lang, path: parsed.path, section: parsed.section };
}

/** The canonical URL when it differs from the current one in language. */
function rewriteFor(parsed: ParsedHash, location: Location): string | null {
  return (parsed.lang ?? 'en') === location.lang
    ? null
    : href(location.path, location.section, location.lang);
}

function entryKey(): string | null {
  const s = history.state as Partial<EntryState> | null;
  return s && typeof s.jcKey === 'string' ? s.jcKey : null;
}

let counter = 0;
function newKey(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}`;
}

function replaceEntry(state: EntryState, url: string | null): void {
  if (url) history.replaceState(state, '', url);
  else history.replaceState(state, '');
}

const positions = new Map<string, number>();
const langListeners = new Set<(lang: Lang) => void>();

const RouterContext = createContext<Location>({ lang: 'en', path: '/', section: null });

export function useLocation(): Location {
  return useContext(RouterContext);
}

/** Builds an href for a docs path in a language (English is unprefixed). */
export function href(path: string, section?: string | null, lang: Lang = 'en'): string {
  const prefix = lang === 'en' ? '' : `/${lang}`;
  const full = prefix && path === '/' ? prefix : `${prefix}${path}`;
  return `#${full}${section ? `#${encodeURIComponent(section)}` : ''}`;
}

/**
 * Switches the site language: remembers the choice and replaces the current
 * history entry with the same page in that language (scroll position is kept).
 */
export function switchLanguage(lang: Lang): void {
  rememberLang(lang);
  langListeners.forEach((l) => l(lang));
}

function scrollToSection(section: string | null): boolean {
  if (!section) return false;
  const el = document.getElementById(section);
  if (!el) return false;
  el.scrollIntoView({ block: 'start' });
  return true;
}

function sameLocation(a: Location, b: Location): boolean {
  return a.lang === b.lang && a.path === b.path && a.section === b.section;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => ({
    location: resolve(parse(window.location.hash), false),
    nav: 0,
  }));
  const pending = useRef<{ restore: number | null; focus: boolean } | null>({
    restore: null,
    focus: false,
  });
  const location = state.location;

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    // Tag the first entry and put the negotiated language into the URL.
    const first = parse(window.location.hash);
    replaceEntry({ jcKey: entryKey() ?? newKey() }, rewriteFor(first, resolve(first, false)));

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const key = entryKey();
        if (key) positions.set(key, window.scrollY);
      });
    };
    const onNavigate = () => {
      const parsed = parse(window.location.hash);
      const key = entryKey();
      const next = resolve(parsed, key !== null);
      let restore: number | null = null;
      if (key) {
        // Back/forward to a known entry.
        restore = positions.get(key) ?? 0;
        replaceEntry({ jcKey: key }, rewriteFor(parsed, next));
      } else {
        replaceEntry({ jcKey: newKey() }, rewriteFor(parsed, next));
      }
      pending.current = { restore, focus: restore === null };
      setState((prev) => ({
        location: sameLocation(prev.location, next) ? prev.location : next,
        nav: prev.nav + 1,
      }));
    };
    const onLanguage = (lang: Lang) => {
      const parsed = parse(window.location.hash);
      const next: Location = { lang, path: parsed.path, section: parsed.section };
      replaceEntry({ jcKey: entryKey() ?? newKey() }, rewriteFor(parsed, next));
      setState((prev) => ({
        location: sameLocation(prev.location, next) ? prev.location : next,
        nav: prev.nav,
      }));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onNavigate);
    langListeners.add(onLanguage);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', onNavigate);
      langListeners.delete(onLanguage);
      cancelAnimationFrame(frame);
    };
  }, []);

  // `<html lang>` follows the page language (screen reader voice, hyphenation, `:lang()` CSS).
  useLayoutEffect(() => {
    document.documentElement.lang = location.lang;
  }, [location.lang]);

  // After the new page has rendered: restore, jump to the section, or go to the top.
  useLayoutEffect(() => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    const { restore, focus } = p;
    if (restore !== null) {
      window.scrollTo(0, restore);
      return;
    }
    if (scrollToSection(state.location.section)) return;
    window.scrollTo(0, 0);
    if (focus) {
      // Move focus to the new page's heading so screen readers announce it.
      const heading = document.querySelector<HTMLElement>('main h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }, [state]);

  return <RouterContext.Provider value={location}>{children}</RouterContext.Provider>;
}

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Language-neutral path, e.g. `/charts/line-chart`. */
  to: string;
  section?: string;
}

/**
 * Internal link in the current language. Marks itself `aria-current="page"` when
 * it points at the current page.
 */
export function Link({ to, section, children, ...rest }: LinkProps) {
  const { path, lang } = useLocation();
  const current = !section && path === to;
  return (
    <a href={href(to, section, lang)} aria-current={current ? 'page' : undefined} {...rest}>
      {children}
    </a>
  );
}
