import type { ReactNode } from 'react';
import { CHARTS } from './docs/charts';
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
  /** Used for `document.title`. */
  title: string;
  element: ReactNode;
  /** Wide pages use the full content width. */
  wide?: boolean;
}

const STATIC: Record<string, () => ResolvedRoute> = {
  '/': () => ({ title: 'Jafari Charts', element: <Home />, wide: true }),
  '/getting-started': () => ({ title: 'Introduction', element: <GettingStarted /> }),
  '/installation': () => ({ title: 'Installation', element: <Installation /> }),
  '/quick-start': () => ({ title: 'Quick start', element: <QuickStart /> }),
  '/charts': () => ({ title: 'Charts', element: <ChartsIndex />, wide: true }),
  '/components': () => ({ title: 'Components', element: <Components /> }),
  '/themes': () => ({ title: 'Themes', element: <Themes /> }),
  '/api': () => ({ title: 'API reference', element: <ApiReference /> }),
  '/performance': () => ({ title: 'Performance', element: <Performance />, wide: true }),
  '/playground': () => ({ title: 'Playground', element: <Playground />, wide: true }),
  '/examples': () => ({ title: 'Examples', element: <Examples />, wide: true }),
  '/changelog': () => ({ title: 'Changelog', element: <Changelog /> }),
  '/github': () => ({ title: 'GitHub', element: <GitHub /> }),
};

export function resolveRoute(path: string): ResolvedRoute {
  const page = STATIC[path];
  if (page) return page();
  const m = /^\/charts\/([\w-]+)$/.exec(path);
  if (m) {
    const doc = CHARTS.find((c) => c.slug === m[1]);
    if (doc) return { title: doc.component, element: <ChartPage doc={doc} key={doc.slug} /> };
  }
  return { title: 'Page not found', element: <NotFound /> };
}
