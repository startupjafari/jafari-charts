import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { href, Link, useLocation } from './lib/router';
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
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="icon-button"
      onClick={() => setSiteTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
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

function Sidebar({ id, onNavigate }: { id: string; onNavigate?: () => void }) {
  const groups = navigation();
  return (
    <nav id={id} className="sidebar-nav" aria-label="Documentation">
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
  const order = pageOrder();
  const i = order.findIndex((p) => p.to === path);
  if (i < 0) return null;
  const prev = order[i - 1];
  const next = order[i + 1];
  return (
    <nav className="prev-next" aria-label="Previous and next page">
      {prev ? (
        <Link to={prev.to} className="prev-next-link">
          <span className="prev-next-dir">Previous</span>
          <span className="prev-next-title">{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.to} className="prev-next-link prev-next-next">
          <span className="prev-next-dir">Next</span>
          <span className="prev-next-title">{next.label}</span>
        </Link>
      ) : null}
    </nav>
  );
}

const TOP_LINKS = [
  { to: '/getting-started', label: 'Docs' },
  { to: '/charts', label: 'Charts' },
  { to: '/playground', label: 'Playground' },
  { to: '/examples', label: 'Examples' },
  { to: '/performance', label: 'Performance' },
];

export function App() {
  useFollowOsTheme();
  const location = useLocation();
  const route = resolveRoute(location.path);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const [lastPath, setLastPath] = useState(location.path);

  // Close the mobile menu after navigating (adjusting state during render, not in an effect).
  if (lastPath !== location.path) {
    setLastPath(location.path);
    if (menuOpen) setMenuOpen(false);
  }

  useEffect(() => {
    document.title =
      route.title === 'Jafari Charts' ? 'Jafari Charts' : `${route.title} · Jafari Charts`;
  }, [route.title]);

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
    <>
      <a className="skip-link" href={href(location.path, 'main')} onClick={skip}>
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <button
            ref={menuButton}
            type="button"
            className="icon-button menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
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
          <Link to="/" className="brand" aria-label="Jafari Charts home">
            <Logo />
            <span className="brand-name">Jafari Charts</span>
            <span className="brand-version">{VERSION}</span>
          </Link>
          <nav className="top-nav" aria-label="Primary">
            {TOP_LINKS.map((l) => (
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
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="shell">
        <aside className="sidebar" aria-label="Sidebar">
          <Sidebar id="desktop-nav" />
        </aside>
        <div className="drawer" ref={drawer} hidden={!menuOpen}>
          <button
            type="button"
            className="drawer-backdrop"
            aria-label="Close navigation"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
          />
          <div className="drawer-panel" id="mobile-nav">
            <Sidebar id="mobile-nav-list" onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
        <main id="main" tabIndex={-1} className={route.wide ? 'main main-wide' : 'main'}>
          <div className="content">
            <ErrorBoundary resetKey={location.path} label="This page">
              {route.element}
            </ErrorBoundary>
            <PrevNext path={location.path} />
          </div>
          <footer className="site-footer">
            <p>
              Jafari Charts {VERSION} · Engineered for performance. Beautiful charts. Zero
              compromise.
            </p>
            <p className="muted">
              Every chart on this site is rendered with Jafari Charts. © Mehman Jafari · MIT
              (proposed).
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
