import { ChartLine, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useT } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { navigation, type NavGroup } from '../nav';
import { Input } from '../ui/input';

export const VERSION = '0.1.0';

/** Logo mark + name + version, used in the sidebar and the mobile top bar. */
export function Brand({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <Link
      to="/"
      className="-ml-1 flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg px-1 py-1 outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/20"
      title={t.a11y.home}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <ChartLine className="size-[18px]" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="truncate text-[0.9375rem] leading-none font-bold tracking-[-0.01em]">
        Jafari Charts
      </span>
      {compact ? null : (
        <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[0.6875rem] leading-none font-medium text-muted-foreground">
          {VERSION}
        </span>
      )}
    </Link>
  );
}

function normalise(s: string): string {
  return s.toLocaleLowerCase().replace(/ё/g, 'е');
}

/** Groups whose title or entries match the query (all of them for an empty query). */
function filterNav(groups: NavGroup[], query: string): NavGroup[] {
  const q = normalise(query.trim());
  if (!q) return groups;
  return groups
    .map((g) => {
      if (normalise(g.title).includes(q)) return g;
      return {
        ...g,
        items: g.items.filter((i) => normalise(`${i.label} ${i.keywords ?? ''}`).includes(q)),
      };
    })
    .filter((g) => g.items.length > 0);
}

/**
 * Documentation navigation: brand, a filter field and grouped links with icons.
 * Rendered twice (desktop column and mobile drawer); `shortcut` lets one instance
 * own the “/” key.
 */
export function Sidebar({
  onNavigate,
  shortcut = false,
  autoFocusFilter = false,
}: {
  onNavigate?: () => void;
  shortcut?: boolean;
  autoFocusFilter?: boolean;
}) {
  const t = useT();
  const { path } = useLocation();
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const statusId = useId();
  const groups = useMemo(() => filterNav(navigation(t), query), [t, query]);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  // “/” focuses the filter (unless the visitor is typing somewhere).
  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (
        el instanceof HTMLElement &&
        (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))
      )
        return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shortcut]);

  // Keep the current page's entry in view inside the scrolling column.
  useEffect(() => {
    const active = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [path]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center px-4">
        <Brand />
      </div>
      <div className="shrink-0 px-3 pt-1 pb-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            ref={input}
            type="search"
            size="md"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && query) {
                e.stopPropagation();
                setQuery('');
              }
            }}
            autoFocus={autoFocusFilter}
            placeholder={t.search.placeholder}
            aria-label={t.search.label}
            aria-describedby={statusId}
            className="pr-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                input.current?.focus();
              }}
              // StudentHub's clear button for fields (SelectClearButton): a 24px target
              // over the field's right padding.
              className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label={t.search.clear}
              title={t.search.clear}
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : shortcut ? (
            <kbd
              className="pointer-events-none absolute top-1/2 right-2 flex h-5 -translate-y-1/2 items-center rounded-md border border-border bg-muted px-1.5 font-mono text-[0.6875rem] text-muted-foreground"
              aria-hidden
            >
              /
            </kbd>
          ) : null}
        </div>
        <p id={statusId} className="sr-only" aria-live="polite">
          {query ? (count ? t.search.results(count) : t.search.empty(query)) : ''}
        </p>
      </div>
      <nav
        ref={navRef}
        aria-label={t.a11y.docsNav}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-8"
      >
        {groups.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-center">
            <Search className="size-5 text-muted-foreground" aria-hidden />
            <p className="m-0 text-sm text-muted-foreground">{t.search.empty(query)}</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.title} className="flex flex-col gap-0.5">
              <p className="m-0 px-2.5 pt-4 pb-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                {g.title}
              </p>
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        className="flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[0.84rem] font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary-ink"
                      >
                        <Icon className="size-4 shrink-0" aria-hidden />
                        <span className="min-w-0 truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </nav>
    </div>
  );
}
