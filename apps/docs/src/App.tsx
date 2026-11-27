import { ChartProvider } from '@startupjafari/charts';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { LANGS, messagesFor, useLang, useT } from './i18n';
import { href, Link, switchLanguage, useLocation } from './lib/router';
import { REPO_URL } from './lib/repo';
import { setSiteTheme, useFollowOsTheme, useSiteTheme } from './lib/theme';
import { navigation, pageOrder } from './nav';
import { resolveRoute } from './routes';
import { ErrorBoundary } from './ui/ErrorBoundary';

const VERSION = '0.1.0';

function Logo() {
  return (
    <svg className="logo" width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="logo-bg" />
      <path
        d="M8 22l5-6 4 3 7-9"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThemeToggle() {
  const theme = useSiteTheme();
  const t = useT();
  const next = theme === 'dark' ? 'light' : 'dark';
  const label = t.a11y.switchTheme(next);
  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => setSiteTheme(next)}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

/** EN / RU switch: keeps the current page and section, remembers the choice. */
function LanguageSwitch() {
  const lang = useLang();
  const t = useT();
  return (
    <div className="lang-switch" role="group" aria-label={t.a11y.language}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className="lang-option"
          aria-pressed={l === lang}
          title={messagesFor(l).langName}
          onClick={() => {
            if (l !== lang) switchLanguage(l);
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Sidebar({ id, onNavigate }: { id: string; onNavigate?: () => void }) {
  const t = useT();
  const groups = navigation(t);
  return (
    <nav id={id} className="sidebar-nav" aria-label={t.a11y.docsNav}>
      {groups.map((g) => (
        <div key={g.title} className="nav-group">
          <p className="nav-group-title">{g.title}</p>
          <ul>
            {g.items.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="nav-link" onClick={onNavigate}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function PrevNext({ path }: { path: string }) {
  const t = useT();
  const order = pageOrder(t);
  const i = order.findIndex((p) => p.to === path);
  if (i < 0) return null;
  const prev = order[i - 1];
  const next = order[i + 1];
  return (
    <nav className="prev-next" aria-label={t.a11y.prevNext}>
      {prev ? (
        <Link to={prev.to} className="prev-next-link">
          <span className="prev-next-dir">{t.pager.previous}</span>
          <span className="prev-next-title">{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.to} className="prev-next-link prev-next-next">
          <span className="prev-next-dir">{t.pager.next}</span>
          <span className="prev-next-title">{next.label}</span>
        </Link>
      ) : null}
    </nav>
  );
}

export function App() {
  useFollowOsTheme();
  const location = useLocation();
  const { lang } = location;
  const t = useT();
  const route = resolveRoute(location.path, t);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const [lastPath, setLastPath] = useState(location.path);

  const topLinks = [
    { to: '/getting-started', label: t.top.docs },
    { to: '/charts', label: t.top.charts },
    { to: '/playground', label: t.top.playground },
    { to: '/examples', label: t.top.examples },
    { to: '/performance', label: t.top.performance },
  ];

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

  useEffect(() => {
    if (!menuOpen) return;
    const first = drawer.current?.querySelector<HTMLElement>('.drawer-panel a');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [menuOpen]);

  const skip = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.getElementById('main');
    main?.focus();
    main?.scrollIntoView();
  };

  return (
    // Every chart on the site follows the site theme (`.dark` on <html>) and language.
    <ChartProvider theme="auto" locale={lang}>
      <a className="skip-link" href={href(location.path, 'main', lang)} onClick={skip}>
        {t.a11y.skipToContent}
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <button
            ref={menuButton}
            type="button"
            className="icon-button menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t.a11y.closeNavigation : t.a11y.openNavigation}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
          <Link to="/" className="brand" aria-label={t.a11y.home}>
            <Logo />
            <span className="brand-name">Jafari Charts</span>
            <span className="brand-version">{VERSION}</span>
          </Link>
          <nav className="top-nav" aria-label={t.a11y.primaryNav}>
            {topLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="top-link"
                data-active={
                  location.path === l.to || location.path.startsWith(`${l.to}/`) ? '' : undefined
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {REPO_URL ? (
              <a className="top-link" href={REPO_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            ) : null}
            <LanguageSwitch />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="shell">
        <aside className="sidebar" aria-label={t.a11y.sidebar}>
          <Sidebar id="desktop-nav" />
        </aside>
        <div className="drawer" ref={drawer} hidden={!menuOpen}>
          <button
            type="button"
            className="drawer-backdrop"
            aria-label={t.a11y.closeNavigation}
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
          />
          <div className="drawer-panel" id="mobile-nav">
            <Sidebar id="mobile-nav-list" onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
        <main id="main" tabIndex={-1} className={route.wide ? 'main main-wide' : 'main'}>
          <div className="content">
            <ErrorBoundary resetKey={`${lang}${location.path}`} label={t.errors.page}>
              {route.element}
            </ErrorBoundary>
            <PrevNext path={location.path} />
          </div>
          <footer className="site-footer">
            <p>
              Jafari Charts {VERSION} · {t.meta.tagline}
            </p>
            <p className="muted">{t.footer.rendered}</p>
          </footer>
        </main>
      </div>
    </ChartProvider>
  );
}
