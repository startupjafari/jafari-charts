import { ChartProvider } from '@startupjafari/charts';
import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { useT } from './i18n';
import { cn } from './lib/cn';
import { href, useLocation } from './lib/router';
import { useFollowOsTheme } from './lib/theme';
import { resolveRoute } from './routes';
import { PrevNext, SiteFooter, TopBar } from './shell/Chrome';
import { OnThisPage } from './shell/OnThisPage';
import { Sidebar } from './shell/Sidebar';
import { ErrorBoundary } from './ui/ErrorBoundary';

const CONTENT_ID = 'doc-content';

export function App() {
  useFollowOsTheme();
  const location = useLocation();
  const { lang } = location;
  const t = useT();
  const route = resolveRoute(location.path, t);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastPath, setLastPath] = useState(location.path);
  const [sections, setSections] = useState(0);
  const onHeadings = useCallback((count: number) => setSections(count), []);
  const showToc = !route.wide && !route.bleed;
  const hasRail = showToc && sections >= 2;

  // Close the mobile menu after navigating (adjusting state during render, not in an effect).
  if (lastPath !== location.path) {
    setLastPath(location.path);
    if (menuOpen) setMenuOpen(false);
  }

  useEffect(() => {
    document.title = route.title ? `${route.title} · Jafari Charts` : 'Jafari Charts';
  }, [route.title]);

  useEffect(() => {
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
  }, [t]);

  const skip = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main');
    main?.focus();
    main?.scrollIntoView();
  };

  return (
    // Every chart on the site follows the site theme (`.dark` on <html>) and language.
    <ChartProvider theme="auto" locale={lang}>
      <a
        className="fixed top-2 left-3 z-[300] -translate-y-20 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg focus:translate-y-0"
        href={href(location.path, 'main', lang)}
        onClick={skip}
      >
        {t.a11y.skipToContent}
      </a>
      <aside
        aria-label={t.a11y.sidebar}
        className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block"
      >
        <Sidebar shortcut />
      </aside>
      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopBar menuOpen={menuOpen} onMenuOpenChange={setMenuOpen} />
        <div
          className={cn(
            'mx-auto flex w-full flex-1 gap-10',
            route.bleed ? 'max-w-none' : 'max-w-[1240px] px-4 sm:px-6 lg:px-8',
          )}
        >
          <main
            id="main"
            tabIndex={-1}
            className={cn('min-w-0 flex-1 outline-none', route.bleed ? '' : 'py-8 lg:py-10')}
            data-toc-rail={hasRail ? '' : undefined}
          >
            <div
              id={CONTENT_ID}
              className={cn(
                'doc-content mx-auto',
                route.bleed ? 'max-w-none' : route.wide ? 'max-w-[1180px]' : 'max-w-[820px]',
              )}
            >
              <ErrorBoundary resetKey={`${lang}${location.path}`} label={t.errors.page}>
                {route.element}
              </ErrorBoundary>
              <div className={route.bleed ? 'mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8' : ''}>
                <PrevNext path={location.path} />
              </div>
            </div>
          </main>
          {showToc ? (
            <div className={cn('hidden w-52 shrink-0 xl:block', !hasRail && 'xl:hidden')}>
              <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto pt-10 pb-8">
                <OnThisPage contentId={CONTENT_ID} onHeadings={onHeadings} />
              </div>
            </div>
          ) : null}
        </div>
        <SiteFooter />
      </div>
    </ChartProvider>
  );
}
