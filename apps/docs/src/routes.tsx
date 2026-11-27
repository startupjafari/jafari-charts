import type { ReactNode } from 'react';
import { CHARTS } from './docs/charts';
import type { Messages } from './i18n';
import { ApiReference } from './pages/ApiReference';
import { Changelog } from './pages/Changelog';
import { ChartPage } from './pages/ChartPage';
import { ChartsIndex } from './pages/ChartsIndex';
import { Components } from './pages/Components';
import { Examples } from './pages/Examples';
import { GettingStarted } from './pages/GettingStarted';
import { GitHub } from './pages/GitHub';
import { Home } from './pages/Home';
import { Installation } from './pages/Installation';
import { NotFound } from './pages/NotFound';
import { Performance } from './pages/Performance';
import { Playground } from './pages/Playground';
import { QuickStart } from './pages/QuickStart';
import { Themes } from './pages/Themes';

export interface ResolvedRoute {
  /** Used for `document.title`; null on the home page. */
  title: string | null;
  element: ReactNode;
  /** Wide pages use the full content width (and no “On this page” rail). */
  wide?: boolean;
  /** Edge-to-edge page that lays out its own containers (the home page). */
  bleed?: boolean;
}

/** Routes are language-neutral paths; titles come from the UI strings. */
const STATIC: Record<string, (t: Messages) => ResolvedRoute> = {
  '/': () => ({ title: null, element: <Home />, bleed: true }),
  '/getting-started': (t) => ({ title: t.pages.introduction, element: <GettingStarted /> }),
  '/installation': (t) => ({ title: t.pages.installation, element: <Installation /> }),
  '/quick-start': (t) => ({ title: t.pages.quickStart, element: <QuickStart /> }),
  '/charts': (t) => ({ title: t.pages.charts, element: <ChartsIndex />, wide: true }),
  '/components': (t) => ({ title: t.pages.components, element: <Components /> }),
  '/themes': (t) => ({ title: t.pages.themes, element: <Themes /> }),
  '/api': (t) => ({ title: t.pages.api, element: <ApiReference /> }),
  '/performance': (t) => ({ title: t.pages.performance, element: <Performance />, wide: true }),
  '/playground': (t) => ({ title: t.pages.playground, element: <Playground />, wide: true }),
  '/examples': (t) => ({ title: t.pages.examples, element: <Examples />, wide: true }),
  '/changelog': (t) => ({ title: t.pages.changelog, element: <Changelog /> }),
  '/github': (t) => ({ title: t.pages.github, element: <GitHub /> }),
};

export function resolveRoute(path: string, t: Messages): ResolvedRoute {
  const page = STATIC[path];
  if (page) return page(t);
  const m = /^\/charts\/([\w-]+)$/.exec(path);
  if (m) {
    const doc = CHARTS.find((c) => c.slug === m[1]);
    if (doc) return { title: doc.component, element: <ChartPage doc={doc} key={doc.slug} /> };
  }
  return { title: t.pages.notFound, element: <NotFound /> };
}
