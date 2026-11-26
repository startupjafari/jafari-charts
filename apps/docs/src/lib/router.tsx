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

/**
 * Tiny hash router: `#/charts/line-chart` (optionally `#/charts/line-chart#props`
 * for a section). Links are plain anchors, so opening in a new tab, copying and
 * history all work natively.
 *
 * Scroll restoration: entries created by clicking a link have no `history.state`;
 * we tag them with a key on arrival. Back/forward lands on an entry that already
 * has a key, so its saved scroll position is restored instead of scrolling to top.
 */
export interface Location {
  path: string;
  /** Section id after a second `#`, if any. */
  section: string | null;
}

interface EntryState {
  jcKey: string;
}

function parse(hash: string): Location {
  const raw = hash.replace(/^#/, '');
  const [pathPart = '', section = ''] = raw.split('#');
  let path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return { path, section: section ? decodeURIComponent(section) : null };
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

const positions = new Map<string, number>();

const RouterContext = createContext<Location>({ path: '/', section: null });

export function useLocation(): Location {
  return useContext(RouterContext);
}

/** Builds an href for a docs path. */
export function href(path: string, section?: string): string {
  return `#${path}${section ? `#${encodeURIComponent(section)}` : ''}`;
}

function scrollToSection(section: string | null): boolean {
  if (!section) return false;
  const el = document.getElementById(section);
  if (!el) return false;
  el.scrollIntoView({ block: 'start' });
  return true;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => ({ location: parse(window.location.hash), nav: 0 }));
  const pending = useRef<{ restore: number | null; focus: boolean } | null>({
    restore: null,
    focus: false,
  });
  const location = state.location;

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!entryKey()) history.replaceState({ jcKey: newKey() } satisfies EntryState, '');

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
      const next = parse(window.location.hash);
      const key = entryKey();
      let restore: number | null = null;
      if (key) {
        // Back/forward to a known entry.
        restore = positions.get(key) ?? 0;
      } else {
        history.replaceState({ jcKey: newKey() } satisfies EntryState, '');
      }
      pending.current = { restore, focus: restore === null };
      setState((prev) => ({
        location:
          prev.location.path === next.path && prev.location.section === next.section
            ? prev.location
            : next,
        nav: prev.nav + 1,
      }));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', onNavigate);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('hashchange', onNavigate);
      cancelAnimationFrame(frame);
    };
  }, []);

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
  to: string;
  section?: string;
}

/** Internal link. Marks itself `aria-current="page"` when it points at the current page. */
export function Link({ to, section, children, ...rest }: LinkProps) {
  const { path } = useLocation();
  const current = !section && path === to;
  return (
    <a href={href(to, section)} aria-current={current ? 'page' : undefined} {...rest}>
      {children}
    </a>
  );
}
